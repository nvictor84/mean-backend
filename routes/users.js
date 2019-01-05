const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

mongoose.connect("mongodb://localhost:27017/mean-stack", {useNewUrlParser: true})
    .then(() => {
        console.info('Connected to mean-mongo');
    })
    .catch(err => {
        console.error(err.message);
    });

/* GET users listing. */
router.get('/', function (req, res, next) {

});

/* POST create new user */
router.post('/signup', function (req, res, next) {
    bcrypt.hash(req.body.password, 10)
        .then(hashedPwd => {
            const newUser = new User({
                email: req.body.email,
                password: hashedPwd
            });
            newUser.save()
                .then(result => {
                    res.status(201)
                        .json({
                            success: true,
                            message: 'User created!',
                            result
                        })
                })
                .catch(err => {
                    res.status(500)
                        .json({
                            success: false,
                            error: err.message
                        })
                })
        })
});

/* POST user login */
router.post('/login', function (req, res, next) {
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found!'
                });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(match => {
                    if (!match) {
                        return res.status(401).json({
                            success: false,
                            message: 'Access denied! Passwords do not match!'
                        });
                    }
                    const token = jwt.sign({
                            userId: user._id,
                            email: user.email
                        },
                        'REPLACE_WITH_YOUR_SECRET_SALT',
                        {expiresIn: "1h"}
                    );
                    return res.status(200).json({
                        success: true,
                        message: 'Access granted! Welcome!',
                        token
                    });
                });
        })
        .catch(err => {
            return res.status(501).json({
                success: false,
                message: err.message
            });
        })
});


module.exports = router;
