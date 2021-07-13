
define("cpo/gdrive-locators", [], function() {
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
    function makeMyGDriveLocator(filename) {
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

          restarter.resume(runtime.makeObject({
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
          }));
        });
      });
    }
    // Shared GDrive locators require a refresh to be re-fetched
    var sharedLocatorCache = {};
    function makeSharedGDriveLocator(filename, id) {
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
          restarter.resume(locator);
        });
      });
    }
    function makeGDriveJSLocator(filename, id) {
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
            restarter.resume(locator);
          }, "gdrivejs-locator:make-locator");
        });
      });

    }
    function makeCompiledGDriveJSLocator(filename, id) {
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

        var contentsP = fileP.then(function(file) { return file.getContents(); });
        var loadedP = Q.spread([contentsP, fileP], function(contents, file) {
          var uri = "compiled-gdrive-js://" + filename + ":" + file.getUniqueId();
          return {uri: uri, contents: contents};
        });
        Q.spread([loadedP, fileP], function(mod, file) {

          var uri = "compiled-gdrive-js://" + filename + ":" + file.getUniqueId();

          function needsCompile() { return false; }

          function getModule(self) {
            runtime.ffi.throwMessageException("Cannot get-module of js import");
          }

          function getDependencies(self) {
            return runtime.pauseStack(function(restarter) {
              var define = function(deps, callback) {
                var realDeps = deps.map(function(d) {
                  if(d.indexOf("@my-gdrive") === 0) {
                    return gmf(compileStructs, "dependency").app(
                      "my-gdrive",
                      runtime.ffi.makeList([d.slice(11)]));
                  }
                  else if(d.indexOf("@shared-gdrive") === 0) {
                    var pieces = d.split("/");
                    return gmf(compileStructs, "dependency").app(
                      "shared-gdrive",
                      runtime.ffi.makeList([pieces[1], pieces[2]]));
                  }
                  else if(d.indexOf("trove/") === 0) {
                    return gmf(compileStructs, "builtin").app(
                      d.slice(6)
                    );
                  }
                });
                restarter.resume(runtime.ffi.makeList(realDeps));
              }
              loader.safeEval(mod.contents, {define: define});
            });
            return runtime.ffi.makeList(depArray);
          }

          function getProvides(self) {
            return runtime.pauseStack(function(rs) {
              runtime.loadBuiltinModules([util.modBuiltin("string-dict")], "gdrive-js-locator", function(stringDict) {
                var sdo = gmf(stringDict, "make-string-dict");
                restarter.resume(gmf(compileStructs, "provides").app(sdo.app(), sdo.app()));
              });
            });
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

          var m0 = runtime.makeMethod0;
          var m1 = runtime.makeMethod1;
          var m2 = runtime.makeMethod2;

          restarter.resume(runtime.makeObject({
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
              }, "gdrivejs-locator:_equals");
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() {

              return runtime.pauseStack(function(restarter) {
                var define = function(_, callback) {
                  restarter.resume(
                    runtime.ffi.makeSome(
                      gmf(compileLib, "pre-loaded").app(
                        gmf(compileStructs, "no-builtins"),
//                        mod.contents)));
                        runtime.makeOpaque(callback))));
                };
                loader.safeEval(mod.contents, {define: define});
              });
            })
          }));
        });
      });

    }
    return {
      makeMyGDriveLocator: makeMyGDriveLocator,
      makeSharedGDriveLocator: makeSharedGDriveLocator,
      makeGDriveJSLocator: makeGDriveJSLocator,
      makeCompiledGDriveJSLocator: makeCompiledGDriveJSLocator
    };
  }
  return {
    makeLocatorConstructors: makeLocatorConstructors
  }
});
