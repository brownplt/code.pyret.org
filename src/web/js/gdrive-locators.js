define(["q"], function(q) {
  function makeLocatorConstructors(storageAPI, runtime, compileLib) {
    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    function makeMyGDriveLocator(filename) {
      function fileRequestFailure(failure) {
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
        return message;
      }
      function checkFileResponse(files, restarter) {
        if(files.length === 0) {
          restarter.error(runtime.ffi.makeMessageException("Could not find module with name " + filename + " in your drive."));
        }
        if(files.length > 1) {
          restarter.error(runtime.ffi.makeMessageException("There were multiple files with name " + filename + " in your drive."));
        }
      }
      function contentRequestFailure(failure) {
        return "Could not load file with name " + filename;
      }

      // Pause because we'll fetch the Google Drive file object and restart
      // with it to create the actual locator
      runtime.pauseStack(function(restarter) {
        // We start by setting up the fetch of the file; lots of methods will
        // close over this.
        var filesP = storageAPI.then(function(storage) {
          return storage.api.getFileByName(filename);
        });
        filesP.fail(function(failure) {
          restarter.error(runtime.ffi.makeMessageException(fileRequestFailure(failure)));
        });
        var fileP = filesP.then(function(files) {
          checkFileResponse(files, restarter);
          // checkFileResponse throws if there's an error
          return files[0];
        });

        fileP.then(function(file) {

          var uri = "my-gdrive://" + filename + ":" + file.getUniqueId();

          function needsCompile() { return true; }

          function getModule(self) {
            runtime.pauseStack(function(getModRestart) {
              var contentsP = file.getContents();
              contentsP.fail(function(failure) {
                getModRestart.error(runtime.ffi.makeMessageException(contentRequestFailure(failure)));
              });
              contentsP.then(function(pyretString) {
                var ret = gmf(compileLib, "pyret-string").app(pyretString);
                getModRestart.resume(ret);
              });
            });
          }

          function getDependencies(self) {
            return runtime.safeCall(function() {
              return runtime.getField(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-dependencies-with-env").app(mod, uri, gmf(compileLib, "standard-builtins"));
              });
            });
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return runtime.getField(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
              });
            });
          }

          function getCompileEnv(_) {
            return gmf(compileLib, "standard-builtins");
          }

          function getNamespace(_, otherRuntime) {
            return gmf(compileLib, "make-base-namespace").app(otherRuntime);
          }
          
          function getUri(_) { return uri; }
          function name(_) { return filename; }
          function setCompiled(_) { return runtime.nothing; }

          var m0 = runtime.makeMethod0;
          var m1 = runtime.makeMethod1;
          var m2 = runtime.makeMethod2;

          restarter.resume(runtime.makeObject({
            "needs-compile": m1(needsCompile),
            "get-module": m0(getModule),
            "get-dependencies": m0(getDependencies),
            "get-provides": m0(getProvides),
            "get-compile-env": m0(getCompileEnv),
            "get-namespace": m1(getNamespace),
            "uri": m0(getUri),
            "name": m0(name),
            "_equals": m2(function(self, other, rec) {
              return runtime.safeCall(function() {
                return runtime.getField(other, "uri").app();
              }, function(otherstr) {
                return runtime.safeTail(function() {
                  return rec.app(otherstr, uri);
                })
              });
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
          }));
        });
      });
    }
    return {
      makeMyGDriveLocator: makeMyGDriveLocator
    };
  }
  return {
    makeLocatorConstructors: makeLocatorConstructors
  }
});
