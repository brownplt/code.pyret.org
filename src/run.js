var server = require("./server.js");

server.start({
  baseUrl: process.env["BASE_URL"],
  port: process.env["PORT"],
  sessionSecret: process.env["SESSION_SECRET"],
  google: {
    clientId: process.env["GOOGLE_CLIENT_ID"],
    clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
    redirect: "/oauth2callback"
  }
}, function(app) {

});
