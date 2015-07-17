/**
 * Created by guanghu on 6/15/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
//var path = require('path');
var engines = require('consolidate');
var passport = require('passport');


module.exports = function() {
    var app = express();

    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    var flash = require('connect-flash');

    app.use(express.static(__dirname + '/../public'));
    var expressSession = require('express-session');
// TODO - Why Do we need this key ?
    app.use(expressSession({secret: 'mySecretKey'}));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());
    app.set('views', './app/views');
    //app.set('view engine', 'ejs');
    app.engine('html', engines.mustache);
    app.set('view engine', 'html');
    require('../app/routes/index.server.routes.js')(app);
    return app;
};