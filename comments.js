// Create web server
// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var mime = require('mime');
var querystring = require('querystring');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;
    var ext = path.extname(pathname);
    var type = mime.lookup(ext);
    console.log("Request for " + pathname + " received.");

    if (pathname === "/") {
        fs.readFile("index.html", function (err, data) {
            if (err) {
                console.log(err);
                response.writeHead(404, {'Content-Type': 'text/html'});
            } else {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write(data.toString());
            }
            response.end();
        });
    } else if (pathname === "/comments" && request.method === "POST") {
        var postData = "";
        request.on('data', function (data) {
            postData += data;
        });
        request.on('end', function () {
            var post = querystring.parse(postData);
            console.log(post);
            var comments = JSON.parse(fs.readFileSync('comments.json'));
            comments.push(post);
            fs.writeFileSync('comments.json', JSON.stringify(comments));
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify(comments));
            response.end();
        });
    } else if (pathname === "/comments" && request.method === "GET") {
        var comments = fs.readFileSync('comments.json');
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(comments);
        response.end();
    } else {
        fs.readFile(pathname.substr(1), function (err, data) {
            if (err) {
                console.log(err);
                response.writeHead(404, {'Content-Type': 'text/html'});
            } else {
                response.writeHead(200, {'Content-Type': type});
                response.write(data.toString());
            }
            response.end();
        });
    }
});

// Listen on port 8000, IP defaults to