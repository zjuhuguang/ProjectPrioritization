/**
 * Created by guanghu on 6/17/15.
 */
var http = require("http");
var math = require('mathjs');
http.createServer(function(request, response) {
    var m = math.mean(1, 2);
    console.log(m);
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
}).listen(1337);