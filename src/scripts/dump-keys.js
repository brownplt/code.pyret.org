// USAGE:

// node src/scripts/dump_keys.js "redis://<your redis URL, probably coped from Heroku rediscloud>"
//
// Prints out all the _keys_ in the redis store.  If you have tons, this will probably
// lock up the redis store for a while.  If you have thousands, it will finish
// in about a second.  Used for counting how many folks have connected to Drive.

var redis = require('redis');
var url = require('url');

var rediscloud_url = process.argv[2];

var redisURL = url.parse(rediscloud_url);
console.log(redisURL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
if(redisURL.auth) {
  client.auth(redisURL.auth.split(":")[1]);
}

client.keys('*', function (err, keys) {
  if (err) return console.log(err);

  for(var i = 0, len = keys.length; i < len; i++) {
    console.log(keys[i]);
  }
});        

