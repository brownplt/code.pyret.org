define([], function() {
  function makeLocatorConstructors(
      storageAPI,
      runtime,
      compileLib,
      compileStructs,
      builtinModules, replSupport, spyretParse) {
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
    function makeWeSchemeMyGDriveLocator(filename) {
      console.log('doing makeWeSchemeMyGDriveLocator ' + filename);
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
          console.log('ds26gte I ' + JSON.stringify(storage));
          return storage.getFileByName(filename); //makeWeSchemeMyGDriveLocator
        });
        filesP.fail(function(failure) {
          console.log('ds26gte II ' + failure);
          restarter.error(runtime.ffi.makeMessageException(fileRequestFailure(failure, filename)));
        });
        var fileP = filesP.then(function(files) {
          console.log('ds26gte III');
          checkFileResponse(files, restarter);
          // checkFileResponse throws if there's an error
          return files[0];
        });

        fileP.then(function(file) {

          var uri = "wescheme-gdrive://" + filename;

          function needsCompile() { return true; }

          function dialect(self) {
            return runtime.makeString("spyret");
          }

          var ast = undefined;

          function getModule(self) { 
            console.log('doing makeWeSchemeMyGDriveLocator > getModule');
            if (ast !== undefined) {
              console.log('reusing ast');
              return ast;
            } else {
              runtime.pauseStack(function(getModRestart) {
                var contentsP = file.getContents();
                contentsP.fail(function(failure) {
                  getModRestart.error(runtime.ffi.makeMessageException(contentRequestFailure(failure)));
                });
                contentsP.then(function(spyretString) {
                  console.log('operating on ' + spyretString);
                  return runtime.safeCall(function() {
                    console.log('calling schemeToPyretAST');
                    return spyretParse.schemeToPyretAST(spyretString, uri, "module");
                  }, function(sAst) {
                    return runtime.safeCall(function() {
                      console.log('calling spyret-surface-parse');
                      return gmf(compileLib, "spyret-surface-parse").app(sAst, uri);
                    }, function(parsed) {
                      return runtime.safeCall(function() {
                        console.log('calling make-provide-for-repl');
                        return gmf(replSupport, "make-provide-for-repl").app(parsed);
                      }, function(pAst) {
                        return runtime.safeCall(function() {
                          console.log('wrapping pyret-ast');
                          return gmf(compileLib, "pyret-ast").app(pAst);
                        }, function(ret) {
                          ast = ret;
                          getModRestart.resume(ret);
                        });
                      });
                    });
                  });
                });
              });
            }
          }

          function getDependencies(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-standard-dependencies").app(mod, uri);
              });
            });
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
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
            "dialect": m0(dialect),
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
              });
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
          }));
        });
      });
    }
    function makeWeSchemeSharedGDriveLocator(/* filename, */ id) {
      console.log('doing makeWeSchemeSharedGDriveLocator '  + id);
      function checkFileResponse(file, filename, restarter) {
        var actualName = file.getName();
        if(actualName !== filename) {
          restarter.error(runtime.ffi.makeMessageException("Expected file with id " + id + " to have name " + filename + ", but its name was " + actualName));
        }
      }
      function contentRequestFailure(failure) {
        //return "Could not load file with name " + filename;
        return "Could not load file with id " + id;
      }

      // Pause because we'll fetch the Google Drive file object and restart
      // with it to create the actual locator
      runtime.pauseStack(function(restarter) {
        // We start by setting up the fetch of the file; lots of methods will
        // close over this.
        var filesP = storageAPI.then(function(storage) {
          console.log('ds26gte aI ' + JSON.stringify(storage));
          return storage.getSharedFileById(id);
        });
        filesP.fail(function(failure) {
          console.log('ds26gte aII ' + failure);
          restarter.error(runtime.ffi.makeMessageException(fileRequestFailure(failure, id /* filename */)));
        });
        var fileP = filesP.then(function(file) {
          console.log('ds26gte aIII');
          //checkFileResponse(file, filename, restarter);
          // checkFileResponse throws if there's an error
          return file;
        });

        fileP.then(function(file) {

          //var uri = "shared-gdrive://" + filename + ":" + file.getUniqueId();
          var uri = "shared-gdrive://" + id + ":" + file.getUniqueId();

          function needsCompile() { return true; }

          function dialect(self) {
            return runtime.makeString('spyret');
          }

          var ast = undefined;

          function getModule(self) {
            console.log('doing makeWeSchemeSharedGDriveLocator > getModule');
            if (ast !== undefined) {
              console.log('reusing ast');
              return ast;
            } else {
              runtime.pauseStack(function(getModRestart) {
                var contentsP = file.getContents();
                contentsP.fail(function(failure) {
                  getModRestart.error(runtime.ffi.makeMessageException(contentRequestFailure(failure)));
                });
                contentsP.then(function(spyretString) {
                  console.log('operating on ' + spyretString);
                  return runtime.safeCall(function() {
                    sessionStorage.setItem(uri,spyretString);
                  }, function(_) {
                    return runtime.safeCall(function() {
                      console.log('calling schemeToPyretAST');
                      return spyretParse.schemeToPyretAST(spyretString, uri, "module");
                    }, function(sAst) {
                      return runtime.safeCall(function() {
                        console.log('calling spyret-surface-parse');
                        return gmf(compileLib, "spyret-surface-parse").app(sAst, uri);
                      }, function(parsed) {
                        return runtime.safeCall(function() {
                          console.log('calling make-provide-for-repl');
                          return gmf(replSupport, "make-provide-for-repl").app(parsed);
                        }, function(pAst) {
                          return runtime.safeCall(function() {
                            console.log('wrapping pyret-ast');
                            return gmf(compileLib, "pyret-ast").app(pAst);
                          }, function(ret) {
                            ast = ret;
                            getModRestart.resume(ret);
                          });
                        });
                      });
                    });
                  });
                });
              });
            }
          }

          function getDependencies(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-standard-dependencies").app(mod, uri);
              });
            });
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
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
          //function name(_) { return filename; }
          function name(_) { return id; }
          function setCompiled(_) { return runtime.nothing; }
          function getModifiedTime(_) { return 0; }
          function getOptions(_, options) { return options; }
          function getNativeModules(_) { return runtime.ffi.makeList([]); }

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
              });
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
          }));
        });
      });
    }
    function makeWeSchemeCollectionLocator(filename) {
     console.log('doing makeWeSchemeCollectionLocator ' + filename);

      // Pause because we'll fetch the Google Drive file object and restart
      // with it to create the actual locator
      runtime.pauseStack(function(restarter) {
        // We start by setting up the fetch of the file; lots of methods will
        // close over this.

          var uri = "wescheme-collection://" + filename;

          function needsCompile() { return true; }

          function dialect(self) {
            return runtime.makeString("spyret");
          }

          function getModule(self) {
            runtime.pauseStack(function(getModRestart) {
              var spyretString;
              runtime.safeCall(function() {
                jQuery.ajax({
                  url: filename,
                  success: function(str) {
                    spyretString = str;
                  },
                  error: function(error) {
                    getModRestart.error(runtime.ffi.makeMessageException("Could not load " + uri));
                  },
                  async: false
                });
                return true;
              }, function(_) {
                runtime.safeCall(function() {
                  return spyretParse.schemeToPyretAST(spyretString, uri, "module");
                }, function(sAst) {
                  return runtime.safeCall(function() {
                    return gmf(compileLib, "spyret-surface-parse").app(sAst, uri);
                  }, function(parsed) {
                    return runtime.safeCall(function() {
                      return gmf(replSupport, "make-provide-for-repl").app(parsed);
                    }, function(pAst) {
                      return runtime.safeCall(function() {
                        return gmf(compileLib, "pyret-ast").app(pAst);
                      }, function(ret) {
                        getModRestart.resume(ret);
                      });
                    });
                  });
                });
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
            });
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
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
            "dialect": m0(dialect),
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
              });
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
          }));
      });
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
      runtime.pauseStack(function(restarter) {
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

          var uri = "my-gdrive://" + filename + ":" + file.getUniqueId();

          function needsCompile() { return true; }

          function getModule(self) {
            runtime.pauseStack(function(getModRestart) {
              var contentsP = file.getContents();
              contentsP.fail(function(failure) {
                getModRestart.error(runtime.ffi.makeMessageException(contentRequestFailure(failure)));
              });
              contentsP.then(function(pyretString) {
                sessionStorage.setItem(uri,pyretString);
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
            });
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
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
              });
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
          }));
        });
      });
    }
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

      // Pause because we'll fetch the Google Drive file object and restart
      // with it to create the actual locator
      runtime.pauseStack(function(restarter) {
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

        fileP.then(function(file) {

          var uri = "shared-gdrive://" + filename + ":" + file.getUniqueId();

          function needsCompile() { return true; }

          function getModule(self) {
            runtime.pauseStack(function(getModRestart) {
              var contentsP = file.getContents();
              contentsP.fail(function(failure) {
                getModRestart.error(runtime.ffi.makeMessageException(contentRequestFailure(failure)));
              });
              contentsP.then(function(pyretString) {
                sessionStorage.setItem(uri,pyretString);
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
            });
          }

          function getProvides(self) {
            return runtime.safeCall(function() {
              return gf(self, "get-module").app();
            }, function(mod) {
              return runtime.safeTail(function() {
                return gmf(compileLib, "get-provides").app(mod, uri);
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
          function getModifiedTime(_) { return 0; }
          function getOptions(_, options) { return options; }
          function getNativeModules(_) { return runtime.ffi.makeList([]); }

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
              });
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() { return runtime.ffi.makeNone(); })
          }));
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
      runtime.pauseStack(function(restarter) {
        // We start by setting up the fetch of the file; lots of methods will
        // close over this.
        var filesP = storageAPI.then(function(storage) {
          return storage.getFileById(id);
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
          var uri = "gdrive-js://" + filename + ":" + file.getUniqueId();
          return loader.goodIdea(runtime, uri, contents);
        });
        Q.spread([loadedP, fileP], function(mod, file) {

          var uri = "gdrive-js://" + filename + ":" + file.getUniqueId();

          function needsCompile() { return false; }

          function getModule(self) {
            runtime.ffi.throwMessageException("Cannot get-module of js import");
          }

          function getDependencies(self) {
            var depArray = mod.dependencies.map(function(d) {
              if(d["import-type"] === "builtin") {
                return gmf(compileStructs, "builtin").app(d.name);
              }
              else {
                return gmf(compileStructs, "dependency").app(
                  d.protocol,
                  runtime.ffi.makeList(d.args));
              }
            });
            return runtime.ffi.makeList(depArray);
          }

          function getProvides(self) {
            runtime.pauseStack(function(rs) {
              runtime.loadBuiltinModules([util.modBuiltin("string-dict")], "gdrive-js-locator", function(stringDict) {
                var sdo = gmf(stringDict, "string-dict-of");
                var l = runtime.ffi.makeList;
                var values = sdo.app(l(mod.provides.values), gmf(compileStructs, "v-just-there"));
                var types = sdo.app(l(mod.provides.types), gmf(compileStructs, "t-just-there"));
                restarter.resume(gmf(compileStructs, "provides").app(values, types));
              });
            })
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
              });
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() {
              return runtime.ffi.makeSome(
                  gmf(compileLib, "pre-loaded").app(
                    gmf(compileStructs, "minimal-builtins"),
                    runtime.makeOpaque(mod.theModule))
                );
            })
          }));
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
      runtime.pauseStack(function(restarter) {
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
            runtime.pauseStack(function(restarter) {
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
            runtime.pauseStack(function(rs) {
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
              });
            }),
            "set-compiled": m2(setCompiled),
            "get-compiled": m1(function() {

              runtime.pauseStack(function(restarter) {
                var define = function(_, callback) {
                  restarter.resume(
                    runtime.ffi.makeSome(
                      gmf(compileLib, "pre-loaded").app(
                        gmf(compileStructs, "minimal-builtins"),
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
      makeWeSchemeCollectionLocator: makeWeSchemeCollectionLocator,
      makeWeSchemeMyGDriveLocator: makeWeSchemeMyGDriveLocator,
      makeWeSchemeSharedGDriveLocator: makeWeSchemeSharedGDriveLocator,
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
