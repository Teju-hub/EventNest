const upload = require('../config/multerConfig');
const userModel = require('../models/userModel');
const eventModel = require('../models/eventModel');
const roles = require('../config/role');
const transactionModel = require('../models/transactionModel');
const nodemailer = require('nodemailer');


const eventController = {

    getDashboard: async (req, res) => {
        // Check if the user is authenticated
        if (req.session.user) {
            const userRole = req.session.user.role;
            console.log('inside dashboard :', userRole);
            const allUsers = await userModel.getAllUsers();
            const admins = allUsers.filter(user => ['admin1', 'admin2'].includes(user.role));
            const users = allUsers.filter(user => user.role === 'user');
            const allTransactions = await transactionModel.getAllTransactions();
            const allEvents = await eventModel.getAllEvents();
            // console.log('all events :',allEvents);
            // Fetch events only for the logged-in user
            const userEvents = await eventModel.getAllEventsByUser(req.session.user.id);
            // console.log('all events of a user:',userEvents);

            // Calculate counts
            const usersCount = allUsers.length;
            const eventsCount = allEvents.length;
            const bookedEventsCount = await transactionModel.getBookedEventsCount();
            const transactionsCount = allTransactions.length;
            // Define maxUsers
            const maxUsers = 100;

            // Calculate the percentage
            const usersPercentage = ((usersCount / maxUsers) * 100).toFixed(0);
            const eventsPercentage = ((eventsCount / maxUsers) * 100).toFixed(0);
            const bookedEventsPercentage = ((bookedEventsCount / maxUsers) * 100).toFixed(0);
            const transactionsPercentage = ((transactionsCount / maxUsers) * 100).toFixed(0);

            // Fetch monthly data for created events
            const monthlyEvents = await eventModel.getMonthlyEvents();

            // Fetch monthly data for booked events
            const monthlyBookedEvents = await transactionModel.getMonthlyBookedEvents();

            // Fetch monthly data for successful transactions
            const monthlyTransactions = await transactionModel.getMonthlySuccessfulTransactions();

            // Format the data for the charts
            const monthlyChartData = monthlyEvents.map((entry, index) => {
                return {
                    month: entry.month, // Assuming your database returns a 'month' field
                    eventsCreated: entry.eventsCreated,
                    eventsBooked: monthlyBookedEvents[index].eventsBooked,
                    transactions: monthlyTransactions[index].totalAmount,
                };
            });
            // console.log(monthlyChartData);

            if (userRole === 'superadmin') {
                // Use the roles configuration to determine user capabilities
                const userPermissions = roles[userRole].can;
                console.log('permission:',userPermissions);
                return res.render('superadmin/dashboard', { 
                    user: req.session.user, admins, users, allEvents, allTransactions,
                    usersCount, usersPercentage, eventsCount, eventsPercentage, 
                    bookedEventsCount, bookedEventsPercentage, transactionsCount, transactionsPercentage,
                    monthlyChartData
                });
            } else if (userRole === 'admin1' || userRole === 'admin2' ) {
                return res.render('admin/dashboard', { 
                    user: req.session.user, users, allEvents, allTransactions,
                    usersCount, usersPercentage, eventsCount, eventsPercentage,
                    bookedEventsCount, bookedEventsPercentage, transactionsCount,
                    transactionsPercentage, monthlyChartData
                });
            } else if (userRole === 'user') {
                return res.render('user/dashboard', { user: req.session.user, userEvents });
            } else {
                // Handle unknown roles or redirect to login
                return res.redirect('/login');
            }
        } else {
          res.redirect('/login');
        }
    },

    postCreateEvent: async (req, res) => {
        // console.log('create event', req.file); //printing
        upload(req, res, async (err) => {
            // console.log('upload event'); //printing
            // const { eventname, eventdescription, eventplace, eventdate, eventprice, eventimg } = req.body;

            // console.log('Event Data:', { eventname, eventdescription, eventplace, eventdate, eventprice, eventimg });
          
            try {
                // console.log('inside try'); //printing
                if (err) {
                    console.error('Error during file upload:', err); 
                    // Handle the error
                } else {
                    // console.log('inside else');//
                    // Check if file is selected
                    if (!req.file) {
                        console.error('No file uploaded.');
                        return res.json({ success: false, error: 'Please select an image file.' });
                    }
                    if (req.file) {
                        // console.log('File uploaded:', req.file);
                        // Add the file path to eventData
                        req.body.eventimg = '/uploads/' + req.file.filename;
                    }
                    const { eventname, eventdescription, eventplace, eventdate, eventprice, eventimg } = req.body;

                    // console.log('Event Data:', { eventname, eventdescription, eventplace, eventdate, eventprice, eventimg });

                    // Validate the event date
                    const currentDate = new Date();
                    const selectedDate = new Date(eventdate);

                    if (selectedDate < currentDate) {
                        // return res.render('user/dashboard', { user: req.session.user, error: 'Event date should be today or later.' });
                        return res.json({ success: false, error: 'Event date should be today or later.' });
                    }

                    // Create event data
                    const eventData = {
                        eventname,
                        eventdescription,
                        eventplace,
                        eventdate,
                        eventprice: eventprice.toString(), // Convert to string before storing
                        eventimg,
                    };
                    console.log('userdata :',req.session.user);
                    
                    // Insert the event into the database
                    await eventModel.createEvent(eventData, req.session.user);

                    // Redirect or respond with success
                    res.json({ success: true });
                }
            } catch (error) {
                console.error('Error during event creation:', error); //
                // res.render('user/dashboard', { user: req.session.user, error: 'An error occurred during event creation. Please try again later.' });
                res.json({ success: false, error: 'An error occurred during event creation. Please try again later.' });

            }
        });
    },

    // Handle the edit event request
    postEditEvent: async (req, res) => {
        console.log('posteditevent'); //
       
        try {
            // Extract the user's role
            const userRole = req.session.user.role;
            // console.log('Role:',userRole);
            // Check if the user's role is allowed for this action
            if (!roles[userRole] || !roles[userRole].can.includes('edit')) {
                // Show a pop-up message to the user
                return res.status(403).send(`
                    <script>
                        alert("You have no access to edit.");
                        window.location.href = '/dashboard'; // Redirect to dashboard or any other page
                    </script>
                `);
            }
            
            upload(req, res, async (err) => {
                if (err) {
                    // console.error('Error during file upload:', err);
                    return res.json({ success: false, error: 'Error during file upload. Please try again.' });
                } 
                const { eventid, eventname, eventdescription, eventplace, eventdate, eventprice } = req.body;

                // Check if a new image is selected
                let eventimg;
                if (req.file) {
                    // console.log('File uploaded:', req.file);
                    eventimg = '/uploads/' + req.file.filename;
                } else {
                    // No new image selected, use the existing image
                    eventimg = req.body.eventimg;
                }
                    
                console.log('Event Data:', { eventid, eventname, eventdescription, eventplace, eventdate, eventprice, eventimg });
                
                // Create updated event data
                const eventData = {
                    eventid,
                    eventname,
                    eventdescription,
                    eventplace,
                    eventdate,
                    eventprice: eventprice.toString(), // Convert to string before storing
                    eventimg,
                };
                // console.log('userdata :',req.session.user);
                // Update the event in the database
                await eventModel.updateEvent(eventData);

                // Redirect or respond with success
                res.json({ success: true });
            });    
        } catch (error) {
            console.error('Error during event editing:', error);
            res.json({ success: false, error: 'An error occurred during event editing. Please try again later.' });
        }
        
    },

    // Handle the delete event request
    deleteEvent: async (req, res) => {
        try {
            // Extract the user's role
            const userRole = req.session.user.role;
            // console.log('Role:',userRole);
            // Check if the user's role is allowed for this action
            if (!roles[userRole] || !roles[userRole].can.includes('delete')) {
                return res.status(403).json({ success: false, error: 'Permission denied.' });
            }
            // Extract the eventId from the request body
            const eventId = req.body.eventId;
            console.log('eventid =',eventId);
            // Call the deleteEvent method in the eventModel
            await eventModel.deleteEvent(eventId);

            // Respond with success
            res.json({ success: true });
        } catch (error) {
            // Handle errors
            console.error('Error during event deletion:', error);
            res.json({ success: false, error: 'An error occurred during event deletion. Please try again later.' });
        }
    },

    sendEmail: async (req, res) => {
        console.log("inside sendEmail");
        try {
            const { subject, message, recipientEmails } = req.body;

            // Create a nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'tejaswininayak1996@gmail.com', //'tejaswini.techdoodles@gmail.com',
                    pass: 'ahos klcv dvhn luhh', //'knas acfw pdfw vpwr',
                },
            });

            // Setup email data
            const mailOptions = {
                from: 'tejaswininayak1996@gmail.com', //'tejaswini.techdoodles@gmail.com',
                to: recipientEmails.join(','),
                subject: subject,
                text: message,
            };

            // Send email
            await transporter.sendMail(mailOptions);
            
            // Redirect to dashboard after successful email send
            res.json({ success: true, redirect: '/dashboard' });
        } catch (error) {
            console.error('Error during email sending:', error);
            res.json({ success: false, error: 'An error occurred during email sending. Please try again later.' });
        }
    },
   

}

module.exports = eventController;
