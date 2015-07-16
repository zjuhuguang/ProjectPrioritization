/**
 * Created by guanghu on 6/15/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
//var path = require('path');
var engines = require('consolidate');


module.exports = function() {
    var app = express();

    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));

    app.use(express.static(__dirname + '/../public'));

    app.set('views', './app/views');
    //app.set('view engine', 'ejs');
    app.engine('html', engines.mustache);
    app.set('view engine', 'html');
    require('../app/routes/index.server.routes.js')(app);
    return app;
};