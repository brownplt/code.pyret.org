var static = require('node-static');
var url = require('url');
var request = require('request');

var fileServer = new static.Server('./build/web/', {gzip: true, cache: 3600});

require('http').createServer(function (req, response) {
  if(req.url.slice(0, 9) === "/download") {
    var parsed = url.parse(req.url);
    var googleLink = decodeURIComponent(parsed.query.slice(0));
    var googleParsed = url.parse(googleLink);
    console.log(googleParsed);
    request(googleLink, function(error, resp, body) {
      if(error) {
        response.status(400).write("Error fetching file");
      }
      response.write(body);
      response.end();
    });
  }
  else {
    req.addListener('end', function () {
        fileServer.serve(req, response);
    }).resume();
  }
}).listen(5000);
