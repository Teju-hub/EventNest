const db = require('../config/database');

const eventModel = {
    createEvent: (eventData, user) => {
        return new Promise((resolve, reject) => {
            const { eventname, eventdescription, eventplace, eventdate, eventprice, eventimg } = eventData;
            const { id: userid, username } = user; // Using the user object passed from authController

            const query = `INSERT INTO events (eventname, eventdescription, eventplace, eventdate, eventprice, eventimg, userid, username, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;    

            db.query(query, [eventname, eventdescription, eventplace, eventdate, eventprice, eventimg, userid, username], (err, result) => {
                if (err) {
                    console.error('Error inserting event:', err); //
                    // res.status(500).json({ success: false, error: 'An error occurred while creating the event.' });
                    reject(err);
                } else {
                    resolve(result);
                    // res.json({ success: true, message: 'Event created successfully.' });
                }
            });
        });
    },

    getAllEvents: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM events';
            db.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    },

    getAllEventsByUser: (userId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM events WHERE userid = ?';
            db.query(query, [userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    },

    updateEvent: (eventData) => {
        console.log('update event');//
        return new Promise((resolve, reject) => {
            const { eventid, eventname, eventdescription, eventplace, eventdate, eventprice, eventimg } = eventData;
            // const { id: userid, username } = user;
            const query = `
                UPDATE events 
                SET 
                    eventname = ?,
                    eventdescription = ?,
                    eventplace = ?,
                    eventdate = ?,
                    eventprice = ?,
                    eventimg = ?
                WHERE 
                    eventid = ?`;

            db.query(query, [eventname, eventdescription, eventplace, eventdate, eventprice, eventimg, eventid], (err, result) => {
                if (err) {
                    console.error('Error updating event:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },
    
    // Delete an event based on eventId
    deleteEvent: (eventId) => {
        return new Promise((resolve, reject) => {
            const deleteQuery = 'DELETE FROM events WHERE eventid = ?';

            db.query(deleteQuery, [eventId], (err, result) => {
                if (err) {
                    console.error('Error deleting event:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    getEventById: (eventId) => {
        console.log('Event Id in model:',eventId)
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM events WHERE eventid = ?';
            db.query(query, [eventId], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.length > 0) {
                        resolve(result[0]); // Assuming eventId is unique, returning the first result
                    } else {
                        reject({ message: 'Event not found' });
                    }
                }
            });
        });
    },

    getMonthlyEvents: () => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    DATE_FORMAT(eventdate, '%M %Y') AS month,
                    COUNT(*) AS eventsCreated
                FROM 
                    events
                GROUP BY 
                    MONTH(eventdate), YEAR(eventdate)
                ORDER BY 
                    YEAR(eventdate), MONTH(eventdate)
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

module.exports = eventModel;