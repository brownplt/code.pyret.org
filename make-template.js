var mustache = require('mustache');
var file = require('fs');
// Silent suppresses "missing .env file" warning,
// which we want since deploys don't have that file
var dotenv = require('dotenv');

dotenv.config({ silent: true });

const replacementConfig = process.argv[3];
let config;
if(replacementConfig !== undefined) {
    const buf = Buffer.from(file.readFileSync(process.argv[3]));
    config = dotenv.parse(buf)
}
else {
    config = process.env;
}

var fileIn = process.argv[2];
var fileContents = String(file.readFileSync(fileIn));

process.stdout.write(mustache.render(fileContents, config));

