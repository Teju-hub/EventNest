/* Database configuration  */

const mysql = require('mysql');

const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    charset : 'utf8mb4' // add this line to specify UTF-8 encoding
    
});

// This event is triggered when a new connection is made to the pool
db.on('connection', (connection) => {
    console.log('New connection established to the database');
  });
  
// This event is triggered when a connection is closed or released
db.on('release', (connection) => {
    console.log('Connection released');
});

module.exports = db;