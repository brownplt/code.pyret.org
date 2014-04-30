// assumes gapi bound to Google API

function createProgramCollectionAPI(collectionName, initialAuthToken, refresh, onInit) {

  var drive;
  gapi.auth.setToken({ access_token: initialAuthToken });
  gapi.client.load('drive', 'v2', initialize);

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
      getContents: function(withContents) {
        $.ajax(googFileObject.downloadUrl, {
          method: "get",
          dataType: 'text',
          headers: {'Authorization': 'Bearer ' + gapi.auth.getToken().access_token },
          success: function(r) {
            console.log(r);
            withContents(r.responseText);
          },
          error: function(e, err) {
            console.error("Error fetching file contents: ", e, err);
          }
        });
      },
      save: function(contents, newRevision, afterSave) {
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
        request.execute(function(r) {
          afterSave(this);
        });
      },
      _googObj: googFileObject
    }
  }

  function createAPI(files, baseCollection) {
    console.log(baseCollection.id);
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
    return {
      getAllFiles: function(withFiles) {
        if(!dirty) { withFiles(apiFiles); }
        dirty = false;
        withAuthCheck(function(then) {
            drive.files.list({}).execute(then);
          }, function(filesList) {
            updateApiFiles(filesList.items);
            withFiles(apiFiles);
          });
      },
      createFile: function(name, onCreated) {
        dirty = true;
        withAuthCheck(function(then) {
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
          }).execute(then);
        }, function(googFileObj) {
          onCreated(makeFile(googFileObj));
        });
      }
    };
  }

  function initialize() {
    drive = gapi.client.drive;

    withAuthCheck(function(then) {
        drive.files.list({}).execute(then);
      },
    function(filesResult) {
      if(filesResult.kind !== "drive#fileList") {
        console.error("Could not get file list: ", filesResult);
        throw new Error("File list refused");
      }
      else {
        var foundCollection = false;
        filesResult.items.forEach(function(i) {
          if(i.mimeType === "application/vnd.google-apps.folder" &&
             i.title === collectionName) {
            foundCollection = i;
          }
        });
        if(!foundCollection) {
          withAuthCheck(function(then) {
              drive.files.insert({
                resource: {
                  mimeType: "application/vnd.google-apps.folder",
                  title: collectionName
                }
              }).execute(then);
            }, function(inserted) {
              onInit(createAPI(filesResult.items, inserted));
            });
        }
        else {
          onInit(createAPI(filesResult.items, foundCollection));
        }
      }
    });

  }
}
