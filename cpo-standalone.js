require(["pyret-base/js/runtime", "program", "cpo/cpo-builtin-modules"], function(runtimeLib, program, cpoBuiltinModules) {

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

  var EXIT_SUCCESS = 0;
  var EXIT_ERROR = 1;
  var EXIT_ERROR_RENDERING_ERROR = 2;
  var EXIT_ERROR_DISPLAYING_ERROR = 3;
  var EXIT_ERROR_JS = 4;
  var EXIT_ERROR_UNKNOWN = 5;

  runtime.setParam("command-line-arguments", []);
  runtime.setParam("staticModules", program.staticModules);

  var postLoadHooks = {
    "builtin://srcloc": function(srcloc) {
      runtime.srcloc = runtime.getField(runtime.getField(srcloc, "provide-plus-types"), "values");
    },
    "builtin://ffi": function(ffi) {
      ffi = ffi.jsmod;
      runtime.ffi = ffi;
      runtime["throwMessageException"] = ffi.throwMessageException;
      runtime["throwNoBranchesMatched"] = ffi.throwNoBranchesMatched;
      runtime["throwNoCasesMatched"] = ffi.throwNoCasesMatched;
      runtime["throwNonBooleanCondition"] = ffi.throwNonBooleanCondition;
      runtime["throwNonBooleanOp"] = ffi.throwNonBooleanOp;

      var checkList = runtime.makeCheckType(ffi.isList, "List");
      runtime["checkList"] = checkList;

      runtime["checkEQ"] = runtime.makeCheckType(ffi.isEqualityResult, "EqualityResult");
    },
    "builtin://checker": function(checker) {
      checker = runtime.getField(runtime.getField(checker, "provide-plus-types"), "values");
      // NOTE(joe): This is the place to add checkAll
      var currentChecker = runtime.getField(checker, "make-check-context").app(runtime.makeString(main), true);
      runtime.setParam("current-checker", currentChecker);
    },
    "builtin://cpo-builtins": function(_) {
      // NOTE(joe): At this point, all the builtin modules are for sure loaded
      // (like image, world, etc)
      cpoBuiltinModules.setRealm(realm);
    }
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
    var getStackP = runtime.makeFunction(getStack);
    var toCall = runtime.getField(checker, "render-check-results-stack");
    var checks = runtime.getField(answer, "checks");
    runtime.safeCall(function() {
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
      var pyretStack = res.exn.pyretStack;
      execRt.runThunk(
        function() {
          if (execRt.isPyretVal(res.exn.exn) && execRt.hasField(res.exn.exn, "render-reason")) {
            return execRt.getColonField(res.exn.exn, "render-reason");
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
      //console.log("The program completed successfully");
      //console.log(result);
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
