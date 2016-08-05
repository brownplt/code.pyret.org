({
  requires: [
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./output-ui"]
    },
    { "import-type": "builtin",
      name: "image-lib"
    },
    { "import-type": "builtin",
      name: "srcloc"
    },
    { "import-type": "builtin",
      name: "error"
    },
    { "import-type": "builtin",
      name: "contracts"
    }
  ],
  provides: {},
  nativeRequires: [ ],
  theModule: function(runtime, _, uri, outputUI, image, srclocLib, errorLib, contractsLib) {
    var srcloc = runtime.getField(srclocLib, "values");
    var error = runtime.getField(errorLib, "values");
    var contracts = runtime.getField(contractsLib, "values");

    var ffi = runtime.ffi;
    var cases = ffi.cases;

    // NOTE: MUST BE CALLED WHEN RUNNING ON runtime's STACK
    function drawError(container, documents, runtime, exception) {
      var cases = ffi.cases;
      var get = runtime.getField;

      function mkPred(pyretFunName) {
        return function(val) { return get(error, pyretFunName).app(val); }
      }

      var isContractError = get(contracts, "is-ContractResult").app;

      // Exception will be one of:
      // - an Array of compileErrors (this is legacy, but useful for old versions),
      // - a PyretException with a list of compileErrors
      // - a PyretException with a stack and a Pyret value error
      // - something internal and JavaScripty, which we don't want
      //   users to see but will have a hard time ruling out
      if (exception instanceof Array) {
        return drawCompileErrors(exception);
      } else if (exception.exn instanceof Array) {
        return drawCompileErrors(exception.exn);
      } else if(runtime.isPyretException(exception)) {
        return drawPyretException(exception);
      } else {
        return drawUnknownException(exception);
      }

      // HELPERS

      // NOTE: MUST BE CALLED WHEN RUNNING ON runtime's STACK
      function drawCompileErrors(e) {
        var lastError;
        function drawCompileError(e) {
          runtime.pauseStack(function(restarter) {
            runtime.runThunk(function() {
              return get(e, "render-fancy-reason").app(); 
            }, function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                runtime.runThunk(function() {
                  return outputUI.renderErrorDisplay(documents, runtime, errorDisp.result, e.pyretStack || []);
                }, function(domResult) {
                  if (runtime.isSuccessResult(domResult)) {
                    var dom = domResult.result;
                    dom.addClass("compile-error");
                    container.append(dom);
                    dom.on('click', function(){
                      $(".highlights-active").removeClass("highlights-active");
                      dom.trigger('toggleHighlight');
                      dom.addClass("highlights-active");
                    });
                    lastError = dom;
                  } else {
                    container.append($("<span>").addClass("compile-error internal-error")
                                     .text("An error occurred rendering the reason for this error; details logged to the console"));
                    console.error("drawCompileError: renderErrorDisplay failed:", errorDisp);;
                    console.log(errorDisp.exn);
                  }
                  restarter.resume(runtime.nothing);
                });
              } else {
                container.append($("<span>").addClass("compile-error internal-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.error("drawCompileError: render-fancy-reason failed:", errorDisp);;
                console.log(errorDisp.exn);
                renderSimpleReason(e).then(function(_) { 
                  restarter.resume(runtime.nothing); 
                });
              }
            });
          });
        }
        return runtime.safeCall(function() {
          return runtime.eachLoop(runtime.makeFunction(function(i) {
            return drawCompileError(e[i]);
          }), 0, e.length);
        }, function(_) {
          lastError.click();
        }, "drawCompileErrors: each: drawCompileError");
      }

      // NOTE: MUST BE CALLED WHEN RUNNING ON runtime's STACK
      function drawPyretException(e) {
        if(!runtime.isObject(e.exn)) {
          return drawRuntimeErrorToString(e)();
        }
        else if(isContractError(e.exn)) {
          return drawPyretContractFailure(e.exn);
        }
        else if(mkPred("is-RuntimeError")(e.exn)) {
          return drawPyretRuntimeError();
        }
        else if(mkPred("is-ParseError")(e.exn)) {
          return drawPyretParseError();
        } else {
          return drawRuntimeErrorToString(e)();
        }

        // HELPERS

        // NOTE: MUST BE CALLED WHEN RUNNING ON runtime's STACK
        function drawRuntimeErrorToString(e) {
          return function() {
            var dom = $("<div>");
            var exnstringContainer = $("<div>");
            dom
              .addClass("compile-error")
              .append($("<p>").text("Error: "))
              .append(exnstringContainer)
              .append($("<p>"))
              .append(outputUI.renderStackTrace(runtime, documents, srcloc, e.pyretStack));
            container.append(dom);
            if(runtime.isPyretVal(e.exn)) {
              outputUI.renderPyretValue(exnstringContainer, runtime, e.exn);
            }
            else {
              exnstringContainer.text(String(e.exn));
            }
          }
        }
        

        // NOTE: MUST BE CALLED WHEN RUNNING ON runtime's STACK
        function drawPyretRuntimeError() {
          var maybeLocToAST   = outputUI.makeMaybeLocToAST(runtime, documents, srcloc);
          var srclocAvaliable = outputUI.makeSrclocAvaliable(runtime, documents, srcloc);
          var maybeStackLoc = outputUI.makeMaybeStackLoc(runtime, documents, srcloc, e.pyretStack);
          runtime.pauseStack(function(restarter) {
            runtime.runThunk(
              function() { 
                return get(e.exn, "render-fancy-reason").app(maybeStackLoc, srclocAvaliable, maybeLocToAST); 
              }, function(errorDisp) {
                if (runtime.isSuccessResult(errorDisp)) {
                  runtime.runThunk(function() {
                    return outputUI.renderErrorDisplay(documents, runtime, errorDisp.result, e.pyretStack);
                  }, function(result) {
                    if (runtime.isSuccessResult(result)) {
                      var dom = result.result;
                      dom.append(outputUI.renderStackTrace(runtime, documents, srcloc, e.pyretStack));
                      dom.on('click', function(){
                        $(".highlights-active").removeClass("highlights-active");
                        dom.trigger('toggleHighlight');
                        dom.addClass("highlights-active");
                      });
                      dom.click();
                      dom.addClass("compile-error");
                      container.append(dom);
                    } else {
                      container.append($("<span>").addClass("error")
                                 .text("Something went wrong while rendering the error"));
                      console.log("drawPyretRuntimeError: renderErrorDisplay failed:", result.exn);
                    }
                    restarter.resume(runtime.nothing);
                  });
                } else {
                  renderSimpleReason(e).then(function(_) {
                    errorError = $("<span>").addClass("compile-error internal-error")
                      .text("An error occurred rendering the reason for the above error; details logged to the console");
                    if(!container.hasClass("internal-error")) {
                      drawError(errorError, documents, runtime, errorDisp, undefined);
                    }
                    container.append(errorError);
                    errorError.click();
                    console.error("drawPyretRuntimeError: render-fancy-reason failed:", errorDisp);
                    console.log(e.exn);
                    restarter.resume(runtime.nothing);
                  });
                }
              });
          });
        }
        
        // NOTE: MUST BE CALLED WHEN RUNNING ON runtime's STACK
        function renderSimpleReason(err) {
          var ret = Q.defer();
          runtime.runThunk(function() { 
            return get(err.exn, "render-reason").app(); 
          }, function(errorDisp) {
            if (runtime.isSuccessResult(errorDisp)) {
              runtime.runThunk(function() {
                return outputUI.renderErrorDisplay(documents, runtime, errorDisp.result, err.pyretStack);
              }, function(domResult) {
                if (runtime.isSuccessResult(domResult)) {
                  var dom = domResult.result;
                  dom.addClass("compile-error");
                  container.append(dom);
                  dom.append(outputUI.renderStackTrace(runtime, documents, srcloc, err.pyretStack));
                  dom.on('click', function(){
                    dom.trigger('toggleHighlight');
                  });
                  dom.click();
                  ret.resolve(runtime.nothing);
                } else {
                  container.append($("<span>").addClass("compile-error internal-error")
                                   .text("An error occurred rendering the reason for this error; details logged to the console"));
                  console.error("renderSimpleReason: renderErrorDisplay failed:", errorDisp);
                  console.log(err);
                  ret.resolve(runtime.nothing);
                }
              });
            } else {
              container.append($("<span>").addClass("compile-error internal-error")
                               .text("An error occurred rendering the reason for this error; details logged to the console"));
              console.error("renderSimpleReason: render-reason failed:", errorDisp);
              console.log(err);
              ret.resolve(runtime.nothing);
            }
          });
          return ret.promise;
        }

        // NOTE: MUST BE CALLED WHEN RUNNING ON runtime's STACK
        function drawPyretContractFailure(err) {
          var maybeLocToAST   = outputUI.makeMaybeLocToAST(runtime, documents, srcloc);
          var srclocAvaliable = outputUI.makeSrclocAvaliable(runtime, documents, srcloc);
          var maybeStackLoc = outputUI.makeMaybeStackLoc(runtime, documents, srcloc, exception.pyretStack);
          var isArg = ffi.isFailArg(err);
          var loc = get(err, "loc");
          var reason = get(err, "reason");
          runtime.pauseStack(function(restarter) {
            runtime.runThunk(function() {
              return get(err, "render-fancy-reason").app(maybeStackLoc, srclocAvaliable, maybeLocToAST); 
            }, function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                runtime.runThunk(function() {
                  return outputUI.renderErrorDisplay(documents, runtime, errorDisp.result, exception.pyretStack);
                }, function(domResult) {
                  if (runtime.isSuccessResult(domResult)) {
                    var dom = domResult.result;
                    dom.addClass("compile-error");
                    dom.on('click', function(){
                      $(".highlights-active").removeClass("highlights-active");
                      dom.trigger('toggleHighlight');
                      dom.addClass("highlights-active");
                    });
                    container.append(dom);
                    dom.append(outputUI.renderStackTrace(runtime, documents, srcloc, exception.pyretStack));
                    dom.click();
                  } else {
                    container.append($("<span>").addClass("compile-error")
                                     .text("An error occurred rendering the reason for this error; details logged to the console"));
                    console.error("drawPyretContractFailure: renderErrorDisplay failed:", errorDisp);
                    console.log(errorDisp.exn);
                  }
                  restarter.resume(runtime.nothing);
                });
              } else {
                container.append($("<span>").addClass("compile-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.error("drawPyretContractFailure: render-fancy-reason failed", errorDisp);
                console.log(errorDisp.exn);
                restarter.resume(runtime.nothing);
              }
            });
          });
        }

        function drawPyretParseError() {
          var srclocAvaliable = outputUI.makeSrclocAvaliable(runtime, documents, srcloc);
          runtime.pauseStack(function(restarter) {
            runtime.runThunk(function() { 
              return get(e.exn, "render-fancy-reason").app(srclocAvaliable);
            }, function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                runtime.runThunk(function() {
                  return outputUI.renderErrorDisplay(documents, runtime, errorDisp.result, e.pyretStack || []);
                }, function(domResult) {
                  if (runtime.isSuccessResult(domResult)) {
                    var rendering = domResult.result;
                    rendering
                      .addClass("compile-error")
                      .on('click', function(){
                        $(".highlights-active").removeClass("highlights-active");
                        rendering.trigger('toggleHighlight');
                        rendering.addClass("highlights-active");
                      })
                      .appendTo(container);
                  } else {
                    container.append($("<span>").addClass("compile-error")
                                     .text("An error occurred rendering the reason for this error; details logged to the console"));
                    console.error("drawPyretParseError: renderErrorDisplay failed:", errorDisp);
                    console.log(errorDisp.exn);
                  }
                  restarter.resume(runtime.nothing);
                });
              } else {
                container.append($("<span>").addClass("compile-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.error("drawPyretParseError: render-fancy-reason failed:", errorDisp);
                console.log(errorDisp.exn);
                restarter.resume(runtime.nothing);
              }
            });
          });
        }
      }

      function drawUnknownException(e) {
        container.append($("<div>").text("An unexpected error occurred: " + String(e)));
        console.error("Unexpected error: ", e);
      }
    }

    return runtime.makeJSModuleReturn({
      drawError: drawError
    });
  }
})
