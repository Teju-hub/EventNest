
const upload = require('../config/multerConfig');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const eventModel = require('../models/eventModel');
const bcryptPattern = /^\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/;

const authController = {

    getRegister: (req, res) => {
        res.render('user/register');
    },

    postRegister : async (req, res) => {
        console.log('Entered postRegister');
        const { username, email, password, role } = req.body;
        try {
            // const allUsers = await userModel.getAllUsers();
            // console.log('All Users:', allUsers);
            const existingUser = await userModel.getUserByEmail(email);

            if (existingUser.length > 0) {
                // console.log('email:', existingUser);
                // Email is already taken
                return res.render('user/register', { error: 'Email is already taken.' });
            }

               // Check if the password meets the criteria
            if (password.length < 8) {
                // console.log('password');
                // Password should be at least 8 characters
                return res.render('user/register', { error: 'Password should be at least 8 characters.' });
            }
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Create a new user
            const userData = {
                username,
                email,
                password: hashedPassword,
                role,
            };
            // Insert the user into the database
            await userModel.createUser(userData);
            // console.log('after register');
            // Redirect to login page after successful registration
            res.redirect('/login');
        } catch (err) {
            console.error('Error during registration:', err);
            res.render('user/register', { error: 'An error occurred during registration. Please try again later.' });
          }
    },

    getLogin: (req, res) => {
        res.render('user/login');
    },

    postLogin: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await userModel.getUserByEmail(email);
        
            if (user.length > 0 && user[0].role == 'user') {
                
                const isPasswordValid = await bcrypt.compare(password, user[0].password);
            
                if (isPasswordValid) {
                    req.session.user = user[0];
                    res.redirect('/eventnest');
                    // res.redirect('/dashboard');
                } else {
                    // res.redirect('/login?error=wrong-password'); //in redirect it should be route name
                    return res.render('user/login', { error: 'Wrong password. Please try again.' });
                }
            } else {
                // res.redirect('/login?error=email-not-registered');
                return res.render('user/login', { error: 'Email is not registered or Invalid role.' });
            }
        } catch (err) {
            console.error('Error during login:', err);
            return res.render('user/login', { error: 'An error occurred during login. Please try again later.' });
        }
    },

    postAdminRegister : async (req, res) => {
        // console.log('Entered postAdminRegister');
        const { username, email, password, role } = req.body;
        // console.log('admin data: ', { username, email, password, role });
        try {
            
            const existingUser = await userModel.getUserByEmail(email);

            if (existingUser.length > 0) {
                // Email is already taken
                return res.json({ success: false, error: 'Email is already taken.' });
            }

               // Check if the password meets the criteria
            if (password.length < 8) {
                // Password should be at least 8 characters
                return res.json({ success: false, error: 'Password should be at least 8 characters.' });
            }
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Create a new user
            const userData = {
                username,
                email,
                password: hashedPassword,
                role,
            };
            // Insert the user into the database
            await userModel.createUser(userData);
            // Redirect to login page after successful registration
            // res.redirect('/admin/login');
            res.json({ success: true });
        } catch (err) {
            console.error('Error during registration:', err);
            res.json({ success: false, error: 'An error occurred during registration. Please try again later.' });
        }
    },

    getAdminLogin: (req, res) => {
        res.render('admin/login');
    },

    postAdminLogin: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await userModel.getUserByEmail(email);

            if (user.length > 0 && (user[0].role === 'admin1' || user[0].role === 'admin2') ) {
                
                const isBcryptHashed = bcryptPattern.test(user[0].password);

                if (isBcryptHashed) {
                    const isPasswordValid = await bcrypt.compare(password, user[0].password);
            
                    if (isPasswordValid) {
                        req.session.user = user[0];
                        res.redirect('/dashboard');
                    } else {
                        // Handle invalid password
                        return res.render('admin/login', { error: 'Wrong password. Please try again.' });
                    }
                } else {
                    // The password is not bcrypt-hashed
                    const isPasswordValid = (password === user[0].password);
            
                    if (isPasswordValid) {
                        req.session.user = user[0];
                        res.redirect('/dashboard');
                    } else {
                        // Handle invalid password
                        return res.render('admin/login', { error: 'Wrong password. Please try again.' });
                    }
                }
            } else {
                // res.redirect('superadmin/login?error=email-not-registered');
                return res.render('admin/login', { error: ' Email is not registered or Invalid role.'});
            }
        } catch (err) {
            console.error('Error during login:', err);
            return res.render('admin/login', { error: 'An error occurred during login. Please try again later.' });
        }
    },

    getSuperAdminLogin: (req, res) => {
        res.render('superAdmin/login');
    },

    postSuperAdminLogin: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await userModel.getUserByEmail(email);

            if (user.length > 0 && user[0].role == 'superadmin') {
                
                const isBcryptHashed = bcryptPattern.test(user[0].password);

                if (isBcryptHashed) {
                    const isPasswordValid = await bcrypt.compare(password, user[0].password);
            
                    if (isPasswordValid) {
                        // Set session for authentication
                        req.session.user = user[0];                        
                        res.redirect('/dashboard');
                    } else {
                        // Handle invalid password
                        return res.render('superadmin/login', { error: 'Wrong password. Please try again.' });
                    }
                } else {
                    // The password is not bcrypt-hashed
                    const isPasswordValid = (password === user[0].password);
            
                    if (isPasswordValid) {
                        req.session.user = user[0];
                        res.redirect('/dashboard');
                    } else {
                        // Handle invalid password
                        return res.render('superadmin/login', { error: 'Wrong password. Please try again.' });
                    }
                }
            } else {
                // res.redirect('superadmin/login?error=email-not-registered');
                return res.render('superadmin/login', { error: ' Email is not registered or Invalid role.' });
            }
        } catch (err) {
            console.error('Error during login:', err);
            return res.render('superadmin/login', { error: 'An error occurred during login. Please try again later.' });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
          res.redirect('/login');
        });
    },   

}

module.exports = authController;
