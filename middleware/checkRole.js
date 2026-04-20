// middleware/checkRole.js
const roles = require('../config/role');

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.session.user ? req.session.user.role : 'user';
    // console.log('inside middleare: ',userRole);
    if (allowedRoles.includes(userRole)) {
        // console.log('yes');
      next(); // User has the required role, proceed to the next middleware/route handler
    } else {
        // console.log('no');
        const errorMessage = 'Forbidden';
        res.status(403).json({ error: errorMessage, redirect: '/dashboard' });
    }
  };
};

module.exports = checkRole;