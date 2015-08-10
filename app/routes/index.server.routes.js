/**
 * Created by guanghu on 6/15/15.
 */
//var passport = require("./passport.js");

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/testAuth');

passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log(username);
        console.log(password);
        User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            console.log(user);
            if (!user) {
                //console.log(user);
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (user.password != password) {

                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    console.log(req.isAuthenticated());
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/login');
};

module.exports = function(app) {
    var index = require('../controllers/index.server.controller');
    //app.get('/', index.base);
    //app.get('/insert', index.insert);
    //app.post('/update', index.update);
    app.post('/refresh', index.refresh);
    //app.get('/del', index.del);
    //app.get('/getProjects', index.getProjects);
    //app.get('/sort', index.sort);
    app.get('/index', index.index);
    app.post('/update', index.update);
    app.get('/comment', index.comment);
    app.post('/postcomment', index.postcomment);
    app.get('/login', index.login);
    app.post('/login',
        passport.authenticate('local', { successRedirect: '/index',
            failureRedirect: '/login',
            failureFlash: true })
    );
    app.get('/logout', function(req, res){
        console.log(req.logout);
        req.logout();
        res.send('log out');
    });

    app.get('/isAuthenticated', function(req, res) {

        var re = req.isAuthenticated();
        console.log(res);
        if (re == true) res.send('authenticated');
        else res.send('no');
    });

    app.get('/getweight', index.getWeight);
    app.get('/getrow', index.getrow);

};