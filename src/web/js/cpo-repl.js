/* global APP_BASE_URL storageAPI Q CPO */
({
  requires: [
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-lib.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-structs.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/repl.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../arr/cpo.arr"]
    },
    // { "import-type": "dependency",
    //   protocol: "js-file",
    //   args: ["./repl-ui"]
    // },
    { "import-type": "builtin",
      name: "parse-pyret"
    },
    { "import-type": "builtin",
      name: "runtime-lib"
    },
    { "import-type": "builtin",
      name: "load-lib"
    },
    { "import-type": "builtin",
      name: "builtin-modules"
    },
    { "import-type": "builtin",
      name: "cpo-builtins"
    }
  ],
  nativeRequires: [
    "cpo/gdrive-locators",
    "cpo/http-imports",
    "cpo/guess-gas",
    "cpo/cpo-builtin-modules",
    "cpo/modal-prompt",
    "pyret-base/js/runtime"
  ],
  provides: {},
  theModule: function(runtime, namespace, uri,
                      compileLib, compileStructs, pyRepl, cpo, //replUI,
                      parsePyret, runtimeLib, loadLib, builtinModules, cpoBuiltins,
                      gdriveLocators, http, guessGas, cpoModules, modalPrompt,
                      rtLib) {

    // var logDetailedOption = $("#detailed-logging");

    // if(localStorage.getItem('log-detailed') !== null) {
    //   logDetailedOption.prop("checked",
    //     localStorage.getItem('log-detailed') == 'true');
    // } else {
    //   localStorage.setItem('log-detailed', false);
    // }

    // logDetailedOption.on('change', function () {
    //   localStorage.setItem('log-detailed', this.checked);
    // });

    // setInterval(function() {
    //   logDetailedOption[0].checked = localStorage.getItem('log-detailed') == 'true';
    // }, 100);

    runtime.setParam("imgUrlProxy", function(s) {
      var a = document.createElement("a");
      a.href = s;
      if(a.origin === window.APP_BASE_URL) {
        return s;
      }
      else if(a.hostname === "drive.google.com" && a.pathname === "/uc") {
        return s;
      }
      else {
        return window.APP_BASE_URL + "/downloadImg?" + s;
      }
    });

    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    var gtf = function(m, f) { return gf(m, "types")[f]; };

    var constructors = gdriveLocators.makeLocatorConstructors(storageAPI, runtime, compileLib, compileStructs, parsePyret, builtinModules, cpo);

    // NOTE(joe): In order to yield control quickly, this doesn't pause the
    // stack in order to save.  It simply sends the save requests and
    // immediately returns.  This avoids needlessly serializing multiple save
    // requests when this is called repeatedly from Pyret.
    function saveGDriveCachedFile(name, content) {
      var file = storageAPI.then(function(storageAPI) {
        var existingFile = storageAPI.getCachedFileByName(name);
        return existingFile.then(function(f) {
          if(f.length >= 1) {
            return f[0];
          }
          else {
            return storageAPI.createFile(name, {
              saveInCache: true,
              fileExtension: ".js",
              mimeType: "text/plain"
            });
          }
        });
      });
      file.then(function(f) {
        f.save(content, true);
      });
      return runtime.nothing;
    }

    // NOTE(joe): this function just allocates a closure, so it's stack-safe
    var onCompile = gmf(cpo, "make-on-compile").app(runtime.makeFunction(saveGDriveCachedFile, "save-gdrive-cached-file"));

    function uriFromDependency(dependency) {
      return runtime.ffi.cases(gmf(compileStructs, "is-Dependency"), "Dependency", dependency,
        {
          builtin: function(name) {
            return "builtin://" + name;
          },
          dependency: function(protocol, args) {
            var arr = runtime.ffi.toArray(args);
            if (protocol === "my-gdrive") {
              return "my-gdrive://" + arr[0];
            }
            else if (protocol === "shared-gdrive") {
              return "shared-gdrive://" + arr[0] + ":" + arr[1];
            }
            else if (protocol === "gdrive-js") {
              return "gdrive-js://" + arr[1];
            }
            else {
              console.error("Unknown import: ", dependency);
            }
          }
        });

    }

    function makeFindModule() {
      // The locatorCache memoizes locators for the duration of an
      // interactions run
      var locatorCache = {};
      function findModule(contextIgnored, dependency) {
        var uri = uriFromDependency(dependency);
        if(locatorCache.hasOwnProperty(uri)) {
          return gmf(compileLib, "located").app(locatorCache[uri], runtime.nothing);
        }
        return runtime.safeCall(function() {
          return runtime.ffi.cases(gmf(compileStructs, "is-Dependency"), "Dependency", dependency,
            {
              builtin: function(name) {
                var raw = cpoModules.getBuiltinLoadableName(runtime, name);
                if(!raw) {
                  throw runtime.throwMessageException("Unknown module: " + name);
                }
                else {
                  return gmf(cpo, "make-builtin-js-locator").app(name, raw);
                }
                /*
                if (cpoBuiltin.knownCpoModule(name)) {
                  return cpoBuiltin.cpoBuiltinLocator(runtime, compileLib, compileStructs, name);
                }
                else if(okImports.indexOf(name) === -1) {
                  throw runtime.throwMessageException("Unknown module: " + name);
                } else {
                  return gmf(compileLib, "located").app(
                    gmf(builtin, "make-builtin-locator").app(name),
                    runtime.nothing
                  );
                }
                */
              },
              dependency: function(protocol, args) {
                var arr = runtime.ffi.toArray(args);
                if (protocol === "my-gdrive") {
                  return constructors.makeMyGDriveLocator(arr[0]);
                }
                else if (protocol === "shared-gdrive") {
                  return constructors.makeSharedGDriveLocator(arr[0], arr[1]);
                }
                else if (protocol === "gdrive-js") {
                  return constructors.makeGDriveJSLocator(arr[0], arr[1]);
                }
                /*
                else if (protocol === "js-http") {
                  // TODO: THIS IS WRONG with the new locator system
                  return http.getHttpImport(runtime, args[0]);
                }
                */
                else {
                  console.error("Unknown import: ", dependency);
                }

              }
            });
         }, function(l) {
            locatorCache[uri] = l;
            return gmf(compileLib, "located").app(l, runtime.nothing);
         }, "findModule");
      }
      return runtime.makeFunction(findModule, "cpo-find-module");
    }

    // NOTE(joe): This line is "cheating" by mixing runtime levels,
    // and uses the same runtime for the compiler and running code.
    // Usually you can only get a new Runtime by calling create, but
    // here we magic the current runtime into one.
    var pyRuntime = gf(gf(runtimeLib, "internal").brandRuntime, "brand").app(
      runtime.makeObject({
        "runtime": runtime.makeOpaque(runtime)
      }));
    var pyRealm = gf(loadLib, "internal").makeRealm(cpoModules.getRealm());


    var builtins = [];
    Object.keys(runtime.getParam("staticModules")).forEach(function(k) {
      if(k.indexOf("builtin://") === 0) {
        builtins.push(runtime.makeObject({
          uri: k,
          raw: cpoModules.getBuiltinLoadable(runtime, k)
        }));
      }
    });
    var builtinsForPyret = runtime.ffi.makeList(builtins);

    // var getDefsForPyret = runtime.makeFunction(function() {
    //     return CPO.editor.cm.getValue();
    //   });
    var replGlobals = gmf(compileStructs, "standard-globals");

    var defaultOptions = gmf(compileStructs, "default-compile-options");

    /**
     */
    var createRepl = function(optionalMakeFindModule, optionalGetDefsForPyret, optionalOnCompile) {
      var replDefer = Q.defer();

      var makeFinder = optionalMakeFindModule || makeFindModule;
      var getDefsForPyret = optionalGetDefsForPyret ||
            (runtime.makeFunction(function() {
              return CPO.editor.cm.getValue();
            }));
      var thisOnCompile = optionalOnCompile || onCompile;

      runtime.safeCall(function() {
          return gmf(cpo, "make-repl").app(
              builtinsForPyret,
              pyRuntime,
              pyRealm,
              runtime.makeFunction(makeFinder));
        }, function(repl) {
          var jsRepl = {
            runtime: runtime.getField(pyRuntime, "runtime").val,
            restartInteractions: function(ignoredStr, typeCheck) {
              var options = defaultOptions.extendWith({"type-check": typeCheck, "on-compile": thisOnCompile});
              var ret = Q.defer();
              setTimeout(function() {
                runtime.runThunk(function() {
                  return runtime.safeCall(
                    function() {
                      return gf(repl,
                      "make-definitions-locator").app(getDefsForPyret, replGlobals);
                    },
                    function(locator) {
                      return gf(repl, "restart-interactions").app(locator, options);
                    });
                }, function(result) {
                  ret.resolve(result);
                });
              }, 0);
              return ret.promise;
            },
            run: function(str, name) {
              var ret = Q.defer();
              setTimeout(function() {
                runtime.runThunk(function() {
                  return runtime.safeCall(
                    function() {
                      return gf(repl,
                      "make-interaction-locator").app(
                        runtime.makeFunction(function() { return str; }))
                    },
                    function(locator) {
                      return gf(repl, "run-interaction").app(locator);
                    });
                }, function(result) {
                  ret.resolve(result);
                }, "make-interaction-locator");
              }, 0);
              return ret.promise;
            },
            pause: function(afterPause) {
              runtime.schedulePause(function(resumer) {
                afterPause(resumer);
              });
            },
            stop: function() {
              runtime.breakAll();
            },
            runtime: runtime
          };
          replDefer.resolve(jsRepl);
        }, "make-repl");

      return replDefer.promise;
    };

    /**
     */
    var createMakeFindModuleFunction = function(protocolOverrideMap) {
      return function() {
        var locatorCache = {};
        var findModule = function(contextIgnored, dependency) {
          var uri = uriFromDependency(dependency);
          if(locatorCache.hasOwnProperty(uri)) {
            return gmf(compileLib, "located").app(locatorCache[uri], runtime.nothing);
          }
          return runtime.safeCall(function() {
            return runtime.ffi.cases(gmf(compileStructs, 'is-Dependency'), 'Dependency', dependency,
              {
                builtin: function(name) {
                  var raw = cpoModules.getBuiltinLoadableName(runtime, name);
                  if(!raw) {
                    throw runtime.throwMessageException('Unknown module: ' + name);
                  }
                  else {
                    return gmf(cpo, 'make-builtin-js-locator').app(name, raw);
                  }
                },
                dependency: function(protocol, args) {
                  var arr = runtime.ffi.toArray(args);
                  var protocolOverride = protocolOverrideMap[protocol];
                  var filesPromise = protocolOverride ? protocolOverride[arr[0]] : null;
                  var keepAuthForShared = protocolOverride ? protocolOverride.keepAuth : null;
                  var getCompiled = protocolOverride ? protocolOverride.getCompiled : null;
                  if (protocol === 'my-gdrive') {
                    if (filesPromise) {
                      return constructors.makeMyGDriveLocator(arr[0], filesPromise);
                    } else {
                      var msg = 'import my-gdrive("' + arr[0] + '"")\n this may be incorrect!';
                      console.warn(msg);
                      alert(msg);
                      return constructors.makeMyGDriveLocator(arr[0]);
                    }
                  }
                  else if (protocol === 'shared-gdrive') {
                    if (keepAuthForShared) {
                      return constructors.makeSharedGDriveLocator(arr[0], arr[1], true, getCompiled);
                    } else {
                      return constructors.makeSharedGDriveLocator(arr[0], arr[1], false, getCompiled);
                    }
                  }
                  else if (protocol === 'gdrive-js') {
                    return constructors.makeGDriveJSLocator(arr[0], arr[1]);
                  }
                  else {
                    console.error('Unknown import: ', dependency);
                  }
                }
              });
           }, function(l) {
              return gmf(compileLib, 'located').app(l, runtime.nothing);
           }, 'findModule');
          };

          return runtime.makeFunction(findModule, "cpo-find-module");
      };
    };

    return runtime.makeJSModuleReturn({
      createRepl: createRepl,
      createMakeFindModuleFunction: createMakeFindModuleFunction
    }, {});
  }
})
