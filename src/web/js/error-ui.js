define(["js/ffi-helpers", "trove/srcloc", "trove/error", "trove/contracts", "compiler/compile-structs.arr", "trove/image-lib", "./output-ui.js", "/js/share.js"], function(ffiLib, srclocLib, errorLib, contractsLib, csLib, imageLib, outputUI) {

  var shareAPI = makeShareAPI("");
  function drawError(container, editors, runtime, exception) {
    var ffi = ffiLib(runtime, runtime.namespace);
    var image = imageLib(runtime, runtime.namespace);
    var cases = ffi.cases;
    runtime.loadModules(runtime.namespace, [srclocLib, errorLib, csLib, contractsLib], function(srcloc, error, cs, contracts) {
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
        exception.forEach(renderReason("compile-error", false));
      }
      
      if(exception.exn instanceof Array) {
        exception.exn.forEach(renderReason("compile-error", false));
      } 
      else if(runtime.isPyretException(exception)) {
        if(!runtime.isObject(e.exn)) {
          drawRuntimeErrorToString(e)();
        }
        else if(isContractError(e.exn)) {
          renderReason("parse-error", true);
        }
        else if(mkPred("RuntimeError")(e.exn)) {
          renderReason("compile-error", true);
        }
        else if(mkPred("ParseError")(e.exn)) {
          renderReason("parse-error", false);
        } 
        else {
          drawRuntimeErrorToString(e)();
        }
      }
      else {
        container.append($("<div>").text("An unexpected error occurred: " + String(e)));
      }
      
      function drawRuntimeErrorToString(e) {
        return function() {
          var dom = $("<div>");
          var exnstringContainer = $("<div>");
          dom
            .addClass("compile-error")
            .append($("<p>").text("Error: "))
            .append(exnstringContainer)
            .append($("<p>"))
            .append(drawExpandableStackTrace(e));
          container.append(dom);
          if(runtime.isPyretVal(e.exn)) {
            outputUI.renderPyretValue(exnstringContainer, runtime, e.exn);
          }
          else {
            exnstringContainer.text(String(e.exn));
          }
        }
      }
      
      function renderReason(domClass, showStackTrace) {
        runtime.runThunk(
          function() { return get(e.exn, "render-reason").app(); },
          function(errorDisp) {
            if (runtime.isSuccessResult(errorDisp)) {
              var dom = outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, e.pyretStack || []);
              container.append(domClass);
              if(showStackTrace) { dom.append(drawExpandableStackTrace(e)); }
            }
            else {
              container.append($("<span>").addClass(domClass)
                               .text("An error occurred rendering the reason for this error; details logged to the console"));
              console.log(errorDisp.exn);
            }
          });
      }

      function singleHover(dom, loc) {
        if (loc === undefined) { 
          console.error("Given an undefined location to highlight, at", (new Error()).stack);
          return;
        }
        outputUI.hoverLink(editors, runtime, srcloc, dom, loc, "error-highlight");
      }

      function drawExpandableStackTrace(e) {
        var srclocStack = e.pyretStack.map(runtime.makeSrcloc);
        var isSrcloc = function(s) { return runtime.unwrap(get(srcloc, "is-srcloc").app(s)); }
        var userLocs = srclocStack.filter(function(l) { return l && isSrcloc(l); });
        var container = $("<div>");
        if(userLocs.length > 0) {
          container.append($("<p>").text("Evaluation in progress when the error occurred:"));
          userLocs.forEach(function(ul) {
            var slContainer = $("<div>");
            var srcloc = outputUI.drawSrcloc(editors, runtime, ul);
            slContainer.append(srcloc);
            singleHover(srcloc, ul);
            container.append(slContainer);
          });
          return outputUI.expandableMore(container);
        } else {
          return container;
        }
      }

    });
  }

  return {
    drawError: drawError
  }

});
