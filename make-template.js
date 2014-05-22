var mustache = require('mustache');
var file = require('fs');

var config = {
  google_client_id: process.env["google_client_id"],
  google_api_key: process.env["google_api_key"]
};

var fileIn = process.argv[2];
var fileContents = String(file.readFileSync(fileIn));

process.stdout.write(mustache.render(fileContents, config));

