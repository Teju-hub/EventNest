const userModel = require('../models/userModel');
const eventModel = require('../models/eventModel');
const transactionModel = require('../models/transactionModel');
const transporter = require('../config/emailConfig');

const Razorpay = require('razorpay');
var razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const { isAuthenticated } = require('../middleware/authMiddleware');


const paymentController = {

    getIndex: async (req, res) => {
        try {
            const events = await eventModel.getAllEvents(); // Implement this function in your model
            if (req.session.user) {
                console.log('user logged in');
                // const userRole = req.session.user.role;
                // const username = req.session.user.username;
                // console.log(username);
                res.render('index', { user: req.session.user, events, isAuthenticated: true });

            }else{
                console.log('user not logged in');
                res.render('index', { events, isAuthenticated: false });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    initiatePayment: async (req, res) => {
        console.log('intiate payment');
        try {
            const { eventId, userId, userName } = req.body;
            console.log('eventId :-',eventId);
            const event = await eventModel.getEventById(eventId); 

            const options = {
                amount: event.eventprice * 100, // amount in the smallest currency unit (paise in this case)
                currency: 'INR', // currency code
                receipt: 'order_receipt_' + eventId,
                payment_capture: 1, // auto-capture payments
            };

            const order = await new Promise((resolve, reject) => {
                razorpayInstance.orders.create(options, (err, order) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(order);
                    }
                });
            });

            // Log the transaction in the database
            const transactionData = {
                event_id: eventId,
                event_name: event.eventname,
                user_id: userId, // Assuming user information is available through authentication
                username: userName, // Assuming user information is available through authentication
                amount: order.amount / 100,
                order_id: order.id,
                status: 'initiated', // You can update this based on the actual payment status
            };
            console.log('transaction :',transactionData);
            await transactionModel.logTransaction(transactionData);

            res.json({ orderId: order.id, amount: order.amount });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    updatePaymentStatus: async (req, res) => {
        console.log('update payment status');
        try {
            
            const { orderId, status, userId, userName, userEmail, eventId } = req.body;
            // console.log({ orderId, status, userId, userName, userEmail, eventId });
            // Update the payment status in your database
            await transactionModel.updatePaymentStatus(orderId, status);
            const event = await eventModel.getEventById(eventId); 
            // console.log('event_name:', event.eventname, event.eventprice);
            const allUsers = await userModel.getAllUsers();
            const admins = allUsers.filter(user => ['admin1', 'admin2'].includes(user.role));
            // console.log('admin :',admins)

            // Send email to the logged-in user
            const userMailOptions = {
                from: process.env.PAYMENT_FROM_EMAI, 
                to: userEmail, //  userEmail passed from the EJS file
                subject: 'Payment Successful',
                text: `Dear ${userName},\n\nThank you for choosing EventNest. Your payment of Rs.${event.eventprice} is successful.\n Your booking is confirmed for event "${event.eventname}"`,
            };

            transporter.sendMail(userMailOptions, (error, info) => {
                if (error) {
                  console.error('Error sending email to user:', error);
                } else {
                  console.log('Email sent to user:', info.response);
                }
            });

            // Send email to the admin
            admins.forEach(async (admin) => {
                const adminMailOptions = {
                    from: process.env.PAYMENT_FROM_EMAIL, 
                    to: admin.email, // Replace with the admin's email
                    subject: 'New Booking Received',
                    text: `Dear Admin,\n\n A new booking for event '${event.eventname}' has been received from "${userName}". Check the admin dashboard for details.`,
                };

                try {
                    const info = await transporter.sendMail(adminMailOptions);
                    console.log(`Email sent to admin ${admin.email}:`, info.response);
                } catch (error) {
                    console.error(`Error sending email to admin ${admin.email}:`, error);
                }
            });

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },

    userLogout: (req, res) => {
        req.session.destroy((err) => {
          res.redirect('/eventnest');
        });
    },   
    
}

module.exports = paymentController;