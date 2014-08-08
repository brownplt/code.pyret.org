define(["js/ffi-helpers", "trove/srcloc", "trove/error", "trove/contracts", "compiler/compile-structs.arr", "trove/image-lib", "./output-ui.js"], function(ffiLib, srclocLib, errorLib, contractsLib, csLib, imageLib, outputUI) {

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
      // - an Array of compileErrors,
      // - a PyretException with a stack and a Pyret value error
      // - something internal and JavaScripty, which we don't want
      //   users to see but will have a hard time ruling out

      if(exception instanceof Array) {
        drawCompileErrors(exception);
      } else if(runtime.isPyretException(exception)) {
        drawPyretException(exception);
      } else {
        drawUnknownException(exception);
      }

      function drawSrcloc(s) {
        return s ? $("<a>").addClass("srcloc").text(get(s, "format").app(true)) : $("<span>");
      }

      function singleHover(dom, loc) {
        outputUI.hoverLink(editors, runtime, srcloc, dom, loc, "error-highlight");
      }
      
      function errorHover(dom, locs) {
        outputUI.hoverLocs(editors, runtime, srcloc, dom, locs, "error-highlight");
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
              var p = $("<p>");
              p.append("The name ");
              p.append($("<span>").addClass("code").text(name));
              p.append(" is used but not defined at ");
              dom.append(p);
              dom.append(drawSrcloc(loc));
              singleHover(dom, loc);
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
              var p = $("<p>");
              p.append("The name ");
              p.append($("<span>").addClass("code").text(name));
              p.append(" is used as a type but not defined as one, at ");
              dom.append(p);
              dom.append(drawSrcloc(loc));
              singleHover(dom, loc);
              container.append(dom);
            }
          });
        }
        function drawShadowId(id, newLoc, oldLoc) {
          var dom = $("<div>").addClass("compile-error");
          cases(get(srcloc, "Srcloc"), "Srcloc", oldLoc, {
            "builtin": function(_) {
              var p = $("<p>");
              p.append("The name ");
              p.append($("<span>").addClass("code").text(id));
              p.append(" is already defined.  You need to pick a different name for ");
              p.append($("<span>").addClass("code").text(id));
              p.append(" at ");
              p.append(drawSrcloc(newLoc));
              dom.append(p);
              singleHover(dom, newLoc);
              container.append(dom);
            },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var p = $("<p>");
              p.append("It looks like you defined the name ");
              p.append($("<span>").addClass("code").text(id));
              p.append(" twice, at ");
              var loc1 = drawSrcloc(oldLoc);
              var loc2 = drawSrcloc(newLoc);
              var p2 = $("<p>");
              p2.text("You need to pick a new name for one of them");
              dom.append(p).append("<br>").append(loc1).append("<br>").append(loc2).append("<br>").append(p2);
              singleHover(loc1, oldLoc);
              singleHover(loc2, newLoc);
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
              var p = $("<p>");
              p.append("Defining an anonymous variable is pointless: you have no name to modify. ");
              p.append("Either give this expression a name, or bind it to an identifier rather than a variable.");
              dom.append(p).append("<br>");
              dom.append(drawSrcloc(loc));
              singleHover(dom, loc);
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
              var p = $("<p>");
              p.append("Anonymous identifiers cannot shadow anything: there is no name to shadow. ");
              p.append("Either give this expression a name, or remove the shadow annotation.");
              dom.append(p).append("<br>");
              dom.append(drawSrcloc(loc));
              singleHover(dom, loc);
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
              var p = $("<p>");
              p.append("Anonymous bindings in graphs are not permitted, as they cannot be used elsewhere in the graph.");
              dom.append(p).append("<br>");
              dom.append(drawSrcloc(loc));
              singleHover(dom, loc);
              container.append(dom);
            }
          });
        }

        function drawWfError(msg, loc) {
          var dom = $("<div>").addClass("compile-error");
          dom.append("<p>").text(msg);
          dom.append("<br>");
          dom.append(drawSrcloc(loc));
          errorHover(dom, [loc]);
          container.append(dom);
        }

        function drawWfErrSplit(msg, locs) {
          var dom = $("<div>").addClass("compile-error");
          dom.append("<p>").text(msg);
          dom.append("<br>")
          var locArray = ffi.toArray(locs)
          locArray.forEach(function(l) {
            dom.append(drawSrcloc(l)).append("<br>");
          });
          errorHover(dom, locArray);
          container.append(dom);
        }

        function drawErrorToString(e) {
          return function() {
            runtime.safeCall(function() {
              return get(e, "tostring").app()
            }, function(s) {
              container.append($("<div>").addClass("compile-error").text(s));
            });
          };
        }


        function drawCompileError(e) {
          cases(get(cs, "CompileError"), "CompileError", e, {
              "unbound-id": drawUnboundId,
              "unbound-type-id": drawUnboundTypeId,
              "shadow-id": drawShadowId,
              "duplicate-id": drawShadowId, // NOTE(joe): intentional re-use, not copypasta
              "duplicate-field": drawShadowId, // NOTE(ben): ditto
              "pointless-var": drawPointlessVar,
              "pointless-shadow": drawPointlessShadow,
              "pointless-graph-id": drawPointlessGraphId,
              "wf-err": drawWfError,
              "wf-err-split": drawWfErrSplit,
              "else": drawErrorToString(e)
            });
        }
        e.forEach(drawCompileError);
      }

      function getDomValue(v, f) {
        if(runtime.isOpaque(v) && image.isImage(v.val)) {
          f(v.val.toDomNode());
        } else {
          runtime.safeCall(function() {
            return runtime.toReprJS(v, "_torepr")
          }, function(str) {
            f($("<div>").text(str));
          });
        }
      }

      function drawPyretException(e) {
        function drawRuntimeErrorToString(e) {
          return function() {
            container.append($("<div>").text(String(e)));
          }
        }
        function drawExpandableStackTrace(e) {
          var srclocStack = e.pyretStack.map(runtime.makeSrcloc);
          var isSrcloc = function(s) { return runtime.unwrap(get(srcloc, "is-srcloc").app(s)); }
          var userLocs = srclocStack.filter(function(l) { return l && isSrcloc(l); });
          var container = $("<div>");
          if(userLocs.length > 0) {
            container.append($("<p>").text("Stack trace:"));
            userLocs.forEach(function(ul) {
              var slContainer = $("<div>");
              var srcloc = drawSrcloc(ul);
              slContainer.append(srcloc);
              singleHover(srcloc, ul);
              container.append(slContainer);
            });
            return expandableMore(container);
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
            return (source === "definitions" || source.indexOf("interactions") !== -1);
          });

          var probablyErrorLocation = userLocs[ix];
          return probablyErrorLocation;
        }
        function drawGenericTypeMismatch(value, type) {
          // TODO(joe): How to improve this search?
          var probablyErrorLocation = getLastUserLocation(e, 0);
          var dom = $("<div>").addClass("compile-error");
          getDomValue(value, function(valDom) {
            dom.append($("<p>").text("Expected to get a " + type + " as an argument, but got this instead: "))
              .append($("<br>"))
              .append(valDom)
              .append($("<br>"))
              .append($("<p>").text("at "))
              .append($("<br>"))
              .append(drawSrcloc(probablyErrorLocation));
            $(valDom).trigger({type: 'afterAttach'});
            $('*', valDom).trigger({type : 'afterAttach'});
            container.append(dom);
            errorHover(dom, [probablyErrorLocation]);
          });
        }
        function drawArityMismatch(funLoc, arity, args) {
          args = ffi.toArray(args);
          var probablyErrorLocation = getLastUserLocation(e, 1);
          var dom = $("<div>").addClass("compile-error");
          var argDom = $("<div>");
          setTimeout(function() {
            args.forEach(function(a) {
              outputUI.renderPyretValue(argDom, runtime, a);
            });
          }, 0);
          cases(get(srcloc, "Srcloc"), "Srcloc", funLoc, {
            "srcloc": function(/* skip args */) {
              var caller = drawSrcloc(probablyErrorLocation);
              var callee = drawSrcloc(funLoc);
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
              var caller = drawSrcloc(probablyErrorLocation);
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
          if(probablyErrorLocation !== undefined) {
            dom.append($("<p>").text(message + " At:"))
              .append($("<br>"))
              .append(drawSrcloc(probablyErrorLocation));
            errorHover(dom, [probablyErrorLocation]);
          } else {
            dom.append($("<p>").text(message));
          }
          container.append(dom);
        }
        function drawNoBranchesMatched(loc, type) {
          var dom = $("<div>").addClass("compile-error");
          var expression = $("<a>").text("this " + type + " expression");
          dom.append($("<p>").append(["No case matched in ", expression]));
          dom.append(drawExpandableStackTrace(e));
          errorHover(expression, [loc]);
          container.append(dom);
        }
        function drawNonBooleanCondition(loc, type, value) {
          getDomValue(value, function(v) {
            var dom = $("<div>").addClass("compile-error");
            dom.append($("<p>").text("Expected true or false for the test in an " + type + " expression, but got:"));
            dom.append($("<br>"));
            dom.append(v);
            $(v).trigger({type: 'afterAttach'});
            $('*', v).trigger({type : 'afterAttach'});
            dom.append(drawSrcloc(loc));
            errorHover(dom, [loc]);
            container.append(dom);
          });
        }
        function drawNonBooleanOp(loc, position, type, value) {
          getDomValue(value, function(v) {
            var dom = $("<div>").addClass("compile-error");
            dom.append($("<p>").text("Expected true or false for the " + position + " argument in " + type + " expression, but got:"));
            dom.append($("<br>"));
            dom.append(v);
            $(v).trigger({type: 'afterAttach'});
            $('*', v).trigger({type : 'afterAttach'});
            dom.append($("<br>"));
            dom.append(drawSrcloc(loc));
            errorHover(dom, [loc]);
            container.append(dom);
          });
        }
        function drawNonFunctionApp(loc, nonFunVal) {
          getDomValue(nonFunVal, function(v) {
            var dom = $("<div>").addClass("compile-error");
            dom.append($("<p>").text("Expected a function in application but got:"));
            dom.append($("<br>"));
            dom.append(v);
            $(v).trigger({type: 'afterAttach'});
            $('*', v).trigger({type : 'afterAttach'});
            dom.append($("<br>"));
            dom.append(drawSrcloc(loc));
            errorHover(dom, [loc]);
            container.append(dom);
          });
        }
        function drawUserBreak() {
          container.append($("<div>").addClass("compile-error").text("Program stopped by user"));
        }
        function drawFieldNotFound(loc, obj, field) {
          var dom = $("<div>").addClass("compile-error");
          var expression = $("<a>").text("this lookup expression");
          dom.append($("<p>").append(["Field ", $("<code>").text(field), " not found in ", expression]));
          dom.append($("<p>").text("The object was:"));
          var valueContainer = $("<div>");
          dom.append(valueContainer);
          setTimeout(function() {
            outputUI.renderPyretValue(valueContainer, runtime, obj);
          }, 0);
          dom.append(drawExpandableStackTrace(e));
          errorHover(expression, [loc]);
          container.append(dom);
        }
        function drawLookupNonObject(loc, nonObj, field) {
          var dom = $("<div>").addClass("compile-error");
          var expression = $("<a>").text("this lookup expression");
          dom.append($("<p>").append(["Tried to look up field ", $("<code>").text(field), " on a non-object in ", expression]));
          dom.append($("<p>").text("The non-object was:"));
          var valueContainer = $("<div>");
          dom.append(valueContainer);
          setTimeout(function() {
            outputUI.renderPyretValue(valueContainer, runtime, nonObj);
          }, 0);
          dom.append(drawExpandableStackTrace(e));
          errorHover(expression, [loc]);
          container.append(dom);
        }
        function drawExtendNonObject(loc, nonObj) {
          var dom = $("<div>").addClass("compile-error");
          var expression = $("<a>").text("this expression");
          dom.append($("<p>").append(["Tried to extend a non-object in ", expression]));
          dom.append($("<p>").text("The non-object was:"));
          var valueContainer = $("<div>");
          dom.append(valueContainer);
          setTimeout(function() {
            outputUI.renderPyretValue(valueContainer, runtime, nonObj);
          }, 0);
          dom.append(drawExpandableStackTrace(e));
          errorHover(expression, [loc]);
          container.append(dom);
        }
        function drawInvalidArrayIndex(methodName, array, index, reason) {
          var dom = $("<div>").addClass("compile-error");
          var probablyErrorLocation = getLastUserLocation(e, 0);
          var expression = $("<a>").text(" this function call ");
          dom.append($("<p>").append(["Invalid array index ", $("<code>").text(index), " around ", expression, "because: " + reason]));
          dom.append(drawExpandableStackTrace(e));
          errorHover(expression, [probablyErrorLocation]);
          container.append(dom);
        }
        function drawModuleLoadFailure(names) {
          var arr = runtime.ffi.toArray(names);
          var dom = $("<div>").addClass("compile-error");
          dom.append($("<p>").append(["The module(s) "], $("<code>").text(arr.join(", ")), [" failed to load"]));
          container.append(dom);
        }

        function drawPlusError(val1, val2) {
          var dom = $("<div>").addClass("compile-error");
          var val1C = $("<div>");
          var val2C = $("<div>");
          dom.append([$("<p>").append(["Invalid use of ", $("<code>").text("+"), " for these values: "]),
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
          dom.append([$("<p>").append(["Invalid use of ", $("<code>").text(opname), " for these values: "]),
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
          cases(get(error, "RuntimeError"), "RuntimeError", e.exn, {
              "message-exception": drawMessageException,
              "no-branches-matched": drawNoBranchesMatched,
              "field-not-found": drawFieldNotFound,
              "lookup-non-object": drawLookupNonObject,
              "extend-non-object": drawExtendNonObject,
              "generic-type-mismatch": drawGenericTypeMismatch,
              "arity-mismatch": drawArityMismatch,
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
        }

        function expandableMore(dom) {
          var container = $("<div>");
          container.append(dom);
          var moreLink = $("<a>").text("(More...)");
          var lessLink = $("<a>").text("(Less...)");
          function toggle() {
            dom.toggle();
            lessLink.toggle();
            moreLink.toggle();
          }
          moreLink.on("click", toggle);
          lessLink.on("click", toggle);
          container.append(moreLink).append(lessLink).append(dom);
          dom.hide();
          lessLink.hide();
          return container;
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
          dom.append($("<p>").text("Pyret didn't understand your program around ").append(drawSrcloc(loc)));
          dom.append(expandableMore(explanation));
          errorHover(dom, [loc]);
          container.append(dom);
        }

        // NOTE(joe 8 Aug 2014): The underscore is a location that is
        // currently always a builtin location, because of how set-ref works
        function drawRefInit(isArg, _) {
          return function(annLoc, reason) {
            var probablyErrorLocation = getLastUserLocation(e, 0);
            var dom = $("<div>").addClass("compile-error");
            var loc = drawSrcloc(probablyErrorLocation);
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
            var type = $("<a>").append($("<code>").text("this annotation"));
            var typeName = $("<code>").text(name);
            singleHover(type, loc);
            dom.append($("<p>").append(["Expected to get ", typeName, " because of ", type, " but got"]))
              .append($("<br>"))
              .append(valContainer);
            if(probablyErrorLocation && isArg) {
              var srcloc = drawSrcloc(probablyErrorLocation);
              dom.append($("<br>"))
                .append($("<p>").text(" called from around "))
                .append(srcloc);
              errorHover(srcloc, [probablyErrorLocation]);
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
            var type = $("<a>").text("this annotation");
            var pred = $("<code>").text(predName);
            errorHover(type, [loc]);
            dom.append($("<p>").append(["The predicate ", pred, " in ", type, " returned false for this value:"]))
              .append($("<br>"))
              .append(valContainer);
            if(probablyErrorLocation && isArg) {
              var srcloc = drawSrcloc(probablyErrorLocation);
              dom.append($("<br>"))
                .append($("<p>").text(" called from around "))
                .append(srcloc);
              errorHover(srcloc, [probablyErrorLocation]);
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
            errorHover(type, [loc]);
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
            errorHover(ann, [loc]);
            dom.append($("<p>").append(["Couldn't find ", ann, " in the annotations from ", $("<code>").text(name)]));
            container.append(dom);
          }
        }

        function drawPyretContractFailure(err) {
          var isArg = ffi.isFailArg(err);
          var loc = get(err, "loc");
          var reason = get(err, "reason");
          cases(get(contracts, "FailureReason"), "FailureReason", reason, {
              "type-mismatch": drawTypeMismatch(isArg, loc),
              "ref-init": drawRefInit(isArg, loc),
              "predicate-failure": drawPredicateFailure(isArg, loc),
              "record-fields-fail": drawRecordFieldsFail(isArg, loc),
              "dot-ann-not-present": drawDotAnnNotPresent(isArg, loc)
            });
        }

        function drawPyretParseError() {
          cases(get(error, "ParseError"), "ParseError", e.exn, {
              "parse-error-next-token": drawParseErrorNextToken,
              "else": drawRuntimeErrorToString(e)
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
          drawRuntimeErrorToString(e);
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

