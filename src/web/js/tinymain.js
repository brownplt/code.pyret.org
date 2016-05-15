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
    { "import-type": "builtin",
      name: "runtime-lib"
    }
  ],
  nativeRequires: [
    "cpo/repl-ui",
    "cpo/cpo-builtins",
    "cpo/gdrive-locators",
    "cpo/http-imports",
    "cpo/guess-gas",
    "cpo/cpo-builtin-modules",
    "pyret-base/js/runtime"
  ],
  provides: {},
  theModule: function(runtime, namespace, uri,
                      compileLib, compileStructs, pyRepl, cpo, runtimeLib,
                      replUI, cpoBuiltin, gdriveLocators, http, guessGas, cpoModules,
                      rtLib) {

    


    var replContainer = $("<div>").addClass("repl");
    $("#REPL").append(replContainer);

    runtime.setParam("imgUrlProxy", function(s) {
      return APP_BASE_URL + "/downloadImg?" + s;
    });

    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    var gtf = function(m, f) { return gf(m, "types")[f]; };


    var replEnv = gmf(compileStructs, "standard-builtins");
    function findModule(contextIgnored, dependency) {
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
              console.error("Unknown import: ", dependency);
              throw runtime.throwMessageException("Unknown protocol: " + protocol);

            /*
              var arr = runtime.ffi.toArray(args);
              if (protocol === "my-gdrive") {
                return constructors.makeMyGDriveLocator(arr[0]);
              }
              else if (protocol === "shared-gdrive") {
                return constructors.makeSharedGDriveLocator(arr[0], arr[1]);
              }
              else if (protocol === "js-http") {
                // TODO: THIS IS WRONG with the new locator system
                return http.getHttpImport(runtime, args[0]);
              }
              else if (protocol === "gdrive-js") {
                return constructors.makeGDriveJSLocator(arr[0], arr[1]);
              }
              else {
                console.error("Unknown import: ", dependency);
              }
            */
            }
          });
       }, function(l) {
          return gmf(compileLib, "located").app(l, runtime.nothing); 
       });
    }

    // NOTE(joe): This line is "cheating" by mixing runtime levels,
    // and uses the same runtime for the compiler and running code.
    // Usually you can only get a new Runtime by calling create, but
    // here we magic the current runtime into one.
    var pyRuntime = gf(gf(runtimeLib, "internal").brandRuntime, "brand").app(
      runtime.makeObject({
        "runtime": runtime.makeOpaque(runtime)
      }));

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

    var replP = Q.defer();
    runtime.safeCall(function() {
        return gmf(cpo, "make-repl").app(
            builtinsForPyret,
            runtime.makeFunction(function() {
              return CPO.editor.cm.getValue();
            }),
            pyRuntime,
            runtime.makeFunction(findModule));
      }, function(repl) {
        var jsRepl = {
          runtime: runtime.getField(pyRuntime, "runtime").val,
          restartInteractions: function(ignoredStr, typeCheck) {
            var ret = Q.defer();
            setTimeout(function() {
              runtime.runThunk(function() {
                return gf(repl, "restart-interactions").app(typeCheck);
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
                    return gmf(repl,
                    "make-repl-interaction-locator").app(
                      runtime.makeFunction(function() { return str; }))
                  },
                  function(locator) {
                    return gf(repl, "run-interaction").app(locator); 
                  });
              }, function(result) {
                ret.resolve(result);
              });
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
        replP.resolve(jsRepl);
      });

    replP.promise.then(function(repl) {
      console.log("Loaded");
      clearInterval($("#loader").data("intervalID"));
      $("#loader").hide();
      CPO.editor.cm.setValue("5 + 5");
      var comp = repl.restartInteractions("", false);
      comp.then(function(res) {
        console.log("Result: ", res);
      });
      comp.fail(function(err) {
        console.log("Fail: ", err);
      });
    });

    return runtime.makeModuleReturn({}, {});
  }
})
