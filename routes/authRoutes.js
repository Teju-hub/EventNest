// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const eventController = require('../controllers/eventController');
const paymentController = require('../controllers/paymentController');

const checkRole = require('../middleware/checkRole');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/eventnest', paymentController.getIndex);
router.post('/initiate-payment', isAuthenticated, paymentController.initiatePayment);
router.get('/user-logout', paymentController.userLogout);
router.post('/update-payment-status', paymentController.updatePaymentStatus);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/admin/login', authController.getAdminLogin);
router.post('/admin/login', authController.postAdminLogin);
router.post('/admin/register', authController.postAdminRegister);

router.get('/superadmin/login', authController.getSuperAdminLogin);
router.post('/superadmin/login', authController.postSuperAdminLogin);

router.get('/logout', authController.logout);

// router.get('/dashboard', authController.getDashboard);
router.get('/dashboard', eventController.getDashboard);

//for event creation
router.post('/dashboard/create-event', eventController.postCreateEvent);
router.post('/dashboard/edit-event',checkRole(['admin1', 'user', 'superadmin']), eventController.postEditEvent);
router.post('/dashboard/delete-event',checkRole(['admin2','user', 'superadmin']), eventController.deleteEvent);
// router.post('/dashboard/send-email', checkRole(['admin1', 'admin2', 'superadmin']), eventController.sendEmail);
router.post('/dashboard/send-email', isAuthenticated, (req, res, next) => {
    console.log('User Role:', req.session.user.role);
    next(); // Move to the next middleware (eventController.sendEmail)
}, checkRole(['admin1', 'admin2', 'superadmin']), eventController.sendEmail);

module.exports = router;