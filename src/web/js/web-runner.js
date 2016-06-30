define([
    "q",
    
    "js/runtime-anf",
    "trove/runtime-lib",
    
    "/js/guess-gas.js",
    
    "compiler/compile-lib.arr",
    "compiler/compile-structs.arr",
  ],
  function(
    q,

    rtLib,
    pyRuntimeLib,
    
    guessGas,
    
    compileLibLib,
    compileStructsLib) {

  function createRunner(imgUrlProxy, makeFindModule) {
    var runnerP = q.defer();
    var runtime = rtLib.makeRuntime({stdout: function(str) { console.log(str); }});
    runtime.setParam("imgUrlProxy", imgUrlProxy);

    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    var gtf = function(m, f) { return gf(m, "types")[f]; };

    var findModuleP = makeFindModule(runtime);

    findModuleP.then(function(findModule) {

      try {
        runtime.runThunk(function() {
          return runtime.loadModulesNew(
            runtime.namespace,
            [pyRuntimeLib, compileLibLib, compileStructsLib],
            function(pyRuntime, compileLib, compileStructs) {
              // NOTE(joe): This line is "cheating" by mixing runtime levels,
              // and uses the same runtime for the compiler and running code.
              // Usually you can only get a new Runtime by calling create, but
              // here we magic the current runtime into one.
              var pr = gf(gf(pyRuntime, "internal").brandRuntime, "brand").app(
                runtime.makeObject({
                  "runtime": runtime.makeOpaque(runtime)
                }));
              function run(locator /* A Pyret Locator */, subs) {
                var resultP = q.defer();
                runtime.runThunk(function() {
                  return runtime.safeTail(function() {
                    gmf(compileLib, "compile-and-run-locator").app(
                        locator,
                        runtime.makeFunction(findModule(subs)),
                        runtime.nothing, // no context just yet
                        pr,
                        gmf(compileStructs, "default-compile-options")
                      );
                  });
                }, function(result) {
                  resultP.resolve(result);
                });
                return resultP.promise;
              }
              function runString(str, name, subs) {
                return run(
                    gmf(compileLib, "string-locator").app(name, str), subs);
              }
              return { run: run, runString: runString, runtime: runtime };
            });
          }, function(result) {
            if(runtime.isFailureResult(result)) {
              runnerP.reject(result);
            }
            else {
              runnerP.resolve(result.result);
            }
          });
       }
       catch(e) {
         runnerP.reject(e);
       }
    });
    return runnerP.promise;
  }

  return {createRunner: createRunner};
});

