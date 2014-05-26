var mustache = require('mustache');
var file = require('fs');

var config = process.env;

var fileIn = process.argv[2];
var fileContents = String(file.readFileSync(fileIn));

process.stdout.write(mustache.render(fileContents, config));

