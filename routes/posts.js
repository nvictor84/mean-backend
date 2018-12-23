var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/mean-stack", { useNewUrlParser: true })
    .then(() => {
        console.info('Connected to mean-mongo');
    })
    .catch(err => {
        console.error(err.message);
    });


const Post = require('../models/post');

/* GET posts */
router.get('/', (req, res, next) => {
    Post.find()
        .then(docs => {
            res.status(200).json({
                success: true,
                posts: docs.map(doc => {
                    return {
                        id: doc._id,
                        title: doc.title,
                        content: doc.content
                    }
                })
            });
        })
        .catch(err => {
            res.status(400).json({
                success: false,
                message: err.message
            });
        });
});

/* POST posts */
router.post('/', (req, res, next) => {
        if (!req.body.newPost) {
            res.status(203).json({
                success: false,
                message: `New post missing, nothing inserted`
            })
        } else {
            const newPost = new Post(req.body.newPost);
            newPost.save()
                .then(result => {
                    res.status(200).json({
                        success: true
                    });
                });
        }
});

/* UPDATE posts */
router.put('/:id', (req, res, next) => {
        if (!req.params.id) {
            res.status(203).json({
                success: false,
                message: `Missing post id. Nothing to update.`
            })
        } else {
            Post.updateOne({ _id: req.params.id }, {...req.body})
                .then(result => {
                    res.status(200).json({
                        success: true,
                        message: `Post ${req.body.id} updated!`
                    });
                })
                .catch(err => {
                    console.log(err.message);
                    res.status(500).json({
                        success: false,
                        message: `Post ${req.body.id} NOT updated! Try again later.`
                    });
                })
        }
});

/* DELETE posts */
router.delete('/:id', (req, res, next) => {
        if (!req.params.id) {
            res.status(203).json({
                success: false,
                message: `Missing post id. Nothing to delete.`
            })
        } else {
            Post.deleteOne({ _id: req.params.id })
                .then(result => {
                    res.status(200).json({
                        success: true,
                        message: `Post ${req.params.id} deleted!`
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        success: false,
                        message: `Post ${req.params.id} NOT deleted! Try again later.`
                    });
                })
        }
});

module.exports = router;