var Q = require("q");

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
  var db = config.db;

  app.get("/src/web/pyret.js", function(req, res) {
    res.set("Content-Encoding", "gzip");
    res.set("Content-Type", "application/javascript");
    res.send(fs.readFileSync("src/web/pyret.js.gz"));
  });

  app.get("/", function(req, res) {
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
        var existingUser = db.getUserByGoogle(data.googleId);
        var session = existingUser.then(function(result) {
          if(result.rows.length === 0) {
            var newUser = db.createUser({
              google_id: data.googleId,
              email: data.email,
              refresh_token: data.refresh
            });
            var newUserSession = newUser.spread(function(_, id) {
              var newSession = db.createSession({
                user_id: id,
                refresh_token: data.refresh,
                auth_token: data.access
              });
              return newSession;
            });
            return newUserSession;
          }
          else {
            var userId = result.rows[0].id;
            var thisUser;
            // The refresh token is present if the old one expired; we should
            // always use the most up-to-date token we've received from Google
            // TODO(joe): cache invalidation here
            if(data.refresh) {
              var updated = db.updateRefreshToken(userId, data.refresh);
              thisUser = updated.then(function(_) {
                return db.getUserById(userId).then(function(r) {
                  return r.rows[0];
                });
              });
            } else {
              thisUser = Q.fcall(function() { return result.rows[0] });
            }
            return thisUser.then(function(u) {
              return db.createSessionForUser(u, data.access);
            });
          }
        });
        session.spread(function(_, id) {
          req.session["session_id"] = id;
          res.redirect("/my-programs");
        });
        session.fail(function(err) {
          console.error("Authentication failure", err, err.stack);
          res.redirect("/authError");
        });
      }
    });
  });

  app.get("/getAccessToken", function(req, res) {
    function noAuth() {
      res.status(404).send("No account information found.");
    }
    if(req.session && req.session["session_id"]) {
      var maybeSession = db.getSession(req.session["session_id"]);
      var session = maybeSession.then(function(s) {
        if(s.rows.length === 0) {
          noAuth();
          return null;
        }
        var session = s.rows[0];
        return auth.refreshAccess(session.refresh_token, function(err, newToken) {
          if(err) { res.send(err); res.end(); return; }
          else {
            var newAccess = db.updateSessionAccessToken(session.id, newToken);
            return newAccess.then(function(_) {
              res.send({ access_token: newToken });
              res.end();
            });
          }
        });
      });
      session.fail(function(err) {
        console.log("Failed to get an access token: ", err);
        noAuth();
      });
    } else {
      noAuth();
    }
  });

  app.get("/editor", function(req, res) {
    res.sendfile("src/web/repl.html");
  });

  app.get("/my-programs", function(req, res) {
    if(req.session && req.session["session_id"]) {
      res.sendfile("src/web/my-programs.html");
    }
    else {
      res.redirect("/login"); 
    }
  });

  app.get("/api-test", function(req, res) {
    res.sendfile("src/web/api-play.html");
  });

  app.get("/logout", function(req, res) {
    if(req.session && req.session["session_id"]) {
      db.deleteSession(req.session["session_id"]);
    }
    req.session = null;
    delete req.session;
    // NOTE(joe): I stole this magical redirect sequence from WeScheme.
    // The continue parameter of accounts.google.com won't let you go
    // to an arbitrary site, but evidently appengine will, hence the double
    // redirect to get back to the home page.
    res.redirect("https://accounts.google.com/Logout?continue=https%3A%2F%2Fappengine.google.com%2F_ah%2Flogout%3Fcontinue%3D" + encodeURIComponent(config.baseUrl));
  });

  var server = app.listen(config["port"]);

  onServerReady(app, server);

}

module.exports = {
  start: start
};
