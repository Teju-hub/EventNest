// authMiddleware.js
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        // User is authenticated
        next();
    } else {
        // User is not authenticated
        res.redirect('/login'); // Redirect to the login page or any other page
    }
};

module.exports = { isAuthenticated };
