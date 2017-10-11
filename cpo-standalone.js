requirejs(["pyret-base/js/runtime", "pyret-base/js/exn-stack-parser", "program", "cpo/cpo-builtin-modules"], function(runtimeLib, stackLib, program, cpoBuiltinModules) {

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
      runtime["throwUnfinishedTemplate"] = ffi.throwUnfinishedTemplate;
      runtime["toArray"] = ffi.toArray;

      var checkList = runtime.makeCheckType(ffi.isList, "List");
      runtime["checkList"] = checkList;

      runtime["checkEQ"] = runtime.makeCheckType(ffi.isEqualityResult, "EqualityResult");
    },
    "builtin://table": function(table) {
      table = table.jsmod;
      runtime["makeTable"] = table.makeTable;
      runtime["makeRow"] = table.makeRow;
      runtime["makeRowFromArray"] = table.makeRowFromArray;
      runtime["openTable"] = table.openTable;
      runtime["checkTable"] = runtime.makeCheckType(table.isTable, "Table");
      runtime["checkRow"] = runtime.makeCheckType(table.isRow, "Row");
      runtime["isTable"] = table.isTable;
      runtime["isRow"] = table.isTable;
      runtime["checkWrapTable"] = function(val) {
        runtime.checkTable(val);
        return val;
      };
      runtime.makePrimAnn("Table", table.isTable);
    },
    "builtin://data-source": function(ds) {
      ds = runtime.getField(runtime.getField(ds, "provide-plus-types"), "values");
      // Variadic convenience function for desugaring use.
      // 'type' corresponds to a loader option in `data-source.arr`

      runtime["asLoaderOption"] = function(type) {
        switch(type) {
        case "sanitizer":
          return runtime.getField(ds, "sanitize-col").app(arguments[1], arguments[2]);
        default:
          runtime.ffi.throwMessageException("Internal error: Invalid loader option type: " + type);
        }
      };
      // Convenience function for JS library use
      runtime["extractLoaderOption"] = function(opt) {
        var isSanitizer = runtime.getField(ds, "is-sanitize-col");
        if (runtime.unwrap(isSanitizer.app(opt))) {
          return {
            type: "sanitizer",
            col: runtime.getField(opt, "col"),
            sanitizer: runtime.getField(opt, "sanitizer")
          };
        } else {
          runtime.ffi.throwMessageException("Internal error: Cannot coerce non-loader option");
        }
      }
      runtime["builtin_sanitizers"] = {
        option : runtime.getField(ds, "option-sanitizer"),
        string : runtime.getField(ds, "string-sanitizer"),
        num : runtime.getField(ds, "num-sanitizer"),
        bool: runtime.getField(ds, "bool-sanitizer"),
        strict_num : runtime.getField(ds, "strict-num-sanitizer"),
        strings_only : runtime.getField(ds, "strings-only"),
        numbers_only : runtime.getField(ds, "numbers-only"),
        booleans_only : runtime.getField(ds, "booleans-only"),
        empty_only : runtime.getField(ds, "empty-only")
      };

      runtime["makeCStr"] = runtime.getField(ds, "c-str").app;
      runtime["makeCNum"] = runtime.getField(ds, "c-num").app;
      runtime["makeCBool"] = runtime.getField(ds, "c-bool").app;
      runtime["makeCCustom"] = runtime.getField(ds, "c-custom").app;
      runtime["makeCEmpty"] = function() { return runtime.getField(ds, "c-empty"); };

      runtime["isCStr"] = function(v) { return runtime.unwrap(runtime.getField(ds, "is-c-str").app(v)); };
      runtime["isCNum"] = function(v) { return runtime.unwrap(runtime.getField(ds, "is-c-num").app(v)); };
      runtime["isCBool"] = function(v) { return runtime.unwrap(runtime.getField(ds, "is-c-bool").app(v)); };
      runtime["isCCustom"] = function(v) { return runtime.unwrap(runtime.getField(ds, "is-c-custom").app(v)); };
      runtime["isCEmpty"] = function(v) { return runtime.unwrap(runtime.getField(ds, "is-c-empty").app(v)); };

      runtime["unwrapCellContent"] = function(v) {
        if (runtime.isCStr(v)) {
          return {type: "str", value: runtime.getField(v, "s")};
        } else if (runtime.isCNum(v)) {
          return {type: "num", value: runtime.getField(v, "n")};
        } else if (runtime.isCBool(v)) {
          return {type: "bool", value: runtime.getField(v, "b")};
        } else if (runtime.isCCustom(v)) {
          return {type: "custom", value: runtime.getField(v, "datum")};
        } else if (runtime.isCEmpty(v)) {
          return {type: "empty"};
        } else {
          runtime.ffi.throwMessageException("Internal error: Cannot unwrap non-cell content");
        }
      };

      runtime["makeLoadedTable"] = function(headers, contents) {
        // Headers can either be [name, sanitizer] arrays or
        // {name: name, sanitizer: sanitizer} objects
        headers = headers.map(function(h) {
          if (h.sanitizer) {
            return runtime.makeTuple([h.name, h.sanitizer]);
          } else {
            return runtime.makeTuple(h);
          }
        });
        return runtime.makeTuple([headers, contents]);
      };
      runtime["checkCellContent"] = runtime.makeCheckType(
        runtime.getField(ds, "is-CellContent").app, "CellContent");
    },
    "builtin://checker": function(checker) {
      checker = runtime.getField(runtime.getField(checker, "provide-plus-types"), "values");
      // NOTE(joe): This is the place to add checkAll
      var currentChecker = runtime.getField(checker, "make-check-context").app(runtime.makeString(main), true);
      runtime.setParam("current-checker", currentChecker);
    },
    "builtin://reactors": function(reactor) {
      var r = runtime.getField(runtime.getField(reactor, "provide-plus-types"), "values");
      runtime.setParam("makeReactor", runtime.getField(r, "make-reactor").app);
    },
    "builtin://cpo-builtins": function(_) {
      // NOTE(joe): At this point, all the builtin modules are for sure loaded
      // (like image, world, etc)
      
      var reactors = gf(gf(realm["builtin://reactors"], "provide-plus-types"), "internal");
      var world = gf(gf(realm["builtin://world"], "provide-plus-types"), "internal");
      reactors.setInteract(world.bigBangFromDict);

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
