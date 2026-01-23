var static = require('node-static'),
  http = require('http'),
  util = require('util');

var webroot = './',
  port = Number(process.env.PORT || 8080);

var file = new(static.Server)(webroot, { 
  cache: 600, 
  headers: { 'X-Powered-By': 'node-static' } ,
  gzip: true
});

http.createServer(function(req, res) {
  console.log("Request received");
  file.serve(req, res, function(err, result) {
    console.log("Done serving");
    if (err) {
      console.error('Error serving %s - %s', req.url, err.message);
      res.writeHead(err.status, err.headers);
      res.end();
    } else {
      console.log('%s - %s', req.url, res.message); 
    }
  });
}).listen(port);

console.log('node-static running at http://localhost:%d', port);
