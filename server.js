require('dotenv').config();// Load environment variables from .env file
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const http = require("http");
const authRoutes = require('./routes/authRoutes');
// const { Server } = require('socket.io');
// const io = new Server(server);
const server = http.createServer(app);
const secretKey = process.env.SECRET_KEY; // Use environment variable or default value

const db = require('./config/database'); // Import the database connection

// Set up middleware
app.use(session({
    secret: secretKey,
    resave: true,
    saveUninitialized: true,
}));

app.use(express.json()); // Add this middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // to include static files from the "public" directory
app.set('view engine', 'ejs');
// app.use(express.static('dist'));
// app.use(express.static('plugins'));

//include routes
app.use('/', authRoutes);

// Check the database connection
// db.getConnection((err, connection) => {
//     if (err) {
//       console.error('Error connecting to MySQL database:', err.message);
//       return;
//     }
//     console.log('Connected to MySQL database');
//     connection.release(); // Release the connection when done
// });
 
server.listen(3003, () => {
    console.log('Server is running on port 3003');
});
