define(["q", "js/runtime-util", "js/type-util"], function(q, util, t) {
  var knownModules = {
    "gdrive-sheets": true
  };
  function getCPOBuiltinLocator(runtime, compileLib, compileStructs, name) {
    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    var F = runtime.makeFunction;
    runtime.pauseStack(function(restarter) {
      require(["/js/" + name + ".js"], function(mod) {
        function needsCompile() { return false; }
        function getModule(self) {
          runtime.ffi.throwMessageException("Cannot get-module of js import");
        }
        function getDependencies(self) {
          var depArray = (mod.dependencies || []).map(function(d) {
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

        function getNamespace(_, otherRuntime) {
          return gmf(compileLib, "make-base-namespace").app(otherRuntime);
        }
        
        var uri = "cpo-js://" + name;
        function getUri(_) { return uri; }
        function name(_) { return name; }
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
          "get-compiled": m1(function() {
            return runtime.safeCall(function() {
              return gmf(compileStructs, "provides-from-raw-provides").app(
                uri,
                t.providesToPyret(runtime, mod.provides));
            },
            function(provides) {
              return runtime.ffi.makeSome(
                gmf(compileLib, "pre-loaded").app(
                  provides,
                  gmf(compileStructs, "minimal-builtins"),
                  runtime.makeOpaque(mod.theModule))
              );
            });
          })
        }));
      });
    });
  }
  function knownCPOModule(name) { return !!knownModules[name]; }
  return {
    "cpoBuiltinLocator": getCPOBuiltinLocator,
    "knownCpoModule": knownCPOModule
  };
});
