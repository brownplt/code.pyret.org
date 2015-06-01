define(["q"], function(Q) {
  function makeDriveImporter(storageAPI) {
    var contentsMap = {};
    return {
      // ModuleLoadResult = Promise<{ name: String, ast: Program } U "loaded">
      // Runtime x String -> ModuleLoadResult
      getMyDriveImport: function(runtime, filename) {
        // TODO(joe): what happens if initially not logged in?
        return storageAPI.then(function(storage) {
          var api = storage.api;
          var returnP = Q.defer();
          var filesP = api.getFileByName(filename).then(function(files) {
            if(files.length === 0) {
              runtime.ffi.throwMessageException("Could not find module with name " + filename + " in your drive.");
            }
            if(files.length > 1) {
              runtime.ffi.throwMessageException("There were multiple files with name " + filename + " in your drive.");
            }
            return files;
          });
          filesP.fail(function(failure) {
            if(runtime.isPyretException(failure)) {
              returnP.reject(failure);
              return;
            }
            var message = "";
            var defaultMessage = "There was an error fetching file with name " + filename + 
                  " (labelled " + filename + ") from Google Drive.";
            if(failure.message === "Authentication failure") {
              message = "Couldn't access the file named " + filename +
                " on Google Drive due to an " +
                "authentication failure.  my-gdrive imports require that you are "
                + "connected to Google Drive.";
            }
            else if(failure.err) {
              if(failure.err.code === 404) {
                message = "Couldn't find the file named " + filename +
                  " on Google Drive.";
              }
              else if(failure.err.message) {
                message = "There was an error fetching file named " + filename + 
                  " from Google Drive: " + failure.err.message;
              }
              else {
                message = defaultMessage;
              }
            }
            else {
              message = defaultMessage;
            }
            returnP.reject(runtime.ffi.makeMessageException(message));
          });

          var fullname = "@my-gdrive/" + filename;

          var contentsP = filesP.then(function(files) { return files[0].getContents(); });
          contentsP.then(function(contents) {
            if(requirejs.defined(fullname) && contentsMap[fullname] === contents) {
              // File has been successfully loaded and hasn't changed, so just
              // note that it is loaded already
              returnP.resolve("loaded");
            }
            else {
              contentsMap[fullname] = contents;
              returnP.resolve({ code: contents, name: fullname });
            }
          });
          contentsP.fail(function(err) {
            returnP.reject(runtime.makeFailureResult(err));
          });
          return returnP.promise;
        });
      },
      // Runtime x String x Array<String> -> ModuleLoadResult
      getSharedDriveImport: function(runtime, filename, id) {
        return storageAPI.then(function(storage) {
          var api = storage.api;
          var returnP = Q.defer();
          var fullname = "@shared-gdrive/" + filename + "/" + id;
          // Do not re-load modules that were loaded by id
          if(requirejs.defined(fullname)) {
            returnP.resolve("loaded");
          }
          else {
            var fileP = api.getSharedFileById(id);
            fileP.fail(function(failure) {
              var message = "";
              var defaultMessage = "There was an error fetching file with id " + id + 
                    " (labelled " + filename + ") from Google Drive.";
              if(failure.err) {
                if(failure.err.code === 404) {
                  message = "Couldn't find file with id " + id +
                    " (labelled " + filename + ") on Google Drive";
                }
                else if(failure.err.message) {
                  message = "There was an error fetching file with id " + id + 
                    " (labelled " + filename + ") from Google Drive: " +
                    failure.err.message;
                }
                else {
                  message = defaultMessage;
                }
              }
              else {
                message = defaultMessage;
              }
              returnP.reject(runtime.ffi.makeMessageException(message));
            });
            var contentsP = fileP.then(function(file) {
              return file.getContents();
            });
            contentsP.then(function(contents) {
              returnP.resolve({ code: contents, name: fullname });
            });
            contentsP.fail(function(err) {
              console.log("Error: ", err);
              returnP.reject(runtime.makeFailureResult(err));
            });
          }
          return returnP.promise;
        });
      }
    };
  }
  return {
    makeDriveImporter: makeDriveImporter
  }
});
