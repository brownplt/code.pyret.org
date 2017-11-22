requirejs(["pyret-base/js/runtime", "pyret-base/js/post-load-hooks", "pyret-base/js/exn-stack-parser", "program", "cpo/cpo-builtin-modules"], function(runtimeLib, loadHooksLib, stackLib, program, cpoBuiltinModules) {

  var staticModules = program.staticModules;
  var depMap = program.depMap;
  var toLoad = program.toLoad;

  var main = toLoad[toLoad.length - 1];

  var realm = {};

  cpoBuiltinModules.setStaticModules(program.staticModules);

  var runtime = runtimeLib.makeRuntime({
    stdout: function(s) { console.log(s); },
    stderr: function(s) { console.error(s); }
  });

  // NOTE(joe): intentional, for debuggability
  window.THE_RUNTIME = runtime;

  // This stores the repl object with `run` and `restartInteractions` declared
  // in and exported from cpo-main.js
  var repl;

  var FIREFOX_GAS = 200;
  var OTHER_GAS = 1000;

  var EXIT_SUCCESS = 0;
  var EXIT_ERROR = 1;
  var EXIT_ERROR_RENDERING_ERROR = 2;
  var EXIT_ERROR_DISPLAYING_ERROR = 3;
  var EXIT_ERROR_JS = 4;
  var EXIT_ERROR_UNKNOWN = 5;

  runtime.setParam("command-line-arguments", []);
  runtime.setParam("staticModules", program.staticModules);
  runtime.setParam("currentMainURL", main);

  var ua = "";
  if(window.navigator && window.navigator.userAgent) {
    ua = window.navigator.userAgent;
  }
  if(ua.indexOf("Firefox") !== -1) {
    runtime.INITIAL_GAS = FIREFOX_GAS;
  }
  else {
    runtime.INITIAL_GAS = OTHER_GAS;
  }

  var gf = runtime.getField;

  var postLoadHooks = loadHooksLib.makeDefaultPostLoadHooks(runtime, {main: main, checkAll: true});
  postLoadHooks["builtin://cpo-builtins"] = function(_) {
    // NOTE(joe): At this point, all the builtin modules are for sure loaded
    // (like image, world, etc)
    
    var reactors = gf(gf(realm["builtin://reactors"], "provide-plus-types"), "internal");
    var world = gf(gf(realm["builtin://world"], "provide-plus-types"), "internal");
    reactors.setInteract(world.bigBangFromDict);

    cpoBuiltinModules.setRealm(realm);
  };
  postLoadHooks[main] = function(answer) {
    var checkerLib = runtime.modules["builtin://checker"];
    var checker = runtime.getField(runtime.getField(checkerLib, "provide-plus-types"), "values");
    var getStack = function(err) {
      console.error("The error is: ", err);
      var locArray = err.val.pyretStack.map(runtime.makeSrcloc);
      var locList = runtime.ffi.makeList(locArray);
      return locList;
    };

    repl = gf(gf(gf(answer, "provide-plus-types"), "values"), "repl").val;

    var getStackP = runtime.makeFunction(getStack);
    var toCall = runtime.getField(checker, "render-check-results-stack");
    var checks = runtime.getField(answer, "checks");
    return runtime.safeCall(function() {
      return toCall.app(checks, getStackP);
    }, function(printedCheckResult) {
      if(runtime.isString(printedCheckResult)) {
        console.log(printedCheckResult);
        console.log("\n");
      }
    });
  };

  function renderErrorMessage(execRt, res) {
    if (execRt.isPyretException(res.exn)) {
      var rendererrorMod = execRt.modules["builtin://render-error-display"];
      var rendererror = execRt.getField(rendererrorMod, "provide-plus-types");
      var gf = execRt.getField;
      var exnStack = res.exn.stack;
      res.exn.pyretStack = stackLib.convertExceptionToPyretStackTrace(res.exn, program);
      var pyretStack = res.exn.pyretStack;
      execRt.runThunk(
        function() {
          if (execRt.isPyretVal(res.exn.exn) && execRt.hasField(res.exn.exn, "render-reason")) {
            return execRt.getColonField(res.exn.exn, "render-reason").full_meth(res.exn.exn);
          } else {
            return execRt.ffi.edEmbed(res.exn.exn);
          }
        },
        function (reasonResult) {
          if (execRt.isFailureResult(reasonResult)) {
            console.error("While trying to report that Pyret terminated with an error:\n" + JSON.stringify(res)
                          + "\nPyret encountered an error rendering that error:\n" + JSON.stringify(reasonResult));
            console.error("Stack:\n" + JSON.stringify(exnStack));
            console.error("Pyret stack:\n" + execRt.printPyretStack(pyretStack, true));
            // process.exit(EXIT_ERROR_RENDERING_ERROR);
          } else {            
            execRt.runThunk(
              function() {
                return gf(gf(rendererror, "values"), "display-to-string").app(
                  reasonResult.result,
                  execRt.namespace.get("torepr"),
                  execRt.ffi.makeList(res.exn.pyretStack.map(execRt.makeSrcloc)));
              }, 
              function(printResult) {
                if (execRt.isSuccessResult(printResult)) {
                  console.error(printResult.result);
                  console.error("Stack trace:\n" + execRt.printPyretStack(res.exn.pyretStack));
                  // process.exit(EXIT_ERROR);
                } else {
                  console.error(
                    "While trying to report that Pyret terminated with an error:\n" + JSON.stringify(res)
                      + "\ndisplaying that error produced another error:\n" + JSON.stringify(printResult));
                  console.error("Stack:\n" + JSON.stringify(exnStack));
                  console.error("Pyret stack:\n" + execRt.printPyretStack(pyretStack, true));
                  // process.exit(EXIT_ERROR_DISPLAYING_ERROR);
                }                  
              }, "errordisplay->to-string");
          }
        }, "error->display");
    } else if (res.exn && res.exn.stack) {
      console.error("Abstraction breaking: Uncaught JavaScript error:\n", res.exn);
      console.error("Stack trace:\n", res.exn.stack);
      // process.exit(EXIT_ERROR_JS);
    } else {
      console.error("Unknown error result: ", res.exn);
      // process.exit(EXIT_ERROR_UNKNOWN);
    }
  }

  function onComplete(result) {
    if(runtime.isSuccessResult(result)) {
      // NOTE(joe): This forces the loading of all the built-in compiler libs
      var interactionsReady = repl.restartInteractions("", { typeCheck: false, checkAll: false });
      interactionsReady.fail(function(err) {
        console.error("Couldn't start REPL: ", err);
      });
      interactionsReady.then(function(result) {
        $("#runButton").attr("disabled", false);
        $("#runDropdown").attr("disabled", false);
        clearInterval($("#loader").data("intervalID"));
        $("#loader").hide();
        console.log("REPL ready.");
      });
    }
    else {
      console.error("The run ended in error: ", result);
      renderErrorMessage(runtime, result);
      console.error(result.exn.stack);
    }
//    $("#loader").hide();
    console.log(window.performance.now());
  }

  return runtime.runThunk(function() {
    runtime.modules = realm;
    return runtime.runStandalone(staticModules, realm, depMap, toLoad, postLoadHooks);
  }, onComplete);

});
