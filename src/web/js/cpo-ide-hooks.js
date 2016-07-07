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
    },
    { "import-type": "builtin",
      name: "load-lib"
    },
    { "import-type": "builtin",
      name: "builtin-modules"
    },
    { "import-type": "builtin",
      name: "cpo-builtins"
    },
    {
      "import-type": "builtin",
      name: "parse-pyret"
    }
  ],
  nativeRequires: [
    "cpo/cpo-builtin-modules"
  ],
  provides: {},
  theModule: function(runtime, namespace, uri,
                      compileLib, compileStructs, pyRepl, cpo,
                      runtimeLib, loadLib, builtinModules, cpoBuiltins, parsePyret,
                      cpoModules
  ) {

    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };

    function findModule(contextIgnored, dependency) {
      // TODO(joe): enhance this with gdrive locators, etc, later
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
            },
            dependency: function(protocol, args) {
              console.error("Unknown import: ", dependency);
            }
          });
       }, function(l) {
          return gmf(compileLib, "located").app(l, runtime.nothing);
       }, "findModule");
    }
    var pyFindModule = runtime.makeFunction(findModule, "find-module");

    // NOTE(joe): This line is "cheating" by mixing runtime levels, and uses
    // the same runtime for the compiler and running code.  Usually you can
    // only get a new pyret-viewable Runtime by calling create, but here we
    // magic the current runtime into one.
    // Someday Pyret will be quick enough that we won't need to save theses
    // seconds of instantiation.
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

    function parse(source, uri) {
      var parse = runtime.getField(runtime.getField(parsePyret, "values"), "surface-parse")
      return runtime.safeTail(function() {
        return parse.app(source, uri);
      });
    }

    function compile(ast) {
      var compileAst = gmf(cpo, "compile-ast");
      return runtime.safeTail(function() {
        return compileAst.app(ast, pyRuntime, pyFindModule, gmf(compileStructs, "default-compile-options"));
      });
    }

    function run(jsSrc) {
      var run = gmf(cpo, "run");
      return runtime.safeTail(function() {
        return run.app(pyRuntime, pyRealm, jsSrc);
      });
    }

    window.CPOIDEHooks = {
      runtime: runtime,
      parse: parse,
      compile: compile,
      run: run
    };
    return runtime.makeModuleReturn({}, {});
  }
})
