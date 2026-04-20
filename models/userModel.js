const db = require('../config/database');

const userModel = {
    createUser: (userData) => {
      console.log('Entered createUser');
      const { username, email, password, role } = userData;
      const query = `INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`;
      // return db.query(query, [username, email, password, role]);
        return new Promise((resolve, reject) => {
          db.query(query, [username, email, password, role], (error, results) => {
            if (error) {
              console.error('Error inserting user:', error);
              reject(error);
            } else {
                console.log('User inserted successfully');
                resolve(results);
            }
          });
      });
    },
  
    getUserByEmail: (email) => {
      // console.log('Entered exist user', email);
      const query = 'SELECT * FROM users WHERE email = ? COLLATE utf8mb4_general_ci';
        return new Promise((resolve, reject) => {
          db.query(query, [email], (error, results) => {
              if (error) {
                  console.error('Error getting user by email:', error);
                  reject(error);
              } else {
                  // console.log('result:',results);
                  resolve(results);
              }
          });
      });
    },
    getAllUsers: () => {
      return new Promise((resolve, reject) => {
          const query = 'SELECT * FROM users';
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

 
  
  module.exports = userModel;