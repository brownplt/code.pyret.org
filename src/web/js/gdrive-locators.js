
define("cpo/gdrive-locators", ["path"], function(pathlib) {
  function makeLocatorConstructors(
      storageAPI,
      runtime,
      compileLib,
      compileStructs,
      parsePyret,
      builtinModules,
      cpo) {
    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    function fileRequestFailure(failure, filename) {
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
    function makeMyGDriveLocator(context, filename) {
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
      return runtime.pauseStack(function(restarter) {
        // We start by setting up the fetch of the file; lots of methods will
        // close over this.
        var filesP = storageAPI.then(function(storage) {
          return storage.getFileByName(filename);
        });
        filesP.fail(function(failure) {
          restarter.error(runtime.ffi.makeMessageException(fileRequestFailure(failure, filename)));
        });
        var fileP = filesP.then(function(files) {
          checkFileResponse(files, restarter);
          // checkFileResponse throws if there's an error
          return files[0];
        });

        fileP.then(function(file) {

          var uri = "my-gdrive://" + filename;

          function needsCompile() { return true; }

          var contentsP = file.getContents();

          function getModule(self) {
            return runtime.pauseStack(function(getModRestart) {
              contentsP.fail(function(failure) {
                getModRestart.error(runtime.ffi.makeMessageException(contentRequestFailure(failure)));
              });
              contentsP.then(function(pyretString) {
                CPO.documents.set(uri, new CodeMirror.Doc(pyretString, "pyret"));
                var ret = gmf(compileLib, "pyret-string").app(pyretString);
                getModRestart.resume(ret);
              });
            });
          }

          function getDependencies(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-standard-dependencies").app(mod, uri);
              });
            }, "mygdrive-locator:get-dependencies");
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
              });
            }, "mygdrive-locator:get-provides");
          }

          function getExtraImports(self) {
            return gmf(compileStructs, "standard-imports");
          }

          function getGlobals(self) {
            return gmf(compileStructs, "standard-globals");
          }

          function getCompileEnv(_) {
            return gmf(compileStructs, "standard-builtins");
          }

          function getModifiedTime(_) { return 0; }
          function getOptions(_, options) { return options; }
          function getNativeModules(_) { return runtime.ffi.makeList([]); }

          function getUri(_) { return uri; }
          function name(_) { return filename; }
          function setCompiled(_) { return runtime.nothing; }

          var m0 = runtime.makeMethod0;
          var m1 = runtime.makeMethod1;
          var m2 = runtime.makeMethod2;

          restarter.resume({
            context: runtime.makeObject({ currentFile: file }),
            locator: runtime.makeObject({
              "get-modified-time": m0(getModifiedTime),
              "get-options": m1(getOptions),
              "get-native-modules": m0(getNativeModules),
              "needs-compile": m1(needsCompile),
              "get-module": m0(getModule),
              "get-dependencies": m0(getDependencies),
              "get-provides": m0(getProvides),
              "get-extra-imports": m0(getExtraImports),
              "get-globals": m0(getGlobals),
              "get-compile-env": m0(getCompileEnv),
              "uri": m0(getUri),
              "name": m0(name),
              "_equals": m2(function(self, other, rec) {
                return runtime.safeCall(function() {
                  return runtime.getField(other, "uri").app();
                }, function(otherstr) {
                  return runtime.safeTail(function() {
                    return rec.app(otherstr, uri);
                  })
                }, "mygdrive-locator:_equals");
              }),
              "set-compiled": m2(setCompiled),
              "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
            })
          });
        });
      });
    }
    // Shared GDrive locators require a refresh to be re-fetched
    var sharedLocatorCache = {};
    function makeSharedGDriveLocator(context, filename, id) {
      function checkFileResponse(file, filename, restarter) {
        var actualName = file.getName();
        if(actualName !== filename) {
          restarter.error(runtime.ffi.makeMessageException("Expected file with id " + id + " to have name " + filename + ", but its name was " + actualName));
        }
      }
      function contentRequestFailure(failure) {
        return "Could not load file with name " + filename;
      }
      var cacheKey = filename + ":" + id;

      if(sharedLocatorCache[cacheKey]) {
        return sharedLocatorCache[cacheKey];
      }

      // Pause because we'll fetch the Google Drive file object and restart
      // with it to create the actual locator
      return runtime.pauseStack(function(restarter) {
        var ast = undefined;
        // We start by setting up the fetch of the file; lots of methods will
        // close over this.
        var filesP = storageAPI.then(function(storage) {
          return storage.getSharedFileById(id);
        });
        filesP.fail(function(failure) {
          restarter.error(runtime.ffi.makeMessageException(fileRequestFailure(failure, filename)));
        });
        var fileP = filesP.then(function(file) {
          checkFileResponse(file, filename, restarter);
          // checkFileResponse throws if there's an error
          return file;
        });
        var contentsP = Q.all([fileP, fileP.then(function(file) {
          return file.getContents();
        })]);

        contentsP.fail(function(failure) {
          getModRestart.error(runtime.ffi.makeMessageException(contentRequestFailure(failure)));
        });
        contentsP.then(function(fileAndContents) {
          var file = fileAndContents[0];
          var contents = fileAndContents[1];
          
          var uri = "shared-gdrive://" + file.getName() + ":" + file.getUniqueId();
          CPO.documents.set(uri, new CodeMirror.Doc(contents, "pyret"));

          function needsCompile() { return true; }

          function getModule(self) {
            if(ast) { return ast; }
            else {
              return runtime.safeCall(function() {
                return gmf(parsePyret, "surface-parse").app(contents, uri);
              }, function(ret) {
                ast = gmf(compileLib, "pyret-ast").app(ret);
                return ast; 
              }, "sharedgdrive-locator:parse-contents");
            }
          }

          function getDependencies(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-standard-dependencies").app(mod, uri);
              });
            }, "sharedgdrive-locator:get-dependencies");
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
              });
            }, "sharedgdrive-locator:get-provides");
          }

          function getExtraImports(self) {
            return gmf(compileStructs, "standard-imports");
          }

          function getGlobals(self) {
            return gmf(compileStructs, "standard-globals");
          }

          function getCompileEnv(_) {
            return gmf(compileStructs, "standard-builtins");
          }

          function getUri(_) { return uri; }
          function name(_) { return filename; }
          function setCompiled(_) { return runtime.nothing; }
          function getModifiedTime(_) { return 0; }
          function getOptions(_, options) { return options; }
          function getNativeModules(_) { return runtime.ffi.makeList([]); }

          var m0 = runtime.makeMethod0;
          var m1 = runtime.makeMethod1;
          var m2 = runtime.makeMethod2;

          var locator = runtime.makeObject({
            "get-modified-time": m0(getModifiedTime),
            "get-options": m1(getOptions),
            "get-native-modules": m0(getNativeModules),
            "needs-compile": m1(needsCompile),
            "get-module": m0(getModule),
            "get-dependencies": m0(getDependencies),
            "get-provides": m0(getProvides),
            "get-extra-imports": m0(getExtraImports),
            "get-globals": m0(getGlobals),
            "get-compile-env": m0(getCompileEnv),
            "uri": m0(getUri),
            "name": m0(name),
            "_equals": m2(function(self, other, rec) {
              return runtime.safeCall(function() {
                return runtime.getField(other, "uri").app();
              }, function(otherstr) {
                return runtime.safeTail(function() {
                  return rec.app(otherstr, uri);
                })
              }, "sharedgdrive-locator:_equals");
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
          });

          sharedLocatorCache[cacheKey] = locator;
          restarter.resume({
            context: runtime.makeObject({ currentFile: file }),
            locator: locator
          });
        });
      });
    }
    function makeGDriveJSLocator(context, filename, id) {
      function checkFileResponse(file, filename, restarter) {
        var actualName = file.getName();
        if(actualName !== filename) {
          restarter.error(runtime.ffi.makeMessageException("Expected file with id " + id + " to have name " + filename + ", but its name was " + actualName));
        }
      }
      function contentRequestFailure(failure) {
        return "Could not load file with name " + filename;
      }

      // Pause because we'll fetch the Google Drive file object and restart
      // with it to create the actual locator
      return runtime.pauseStack(function(restarter) {
        // We start by setting up the fetch of the file; lots of methods will
        // close over this.
        var filesP = storageAPI.then(function(storage) {
          return storage.getFileById(id);
        });
        filesP.fail(function(failure) {
          restarter.error(runtime.ffi.makeMessageException(fileRequestFailure(failure, filename)));
        });
        var fileP = filesP.then(function(file) {
          // checkFileResponse(file, filename, restarter);
          // checkFileResponse throws if there's an error
          return file;
        });

        var contentsP = fileP.then(function(file) { return file.getContents(); });

        var F = runtime.makeFunction;

        Q.spread([contentsP, fileP], function(mod, file) {

          var uri = "gdrive-js://" + file.getUniqueId();

          var rawModule = gmf(builtinModules, "builtin-raw-locator-from-str").app(mod);
          return runtime.safeCall(function() {
            return gmf(cpo, "make-js-locator-from-raw").app(
              rawModule,
              true,
              uri,
              filename);
          }, function(locator) {
            restarter.resume({
              context: runtime.makeObject({ currentFile: file }),
              locator: locator
            });
          }, "gdrivejs-locator:make-locator");
        });
      });

    }
    function makeGDrivePathLocator(context, path) {
      var baseDir = storageAPI.then(function(api) {
        if(context.currentFile === null) { // Treat this as the base directory of the user's code.pyret.org
          return api.getBaseDirectory();
        }
        else {
          return context.currentFile.getParent();
        }
      });

      var fullpath = pathlib.normalize(path);
      if(pathlib.isAbsolute(fullpath)) { runtime.ffi.throwMessageException("Cannot get absolute paths in Drive"); }

      var pathParts = pathlib.dirname(fullpath).split(pathlib.sep);
      var fileName = pathlib.basename(fullpath);

      console.log("Parts of path: ", pathParts, fileName);

      function lookup(index, curBaseDir) {
        if(pathParts[index] === "." || index >= pathParts.length) {
          return storageAPI.then(function(api) {
            console.log("Got API: ", api, curBaseDir, fileName);
            return api.getFileByNameIn(curBaseDir, fileName);
          }).then(function(files) {
            console.log("Got files: ", files);
            if(files.length === 1) { return files[0]; } 
            throw new Error("File doesn't exist or ambiguous: ", files, fileName);
          }).fail(function(err) {
            console.error("Failed: ", err); 
          });
        }
        else if (pathParts[index] === "..") {
          return Q.spread([storageAPI, curBaseDir], function(api, curBaseDir) {
            return lookup(index + 1, api.getDirectoryParent(curBaseDir));
          });
        }
        else {
          return storageAPI.then(function(api) {
            var subdir = api.getSubdirByNameIn(curBaseDir, pathParts[index]);
            subdir = subdir.then(function(sd) {
              if(sd.length === 0) { console.error("Not found: ", pathParts[index]); }
              return sd[0];
            });
            return lookup(index + 1, subdir);
          });
        }
      }
      var fileP = lookup(0, baseDir);



      return runtime.pauseStack(function(restarter) {
        fileP.fail(function(err) {
          console.error("File failed to load: ", err);
          restarter.error(err); });
        fileP.then(function(file) {

          var uri = "gdrive-path://" + file.id;

          function needsCompile() { return true; }

          var contentsP = file.getContents();

          function getModule(self) {
            return runtime.pauseStack(function(getModRestart) {
              contentsP.fail(function(failure) {
                getModRestart.error(runtime.ffi.makeMessageException(contentRequestFailure(failure)));
              });
              contentsP.then(function(pyretString) {
                CPO.documents.set(uri, new CodeMirror.Doc(pyretString, "pyret"));
                var ret = gmf(compileLib, "pyret-string").app(pyretString);
                getModRestart.resume(ret);
              });
            });
          }

          function getDependencies(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-standard-dependencies").app(mod, uri);
              });
            }, "mygdrive-locator:get-dependencies");
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
              });
            }, "mygdrive-locator:get-provides");
          }

          function getExtraImports(self) {
            return gmf(compileStructs, "standard-imports");
          }

          function getGlobals(self) {
            return gmf(compileStructs, "standard-globals");
          }

          function getCompileEnv(_) {
            return gmf(compileStructs, "standard-builtins");
          }

          function getModifiedTime(_) { return 0; }
          function getOptions(_, options) { return options; }
          function getNativeModules(_) { return runtime.ffi.makeList([]); }

          function getUri(_) { return uri; }
          function name(_) { return filename; }
          function setCompiled(_) { return runtime.nothing; }

          var m0 = runtime.makeMethod0;
          var m1 = runtime.makeMethod1;
          var m2 = runtime.makeMethod2;

          restarter.resume({
            context: runtime.makeObject({ currentFile: file }),
            locator: runtime.makeObject({
              "get-modified-time": m0(getModifiedTime),
              "get-options": m1(getOptions),
              "get-native-modules": m0(getNativeModules),
              "needs-compile": m1(needsCompile),
              "get-module": m0(getModule),
              "get-dependencies": m0(getDependencies),
              "get-provides": m0(getProvides),
              "get-extra-imports": m0(getExtraImports),
              "get-globals": m0(getGlobals),
              "get-compile-env": m0(getCompileEnv),
              "uri": m0(getUri),
              "name": m0(name),
              "_equals": m2(function(self, other, rec) {
                return runtime.safeCall(function() {
                  return runtime.getField(other, "uri").app();
                }, function(otherstr) {
                  return runtime.safeTail(function() {
                    return rec.app(otherstr, uri);
                  })
                }, "mygdrive-locator:_equals");
              }),
              "set-compiled": m2(setCompiled),
              "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
            })
          });
        });
      });


    }
    return {
      makeMyGDriveLocator: makeMyGDriveLocator,
      makeSharedGDriveLocator: makeSharedGDriveLocator,
      makeGDriveJSLocator: makeGDriveJSLocator,
      makeGDrivePathLocator: makeGDrivePathLocator
    };
  }
  return {
    makeLocatorConstructors: makeLocatorConstructors
  }
});
