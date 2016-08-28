({
  requires: [
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./output-ui"]
    },
    { "import-type": "builtin",
      name: "srcloc"
    },
    { "import-type": "builtin",
      name: "error"
    },
    { "import-type": "builtin",
      name: "contracts"
    },
    { "import-type": "builtin",
      name: "checker"
    }
  ],
  provides: {},
  nativeRequires: [ ],
  theModule: function(runtime, _, uri, outputUI, srclocLib, errorLib, contractsLib, checkerLib) {
    var srcloc = runtime.getField(srclocLib, "values");

    var isContractError = function(runtime, v){
      var contracts = runtime.getField(contractsLib, "values");
      return runtime.getField(contracts, "is-ContractResult").app(v)
    };

    var isRuntimeError  = function(runtime, v){
      var error = runtime.getField(errorLib, "values");
      return runtime.getField(error, "is-RuntimeError").app(v)
    };

    var isParseError  = function(runtime, v){
      var error = runtime.getField(errorLib, "values");
      return runtime.getField(error, "is-ParseError").app(v)
    };

    var isTestResult  = function(runtime, v){
      var error = runtime.getField(checkerLib, "values");
      return runtime.getField(error, "is-TestResult").app(v)
    };

    var ffi = runtime.ffi;
    var cases = ffi.cases;

    // Helper function. MUST BE CALLED ON PYRET STACK.
    function callDeferred(runtime, thunk) {
      var ret = Q.defer();
      runtime.runThunk(
        thunk,
        function (result) {
          if (runtime.isSuccessResult(result)) {
            ret.resolve(result.result);
          } else {
            ret.resolve(result.exn);
          }
        });
      return ret.promise;
    }

    function applyMethod(runtime, value, name, args) {
      return function() {
        var fun = runtime.getField(value, name);
        args.length = fun.arity;
        return fun.app.apply(value, args);
      };
    }

    // MUST BE CALLED ON PYRET STACK
    function render_reason(runtime, renderable) {
      return callDeferred(runtime,
              applyMethod(runtime, renderable, "render-reason"));
    }

    // MUST BE CALLED ON PYRET STACK
    function render_fancy_reason(runtime, renderable) {
      return callDeferred(runtime,
              applyMethod(runtime, renderable, "render-fancy-reason",
                Array.prototype.slice.call(arguments, 2)));
    }

    function getFancyRenderer(runtime, documents, error) {
      var srclocAvaliable = outputUI.makeSrclocAvaliable(runtime, documents, srcloc);
      if (isRuntimeError(runtime, error)
       || isContractError(runtime, error)
       || isTestResult(runtime, error)) {
        var maybeLocToAST   = outputUI.makeMaybeLocToAST(runtime, documents, srcloc);
        return function(stack) {
          return render_fancy_reason(runtime, error,
                    outputUI.makeMaybeStackLoc(
                              runtime,
                              documents,
                              srcloc,
                              stack),
                    srclocAvaliable, maybeLocToAST);
        };
      } else if (isParseError(runtime, error)) {
        return function(stack) {
          return render_fancy_reason(runtime, error, srclocAvaliable);
        };
      } else {
        return function(stack) {
          return render_fancy_reason(runtime, error);
        };
      }
    }

    // Calls `render-fancy-reason` and, on failure,
    // falls back to `render-reason`
    // MUST BE CALLED ON PYRET STACK
    function error_to_reason(runtime, documents, error, stack) {
      return getFancyRenderer(runtime, documents, error)(stack).
        catch(function (render_error) {
          return render_reason(runtime, error);
        })
    }

    // Consumes a reason, produces promise for html
    // MUST BE CALLED ON PYRET STACK
    function reason_to_html(runtime, documents, stack) {
      return function (displayable) {
        return callDeferred(runtime, function () {
            return outputUI.renderErrorDisplay(
                    documents,
                    runtime,
                    displayable,
                    stack || []);
          });
      };
    }

    return runtime.makeJSModuleReturn({
      error_to_reason: error_to_reason,
      reason_to_html: reason_to_html
    });
  }
})
