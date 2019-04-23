var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors());
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var jwt = require('jsonwebtoken');
var Movie = require('./Movies');
var Comment = require('./Comments');
mongodb = require('mongodb');
ObjectId = mongodb.ObjectId;
module.exports = app; // for testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
var router = express.Router();
app.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
    });

app.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);
            var userJson = JSON.stringify(user);
            // return that user
            res.json(userJson );
        });
    });

app.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

app.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }
            res.json({ success: true, message: 'User created!' });
        });
    }
});
app.route('/Movies/:moviesid')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.moviesid;
        Movie.findById(id, function (err, movie) {
            if (err) res.send(err);
            var movieJson = JSON.stringify(movie);
            res.json(movieJson);
        })
    });

app.route('/Movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.findOne({title : req.body.title}, function (err, movies) {
            if (err) res.send(err);
            res.json(movies);
        })
    });

app.route('/MoviesAll')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if(err) res.send(err);
            res.json(movies);
        })
    });
app.route('/Movies/:id')
    .put(authJwtController.isAuthenticated, function (req, res) {
        var conditions = {_id: req.params.id};
        Movie.updateOne(conditions, req.body)
            .then(mov => {
                if (!mov) {
                    return res.status(404).end();
                }
                return res.status(200).json({msg: "Movie updated"})
            })
            .catch(err => next(err))
    });
app.route('/Movies')
    .delete(authJwtController.isAuthenticated, function (req, res){
        Movie.findOneAndDelete({title: req.body.title}, function (err, movie) {
            if (err)
            {
                res.status(400).json({msg: err})
            }
            else if(movie == null)
            {
                res.json({msg : "Movie not found"})
            }
            else
                res.json({msg :"The movie was deleted"})
        })
    });
app.route('/Movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        var movies = new Movie();
        movies.title = req.body.title;
        movies.YearRelease = req.body.YearRelease;
        movies.genre = req.body.genre;
        movies.Actors = req.body.Actors;
        movies.save(function (err) {
            if (err) {
                if (err.Code == 11000)
                    return res.JSON({success: false, message: 'A movie with that name already exists. '});
                else
                    return res.send(err);
            }
            res.json({success: true, message: 'Movie saved!'})
        });
    });
app.route('/Comments')
    .post(authJwtController.isAuthenticated, function (req, res) {
        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);
            var Mymovie = req.body.movie;
            Comment.find(function (err, movieReviews) {
                if (err) {
                    res.json({msg: "There is not a movie with this name in the database."});
                }
                if (movieReviews) {
                    console.log(req.body);
                    var comments = new Comment();
                    comments.user = decoded.username;
                    comments.title = req.body.movie;
                    comments.comment = req.body.review;
                    comments.rate = req.body.rating;
                    comments.save(function (err) {
                        if (err) {
                            if (err.Code == 11000)
                                return res.JSON({success: false, message: 'You have already commented on this movie!'});
                            else
                                return res.send(err);
                        }
                        res.json({success: true, message: 'You comment was successfully saved!'})
                    });
                }
            });
        });

 app.route('/MoviesandComment')
            .get(authJwtController.isAuthenticated, function (req, res) {
                var data = req.body;
                Movie.aggregate([
                    {
                        "$match": {"title": data.title}
                    },
                    {
                        $lookup:
                            {
                                from: 'comments',
                                localField: 'title',
                                foreignField: 'title',
                                as: 'reviews'
                            },
                    },
                ]).exec((err, review) => {
                    if (err) {
                        res.status('500').send(err);
                    } else {
                        res.json(review)
                    }
                });
            });
app.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;
    User.findOne({username: userNew.username}).select('name username password').exec(function (err, user) {
        if (err) res.send(err);
        user.comparePassword(userNew.password, function (isMatch) {
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            } else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });
    });
    app.all('*', function (res, req) {
        req.json({error: 'Does not support the HTTP method'});
    });
});
app.use('/', router);
app.listen(process.env.PORT || 9000);