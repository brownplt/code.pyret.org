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

      var isRuntimeError = mkPred("RuntimeError");

      function setImmediate(f) { setTimeout(f, 0); }
      function renderValueIn(val, container) {
        setImmediate(function() {
          outputUI.renderPyretValue(container, runtime, val);
        });
      }

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
      } else if (typeof(exception) === 'string') {

        var eo = JSON.parse(exception);
        if (eo.type === 'spyret-parse-failure') {
          console.log('doing spyret-parse-failure')
          var loc
          var eoloc = eo.loc
          if (eoloc) {
            loc = get(srcloc, "srcloc").app(eoloc.source,
                                            eoloc.startRow, eoloc.startCol, eoloc.startChar,
                                            eoloc.endRow, eoloc.endCol, eoloc.endChar)
          } else {
            loc = get(srcloc, "srcloc").app('<no-location>', 0, 0, 0, 0, 0, 0)
          }
          drawSpyretParseError(eo.msg, loc)
        } else {
          drawUnknownException(eo)
        }

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

      function drawSpyretParseError(msg, loc) {
        var dom = $("<div>").addClass("parse-error");
        var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
        dom.append($("<p>").text(msg));
        singleHover(srcElem, loc);
        container.append(dom);
      }

      function drawCompileErrors(e) {
        function drawUnboundId(idExpr) {
          var dom = $("<div>").addClass("compile-error");
          var name = get(get(idExpr, "id"), "toname").app();
          var loc = get(idExpr, "l");
          cases(get(srcloc, "Srcloc"), "Srcloc", loc, {
            "builtin": function(_) {
              console.error("Should not be allowed to have a builtin that's unbound", e);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var srcElem = outputUI.drawSrcloc(editors, runtime, loc)
              var p = $("<p>");
              p.append("The name ");
              p.append($("<span>").addClass("code").text(name));
              p.append(" is used but not defined at ");
              dom.append(p);
              dom.append(srcElem);
              singleHover(srcElem, loc);
              container.append(dom);
            }
          });
        }
        function drawUnboundVar(id, loc) {
          var dom = $("<div>").addClass("compile-error");
          cases(get(srcloc, "Srcloc"), "Srcloc", loc, {
            "builtin": function(_) {
              console.error("Should not be allowed to have a builtin that's unbound", e);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var srcElem = outputUI.drawSrcloc(editors, runtime, loc)
              var p = $("<p>");
              p.append("The variable ");
              p.append($("<span>").addClass("code").text(id));
              p.append(" is assigned to, but not defined, at ");
              dom.append(p);
              dom.append(srcElem);
              singleHover(srcElem, loc);
              container.append(dom);
            }
          });
        }
        function drawUnboundTypeId(idExpr) {
          var dom = $("<div>").addClass("compile-error");
          var name = get(get(idExpr, "id"), "toname").app();
          var loc = get(idExpr, "l");
          cases(get(srcloc, "Srcloc"), "Srcloc", loc, {
            "builtin": function(_) {
              console.error("Should not be allowed to have a builtin that's unbound", e);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var srcElem = outputUI.drawSrcloc(editors, runtime, loc)
              var p = $("<p>");
              p.append("The name ");
              p.append($("<span>").addClass("code").text(name));
              p.append(" is used as a type but not defined as one, at ");
              dom.append(p);
              dom.append(srcElem);
              singleHover(srcElem, loc);
              container.append(dom);
            }
          });
        }
        function drawShadowId(id, newLoc, oldLoc) {
          var dom = $("<div>").addClass("compile-error");
          cases(get(srcloc, "Srcloc"), "Srcloc", oldLoc, {
            "builtin": function(_) {
              var p = $("<p>");
              var srcElem = outputUI.drawSrcloc(editors, runtime, newLoc);
              p.append("The name ");
              p.append($("<span>").addClass("code").text(id));
              p.append(" is already defined.  You need to pick a different name for ");
              p.append($("<span>").addClass("code").text(id));
              p.append(" at ");
              p.append(srcElem);
              dom.append(p);
              singleHover(srcElem, newLoc);
              container.append(dom);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var p = $("<p>");
              p.append("It looks like you defined the name ");
              p.append($("<span>").addClass("code").text(id));
              p.append(" twice, at ");
              var loc1 = outputUI.drawSrcloc(editors, runtime, oldLoc);
              var loc2 = outputUI.drawSrcloc(editors, runtime, newLoc);
              var p2 = $("<p>");
              p2.text("You need to pick a new name for one of them");
              dom.append(p).append("<br>").append(loc1).append("<br>").append(loc2).append("<br>").append(p2);
              singleHover(loc1, oldLoc);
              singleHover(loc2, newLoc);
              container.append(dom);
            }
          });
        }
        function drawBadAssignment(id, newLoc, oldLoc) {
          var dom = $("<div>").addClass("compile-error");
          var p = $("<p>");
          var srcElem = outputUI.drawSrcloc(editors, runtime, newLoc);
          var srcId = $("<span>").addClass("code").text(id)
          var varElt = $("<span>").addClass("code").text("var")
          p.append("The name ");
          p.append(srcId);
          p.append(" is defined as an identifier, but is assigned as if it were a variable at ");
          p.append(srcElem);
          p.append(".");
          dom.append(p);
          singleHover(srcElem, newLoc);

          cases(get(srcloc, "Srcloc"), "Srcloc", oldLoc, {
            "builtin": function(_) {
              container.append(dom);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var declLocElem = outputUI.drawSrcloc(editors, runtime, oldLoc);
              p.append("<br/>");
              singleHover(declLocElem, oldLoc);
              p.append(["One possible fix is to change the declaration of ", id, " to use ", varElt, " at ", declLocElem, ". "]);
              container.append(dom);
            }
          });
        }

        function drawPointlessVar(loc) {
          var dom = $("<div>").addClass("compile-error");
          cases(get(srcloc, "Srcloc"), "Srcloc", loc, {
            "builtin": function(_) {
              console.error("Should not be possible to have a builtin var that's anonymous", e);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
              var p = $("<p>");
              p.append("Defining an anonymous variable is pointless: you have no name to modify. ");
              p.append("Either give this expression a name, or bind it to an identifier rather than a variable.");
              dom.append(p).append("<br>");
              dom.append(srcElem);
              singleHover(srcElem, loc);
              container.append(dom);
            }
          });
        }
        function drawPointlessShadow(loc) {
          var dom = $("<div>").addClass("compile-error");
          cases(get(srcloc, "Srcloc"), "Srcloc", loc, {
            "builtin": function(_) {
              console.error("Should not be possible to have a builtin var that's anonymous", e);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
              var p = $("<p>");
              p.append("Anonymous identifiers cannot shadow anything: there is no name to shadow. ");
              p.append("Either give this expression a name, or remove the shadow annotation.");
              dom.append(p).append("<br>");
              dom.append(srcElem);
              singleHover(srcElem, loc);
              container.append(dom);
            }
          });
        }
        function drawPointlessGraphId(loc) {
          var dom = $("<div>").addClass("compile-error");
          cases(get(srcloc, "Srcloc"), "Srcloc", loc, {
            "builtin": function(_) {
              console.error("Should not be possible to have a builtin var that's anonymous", e);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
              var p = $("<p>");
              p.append("Anonymous bindings in graphs are not permitted, as they cannot be used elsewhere in the graph.");
              dom.append(p).append("<br>");
              dom.append(srcElem);
              singleHover(srcElem, loc);
              container.append(dom);
            }
          });
        }

        function drawWfError(msg, loc) {
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          var dom = $("<div>").addClass("compile-error");
          dom.append("<p>").text(msg);
          dom.append("<br>");
          dom.append(srcElem);
          singleHover(srcElem, loc);
          container.append(dom);
        }

        function drawWfErrSplit(msg, locs) {
          var dom = $("<div>").addClass("compile-error");
          dom.append("<p>").text(msg);
          dom.append("<br>")
          var locArray = ffi.toArray(locs)
          locArray.forEach(function(l) {
            var srcElem = outputUI.drawSrcloc(editors, runtime, l);
            dom.append(srcElem).append("<br>");
            singleHover(srcElem, l);
          });
          container.append(dom);
        }

        function drawReservedName(loc, id) {
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          var dom = $("<div>").addClass("compile-error");
          dom.append("<p>").text("Well-formedness: Pyret disallows the use of " + id + " as an identifier");
          dom.append("<br>");
          dom.append(srcElem);
          singleHover(srcElem, loc);
          container.append(dom);
        }

        function drawErrorToString(e) {
          return function() {
            runtime.safeCall(function() {
              return runtime.toReprJS(e, runtime.ReprMethods._tostring);
            }, function(s) {
              container.append($("<div>").addClass("compile-error").text(s));
            });
          };
        }

        function drawCompileError(e) {
        /*
          cases(get(cs, "CompileError"), "CompileError", e, {
              "unbound-id": drawUnboundId,
              "unbound-var": drawUnboundVar,
              "unbound-type-id": drawUnboundTypeId,
              "shadow-id": drawShadowId,
              "bad-assignment": drawBadAssignment,
              "duplicate-id": drawShadowId, // NOTE(joe): intentional re-use, not copypasta
              "duplicate-field": drawShadowId, // NOTE(ben): ditto
              "pointless-var": drawPointlessVar,
              "pointless-shadow": drawPointlessShadow,
              "pointless-graph-id": drawPointlessGraphId,
              "wf-err": drawWfError,
              "wf-err-split": drawWfErrSplit,
              "reserved-name": drawReservedName,
              "else": drawErrorToString(e)
            });
          container.append($("<hr>"));
          */
          runtime.runThunk(
            function() { return get(e, "render-reason").app(); },
            function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                var dom = outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, e.pyretStack || []);
                dom.addClass("compile-error");
                container.append(dom);
              } else {
                container.append($("<span>").addClass("compile-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.log(errorDisp.exn);
              }
            });
        }
        e.forEach(drawCompileError);
      }

      function getDomValue(v, f) {
        outputUI.installRenderers(runtime);
        runtime.safeCall(function() {
          return runtime.toReprJS(v, runtime.ReprMethods["$cpo"]);
        }, f);
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
      function getLastUserLocation(e, ix) {
        var srclocStack = e.pyretStack.map(runtime.makeSrcloc);
        var isSrcloc = function(s) { return runtime.unwrap(get(srcloc, "is-srcloc").app(s)); }
        var userLocs = srclocStack.filter(function(l) {
          if(!(l && isSrcloc(l))) { return false; }
          var source = runtime.getField(l, "source");
          return (source === "definitions" || source.indexOf("interactions") !== -1 || source.indexOf("gdrive") !== -1);
        });

        var probablyErrorLocation = userLocs[ix];
        return probablyErrorLocation;
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
        function drawGenericTypeMismatch(value, type) {
          // TODO(joe): How to improve this search?
          var probablyErrorLocation = getLastUserLocation(e, 0);
          var dom = $("<div>").addClass("compile-error");
          var srcElem = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
          getDomValue(value, function(valDom) {
            dom.append($("<p>").text("Expected to get a " + type + " as an argument, but got this instead: "))
              .append($("<br>"))
              .append(valDom)
              .append($("<br>"))
              .append($("<p>").text("at "))
              .append($("<br>"))
              .append(srcElem);
            $(valDom).trigger({type: 'afterAttach'});
            $('*', valDom).trigger({type : 'afterAttach'});
            container.append(dom);
            singleHover(srcElem, probablyErrorLocation);
          });
        }
        function drawEqualityFailure(reason, left, right) {
          var probablyErrorLocation = getLastUserLocation(e, 0);
          var dom = $("<div>").addClass("compile-error");
          var srcElem = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
          singleHover(srcElem, probablyErrorLocation);
          var leftContainer = $("<div>");
          var rightContainer = $("<div>");
          dom.append($("<p>").text("These two values cannot be compared for direct equality:"));
          dom.append("<br>");
          dom.append(leftContainer);
          dom.append("<br>");
          dom.append(rightContainer);
          if(runtime.isRoughnum(left) || runtime.isRoughnum(right)) {
            dom.append($("<p>").text("Approximations of numbers (Roughnums) cannot be compared for equality.  The program may need to use within()"));
          }
          outputUI.renderPyretValue(leftContainer, runtime, left);
          outputUI.renderPyretValue(rightContainer, runtime, right);
          dom.append($("<p>").append(["At ", srcElem]));
          container.append(dom);
        }
        function drawCasesArityMismatch(branchLoc, numArgs, actualArity) {
          var dom = $("<div>").addClass("compile-error");
          var loc = outputUI.drawSrcloc(editors, runtime, branchLoc);
          singleHover(loc, branchLoc);
          dom.append($("<p>").append(["The cases branch at ", loc, " should have only " + actualArity + " arguments, but there are ", numArgs]));
          dom.append(drawExpandableStackTrace(e));
          container.append(dom);
        }
        function drawCasesSingletonMismatch(branchLoc, shouldBeSingleton) {
          var dom = $("<div>").addClass("compile-error");
          var loc = outputUI.drawSrcloc(editors, runtime, branchLoc);
          singleHover(loc, branchLoc);
          var para;
          if(shouldBeSingleton) {
            para = $("<p>").append(["The cases branch at ", loc, " has an argument list, but the variant is a singleton."]);
          } else {
            para = $("<p>").append(["The cases branch at ", loc, " doesn't have an argument list, but the variant is not a singleton."]);
          }
          dom.append(para);
          dom.append(drawExpandableStackTrace(e));
          container.append(dom);
        }
        function drawArityMismatch(funLoc, arity, args) {
          args = ffi.toArray(args);
          var probablyErrorLocation = getLastUserLocation(e, 0);
          var dom = $("<div>").addClass("compile-error");
          var argDom = $("<div>");
          setTimeout(function() {
            args.forEach(function(a) {
              outputUI.renderPyretValue(argDom, runtime, a);
            });
          }, 0);
          cases(get(srcloc, "Srcloc"), "Srcloc", funLoc, {
            "srcloc": function(/* skip args */) {
              var caller = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
              var callee = outputUI.drawSrcloc(editors, runtime, funLoc);
              dom.append($("<p>").text("Expected to get " + arity + " arguments when calling the function at"))
                .append($("<br>"))
                .append(callee)
                .append($("<br>"))
                .append($("<p>").text("from"))
                .append($("<br>"))
                .append(caller)
                .append($("<br>"))
                .append($("<p>").text("but got these " + args.length + " arguments: "))
                .append($("<br>"))
                .append(argDom)
              container.append(dom);
              singleHover(callee, funLoc);
              singleHover(caller, probablyErrorLocation);
            },
            "builtin": function(name) {
              var caller = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
              dom.append($("<p>").text("Expected to get " + arity + " arguments at"))
                .append($("<br>"))
                .append(caller)
                .append($("<br>"))
                .append($("<p>").text("but got these " + args.length + " arguments: "))
                .append($("<br>"))
                .append(argDom);
              container.append(dom);
              singleHover(caller, probablyErrorLocation);
            }
          });
          dom.append(drawExpandableStackTrace(e));
        }
        function drawMessageException(message) {
          var probablyErrorLocation = getLastUserLocation(e, 0);
          var dom = $("<div>").addClass("compile-error");
          var srcloc = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
          singleHover(srcloc, probablyErrorLocation);
          if(probablyErrorLocation !== undefined) {
            dom.append($("<p>").text(message))
              .append($("<br>"))
              .append(outputUI.drawSrcloc(editors, runtime, probablyErrorLocation));
          } else {
            dom.append($("<p>").text(message));
          }
          dom.append(drawExpandableStackTrace(e));
          container.append(dom);
        }
        function drawUninitializedId(loc, name) {
          var dom = $("<div>").addClass("compile-error");
          var domLoc = outputUI.drawSrcloc(editors, runtime, loc);
          dom.append($("<p>").append(["The name ", name, " was used at ", domLoc, " before it was defined"]));
          singleHover(domLoc, loc);
          dom.append(drawExpandableStackTrace(e));
          container.append(dom);
        }
        function drawNoBranchesMatched(loc, type) {
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          var dom = $("<div>").addClass("compile-error");
          dom.append($("<p>").append(["No case matched in the ", type, " expression at ", srcElem ]));
          dom.append(drawExpandableStackTrace(e));
          singleHover(srcElem, loc);
          container.append(dom);
        }
        function drawNoCasesMatched(loc, value) {
          var dom = $("<div>").addClass("compile-error");
          var domLoc = outputUI.drawSrcloc(editors, runtime, loc);
          singleHover(domLoc, loc);
          var valContainer = $("<div>");
          dom.append([
            $("<p>").append(["No cases matched in the cases expression at ", domLoc, " for the value:"]),
            valContainer,
            $("<p>"),
            drawExpandableStackTrace(e)
          ]);
          container.append(dom);
          outputUI.renderPyretValue(valContainer, runtime, value);
        }
        function drawNonBooleanCondition(loc, type, value) {
          getDomValue(value, function(v) {
            var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
            var dom = $("<div>").addClass("compile-error");
            dom.append($("<p>").text("Expected true or false for the test in an " + type + " expression, but got:"));
            dom.append($("<br>"));
            dom.append(v);
            $(v).trigger({type: 'afterAttach'});
            $('*', v).trigger({type : 'afterAttach'});
            dom.append(srcElem);
            singleHover(srcElem, loc);
            container.append(dom);
          });
        }
        function drawNonBooleanOp(loc, position, type, value) {
          getDomValue(value, function(v) {
            var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
            var dom = $("<div>").addClass("compile-error");
            dom.append($("<p>").text("Expected true or false for the " + position + " argument in " + type + " expression, but got:"));
            dom.append($("<br>"));
            dom.append(v);
            $(v).trigger({type: 'afterAttach'});
            $('*', v).trigger({type : 'afterAttach'});
            dom.append($("<br>"));
            dom.append(srcElem);
            singleHover(srcElem, loc);
            container.append(dom);
          });
        }
        function drawNonFunctionApp(loc, nonFunVal) {
          getDomValue(nonFunVal, function(v) {
            var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
            var dom = $("<div>").addClass("compile-error");
            dom.append($("<p>").text("Expected a function in application but got:"));
            dom.append($("<br>"));
            dom.append(v);
            $(v).trigger({type: 'afterAttach'});
            $('*', v).trigger({type : 'afterAttach'});
            dom.append($("<br>"));
            dom.append(srcElem);
            singleHover(srcElem, loc);
            container.append(dom);
          });
        }
        function drawUserBreak() {
          container.append($("<div>").addClass("compile-error").text("Program stopped by user"));
        }
        function drawFieldNotFound(loc, obj, field) {
          var dom = $("<div>").addClass("compile-error");
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          dom.append($("<p>").append(
            ["Field ",
            $("<code>").text(field),
            " not found in the lookup expression at ",
            srcElem]));
          dom.append($("<p>").text("The object was:"));
          var valueContainer = $("<div>");
          dom.append(valueContainer);
          setTimeout(function() {
            outputUI.renderPyretValue(valueContainer, runtime, obj);
          }, 0);
          dom.append(drawExpandableStackTrace(e));
          singleHover(srcElem, loc);
          container.append(dom);
        }
        function drawLookupNonObject(loc, nonObj, field) {
          var dom = $("<div>").addClass("compile-error");
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          dom.append($("<p>").append(
            ["Tried to look up field ",
            $("<code>").text(field),
            " on a non-object in the lookup expression at ",
             srcElem]));
          dom.append($("<p>").text("The non-object was:"));
          var valueContainer = $("<div>");
          dom.append(valueContainer);
          setTimeout(function() {
            outputUI.renderPyretValue(valueContainer, runtime, nonObj);
          }, 0);
          dom.append(drawExpandableStackTrace(e));
          singleHover(srcElem, loc);
          container.append(dom);
        }
        function drawExtendNonObject(loc, nonObj) {
          var dom = $("<div>").addClass("compile-error");
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          dom.append($("<p>").append(
            ["Tried to extend a non-object in the expression at ",
            srcElem]));
          dom.append($("<p>").text("The non-object was:"));
          var valueContainer = $("<div>");
          dom.append(valueContainer);
          setTimeout(function() {
            outputUI.renderPyretValue(valueContainer, runtime, nonObj);
          }, 0);
          dom.append(drawExpandableStackTrace(e));
          singleHover(srcElem, loc);
          container.append(dom);
        }
        function drawInvalidArrayIndex(methodName, array, index, reason) {
          var dom = $("<div>").addClass("compile-error");
          var probablyErrorLocation = getLastUserLocation(e, 0);
          var srcElem = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
          dom.append($("<p>").append(
            ["Invalid array index ",
            $("<code>").text(index),
            " around the function call at ",
            srcElem,
            " because: ",
            reason]));
          dom.append(drawExpandableStackTrace(e));
          singleHover(srcElem, probablyErrorLocation);
          container.append(dom);
        }
        function drawModuleLoadFailure(names) {
          var arr = runtime.ffi.toArray(names);
          var dom = $("<div>").addClass("compile-error");
          dom.append($("<p>").append(["The module(s) "], $("<code>").text(arr.join(", ")), [" failed to load"]));
          container.append(dom);
        }

        function drawPlusError(val1, val2) {
          console.log('doing cpos drawpluserror')
          var dom = $("<div>").addClass("compile-error");
          var val1C = $("<div>");
          var val2C = $("<div>");
          dom.append([$("<p>").append(["ooo Invalid use of ", $("<code>").text("+"), " for these values: "]),
            val1C,
            val2C,
            $("<p>").text("Plus takes one of: "),
            $("<ul>").append([
              $("<li>").text("Two strings"),
              $("<li>").text("Two numbers"),
              $("<li>").text("A left-hand side with a _plus method")
            ]),
            drawExpandableStackTrace(e)]);
          renderValueIn(val1, val1C);
          renderValueIn(val2, val2C);
          container.append(dom);
        }

        function drawNumericBinopError(val1, val2, opname, methodname) {
          var dom = $("<div>").addClass("compile-error");
          var val1C = $("<div>");
          var val2C = $("<div>");
          dom.append([$("<p>").append(["ppp Invalid use of ", $("<code>").text(opname), " for these values: "]),
            val1C,
            val2C,
            $("<p>").text("Either:"),
            $("<ul>").append([
              $("<li>").text("Both arguments must be numbers, or"),
              $("<li>").text("The left-hand side must have a " + methodname + " method")
            ]),
            drawExpandableStackTrace(e)]);
          renderValueIn(val1, val1C);
          renderValueIn(val2, val2C);
          container.append(dom);

        }

        function drawPyretRuntimeError() {
          /*
          cases(get(error, "RuntimeError"), "RuntimeError", e.exn, {
              "message-exception": drawMessageException,
              "uninitialized-id": drawUninitializedId,
              "no-branches-matched": drawNoBranchesMatched,
              "no-cases-matched": drawNoCasesMatched,
              "field-not-found": drawFieldNotFound,
              "lookup-non-object": drawLookupNonObject,
              "extend-non-object": drawExtendNonObject,
              "generic-type-mismatch": drawGenericTypeMismatch,
              "equality-failure": drawEqualityFailure,
              "arity-mismatch": drawArityMismatch,
              "cases-arity-mismatch": drawCasesArityMismatch,
              "cases-singleton-mismatch": drawCasesSingletonMismatch,
              "plus-error": drawPlusError,
              "numeric-binop-error": drawNumericBinopError,
              "non-boolean-condition": drawNonBooleanCondition,
              "non-boolean-op": drawNonBooleanOp,
              "non-function-app": drawNonFunctionApp,
              "module-load-failure": drawModuleLoadFailure,
              "invalid-array-index": drawInvalidArrayIndex,
              "user-break": drawUserBreak,
              "else": drawRuntimeErrorToString(e)
            });
          container.append($("<hr>"));
          */
          runtime.runThunk(
            function() { return get(e.exn, "render-reason").app(); },
            function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                var dom = outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, e.pyretStack);
                dom.addClass("compile-error");
                container.append(dom);
                dom.append(drawExpandableStackTrace(e));
              } else {
                container.append($("<span>").addClass("compile-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.log(errorDisp.exn);
              }
            });
        }

        function errorIcon() {
          return $("<span>").addClass("error-icon").text("⚠");
        }

        function drawParseErrorNextToken(loc, nextToken) {
          var explanationMissing =
            $("<div>")
              .append($("<p>").text("The program is missing something"))
              .append($("<p>").html("Look carefully before the <span class='error-highlight'>highlighted text</span>.  Is something missing just before it?  Common missing items are colons (<code>:</code>), commas (<code>,</code>), string markers (<code>\"</code>), and keywords."))
              .append($("<p>").html("<em>Usually, inserting the missing item will fix this error.</em>"));
          var explanationExtra =
            $("<div>")
              .append($("<p>").text("The program contains something extra"))
              .append($("<p>").html("Look carefully at the <span class='error-highlight'>highlighted text</span>.  Does it contains something extra?  A common source of errors is typing too much text or in the wrong order."))
              .append($("<p>").html("<em>Usually, removing the extra item will fix this error.</em>  However, you may have meant to keep this text, so think before you delete!"));
          var explanation =
            $("<div>")
              .append($("<p>").text("Typical reasons for getting this error are"))
              .append($("<ul>")
                .append($("<li>").append(explanationMissing))
                .append($("<li>").append(explanationExtra)));
          var dom = $("<div>").addClass("parse-error");
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          dom.append($("<p>").text("Pyret didn't understand your program around ").append(srcElem));
          dom.append(outputUI.expandableMore(explanation));
          singleHover(srcElem, loc);
          container.append(dom);
        }
        function drawParseErrorUnterminatedString(loc) {
          var dom = $("<div>").addClass("parse-error");
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          dom.append($("<p>").text("Pyret thinks your program has an incomplete string literal around ").append(srcElem).append("; you may be missing closing punctuation."));
          singleHover(srcElem, loc);
          container.append(dom);
        }

        function drawParseErrorEOF(loc) {
          var dom = $("<div>").addClass("parse-error");
          var srcElem = outputUI.drawSrcloc(editors, runtime, loc);
          dom.append($("<p>").text("Pyret didn't understand the very end of your program.  You may be missing an \"end\", or closing punctuation like \")\" or \"]\", right at the end."));
          singleHover(srcElem, loc);
          container.append(dom);
        }

        // NOTE(joe 8 Aug 2014): The underscore is a location that is
        // currently always a builtin location, because of how set-ref works
        function drawRefInit(isArg, _) {
          return function(annLoc, reason) {
            var probablyErrorLocation = getLastUserLocation(e, 0);
            var dom = $("<div>").addClass("compile-error");
            var loc = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
            var reasonDiv = $("<div>");
            dom.append([
              $("<p>").append([
                  "Failed while initializing a graph at ",
                  loc,
                  " because: "
                ]),
              reasonDiv,
              drawExpandableStackTrace(e)
            ]);
            singleHover(loc, probablyErrorLocation);
            var nestedFailure = ffi.contractFail(annLoc, reason);
            var nestedExn = runtime.makePyretFailException(nestedFailure);
            drawError(reasonDiv, editors, runtime, nestedExn)
            container.append(dom);
          }
        }
        function drawTypeMismatch(isArg, loc) {
          return function(val, name) {
            var probablyErrorLocation = getLastUserLocation(e, 0);
            var dom = $("<div>").addClass("compile-error");
            var valContainer = $("<div>");
            renderValueIn(val, valContainer);
            var annElem = outputUI.drawSrcloc(editors, runtime, loc);
            var typeName = $("<code>").text(name);
            singleHover(annElem, loc);
            dom.append($("<p>").append(
              ["Expected to get ",
              typeName,
              " because of the annotation at ",
              annElem,
              " but got"]))
              .append($("<br>"))
              .append(valContainer);
            if(probablyErrorLocation && isArg) {
              var srcloc = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
              dom.append($("<br>"))
                .append($("<p>").text(" called from around "))
                .append(srcloc);
              singleHover(srcloc, probablyErrorLocation);
            }
            dom.append(drawExpandableStackTrace(e));
            container.append(dom);
          };
        }

        function drawPredicateFailure(isArg, loc) {
          return function(val, predName) {
            var probablyErrorLocation = getLastUserLocation(e, 0);
            var dom = $("<div>").addClass("compile-error");
            var valContainer = $("<div>");
            renderValueIn(val, valContainer);
            var annElem = outputUI.drawSrcloc(editors, runtime, loc);
            var pred = $("<code>").text(predName);
            singleHover(annElem, loc);
            dom.append($("<p>").append(
              ["The predicate ",
              pred,
              " in the annotation at ",
              annElem,
              " returned false for this value:"]))
              .append($("<br>"))
              .append(valContainer);
            if(probablyErrorLocation && isArg) {
              var srcloc = outputUI.drawSrcloc(editors, runtime, probablyErrorLocation);
              dom.append($("<br>"))
                .append($("<p>").text(" called from around "))
                .append(srcloc);
              singleHover(srcloc, probablyErrorLocation);
            }
            dom.append(drawExpandableStackTrace(e));
            container.append(dom);
          };
        }

        function drawRecordFieldsFail(isArg, loc) {
          return function(val, fieldFailures) {
            var probablyErrorLocation = getLastUserLocation(e, 0);
            var dom = $("<div>").addClass("compile-error");
            var valContainer = $("<div>");
            renderValueIn(val, valContainer);
            var type = $("<a>").text("this annotation");
            singleHover(type, loc);
            dom.append($("<p>").append(["The record annotation at ", type, " failed on this value:"]))
              .append($("<br>"))
              .append(valContainer);
            var failuresArr = ffi.toArray(fieldFailures);

            container.append(dom);

          };
        }

        function drawDotAnnNotPresent(isArg, loc) {
          return function(name, field) {
            var dom = $("<div>").addClass("compile-error");
            var ann = $("<a>").text(" the annotation named " + field);
            singleHover(ann, loc);
            dom.append($("<p>").append(["Couldn't find ", ann, " in the annotations from ", $("<code>").text(name)]));
            container.append(dom);
          }
        }

        function drawPyretContractFailure(err) {
          var isArg = ffi.isFailArg(err);
          var loc = get(err, "loc");
          var reason = get(err, "reason");
          /*
          cases(get(contracts, "FailureReason"), "FailureReason", reason, {
              "type-mismatch": drawTypeMismatch(isArg, loc),
              "ref-init": drawRefInit(isArg, loc),
              "predicate-failure": drawPredicateFailure(isArg, loc),
              "record-fields-fail": drawRecordFieldsFail(isArg, loc),
              "dot-ann-not-present": drawDotAnnNotPresent(isArg, loc)
            });
          container.append($("<hr>"));
          */
          runtime.runThunk(
            function() { return get(err, "render-reason").app(); },
            function(errorDisp) {
              if (runtime.isSuccessResult(errorDisp)) {
                var dom = outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, e.pyretStack);
                dom.addClass("parse-error");
                container.append(dom);
                dom.append(drawExpandableStackTrace(e));
              } else {
                container.append($("<span>").addClass("compile-error")
                                 .text("An error occurred rendering the reason for this error; details logged to the console"));
                console.log(errorDisp.exn);
              }
            });
        }

        function drawPyretParseError() {
          /*
          cases(get(error, "ParseError"), "ParseError", e.exn, {
              "parse-error-next-token": drawParseErrorNextToken,
              "parse-error-eof": drawParseErrorEOF,
              "parse-error-unterminated-string": drawParseErrorUnterminatedString,
              "else": drawRuntimeErrorToString(e)
            });
          container.append($("<hr>"));
          */
          runtime.runThunk(
            function() { return get(e.exn, "render-reason").app(); },
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

    });
  }

  return {
    drawError: drawError
  }

});
