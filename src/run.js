var Q = require("q");
var redis = require('redis');
var url = require('url');
var storage = require("./storage/redis-store.js");
var server = require("./server.js");
var git = require('git-rev-sync');
Q.longStackSupport = true;

var redisParam = process.env["REDISCLOUD_URL"];
if(redisParam !== "") {
  var redisURL = url.parse(redisParam);
  var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  if(redisURL.auth) {
    client.auth(redisURL.auth.split(":")[1]);
  }
}
else {
  var client = null;
}

var res = Q.fcall(function(db) {
  server.start({
    development: process.env["NODE_ENV"] !== "production",
    baseUrl: process.env["BASE_URL"],
    logURL: process.env["LOG_URL"],
    gitRev:    process.env["GIT_REV"]    || git.short(),
    gitBranch: process.env["GIT_BRANCH"] || git.branch(),
    port: process.env["PORT"],
    sessionSecret: process.env["SESSION_SECRET"],
    db: storage.makeStorage(client),
    google: {
      apiKey: process.env["GOOGLE_API_KEY"],
      clientId: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      redirect: "/oauth2callback"
    },
    version: process.env["CURRENT_PYRET_RELEASE"],
    pyret: process.env["PYRET"]
  }, function(app) {
    console.log("Server ready.");
  });
});
res.fail(function(err) {
  console.error("Server did not start: ", err);
});
