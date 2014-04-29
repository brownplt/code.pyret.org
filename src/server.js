function start(config, onServerReady) {
  var express = require('express');
  var googleAuth = require('./google-auth.js');

  app = express();
  app.use(express.static(__dirname + "/../"));

  var auth = googleAuth.makeAuth(config);

  app.get("/login", function(req, res) {
    res.redirect(auth.getAuthUrl());
  });

  app.get(config.google.redirect, function(req, res) {
    auth.serveRedirect(req, function(err, data) {
      if(err) { res.send(err); }
      else {
        res.redirect("/src/web/repl.html#" + data.access);
      }
    });
  });

  app.listen(config["port"]);

  onServerReady(app);

}

if(typeof process.env["NODE_ENV"] !== "string") {
  process.env["NODE_ENV"] = "development";
}

config = require('./server-config.js')[process.env["NODE_ENV"]];

module.exports = {
  start: start
};
