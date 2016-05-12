// assumes gapi bound to Google API

function createProgramCollectionAPI(clientId, apiKey, collectionName, immediate) {

  gapi.client.setApiKey(apiKey);
  var drive;
  var SCOPE = "https://www.googleapis.com/auth/drive.file "
    + "https://spreadsheets.google.com/feeds "
    + "https://www.googleapis.com/auth/drive.install";
  var FOLDER_MIME = "application/vnd.google-apps.folder";
  var BACKREF_KEY = "originalProgram";
  var PUBLIC_LINK = "pubLink";

  var refresh = function(immediate) {
    return reauth(true);
  };

  function authCheck(f) {
    function isAuthFailure(result) {
      return result &&
        (result.error && result.error.code && result.error.code === 401) ||
        (result.code && result.code === 401);
    }
    var retry = f().then(function(result) {
      if(isAuthFailure(result)) {
        return refresh().then(function(authResult) {
          if(!authResult || authResult.error) {
            return {error: { code: 401, message: "Couldn't re-authorize" }};
          }
          else {
            return f();
          }
        });
      } else {
        return result;
      }
    });
    return retry.then(function(result) {
      if(isAuthFailure(result)) {
        throw new Error("Authentication failure");
      }
      return result;
    });
  }

  function gQ(request, skipAuth) {
    var oldAccess = gapi.auth.getToken();
    if(skipAuth) { gapi.auth.setToken({access_token: null}); }
    var ret = failCheck(authCheck(function() {
      var d = Q.defer();
      request.execute(function(result) {
        d.resolve(result);
      });
      return d.promise;
    }));
    if(skipAuth) {
      ret.fin(function() {
        gapi.auth.setToken({access_token: oldAccess});
      });
    }
    return ret;
  }

  function DriveError(err) {
    this.err = err;
  }
  DriveError.prototype = Error.prototype;

  function failCheck(p) {
    return p.then(function(result) {
      // Network error
      if(result && result.error) {
        console.error("Error fetching file from gdrive: ", result);
        throw new DriveError(result);
      }
      if(result && (typeof result.code === "number") && (result.code >= 400)) {
        console.error("40X Error fetching file from gdrive: ", result);
        throw new DriveError(result);
      }
      return result;
    });
  }

  function createAPI(baseCollection) {
    function makeSharedFile(googFileObject) {
      return {
        shared: true,
        getContents: function() {
          var proxyDownloadLink = "/downloadGoogleFile?" + googFileObject.id;
          return Q($.ajax(proxyDownloadLink, {
            method: "get",
            dataType: 'text'
          })).then(function(response) {
            return response;
          });
        },
        getName: function() {
          return googFileObject.title;
        },
        getDownloadLink: function() {
          return googFileObject.downloadUrl;
        },
        getModifiedTime: function() {
          return googFileObject.modifiedDate;
        },
        getUniqueId: function() {
          return googFileObject.id;
        },
      };

    }
    function makeFile(googFileObject, mimeType, fileExtension) {
      return {
        shared: false,
        getName: function() {
          return googFileObject.title;
        },
        getDownloadLink: function() {
          return googFileObject.downloadUrl;
        },
        getModifiedTime: function() {
          return googFileObject.modifiedDate;
        },
        getUniqueId: function() {
          return googFileObject.id;
        },
        getExternalURL: function() {
          return googFileObject.alternateLink;
        },
        getShares: function() {
          return gQ(drive.files.list({
              q: "trashed=false and properties has {key='" + BACKREF_KEY + "' and value='" + googFileObject.id + "' and visibility='PRIVATE'}"
            }))
          .then(function(files) {
            if(!files.items) { return []; }
            else { return files.items.map(fileBuilder); }
          });;
        },
        getContents: function() {
          return Q($.ajax(googFileObject.downloadUrl, {
            method: "get",
            dataType: 'text',
            headers: {'Authorization': 'Bearer ' + gapi.auth.getToken().access_token },
          })).then(function(response) {
            return response;
          });
        },
        rename: function(newName) {
          return gQ(drive.files.update({
            fileId: googFileObject.id,
            resource: {
              'title': newName
            }
          })).then(fileBuilder);
        },
        makeShareCopy: function() {
          var shareCollection = findOrCreateShareDirectory();
          var newFile = shareCollection.then(function(c) {
            var sharedTitle = googFileObject.title;
            return gQ(drive.files.copy({
              fileId: googFileObject.id,
              resource: {
                "parents": [{id: c.id}],
                "title": sharedTitle,
                "properties": [{
                    "key": BACKREF_KEY,
                    "value": String(googFileObject.id),
                    "visibility": "PRIVATE"
                  }]
              }
            }));
          });
          var updated = newFile.then(function(newFile) {
            return gQ(drive.permissions.insert({
              fileId: newFile.id,
              resource: {
                'role': 'reader',
                'type': 'anyone',
                'id': googFileObject.permissionId
              }
            }));
          });
          return Q.all([newFile, updated]).spread(function(fileObj) {
            return fileBuilder(fileObj);
          });
        },
        save: function(contents, newRevision) {
          // NOTE(joe): newRevision: false will cause badRequest errors as of
          // April 30, 2014
          if(newRevision) { 
            var params = { 'newRevision': true };
          }
          else {
            var params = {};
          }
          const boundary = '-------314159265358979323846';
          const delimiter = "\r\n--" + boundary + "\r\n";
          const close_delim = "\r\n--" + boundary + "--";
          var metadata = {
            'mimeType': mimeType,
            'fileExtension': fileExtension
          };
          var multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                contents +
                close_delim;

          var request = gapi.client.request({
              'path': '/upload/drive/v2/files/' + googFileObject.id,
              'method': 'PUT',
              'params': {'uploadType': 'multipart'},
              'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
              },
              'body': multipartRequestBody});
          return gQ(request).then(fileBuilder);
        },
        _googObj: googFileObject
      };
    }

    // The primary purpose of this is to have some sort of fallback for
    // any situation in which the file object has somehow lost its info
    function fileBuilder(googFileObject) { 
      if ((googFileObject.mimeType === 'text/plain' && !googFileObject.fileExtension) 
          || googFileObject.fileExtension === 'arr') { 
        return makeFile(googFileObject, 'text/plain', 'arr');
      } else {
        return makeFile(googFileObject, googFileObject.mimeType, googFileObject.fileExtension);
      }
    }

    var api = {
      getCollectionLink: function() {
        return baseCollection.then(function(bc) {
          return "https://drive.google.com/drive/u/0/folders/" + bc.id;
        });
      },
      getFileById: function(id) {
        return gQ(drive.files.get({fileId: id})).then(fileBuilder);
      },
      getFileByName: function(name) {
        return this.getAllFiles().then(function(files) {
          return files.filter(function(f) { return f.getName() === name });
        });
      },
      getSharedFileById: function(id) {
        return gQ(drive.files.get({fileId: id}), true).then(makeSharedFile);
      },
      getAllFiles: function() {
        return baseCollection.then(function(bc) {
          return gQ(drive.files.list({ q: "trashed=false and '" + bc.id + "' in parents" }))
          .then(function(filesResult) {
            if(!filesResult.items) { return []; }
            return filesResult.items.map(fileBuilder);
          });
        });
      },
      createFile: function(name, opts) {
        opts = opts || {};
        var mimeType = opts.mimeType || 'text/plain';
        var fileExtension = opts.fileExtension || 'arr';
        return baseCollection.then(function(bc) {
          var reqOpts = {
            'path': '/drive/v2/files',
            'method': 'POST',
            'params': opts.params || {},
            'body': {
              'parents': [{id: bc.id}],
              'mimeType': mimeType,
              'title': name
            }
          };
          // Allow the file extension to be omitted
          // (Google can sometime infer from the mime type)
          if (opts.fileExtension !== false) {
            reqOpts.body.fileExtension = fileExtension;
          }
          var request = gapi.client.request(reqOpts);
          return gQ(request).then(fileBuilder);
        });
      },
      checkLogin: function() {
        return collection.then(function() { return true; });
      }
    };

    function findOrCreateShareDirectory() {
      var shareCollectionName = collectionName + ".shared";
      var filesReq = gQ(drive.files.list({
          q: "trashed=false and title = '" + shareCollectionName + "' and "+
             "mimeType = '" + FOLDER_MIME + "'"
        }));
      var collection = filesReq.then(function(files) {
        if(files.items && files.items.length > 0) {
          return files.items[0];
        }
        else {
          var dir = gQ(drive.files.insert({
            resource: {
              mimeType: FOLDER_MIME,
              title: shareCollectionName
            }
          }));
          return dir;
        }
      });
      return collection;
    }

    return {
      api: api,
      collection: baseCollection,
      reinitialize: function() {
        return Q.fcall(function() { return initialize(); });
      }
    }
  }

  function initialize() {
    drive = gapi.client.drive;

    var list = gQ(drive.files.list({
      q: "trashed=false and title = '" + collectionName + "' and "+
         "mimeType = '" + FOLDER_MIME + "'"
    }));
    var baseCollection = list.then(function(filesResult) {
      var foundCollection = filesResult.items && filesResult.items[0];
      var baseCollection;
      if(!foundCollection) {
        return gQ(
            drive.files.insert({
              resource: {
                mimeType: "application/vnd.google-apps.folder",
                title: collectionName
              }
            }));
      }
      else {
        return foundCollection;
      }
    });
    var fileList = list.then(function(fr) { return fr.items || []; });
    return createAPI(baseCollection);
  }

  var reauth = function(immediate) {
    var d = Q.defer();
    if(!immediate) {
      // Need to do a login to get a cookie for this user; do it in a popup
      var w = window.open("/login?redirect=" + encodeURIComponent("/close.html"));
      window.addEventListener('message', function(e) {
        if (e.domain === document.location.origin) {
          d.resolve(reauth(true));
        } else {
          d.resolve(null);
        }
      });
    }
    else {
      // The user is logged in, but needs an access token from our server
      var newToken = $.ajax("/getAccessToken", { method: "get", datatype: "json" });
      newToken.then(function(t) {
        gapi.auth.setToken({access_token: t.access_token});
        d.resolve({access_token: t.access_token});
      });
      newToken.fail(function(t) {
        d.resolve(null);
      });
    }
    return d.promise;
  };

  var initialAuth = reauth(immediate);
  return initialAuth.then(function(_) {
    var d = Q.defer();
    gapi.client.load('drive', 'v2', function() {
      d.resolve(initialize())
    });
    return d.promise;
  });
  return initialAuth;
}
