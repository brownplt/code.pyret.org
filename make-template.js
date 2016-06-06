var mustache = require('mustache');
var file = require('fs');
// Silent suppresses "missing .env file" warning,
// which we want since deploys don't have that file
require('dotenv').config({ silent: true });

var config = process.env;

var fileIn = process.argv[2];
var fileContents = String(file.readFileSync(fileIn));

process.stdout.write(mustache.render(fileContents, config));

