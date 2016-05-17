({
  requires: [
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./output-ui"]
    },
    // TODO(joe): does this need to be built-in?
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./image-lib"]
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

    function drawError(container, editors, runtime, exception, contextFactory) {
      var cases = ffi.cases;
      var get = runtime.getField;

      function mkPred(pyretFunName) {
        return function(val) { return get(error, pyretFunName).app(val); }
      }
      
      var isContractError = get(contracts, "ContractResult").app;

      // Exception will be one of:
      // - an Array of compileErrors (this is legacy, but useful for old versions),
      // - a PyretException with a list of compileErrors
      // - a PyretException with a stack and a Pyret value error
      // - something internal and JavaScripty, which we don't want
      //   users to see but will have a hard time ruling out
      if(exception instanceof Array) {
        drawCompileErrors(exception);
      }
      if(exception.exn instanceof Array) {
        drawCompileErrors(exception.exn);
      } else if(runtime.isPyretException(exception)) {
        drawPyretException(exception);
      } else {
        drawUnknownException(exception);
      }


      function singleHover(dom, loc) {
        if (loc === undefined) { 
          console.error("Given an undefined location to highlight, at", (new Error()).stack);
          return;
        }
        outputUI.hoverLink(editors, runtime, srcloc, dom, loc, "error-highlight");
      }

      function drawCompileErrors(e) {
        var errorID;
        function drawCompileError(e) {
          runtime.runThunk(
            function() {
              return get(e, "render-reason").app(); },
              // TODO(joe): re-enable once merge is complete
              //return get(e, "render-fancy-reason").app(); },
            function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                errorID = contextFactory();
                var dom = outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, e.pyretStack || [], errorID);
                dom.addClass("compile-error");
                container.append(dom); 
                dom.children().first(".highlightToggle").trigger('click');
              } else {
                container.append($("<span>").addClass("compile-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.log(errorDisp.exn);
              }
            });
        }
        e.forEach(drawCompileError);
        document.getElementById("main").dataset.highlights = errorID;
      }

      function drawPyretException(e) {
        function drawRuntimeErrorToString(e) {
          return function() {
            var dom = $("<div>");
            var exnstringContainer = $("<div>");
            dom
              .addClass("compile-error")
              .append($("<p>").text("Error: "))
              .append(exnstringContainer)
              .append($("<p>"))
              .append(outputUI.renderStackTrace(runtime, editors, srcloc, e));
            container.append(dom);
            if(runtime.isPyretVal(e.exn)) {
              outputUI.renderPyretValue(exnstringContainer, runtime, e.exn);
            }
            else {
              exnstringContainer.text(String(e.exn));
            }
          }
        }

        function drawPyretRuntimeError() {
          var locToAST = outputUI.locToAST(runtime, editors, srcloc);
          var locToSrc = outputUI.locToSrc(runtime, editors, srcloc);
          runtime.runThunk(
            function() { return get(e.exn, "render-reason").app(locToAST, locToSrc); },
            function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                var errorID = contextFactory();
                var highlightLoc = outputUI.getLastUserLocation(runtime, srcloc, e.pyretStack,
                      e.exn.$name == "arity-mismatch" ? 1 : 0);
                if(highlightMode === "scsh" && highlightLoc != undefined) {
                  outputUI.highlightSrcloc(runtime, editors, srcloc, highlightLoc, "hsl(0, 100%, 89%);", errorID);
                }
                var dom = outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, e.pyretStack, errorID);
                dom.children().first(".highlightToggle").trigger('click');
                dom.addClass("compile-error");
                container.append(dom);
                dom.append(outputUI.renderStackTrace(runtime, editors, srcloc, e));
              } else {
                  console.log(errorDisp.exn);
              }
            });
        }

        function drawPyretContractFailure(err) {
          var locToAST = outputUI.locToAST(runtime, editors, srcloc);
          var locToSrc = outputUI.locToSrc(runtime, editors, srcloc);
          var isArg = ffi.isFailArg(err);
          var loc = get(err, "loc");
          var reason = get(err, "reason");
          runtime.runThunk(
            function() { return get(err, "render-reason").app(locToAST, locToSrc); },
            function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                var dom = outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, e.pyretStack, contextFactory());
                dom.addClass("parse-error");
                container.append(dom);
                dom.append(outputUI.renderStackTrace(runtime, editors, srcloc, e));
              } else {
                container.append($("<span>").addClass("compile-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.log(errorDisp.exn);
              }
            });
        }

        function drawPyretParseError() {
          var locToSrc = outputUI.locToSrc(runtime, editors, srcloc);
          runtime.runThunk(
            function() { return get(e.exn, "render-reason").app(locToSrc); },
            function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                var dom = outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, e.pyretStack || []);
                dom.addClass("parse-error");
                container.append(dom);
              } else {
                container.append($("<span>").addClass("compile-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.log(errorDisp.exn);
              }
            });
        }
        if(!runtime.isObject(e.exn)) {
          drawRuntimeErrorToString(e)();
        }
        else if(isContractError(e.exn)) {
          drawPyretContractFailure(e.exn);
        }
        else if(mkPred("RuntimeError")(e.exn)) {
          drawPyretRuntimeError();
        }
        else if(mkPred("ParseError")(e.exn)) {
          drawPyretParseError();
        } else {
          drawRuntimeErrorToString(e)();
        }
      }

      function drawUnknownException(e) {
        container.append($("<div>").text("An unexpected error occurred: " + String(e)));
      }
    }

    return runtime.makeJSModuleReturn({
      drawError: drawError
    });
  }
})
