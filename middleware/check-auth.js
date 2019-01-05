const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, 'REPLACE_WITH_YOUR_SECRET_SALT');
        next();
    } catch (e) {
        res.status(501).json({ success: false, error: e.message })
    }
};