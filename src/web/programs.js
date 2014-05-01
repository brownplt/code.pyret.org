// assumes gapi bound to Google API

function createProgramCollectionAPI(collectionName, initialAuthToken, refresh) {

  var drive;

  function authCheck(f) {
    function isAuthFailure(result) {
      return (result.code && result.code === 401);
    }
    var retry = f().then(function(result) {
      if(isAuthFailure(result)) {
        return refresh().then(function(newToken) {
          gapi.auth.setToken({ access_token: newToken });
          return f();
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

  function gQ(request) {
    return failCheck(authCheck(function() {
      var d = Q.defer();
      request.execute(function(result) {
        d.resolve(result);
      });
      return d.promise;
    }));
  }

  function failCheck(p) {
    return p.then(function(result) {
      if(result && (typeof result.code === "number")) {
        throw new Error(result);
      }
      return result;
    });
  }

  function withAuthCheck(f, then, hasBeenTried) {
    f(function(result) {
      if(result.code && result.code === 401) {
        if(hasBeenTried) {
          throw new Error("Authentication failure");
        } else {
          refresh(function(newToken) {
            gapi.auth.setToken({ access_token: newToken });
            withAuthCheck(f, then, true);
          });
        }
      } else {
        then(result);
      }
    });
  }

  function makeFile(googFileObject) {
    return {
      getName: function() {
        return googFileObject.title;
      },
      getModifiedTime: function() {
        return googFileObject.modifiedDate;
      },
      getUniqueId: function() {
        return googFileObject.id;
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
        })).then(makeFile);
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
          'mimeType': "text/plain",
          'fileExtension': "arr"
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
        return gQ(request).then(makeFile);
      },
      _googObj: googFileObject
    }
  }

  function createAPI(files, baseCollection) {

    var dirty = false;
    var apiFiles = {};
    function updateApiFiles(googFiles) {
      files.forEach(function(f) {
        if(apiFiles.hasOwnProperty(f.title)) {
          apiFiles[f.title].push(makeFile(f));
        } else {
          apiFiles[f.title] = [makeFile(f)];
        }
      });
    }
    updateApiFiles(files);

    return {
      getFileById: function(id) {
        return gQ(drive.files.get({fileId: id})).then(makeFile);
      },
      getAllFiles: function() {
        var that = this;
        return gQ(drive.children.list({folderId: baseCollection.id})).then(function(filesResult) {
          var items = filesResult.items.map(function(childRef) {
            return that.getFileById(childRef.id);
          });
          return Q.all(items);
        });
      },
      createFile: function(name) {
        dirty = true;
        var request = 
          gapi.client.request({
            'path': '/drive/v2/files',
            'method': 'POST',
            'params': {},
            'body': {
              "parents": [{id: baseCollection.id}],
              "mimeType": "text/plain",
              "fileExtension": "arr",
              "title": name
            }
          });
        return gQ(request).then(makeFile);
      }
    };
  }

  function initialize() {
    drive = gapi.client.drive;

    var list = gQ(drive.files.list({}));
    var baseCollection = list.then(function(filesResult) {
      var foundCollection = false;
      filesResult.items.forEach(function(i) {
        if(i.mimeType === "application/vnd.google-apps.folder" &&
           i.title === collectionName &&
           !(i.explicitlyTrashed)) {
          foundCollection = i;
        }
      });
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
    var fileList = list.then(function(fr) { return fr.items; });
    return Q.all([fileList, baseCollection]).spread(function(files, collection) {
      return createAPI(files, collection);
    });
  }

  gapi.auth.setToken({ access_token: initialAuthToken });
  var d = Q.defer();
  gapi.client.load('drive', 'v2', function() {
    d.resolve(initialize())
  });
  return d.promise;
  
}
