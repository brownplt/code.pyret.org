var Q = require("q");
var gapi = require('googleapis').google; // https://github.com/googleapis/google-auth-library-nodejs/issues/355
var path = require('path');
var uuid = require('node-uuid');
const { google } = require("googleapis");
const { drive } = require("googleapis/build/src/apis/drive/index.js");

var BACKREF_KEY = "originalProgram";

function start(config, onServerReady) {
  var express = require('express');
  var cookieSession = require('cookie-session');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
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
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  // From http://stackoverflow.com/questions/7185074/heroku-nodejs-http-to-https-ssl-forced-redirect
  /* At the top, with other redirect methods before other routes */
  app.get('*',function(req,res,next){
    if(req.headers['x-forwarded-proto'] !== 'https' && !config.development)
      res.redirect(config.baseUrl + req.url);
    else
      next(); /* Continue to other routes if we're not redirecting */
  })

  app.get("/__pyret-compiler", function(req, res) {
    request.get(config.pyret).pipe(res);
  });

  // This has to go first to override other options
  app.get("/js/pyret.js", function(req, res) {
    res.set("Content-Encoding", "gzip");
    res.set("Content-Type", "application/javascript");
    res.send(fs.readFileSync("build/web/js/pyret.js.gz"));
  });
  app.get("/js/cpo-main.jarr.gz.js", function(req, res) {
    res.set("Content-Encoding", "gzip");
    res.set("Content-Type", "application/javascript");
    res.send(fs.readFileSync("build/web/js/cpo-main.jarr.gz.js"));
  });

  app.use(cookieSession({
    secret: config.sessionSecret,
    key: "code.pyret.org"
  }));
  app.use(cookieParser());

  var auth = googleAuth.makeAuth(config);
  var db = config.db;

  app.set('views', __dirname + '/../build/web/views');
  app.engine('html', mustache());
  app.engine('js', mustache());
  app.set('view engine', ['html', 'js']);
  app.set('view cache', process.env.NODE_ENV !== 'development');

  app.get("/current-version", function(req, res) {
    res.status(200);
    res.send(JSON.stringify({version: config.version}));
    res.end();
  });

  app.use(express.static(__dirname + "/../build/web/"));

  app.use(csrf());

  app.get("/close.html", function(_, res) { res.render("close.html"); });
  app.get("/faq.html", function(_, res) { res.render("faq.html"); });
  app.get("/privacy.html", function(_, res) { res.render("privacy.html"); });
  app.get("/privacy/", function(_, res) { res.render("privacy.html"); });

  app.get("/faq", function(_, res) { res.render("faq.html"); });

  app.get("/", function(req, res) {
    var content = loggedIn(req) ? "My Programs" : "Log In";
    res.render("index.html", {
      PYRET: process.env.PYRET,
      LEFT_LINK: content,
      GOOGLE_API_KEY: config.google.apiKey,
      BASE_URL: config.baseUrl,
      LOG_URL: config.logURL,
      GIT_REV : config.gitRev,
      GIT_BRANCH: config.gitBranch
    });
  });

  app.get("/apiKey", function(req, res) {
    res.send(config.google.apiKey);
  });

  app.get("/login", function(req, res) {
    var redirect = req.param("redirect") || "/editor";
    var scopesParam = req.param("scopes") === "full" ? "full" : "default";
    var scopes = scopesParam === "full" ? googleAuth.FULL_OAUTH_SCOPES : googleAuth.DEFAULT_OAUTH_SCOPES;
    if(!(req.session && req.session["user_id"])) {
      req.session["scopes"] = scopesParam;
      res.redirect(auth.getAuthUrl(redirect, scopes));
    }
    else {
      var oldscopes = req.session["scopes"];
      // If the user was on the default (or had no param set), then trigger
      // the auth page to upgrade them
      if(scopesParam === "full" && oldscopes !== scopesParam) {
        req.session["scopes"] = scopesParam;
        res.redirect(auth.getAuthUrl(redirect, scopes));
      }
      else {
        res.redirect(redirect);
      }
    }
  });

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

  if(config.development) {
    app.use(express.static(__dirname + "/../test-util/"));
    app.get("/keys", function(req, res) {
      var keys = db.getKeys(req.query.q);
      keys.then(function(keys) {
        res.status(200);
        res.send(keys.join("<br/>"));
        res.end();
      });
      keys.fail(function(err) {
        res.status(500);
        res.send(String(err));
        res.end();
      });
    });
  }

  app.get("/downloadImg", function(req, response) {
    var parsed = url.parse(req.url);
    var googleLink = decodeURIComponent(parsed.query.slice(0));
    var googleParsed = url.parse(googleLink);
    var gReq = request({url: googleLink, encoding: 'binary'}, function(error, imgResponse, body) {
      if(error) {
        response.status(400).send({type: "image-load-failure", error: "Unable to load image " + String(error)});
      }
      else {
        var h = imgResponse.headers;
        var ct = h['content-type'];
        if((!ct) || (ct.indexOf('image/') !== 0)) {
          response.status(400).send({type: "non-image", error: "Invalid image type " + ct});
          return;
        }
        response.set('content-type', ct);
        response.end(body, 'binary');
      }
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
            res.send({ access_token: newToken, user_id: req.session["user_id"] });
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

  app.get("/new-project", function(req, res) {
    var u = requireLogin(req, res);
    u.then(function(user) {
      auth.refreshAccess(user.refresh_token, function(err, newToken) {
        const userClient = new gapi.auth.OAuth2(
            config.google.clientId,
            config.google.clientSecret,
            config.baseUrl + config.google.redirect
          );
        userClient.setCredentials({
          access_token: newToken
        });
        var parsed = url.parse(req.url, true);
        var projectName = decodeURIComponent(parsed.query["projectName"]);
        var drive = gapi.drive({ version: 'v3', auth: userClient });
        drive.files.create({
          requestBody: {
            name: projectName,
            mimeType:  'application/vnd.google-apps.folder',
          }
        }).then((result) => {
          res.redirect(`/anchor/?folder=${result.data.id}`);
        });
      });
    });
  });

  app.get("/project-from-template", function(req, res) {
    var u = requireLogin(req, res);
    u.then(function(user) {
      auth.refreshAccess(user.refresh_token, function(err, newToken) {
        const userClient = new gapi.auth.OAuth2(
            config.google.clientId,
            config.google.clientSecret,
            config.baseUrl + config.google.redirect
          );
        userClient.setCredentials({
          access_token: newToken
        });
        const auth = new gapi.auth.GoogleAuth({scopes: "https://www.googleapis.com/auth/drive"})
          .fromAPIKey(config.google.apiKey);
        const serverClient = gapi.drive({ version: "v3", auth });
        var drive = gapi.drive({ version: 'v3', auth: userClient });
        var parsed = url.parse(req.url, true);
        var folderId = decodeURIComponent(parsed.query["folderId"]);

        lookForProjectOrCopyStructure(serverClient, drive, folderId).then(target => {
          console.log("target: ", target);
          res.redirect(`/anchor?folder=${target.projectDir.id}`);
        }).catch((err) => {
          console.error(err);
          res.status(500).send("Error when copying or opening project from template: " + String(err));
        });
      });
    });
  });
  
  /*
    The setup for creating a project like this is:

    1. The project template is available to "anyone with the link" on Drive
    2. The user visits a project template copy link, or opens the file with CPO

    Because of Drive limitations, the Drive API *cannot see* public files when
    authenticated with the user's credentials.

    So, we make a folder on behalf of the user, share it with the service
    account, then copy all the files into it using the service account, then
    transfer ownership to the user and drop our permissions.

    This avoids having to put e.g. the entire contents of every file (which in
    the long-term may include images or data files) into [a] memory in the
    server process or [b] the service account's Drive. The server of course has
    temporary access to it, but that's just to the template.

    */

  var PROJECT_BACKREF = "originalProjectFile";

  function copyFileOrDir(serverDrive, clientDrive, parentId, fileInfo, serverEmailAddress) {
    let parents;
    if(!parentId) { parents = []; }
    else { parents = [parentId];  }
    const properties = {
      [PROJECT_BACKREF]: String(fileInfo.id),
      [PROJECT_BACKREF + "Flag"]: "true"
    };
    // Note that we copy no matter what; both files and directories get copied
    return new Promise((resolve, reject) => {
      if(fileInfo.mimeType === 'application/vnd.google-apps.folder') {
        clientDrive.files.create({
          requestBody: {
            name: fileInfo.name,
            mimeType:  'application/vnd.google-apps.folder',
            parents,
            properties,
          }
        })
        .then(copyResult => {
          console.log("New directory: ", copyResult);
          serverDrive.files.list({
            key: config.google.apiKey,
            q: `"${fileInfo.id}" in parents and not trashed`,
            fields: 'files(id, name, mimeType, modifiedTime, modifiedByMeTime, webContentLink, iconLink, thumbnailLink)',
          }).then(files => {
            console.log("Directory contents: ", files);
            // NOTE(joe): deliberately parallel
            Promise.all(files.data.files.map(f => copyFileOrDir(serverDrive, clientDrive, copyResult.data.id, f, serverEmailAddress)))
            .then(copiedFiles => {
              resolve(copyResult.data);
            })
            .catch(err => {
              console.error("Error copying directory contents: ", err);
            })
          });
        });
      }
      else {
        // Copy files using the *server* drive. This avoids streaming all the
        // data for each file through the server. For now this will show up as
        // being owned by the server.
        serverDrive.files.get({
          fileId: fileInfo.id,
          alt: 'media',
          key: config.google.apiKey,
        }).then(fileContent => {
          clientDrive.files.create({
            requestBody: {
              parents,
              properties,
              name: fileInfo.name
            },
            media: {
              mimeType: fileInfo.mimeType,
              body: fileContent.data
            }
          })
          .then(copiedFile => {
            console.log("File copied: ", copiedFile);
            resolve(copiedFile.data);
          })
        })
        .catch(err => { console.error("Error while copying: ", err)});
      }

    })
  }

  // Need to create the file in *their* drive because it requires an explicit
  // user interaction to give away a file (this makes some sense because of
  // quotas).
  //
  // So we have to create with clientDrive, give write permission to us, then 
  // drop (maybe) our write permissions after copying everything. All
  // directories should be made and then have perms updated (if
  // necessary/they don't inherit)

  // http://localhost:4999/project-from-template?state={%22ids%22:[%221NP2trCExDCdbUu17j9SGTQAFJOYddpOY%22],%22action%22:%22open%22,%22userId%22:%22106201725712570479817%22,%22resourceKeys%22:{}}
  function lookForProjectOrCopyStructure(serverDrive, clientDrive, fileId) {
    return new Promise((resolve, reject) => {
      // The permissionID
      clientDrive.files.list({
        q: `properties has {key='${PROJECT_BACKREF}' and value='${fileId}'} and trashed=false`
      }).then(files => {
        console.log("Files with key result: ", files);
        if(files.data.files.length === 0) {
          console.log("About to get dir data: ", { fileId, key: config.google.apiKey });
          return serverDrive.files.get({ fileId, key: config.google.apiKey }).then((dirInfo) => {
            return copyFileOrDir(serverDrive, clientDrive, false, dirInfo.data).then(copied => {
              console.log("made a full copy of the directory");
              resolve({
                copied: true,
                projectDir: copied
              });
            });
          });
        }
        else {
          console.log("Directory existed, so not copying");
          resolve({
            copied: false,
            projectDir: files.data.files[0]
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

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
    res.render("editor.html", {
      PYRET: process.env.PYRET,
      BASE_URL: config.baseUrl,
      GOOGLE_API_KEY: config.google.apiKey,
      GOOGLE_APP_ID: config.google.appId,
      CSRF_TOKEN: req.csrfToken(),
      LOG_URL: config.logURL,
      GIT_REV : config.gitRev,
      GIT_BRANCH: config.gitBranch,
      POSTMESSAGE_ORIGIN: process.env.POSTMESSAGE_ORIGIN
    });
  });

  app.get(/\/ide(\/.*)?$/, function(req, res) {
    res.render(
      path.resolve(__dirname, "web", "ide.html"),
      {ASSET_BASE_URL: process.env.ASSET_BASE_URL || ''}
    );
  });

  app.get("/neweditor", function(req, res) {
    res.sendfile("build/web/editor.html");
  });

  app.get("/source-map.js", function(req, res) {
    res.sendfile("build/web/js/source-map.js");
  });

  app.get("/share", function(req, res) {

  });


  app.post("/share-image", function(req, res) {
    var driveFileId = req.body.fileId;
    var maybeUser = db.getUserByGoogleId(req.session["user_id"]);
    maybeUser.then(function(u) {
      if(u === null) {
        res.status(403).send("Invalid or inaccessible user information");
        return null;
      }
      auth.refreshAccess(u.refresh_token, function(err, newToken) {
        if(err) { res.send(err); res.end(); return; }
        else {
          var drive = getDriveClient(newToken, 'v2');
          drive.permissions.insert({
            fileId: driveFileId,
            resource: {
              'role': 'reader',
              'type': 'anyone',
              'value': 'default',
              'withLink': true
            }
          }, function(err, response) {
            // Success or failure of permission change is not relevant
            var sharedProgram = db.createSharedProgram(driveFileId, u.google_id);
            sharedProgram.then(function(sp) {
              res.status(200);
              res.send({
                id: driveFileId
              });
              res.end();
            });
            return sharedProgram;
          });
        }
      });
    });

  });

  app.post("/create-shared-program", function(req, res) {
    var driveFileId = req.body.fileId;
    var title = req.body.title;
    var collectionId = req.body.collectionId;
    var maybeUser = db.getUserByGoogleId(req.session["user_id"]);
    maybeUser.then(function(u) {
      if(u === null) {
        res.status(403).send("Invalid or inaccessible user information");
        return null;
      }
      auth.refreshAccess(u.refresh_token, function(err, newToken) {
        if(err) { res.send(err); res.end(); return; }
        else {
          var drive = getDriveClient(newToken, 'v2');

          var newFileP = Q.defer();

          drive.files.copy({
            fileId: driveFileId,
            resource: {
              name: title + " published",
              parents: [{id: collectionId}],
              properties: [{
                  "key": BACKREF_KEY,
                  "value": String(driveFileId),
                  "visibility": "PRIVATE"
                },
                // NOTE(joe): Adding this because there is no way to query for the
                // presence or absence of a key, just query by specific values.
                // In order to usefully filter these results, add a flag property
                // whose value will always be true.
                // https://stackoverflow.com/questions/23900988/how-to-search-google-drive-for-file-with-a-specific-property/26286007
                {
                  "key": BACKREF_KEY + "Flag",
                  "value": "true",
                  "visibility": "PRIVATE"
                },
              ]
            }
          }, function(err, response) {
            if(err) { newFileP.reject(err); }
            else {
              newFileP.resolve(response);
            }
          });

          // This doesn't have to succeed, and may not for some GAE accounts
          var updatedP = newFileP.promise.then(function(newFile) {
            return drive.permissions.insert({
              fileId: newFile.id,
              resource: {
                'role': 'reader',
                'type': 'anyone',
                'id': newFile.permissionId,
                'withLink': true
              }
            });
          });

          var done = newFileP.promise.then(function(newFile) {
            const newFileId = newFile.data.id;
            var sharedProgram = db.createSharedProgram(newFileId, u.google_id);
            sharedProgram.then(function(sp) {
              res.send({
                id: newFileId,
                modifiedDate: newFile.modifiedDate,
                title: title
              });
              res.end();
            });
            return sharedProgram;
          });
          done.fail(function(err) {
            res.status(500);
            console.error("Failed to create shared file: ", err);
            res.send("Failed to create shared file");
            res.end();
          });
        }
      });
    });
    maybeUser.fail(function(err) {
      console.error("Failed to get an access token: ", err);
      noAuth();
    });
  });

  function getDriveClient(token, version) {
    var client = new gapi.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        config.baseUrl + config.google.redirect
      );
    client.setCredentials({
      access_token: token
    });

    var drive = gapi.drive({ version: version, auth: client });
    return drive;
  }

  function fileAndToken(sharedProgramId, res) {
    var file = db.getSharedProgram(sharedProgramId);
    var refreshToken = file.then(function(f) {
      var uP = db.getUserByGoogleId(f.userId);
      return uP.then(function(u) {
        return u.refresh_token;
      });
    });
    var both = Q.all([file, refreshToken]);
    return both;
  }

  function getSharedContents(id) {
    var ret = Q.defer();
    if(!id) {
      ret.reject("No id given");
      return;
    }
    var both = fileAndToken(id);
    both.fail(function(err) {
      ret.reject("Fetching shared file failed");
    });
    both.then(function(both) {
      var prog = both[0];
      var refreshToken = both[1];
      auth.refreshAccess(refreshToken, function(err, newToken) {
        if(err) { ret.reject("Could not access shared file."); return; }
        else {
        /*
          Rather than mucking with the client library, just construct the request
          ourselves, using the lightly documented but remarkably stable alt=media
          parameter (noted in
          https://developers.google.com/drive/api/v3/reference/files/get and
          https://developers.google.com/drive/api/v3/manage-downloads)

          Note that when I try the Node.js example for downloading files at
          https://developers.google.com/drive/api/v3/manage-downloads, I get an error
          that `.on` is not a function (neither is `.pipe`), so I'm not sure what's going
          on with that API documentation, but this gives us a pipe-able response.

          In any event, this request is relatively straightforward and the
          `Bearer` header is a fine way to manage & send the token, so there's
          little value in going through the library anyway.
        */ 
          const requestURL = `https://www.googleapis.com/drive/v3/files/${prog.programId}?alt=media`;
          const getResponse = request({url: requestURL, headers: { Authorization: `Bearer ${newToken}`}});
          ret.resolve(getResponse);
        }
      })
    });
    return ret.promise;
  }

  app.get("/shared-program-contents", function(req, res) {
    var contents = getSharedContents(req.query.sharedProgramId);
    contents.fail(function(err) {
      res.status(400);
      res.send("Unable to fetch shared file");
      res.end();
    });
    contents.then(function(response) {
      if(!response.headers['content-type'] === "text/plain") {
        res.status(400);
        res.send("Expected a text file, but got: " + response.headers["content-type"]);
        res.end();
      }
      else {
        response
          .on("response", (r) => r.headers["content-disposition"] = `inline; filename="${req.query.sharedProgramId}"`)
          .pipe(res);
      }
    });
  });

  app.get("/shared-image-contents", function(req, res) {
    var contents = getSharedContents(req.query.sharedImageId);
    contents.then(function(response) {
      response
        .on("response", (r) => r.headers["content-disposition"] = `inline; filename="${req.query.sharedImageId}"`)
        .pipe(res);
    })
    .fail(function(err) {
      res.status(400);
      res.send("Could not access shared file, or shared file was not an image.");
      res.end();
    });
  });

  app.get("/shared-file", function(req, res) {
    var sharedProgramId = req.query.sharedProgramId;
    var both = fileAndToken(sharedProgramId);
    both.fail(function(err) {
      console.error(err);
      res.status(404).send("No share information found for " + sharedProgramId);
      res.end();
    });
    both.then(function(both) {
      var prog = both[0];
      var refreshToken = both[1];
      auth.refreshAccess(refreshToken, function(err, newToken) {
        if(err) { res.status(403).send("Couldn't access shared file " + sharedProgramId); res.end(); return; }
        else {
          var drive = getDriveClient(newToken, 'v2');
          drive.files.get({fileId: sharedProgramId}, function(err, response) {
            if(err) { res.status(400).send("Couldn't access shared file " + sharedProgramId); }
            else {
              res.send({
                id: response.data.id,
                modifiedDate: response.data.modifiedDate,
                title: response.data.title,
                selfLink: response.data.selfLink
              });
              res.status(200);
              res.end();
            }
          });
        }
      });
    });
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

  var server = app.listen(config["port"]);

  onServerReady(app, server);

}

module.exports = {
  start: start
};
