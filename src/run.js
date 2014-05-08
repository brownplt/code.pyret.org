var Q = require("q");
var pg = require("pg");
var storage = require("./storage/pg-store.js");
var server = require("./server.js");
Q.longStackSupport = true;

var conn = Q.defer();
pg.connect(process.env["DATABASE_URL"], function(err, client, doneDb) {
  if(err !== null) { conn.reject(err); }
  else { conn.resolve({client: client, done: doneDb}); }
});

conn.promise.then(function(db) {
  server.start({
    baseUrl: process.env["BASE_URL"],
    port: process.env["PORT"],
    sessionSecret: process.env["SESSION_SECRET"],
    db: storage.makeStorage(db.client),
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      redirect: "/oauth2callback"
    }
  }, function(app) {

  });
})
