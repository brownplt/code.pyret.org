function start(config, onServerReady) {
  var express = require('express');
  var cookieSession = require('cookie-session');
  var cookieParser = require('cookie-parser');
  var csrf = require('csurf');
  var googleAuth = require('./google-auth.js');

  app = express();
  app.use(express.static(__dirname + "/../"));

  app.use(cookieSession({
    secret: config.sessionSecret,
    key: "code.pyret.org"
  }));
  app.use(cookieParser());
  app.use(csrf());

  var auth = googleAuth.makeAuth(config);

  app.get("/", function(req, res) {
    res.sendfile("src/web/index.html");
  });

  app.get("/login", function(req, res) {
    if(!(req.session && req.session["access_token"])) {
      res.redirect(auth.getAuthUrl());
    }
    else {
      res.redirect("/editor");
    }
  });

  app.get(config.google.redirect, function(req, res) {
    auth.serveRedirect(req, function(err, data) {
      if(err) { res.send(err); }
      else {
        req.session["access_token"] = data.access;
        req.session["refresh_token"] = data.refresh;
        console.log("After google: ", JSON.stringify(req.session), data.access);
        res.redirect("/programs");
      }
    });
  });

  app.get("/getAccessToken", function(req, res) {
    console.log(JSON.stringify(req.session));
    if(req.session && req.session["access_token"] && req.session["refresh_token"]) {
      auth.refreshAccess(req.session["refresh_token"], function(err, newToken) {
        if(err) { res.send(err); res.end(); }
        else {
          req.session["access_token"] = newToken;
          res.send({ access_token: newToken });
          res.end();
        }
      });
    }
    else {
      res.status(404).send("No account information found.");
    }
  });

  app.get("/editor", function(req, res) {
    res.sendfile("src/web/repl.html");
  });

  app.get("/api-test", function(req, res) {
    res.sendfile("src/web/api-play.html");
  });

  app.listen(config["port"]);

  onServerReady(app);

}

module.exports = {
  start: start
};
