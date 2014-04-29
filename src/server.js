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

module.exports = {
  start: start
};
