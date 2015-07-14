/**
 * Created by guanghu on 6/15/15.
 */
var port = 8017;
var express = require('./config/express');
var app = express();

app.listen(port, '0.0.0.0');
module.exports = app;
console.log('Server running at http://localhost:' + port);