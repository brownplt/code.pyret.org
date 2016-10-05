var mustache = require('mustache');
var file = require('fs');
console.log('ONE');
// Silent suppresses "missing .env file" warning,
// which we want since deploys don't have that file
require('dotenv').config({ silent: true });
console.log('TWO');

var config = process.env;

var fileIn = process.argv[2];
var fileContents = String(file.readFileSync(fileIn));
console.log('THREE');

process.stdout.write(mustache.render(fileContents, config));

