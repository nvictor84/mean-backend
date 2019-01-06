var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer = require('multer');

const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

let multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid Mime-Type");
        if (isValid) {
            error = null;
        }
        cb(error, "public/uploads/images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().replace(/ /g, '-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, `${name}_${Date.now()}.${ext}`);
    }
});

mongoose.connect("mongodb://localhost:27017/mean-stack", {useNewUrlParser: true})
    .then(() => {
        console.info('Connected to mean-mongo');
    })
    .catch(err => {
        console.error(err.message);
    });


const Post = require('../models/post');

/* GET posts */
router.get('/', (req, res, next) => {
    const currentPage = parseInt(req.query['page']);
    const pageSize = parseInt(req.query['pagesize']);
    const postQuery = Post.find();
    if (currentPage && pageSize) {
        postQuery.skip(pageSize * (currentPage - 1))
            .limit(pageSize)
    }
    postQuery
        .then(docs => {
            posts = docs.map(doc => {
                return {
                    id: doc._id,
                    title: doc.title,
                    content: doc.content,
                    image: doc.image,
                    creator: doc.creator
                }
            });
            return Post.estimatedDocumentCount();
        }).then(count => {
        res.status(200).json({
            success: true,
            posts,
            count
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
router.post('/', checkAuth, multer({storage: multerStorage}).single('image'), (req, res, next) => {
    // const url = `${req.protocol}://${req.get('host')}`;
    const newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        image: req.file.filename,
        creator: req.userData.userId
    });
    newPost.save()
        .then(createdPost => {
            res.status(200).json({
                success: true,
                post: {
                    id: createdPost._id,
                    ...createdPost
                }
            });
        });
});

/* UPDATE posts */
router.put('/:id', checkAuth,
    multer({storage: multerStorage}).single('image'),
    (req, res, next) => {
        if (!req.params.id) {
            res.status(203).json({
                success: false,
                message: `Missing post id. Nothing to update.`
            })
        } else {
            let updateData = {...req.body};
            if (req.file) {
                updateData.image = req.file.filename
            }
            Post.updateOne({_id: req.params.id, creator: req.userData.userId }, updateData)
                .then(result => {
                    if (result.nModified > 0) {
                        res.status(200).json({
                            success: true,
                            message: `Post ${req.body.id} updated!`
                        });
                    } else {
                        res.status(401).json({
                            success: false,
                            message: `You are NOT AUTHORIZED to update this post!`
                        });
                    }
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
router.delete('/:id', checkAuth, (req, res, next) => {
    if (!req.params.id) {
        res.status(203).json({
            success: false,
            message: `Missing post id. Nothing to delete.`
        })
    } else {
        Post.deleteOne({_id: req.params.id, creator: req.userData.userId })
            .then(result => {
                if (result.n > 0) {
                    res.status(200).json({
                        success: true,
                        message: `Post ${req.params.id} deleted!`
                    });
                } else {
                    res.status(401).json({
                        success: false,
                        message: `You are NOT AUTHORIZED to delete this post!`
                    });
                }
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