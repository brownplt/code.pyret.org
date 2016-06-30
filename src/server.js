var Q = require("q");
var gapi = require('googleapis');
var path = require('path');

function start(config, onServerReady) {
  var express = require('express');
  var cookieSession = require('cookie-session');
  var cookieParser = require('cookie-parser');
  var csrf = require('csurf');
  var googleAuth = require('./google-auth.js');
  var request = require('request');
  var mustache = require('mustache-express');
  var url = require('url');
  var fs = require('fs');

  function loggedIn(req) {
    var session = req.session;
    return session && session["user_id"];
  }

  function requireLogin(req, res) {
    var login = Q.defer();
    var session = req.session;
    function redirect() {
      res.redirect("/login?redirect=" + encodeURIComponent(req.originalUrl));
    }
    if(!session || !session["user_id"]) {
      redirect();
    }
    else {
      var maybeUser = db.getUserByGoogleId(req.session["user_id"]);
      maybeUser.then(function(u) {
        login.resolve(u);
      });
    }
    return login.promise;
  }

  app = express();


  // From http://stackoverflow.com/questions/7185074/heroku-nodejs-http-to-https-ssl-forced-redirect
  /* At the top, with other redirect methods before other routes */
  app.get('*',function(req,res,next){
    if(req.headers['x-forwarded-proto'] !== 'https' && !config.development)
      res.redirect(config.baseUrl + req.url);
    else
      next(); /* Continue to other routes if we're not redirecting */
  })

  // This has to go first to override other options
  app.get("/js/pyret.js", function(req, res) {
    res.set("Content-Encoding", "gzip");
    res.set("Content-Type", "application/javascript");
    res.send(fs.readFileSync("build/web/js/pyret.js.gz"));
  });

  app.use(cookieSession({
    secret: config.sessionSecret,
    key: "code.pyret.org"
  }));
  app.use(cookieParser());
  app.use(csrf());

  var auth = googleAuth.makeAuth(config);
  var db = config.db;

  app.set('views', __dirname + '/../build/web/views');
  app.engine('html', mustache());
  app.set('view engine', 'html');

  app.use(express.static(__dirname + "/../build/web/"));

  app.get("/close.html", function(_, res) { res.render("close.html"); });

  app.get("/", function(req, res) {
    var content = loggedIn(req) ? "My Programs" : "Log In";
    res.render("index.html", {
      LEFT_LINK: content,
      GOOGLE_API_KEY: config.GOOGLE_API_KEY
    });
  });

  app.get("/login", function(req, res) {
    var redirect = req.param("redirect") || "/editor";
    if(!(req.session && req.session["user_id"])) {
      res.redirect(auth.getAuthUrl(redirect));
    }
    else {
      res.redirect(redirect);
    }
  });

  app.get("/jsProxy", function(req, response) {
    var parsed = url.parse(req.url);
    var jsUrl = decodeURIComponent(parsed.query.slice(0));
    var gReq = request(jsUrl, function(error, jsResponse, body) {
      if(error || (jsResponse.statusCode >= 400)) {
        response.status(400).send({type: "no-js-file", error: "Couldn't load JS file from " + jsUrl});
        return;
      }
      response.send(body);
    });
  });

  var okGoogleDomains = [
    "spreadsheets.google.com",
    "googleapis.com",
    "drive.google.com",
    "googledrive.com"
  ];
  function checkGoogle(req, response) {
    var parsed = url.parse(req.url);
    var googleUrl = decodeURIComponent(parsed.query.slice(0));
    var parsedUrl = url.parse(googleUrl);
    var found = okGoogleDomains.filter(function(v) { return parsedUrl.host === v; });
    if(found.length === 0) {
      response.status(400).send({type: "invalid-domain", error: "Refusing to proxy request to domain " + parsedUrl.host});
      return null;
    }
    return googleUrl;
  }

  function hasMime(response, mimeList) {
    for (var i = 0; i < mimeList.length; i++) {
      if (response.indexOf(mimeList[i]) > -1) {
        return true;
      }
    }
    return false;
  }

  app.use(function(req, res, next) {
    var contentType = req.headers['content-type'] || '';
    var mime = contentType.split(';')[0];

    if (mime != 'application/atom+xml' && mime != 'application/json') {
      return next();
    }

    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function() {
      req.rawBody = data;
      next();
    });
  });

  app.post("/googleProxy", function(req, response) {
    var googleUrl = checkGoogle(req, response);
    if(googleUrl !== null) {
      var headers = {
        "Authorization": req.headers["authorization"],
        "GData-Version": "3.0",
        "content-type": req.headers["content-type"],
      };
      var post = request.post({
        url: googleUrl,
        body: req.rawBody,
        headers: headers
      });
      post.pipe(response);
    }
  });

  app.put("/googleProxy", function(req, response) {
    var googleUrl = checkGoogle(req, response);
    if(googleUrl !== null) {
      var headers = {
        "Authorization": req.headers["authorization"],
        "GData-Version": "3.0",
        "content-type": req.headers["content-type"],
        "If-Match": "*",
      };
      var put = request.put({
        url: googleUrl,
        body: req.rawBody,
        headers: headers
      });
      put.pipe(response);
    }
  });

  app.get("/googleProxy", function(req, response) {
    var googleUrl = checkGoogle(req, response);
    // Check if the request is expecting a result other than
    // JSON or XML (and, if so, block it)
    if(req.accepts && !req.accepts('json') && !req.accepts('atom+xml')) {
      response.sendStatus(403);
    }
    if(googleUrl !== null) {
      var headers = {
        "Authorization": req.headers["authorization"],
        "GData-Version": "3.0",
        "content-type": req.headers["content-type"],
      };
      var get = request.get({
        url: googleUrl,
        body: req.rawBody,
        headers: headers
      }).on('response', function(res){
        var contentType = res.headers['content-type'];
        // Likely to have multiple MIME types, so
        // we need to check substrings
        if (hasMime(contentType, ['application/json', 'application/atom+xml'])) {
          res.headers['X-Pyret-Token'] = req.csrfToken();
          get.pipe(response);
        } else {
          response.sendStatus(403);
        }
      });
    }
  });

  app.delete("/googleProxy", function(req, response) {
    var googleUrl = checkGoogle(req, response);
    if(googleUrl !== null) {
      req.pipe(request(googleUrl)).pipe(response);
    }
  });

  app.get("/downloadGoogleFile", function(req, response) {
    var parsed = url.parse(req.url);
    var googleId = decodeURIComponent(parsed.query.slice(0));
    var googleLink = "https://googledrive.com/host/" + googleId;
    /*
    var googleParsed = url.parse(googleLink);
    console.log(googleParsed);
    var host = googleParsed['hostname'];
    if(host !== 'googledrive.com') {
      response.status(400).send({type: "bad-domain", error: "Tried to get a file from non-Google host " + host});
      return;
    }
    */
    var gReq = request(googleLink, function(error, googResponse, body) {
      var h = googResponse.headers;
      var ct = h['content-type']
      if(ct.indexOf('text/plain') !== 0) {
        response.status(400).send({type: "bad-file", error: "Invalid file response " + ct});
        return;
      }
      response.set('content-type', 'text/plain');
      response.send(body);
    });
  });

  app.get("/downloadImg", function(req, response) {
    var parsed = url.parse(req.url);
    var googleLink = decodeURIComponent(parsed.query.slice(0));
    var googleParsed = url.parse(googleLink);
    var gReq = request({url: googleLink, encoding: 'binary'}, function(error, imgResponse, body) {
      var h = imgResponse.headers;
      var ct = h['content-type']
      if(ct.indexOf('image/') !== 0) {
        response.status(400).send({type: "non-image", error: "Invalid image type " + ct});
        return;
      }
      response.set('content-type', ct);
      response.end(body, 'binary');
    });
  });

  app.get(config.google.redirect, function(req, res) {
    auth.serveRedirect(req, function(err, data) {
      if(err) { res.send({type: "auth error", error: err}); }
      else {
        var existingUser = db.getUserByGoogleId(data.googleId);
        existingUser.fail(function(err) {
          console.error("Error on getting user: ", err);
          res.send({type: "DB error", error: err});
        });
        var user = existingUser.then(function(user) {
          if(user === null) {
            var newUser = db.createUser({
              google_id: data.googleId,
              refresh_token: data.refresh
            });
            return newUser;
          }
          else {
            var thisUser = user;
            // The refresh token is present if the old one expired; we should
            // always use the most up-to-date token we've received from Google
            // TODO(joe): cache invalidation here
            if(data.refresh) {
              var updated = db.updateRefreshToken(user.google_id, data.refresh);
              thisUser = updated.then(function(_) {
                return db.getUserByGoogleId(data.googleId);
              });
            } else {
              thisUser = Q.fcall(function() { return user; });
            }
            return thisUser;
          }
        });
        user.then(function(u) {
          const redirect = req.param("state") || "/editor";
          req.session["user_id"] = u.google_id;
          res.redirect(redirect);
        });
        user.fail(function(err) {
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
    if(req.session && req.session["user_id"]) {
      var maybeUser = db.getUserByGoogleId(req.session["user_id"]);
      maybeUser.then(function(u) {
        if(u === null) {
          noAuth();
          return null;
        }
        return auth.refreshAccess(u.refresh_token, function(err, newToken) {
          if(err) { res.send(err); res.end(); return; }
          else {
            res.send({ access_token: newToken });
            res.end();
          }
        });
      });
      maybeUser.fail(function(err) {
        console.error("Failed to get an access token: ", err);
        noAuth();
      });
    } else {
      noAuth();
    }
  });

  app.get("/new-from-drive", function(req, res) {
    var u = requireLogin(req, res);
    u.then(function(user) {
      auth.refreshAccess(user.refresh_token, function(err, newToken) {
        var client = new gapi.auth.OAuth2(
            config.google.clientId,
            config.google.clientSecret,
            config.baseUrl + config.google.redirect
          );
        client.setCredentials({
          access_token: newToken
        });
        var drive = gapi.drive({ version: 'v2', auth: client });
        var parsed = url.parse(req.url, true);
        var state = decodeURIComponent(parsed.query["state"]);
        var folderId = JSON.parse(state)["folderId"];
        drive.files.insert({
          resource: {
            title: 'new-file.arr',
            mimeType: 'text/plain',
            parents: [{id: folderId}]
          },
          media: {
            mimeType: 'text/plain',
            body: ''
          }
        }, function(err, response) {
          if(err) {
            res.redirect("/editor");
          }
          else {
            res.redirect("/editor#program=" + response.id);
          }
        });
      });
    });
  });

  app.get("/open-from-drive", function(req, res) {
    var u = requireLogin(req, res);
    u.then(function(user) {
      var parsed = url.parse(req.url, true);
      var state = decodeURIComponent(parsed.query["state"]);
      var programId = JSON.parse(state)["ids"][0];
      res.redirect("/editor#program=" + programId);
    });
  });

  app.get("/editor", function(req, res) {
    res.render("editor.html");
  });

  app.get("/ide", function(req, res) {
    res.render(
      path.resolve(__dirname, "web", "ide.html"),
      {ASSET_BASE_URL: process.env.ASSET_BASE_URL || ''}
    );
  });

  app.get("/neweditor", function(req, res) {
    res.sendfile("build/web/editor.html");
  });

  app.get("/share", function(req, res) {

  });

  app.get("/embeditor", function(req, res) {
    res.sendfile("build/web/embedditor.html");
  });

  app.get("/my-programs", function(req, res) {
    var u = requireLogin(req, res);
    u.then(function(user) {
      res.sendfile("build/web/my-programs.html");
    });
  });
  app.get("/api-test", function(req, res) {
    res.sendfile("build/web/api-play.html");
  });

  app.get("/logout", function(req, res) {
    req.session = null;
    delete req.session;
    res.redirect("/");
  });

  app.get("/grade", function(req, res) {
    res.render("grade.html");
  });

  var server = app.listen(config["port"]);

  onServerReady(app, server);

}

module.exports = {
  start: start
};
