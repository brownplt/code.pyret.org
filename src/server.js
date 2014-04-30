function start(config, onServerReady) {
  var express = require('express');
  var cookieSession = require('cookie-session');
  var csrf = require('csurf');
  var googleAuth = require('./google-auth.js');

  app = express();
  app.use(express.static(__dirname + "/../"));

  app.use(cookieSession({
    secret: config.sessionSecret,
    key: "code.pyret.org"
  }));
  app.use(csrf());

  var auth = googleAuth.makeAuth(config);

  app.get("/", function(req, res) {
    
  });

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

  app.get("/editor", function(req, res) {
    if(req.session && req.session["access_token"]) {
      
    }
  });

  app.listen(config["port"]);

  onServerReady(app);

}

module.exports = {
  start: start
};
