function start(config, onServerReady) {
  var express = require('express');
  var cookieSession = require('cookie-session');
  var cookieParser = require('cookie-parser');
  var csrf = require('csurf');
  var googleAuth = require('./google-auth.js');
  var fs = require('fs');

  app = express();
  app.use(express.static(__dirname + "/../"));
  app.use("/teachpacks/", express.static(__dirname + "src/web/teachpacks/"))

  app.use(cookieSession({
    secret: config.sessionSecret,
    key: "code.pyret.org"
  }));
  app.use(cookieParser());
  app.use(csrf());

  var auth = googleAuth.makeAuth(config);

  app.get("/src/web/pyret.js", function(req, res) {
    res.set("Content-Encoding", "gzip");
    res.set("Content-Type", "application/javascript");
    res.send(fs.readFileSync("src/web/pyret.js.gz"));
  });

  app.get("/", function(req, res) {
    console.log("Index: ", JSON.stringify(req.session));
    res.sendfile("src/web/index.html");
  });

  app.get("/login", function(req, res) {
    if(!(req.session && req.session["access_token"])) {
      res.redirect(auth.getAuthUrl());
    }
    else {
      res.redirect("/my-programs");
    }
  });

  app.get(config.google.redirect, function(req, res) {
    auth.serveRedirect(req, function(err, data) {
      if(err) { res.send(err); }
      else {
        req.session["access_token"] = data.access;
        req.session["refresh_token"] = data.refresh;
        res.redirect("/my-programs");
      }
    });
  });

  app.get("/getAccessToken", function(req, res) {
    console.log("getAccessToken: ", JSON.stringify(req.session));
    if(req.session && req.session["access_token"] && req.session["refresh_token"]) {
      auth.refreshAccess(req.session["refresh_token"], function(err, newToken) {
        if(err) { res.send(err); res.end(); }
        else {
          req.session["access_token"] = newToken;
          req.session["refresh_token"] = req.session["refresh_token"];
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

  app.get("/my-programs", function(req, res) {
    console.log("My programs: ", JSON.stringify(req.session));
    res.sendfile("src/web/my-programs.html");
  });

  app.get("/api-test", function(req, res) {
    res.sendfile("src/web/api-play.html");
  });

  app.get("/logout", function(req, res) {
    req.session = null;
    delete req.session;
    res.redirect("/");
  });

  var server = app.listen(config["port"]);

  onServerReady(app, server);

}

module.exports = {
  start: start
};
