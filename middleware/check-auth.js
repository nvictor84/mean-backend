const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'REPLACE_WITH_YOUR_SECRET_SALT');
        req.userData = {
            email: decodedToken.email,
            userId: decodedToken.userId
        };
        next();
    } catch (e) {
        res.status(501).json({ success: false, error: e.message })
    }
};