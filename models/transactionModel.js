const db = require('../config/database');

const transactionModel = {
    logTransaction: (transactionData) => {
        console.log('transaction :',transactionData);
        return new Promise((resolve, reject) => {
            const query = `
            INSERT INTO transactions (event_id, event_name, user_id, username, amount, order_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

            db.query(query, [
                transactionData.event_id,
                transactionData.event_name,
                transactionData.user_id,
                transactionData.username,
                transactionData.amount,
                transactionData.order_id,
                transactionData.status,
            ], (err, result) => {
                if (err) {
                    console.error('Error logging transaction:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },
    
    // Function to update payment status based on orderId
    updatePaymentStatus: (orderId, status) => {
        return new Promise((resolve, reject) => {
            const updateQuery = 'UPDATE transactions SET status = ? WHERE order_id = ?';

            db.query(updateQuery, [status, orderId], (err, result) => {
                if (err) {
                    console.error('Error updating payment status:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    getAllTransactions: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM transactions';

            db.query(query, (err, results) => {
                if (err) {
                    console.error('Error getting all transactions:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    getBookedEventsCount: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) AS bookedEventsCount FROM transactions WHERE status = "success"';
            db.query(query, (err, result) => {
                if (err) {
                    console.error('Error getting booked events count:', err);
                    reject(err);
                } else {
                    resolve(result[0].bookedEventsCount);
                }
            });
        });
    },

    getMonthlyBookedEvents: () => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    DATE_FORMAT(t.created_at, '%M %Y') AS month,
                    COUNT(*) AS eventsBooked
                FROM 
                    transactions t
                WHERE 
                    t.status = 'success'
                GROUP BY 
                    MONTH(t.created_at), YEAR(t.created_at)
                ORDER BY 
                    YEAR(t.created_at), MONTH(t.created_at)
            `;
            db.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    },

    getMonthlySuccessfulTransactions: () => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    DATE_FORMAT(t.created_at, '%M %Y') AS month,
                    SUM(t.amount) AS totalAmount
                FROM 
                    transactions t
                WHERE 
                    t.status = 'success'
                GROUP BY 
                    MONTH(t.created_at), YEAR(t.created_at)
                ORDER BY 
                    YEAR(t.created_at), MONTH(t.created_at)
            `;
            db.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    },

};

module.exports = transactionModel;
