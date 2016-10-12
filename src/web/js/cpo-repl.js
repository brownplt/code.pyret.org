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

    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    var gtf = function(m, f) { return gf(m, "types")[f]; };

    var constructors = gdriveLocators.makeLocatorConstructors(storageAPI, runtime, compileLib, compileStructs, parsePyret, builtinModules, cpo);

    var defaultDependencyCases = {
      builtin: function(name) {
        var raw = cpoModules.getBuiltinLoadableName(runtime, name);
        if(!raw) {
          throw runtime.throwMessageException("Unknown module: " + name);
        }
        else {
          return gmf(cpo, "make-builtin-js-locator").app(name, raw);
        }
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
        else {
          console.error("Unknown dependency protocol: ", protocol);
        }
      }
    };

    var uriFromDependency = function(dependency) {
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
    };

    function createMakeFindModuleFunction(dependencyCasesOverride) {
      var dependencyCases = {
        builtin:    (dependencyCasesOverride.builtin    || defaultDependencyCases.builtin),
        dependency: (dependencyCasesOverride.dependency || defaultDependencyCases.dependency)
      };
      var makeFindModule = function() {
        // The locatorCache memoizes locators for the duration of an
        // interactions run
        var locatorCache = {};
        var findModule = function(contextIgnored, dependency) {
          var uri = uriFromDependency(dependency);
          if(locatorCache.hasOwnProperty(uri)) {
            return gmf(compileLib, "located").app(locatorCache[uri], runtime.nothing);
          }
          return runtime.safeCall(function() {
            return runtime.ffi.cases(gmf(compileStructs, "is-Dependency"), "Dependency", dependency,
              dependencyCases);
           }, function(l) {
              locatorCache[uri] = l;
              return gmf(compileLib, "located").app(l, runtime.nothing);
           }, "findModule");
        };

        return runtime.makeFunction(findModule, "cpo-find-module");
      };

      return runtime.makeFunction(makeFindModule);
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

    var defaultMakeReplArgs = {
      builtinMods: builtinsForPyret,
      runtime: pyRuntime,
      realm: pyRealm,
      finder: runtime.makeFunction(createMakeFindModuleFunction({}))
    };

    var getDefsForPyret = function(source) {
      return runtime.makeFunction(function() {
        return source;
      });
    };
    var replGlobals = gmf(compileStructs, "standard-globals");

    var defaultOptions = gmf(compileStructs, "default-compile-options");

    function createRepl(makeReplArgs, onCompile, optionalTransformDefinitionsLocator) {
      var replP = Q.defer();
      runtime.safeCall(function() {
        return gmf(cpo, "make-repl").app(
          (makeReplArgs.builtinMods || defaultMakeReplArgs.builtinMods),
          (makeReplArgs.runtime     || defaultMakeReplArgs.runtime),
          (makeReplArgs.realm       || defaultMakeReplArgs.realm),
          (makeReplArgs.finder      || defaultMakeReplArgs.finder));
      }, function(repl) {
        var jsRepl = {
          runtime: runtime.getField(pyRuntime, "runtime").val,
          restartInteractions: function(source, options) {
            var pyOptions = defaultOptions.extendWith({
              "type-check": options.typeCheck,
              "check-all": options.checkAll,
              "on-compile": onCompile
            });
            var ret = Q.defer();
            setTimeout(function() {
              runtime.runThunk(function() {
                return runtime.safeCall(
                  function() {
                    return gf(repl,
                    "make-definitions-locator").app(getDefsForPyret(source), replGlobals);
                  },
                  function(locator) {
                    if (optionalTransformDefinitionsLocator) {
                      locator = optionalTransformDefinitionsLocator(locator);
                    }
                    return gf(repl, "restart-interactions").app(locator, pyOptions);
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
        replP.resolve(jsRepl);
      }, "make-repl");

      return replP.promise;
    }

    function getGDriveLocatorConstructors() {
      return constructors;
    }

    return runtime.makeJSModuleReturn({
      createRepl: createRepl,
      createMakeFindModuleFunction: createMakeFindModuleFunction,
      getGDriveLocatorConstructors: getGDriveLocatorConstructors
    }, {});
  }
})
