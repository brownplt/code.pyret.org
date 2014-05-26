var Q = require("q");
var redis = require('redis');
var url = require('url');
var storage = require("./storage/redis-store.js");
var server = require("./server.js");
Q.longStackSupport = true;

var redisURL = url.parse(process.env["REDISCLOUD_URL"]);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
//client.auth(redisURL.auth.split(":")[1]);

var res = Q.fcall(function(db) {
  server.start({
    baseUrl: process.env["BASE_URL"],
    port: process.env["PORT"],
    sessionSecret: process.env["SESSION_SECRET"],
    db: storage.makeStorage(client),
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      redirect: "/oauth2callback"
    }
  }, function(app) {

  });
});
res.fail(function(err) {
  console.error("Server did not start: ", err);
});
