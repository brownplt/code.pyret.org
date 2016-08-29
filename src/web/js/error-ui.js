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
            ret.reject(result.exn);
          }
        });
      return ret.promise;
    }

    function applyMethod(runtime, value, name, args) {
      return runtime.
        safeThen(function() {
          return runtime.getField(value, name);
        }, applyMethod).then(function(fun) {
          return fun.app.apply(value, args);
        }).start;
    }

    // MUST BE CALLED ON PYRET STACK
    function render_reason(runtime, renderable) {
      return callDeferred(runtime,
              applyMethod(runtime, renderable, "render-reason", []));
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

    // Calls `render-fancy-reason` | `reason_to_html`, with fallback
    // to `render-reason` | `reason_to_html`, with fallback
    // to internal error
    // MUST BE CALLED ON PYRET STACK
    function error_to_html(runtime, documents, error, stack) {

      function torepr(value) {
        return callDeferred(runtime, function() {
          return runtime.toReprJS(value, runtime.ReprMethods._torepr);
        });
      }

      var record = {};

      function log_set(name) {
        return function (value) {
          record[name] = value;
          return value;
        };
      }

      function log_torepr(name) {
        return function (value) {
          return torepr(value).
            then(log_set(name)).
            thenResolve(value).
            catch(function(repr_error) {
              console.error("`torepr` errored:", repr_error);
              return value;
            });
        };
      }

      var errors = [];

      var renderError = function(_) {
        return getFancyRenderer(runtime, documents, error)(stack);
      }

      return Q(error).
        then(log_torepr('error')).
        then(renderError).
        then(log_torepr('reason_repr')).
        catch(function (render_error) {
          errors.push(e);
          throw e;
        }).
        then(reason_to_html(runtime, CPO.documents, stack)).
        catch(function (display_error) {
          errors.push(display_error);
          return render_reason(runtime, error).
            then(log_torepr('reason_repr')).
            then(reason_to_html(runtime, CPO.documents, stack));
        }).
        then(function (html) {
          if (errors.length > 0) {
            html.append($("<p>").text(
              "One or more internal errors prevented us from showing the "
              + "best error message possible. Please report this as a bug."));
          }
          return html;
        }).
        catch(function (display_error) {
          errors.push(display_error);
          return $("<div>").text(
            "Internal errors prevented this error message from being "
            + "shown. Please report this as a bug.");
        }).
        then(function (html) {
          log_set('html')(html.prop('outerHTML'));
          return html;
        }).
        finally(function (html) {
          errors.forEach(function (e) {
            console.error(e);
          });
          logger.log('error', record);
        });
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
      error_to_html: error_to_html
    });
  }
})
