var static = require('node-static');

var fileServer = new static.Server('./build/web/', {gzip: true, cache: 3600});

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(5000);
