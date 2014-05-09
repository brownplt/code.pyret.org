var Q = require("q");

function start(config, onServerReady) {
  var express = require('express');
  var cookieSession = require('cookie-session');
  var cookieParser = require('cookie-parser');
  var jsonParser = require('express-json');
  var expressValidator = require('express-validator');
  var csrf = require('csurf');
  var googleAuth = require('./google-auth.js');
  var fs = require('fs');

  app = express();
  app.use(express.static(__dirname + "/../"));
  app.use("/teachpacks/", express.static(__dirname + "src/web/teachpacks/"))

  app.use(jsonParser());
  app.use(expressValidator([{}]));

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
    var redirect = req.param("redirect") || "/my-programs";
    if(!(req.session && req.session["access_token"])) {
      res.redirect(auth.getAuthUrl(redirect));
    }
    else {
      res.redirect(redirect);
    }
  });

  app.get(config.google.redirect, function(req, res) {
    auth.serveRedirect(req, function(err, data) {
      if(err) { res.send(err); }
      else {
        var existingUser = db.getUserByGoogle(data.googleId);
        var session = existingUser.then(function(user) {
          if(user === null) {
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
            var thisUser = user;
            // The refresh token is present if the old one expired; we should
            // always use the most up-to-date token we've received from Google
            // TODO(joe): cache invalidation here
            if(data.refresh) {
              var updated = db.updateRefreshToken(userId, data.refresh);
              thisUser = updated.then(function(_) {
                return db.getUserById(userId);
              });
            } else {
              thisUser = Q.fcall(function() { return user; });
            }
            return thisUser.then(function(u) {
              return db.createSessionForUser(u, data.access);
            });
          }
        });
        session.spread(function(_, id) {
          const redirect = req.param("state") || "/my-programs"; 
          req.session["session_id"] = id;
          res.redirect(redirect);
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
        if(s === null) {
          noAuth();
          return null;
        }
        var session = s;
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

  const teacherSignupUrl = "/teacher-signup";
  app.get(teacherSignupUrl, function(req, res) {
    if(req.session && req.session["session_id"]) {
      const info = db.getSession(req.session["session_id"]).then(function(s) {
        if(s === null) {
          res.redirect("/login?redirect=" + encodeURIComponent(teacherSignupUrl));
          return null;
        }
        return db.getTeacherInfoByUser(s.user_id);
      });
      const result = info.then(function(ti) {
        console.log("Teacher signed up before");
        if(ti !== null) {
          console.log("Teacher signed up before");
          res.sendfile("src/web/teacher-signup-done-already.html");
        }
        else {
          console.log("Teacher hasn't signed up before");
          res.sendfile("src/web/teacher-signup.html");
        }
      });
      result.fail(function(err) {
        console.error("Failed to get file: ", err);
      });
    }
    else {
      res.redirect("/login?redirect=" + encodeURIComponent(teacherSignupUrl));
    }
  });

  app.get("/newteacher", function(req, res) {
    if(req.session && req.session["session_id"]) {
      const info = db.getSession(req.session["session_id"]).then(function(s) {
        if(s === null) {
          throw [{msg: "Not logged in"}];
        }
        return [db.getTeacherInfoByUser(s.user_id), s.user_id];
      });
      const result = info.spread(function(ti, userId) {
        if(ti !== null) { 
          throw [{msg: "Already requested"}];
        }
        else {
          console.log(req.param("altemail"));
          req.checkQuery("name", "Name too long (max 100 chars)").len(0, 100);
          req.checkQuery("name", "Name not present").notEmpty();
          req.checkQuery("school", "School name too long (max 100 chars)").len(0, 100);
          req.checkQuery("school", "School not present").notEmpty();
          req.checkQuery("about", "About too long (max 5000 chars)").len(0, 5000);
          req.checkQuery("alt-email", "Email not present").notEmpty();
          req.checkQuery("alt-email", "Invalid email").isEmail();
          const errors = req.validationErrors();
          if(errors.length > 0) {
            console.error(errors);
            throw errors;
          }
          else {
            return db.createTeacherInfo({
              userId: userId,
              name: req.param("name"),
              alternateEmail: req.param("altemail"),
              school: req.param("school"),
              about: req.param("about")
            });
          }
        }
      })
      result.fail(function(errors) {
        console.error(errors);
        res.status(401).send(errors);
      });
      result.then(function(r) {
        res.send("OK");
      });
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
    res.redirect("/");
  });

  app.get("/logoutBoth", function(req, res) {
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
