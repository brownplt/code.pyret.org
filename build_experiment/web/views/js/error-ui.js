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

    // NOTE: MUST BE CALLED IN CONTEXT OF PYRET STACK?
    var isContractError = function(runtime, v){
      var contracts = runtime.getField(contractsLib, "values");
      return runtime.getField(contracts, "is-ContractResult").app(v)
    };

    // NOTE: MUST BE CALLED IN CONTEXT OF PYRET STACK?
    var isRuntimeError  = function(runtime, v){
      var error = runtime.getField(errorLib, "values");
      return runtime.getField(error, "is-RuntimeError").app(v)
    };

    // NOTE: MUST BE CALLED IN CONTEXT OF PYRET STACK?
    var isParseError  = function(runtime, v){
      var error = runtime.getField(errorLib, "values");
      return runtime.getField(error, "is-ParseError").app(v)
    };

    // NOTE: MUST BE CALLED IN CONTEXT OF PYRET STACK?
    var isTestResult  = function(runtime, v){
      var error = runtime.getField(checkerLib, "values");
      return runtime.getField(error, "is-TestResult").app(v)
    };

    var ffi = runtime.ffi;
    var cases = ffi.cases;

    // Helper function. MUST NOT BE CALLED ON PYRET STACK.
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

    // RETURNED FUNCTION MUST BE CALLED IN THE CONTEXT OF THE PYRET STACK 
    function applyMethod(runtime, value, name, args) {
      return runtime.
        safeThen(function() {
          return runtime.getField(value, name);
        }, applyMethod).then(function(fun) {
          return fun.app.apply(value, args);
        }).start;
    }

    // MUST NOT BE CALLED ON PYRET STACK
    function render_reason(runtime, renderable) {
      return callDeferred(runtime,
              // `applyMethod` result must be called in context of the
              // pyret stack, and *is* called in the context of the
              // stack initialized by `callDeferred`.
              applyMethod(runtime, renderable, "render-reason", []));
    }

    // MUST NOT BE CALLED ON PYRET STACK
    function render_fancy_reason(runtime, renderable) {
      return callDeferred(runtime,
              // `applyMethod` result must be called in context of the
              // pyret stack, and *is* called in the context of the
              // stack initialized by `callDeferred`.
              applyMethod(runtime, renderable, "render-fancy-reason",
                Array.prototype.slice.call(arguments, 2)));
    }

    // RETURNED THUNK MUST NOT BE CALLED ON PYRET STACK
    function getFancyRenderer(runtime, documents, error) {
      var srclocAvaliable = outputUI.makeSrclocAvaliable(runtime, documents, srcloc);
      if (isRuntimeError(runtime, error)
       || isContractError(runtime, error)
       || isTestResult(runtime, error)) {
        // NOTE: SHOULD THESE PREDICATES ONLY BE CALLED IN THE CONTEXT OF PYRET STACK?
        var maybeLocToAST   = outputUI.makeMaybeLocToAST(runtime, documents, srcloc);
        return function(stack) {
          // this returned function must not be called on the pyret stack
          // b/c `render_fancy_reason` must not be called on the pyret stack.
          return render_fancy_reason(runtime, error,
                    outputUI.makeMaybeStackLoc(
                              runtime,
                              documents,
                              srcloc,
                              stack),
                    srclocAvaliable, maybeLocToAST);
        };
      } else if (isParseError(runtime, error)) {
        // NOTE: SHOULD `isParseError` ONLY BE CALLED IN THE CONTEXT OF PYRET STACK?
        return function(stack) {
          // this returned function must not be called on the pyret stack
          // b/c `render_fancy_reason` must not be called on the pyret stack.
          return render_fancy_reason(runtime, error, srclocAvaliable);
        };
      } else {
        return function(stack) {
          // this returned function must not be called on the pyret stack
          // b/c `render_fancy_reason` must not be called on the pyret stack.
          return render_fancy_reason(runtime, error);
        };
      }
    }

    // Calls `render-fancy-reason` | `reason_to_html`, with fallback
    // to `render-reason` | `reason_to_html`, with fallback
    // to internal error
    // MUST NOT BE CALLED ON PYRET STACK
    // Assumes the stack has already been enriched, if necessary
    function error_to_html(runtime, documents, error, stack, result) {

      var id = logger.guid();

      // MUST NOT BE CALLED ON PYRET STACK
      function torepr(value) {
        // `torepr` must not be called on pyret stack b/c
        // `callDeferred` must not be called on the pyret stack.
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

      // MUST NOT BE CALLED ON PYRET STACK
      function log_torepr(name) {
        return function (value) {
          // `log_torepr` must not be called on pyret stack b/c
          // `torepr` must not be called on pyret stack.
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

      // `renderError` must not be called on pyret stack, b/c
      // getFancyRenderer must not be called on pyret stack.
      var renderError = function(_) {
        return getFancyRenderer(runtime, documents, error)(stack);
      }

      return Q(error).
        // `error_to_html` must not be called on pyret stack b/c `log_torepr` must not be called on pyret stack
        then(log_torepr('error')).
        // `error_to_html` must not be called on pyret stack b/c `renderError` must not be called on pyret stack
        then(renderError).
        // `error_to_html` must not be called on pyret stack b/c `log_torepr` must not be called on pyret stack
        then(log_torepr('reason_repr')).
        // this `catch` does not add any constraints.
        catch(function (render_error) {
          errors.push(render_error);
          throw render_error;
        }).
        // `error_to_html` must not be called on pyret stack b/c `reason_to_html` must not be called on pyret stack
        then(reason_to_html(runtime, CPO.documents, stack, id, result)).
        // `error_to_html` must not be called on pyret stack b/c `render_reason`, `log_torepr` and `reason_to_html` must not be called on pyret stack
        catch(function (display_error) {
          errors.push(display_error);
          return render_reason(runtime, error).
            then(log_torepr('reason_repr')).
            then(reason_to_html(runtime, CPO.documents, stack, id, result));
        }).
        // this `then` does not add any constraints
        then(function (html) {
          if (errors.length > 0) {
            html.append($("<p>").text(
              "One or more internal errors prevented us from showing the "
              + "best error message possible. Please report this as a bug."));
          }
          return html;
        }).
        // NOTE `renderStackTrace` might actually need to be called on the stack...
        then(function (html) {
          if (stack && stack.length > 0) {
            html.append(outputUI.renderStackTrace(runtime, documents, srcloc, stack));
          }
          return html;
        }).
        // this `catch` does not add any constraints
        catch(function (display_error) {
          errors.push(display_error);
          return $("<div>").text(
            "Internal errors prevented this error message from being "
            + "shown. Please report this as a bug.");
        }).
        // this `finally` does not add any constraints
        finally(function (html) {
          if (errors.length > 0) {
            record.disp_errors = errors;
          }
          errors.forEach(function (e) {
            console.error(e);
          });
          logger.log('error', record);
        });
    }

    // Consumes a reason, produces promise for html
    // MUST NOT BE CALLED ON PYRET STACK
    function reason_to_html(runtime, documents, stack, id, result) {
      return function (displayable) {
        // `callDeferred` must not be called on the pyret stack,
        // therefore `reason_to_html` must not be called on the
        // pyret stack
        return callDeferred(runtime, function () {
            return outputUI.renderErrorDisplay(
                    documents,
                    runtime,
                    displayable,
                    stack || [],
                    id,
                    result);
          });
      };
    }

    return runtime.makeJSModuleReturn({
      error_to_html: error_to_html
    });
  }
})
