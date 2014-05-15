var mustache = require('mustache');
var file = require('fs');

var config = JSON.parse(file.readFileSync("config.json"));

var fileIn = process.argv[2];
var fileContents = String(file.readFileSync(fileIn));

process.stdout.write(mustache.render(fileContents, config));

