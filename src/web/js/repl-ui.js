({
  requires: [
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./check-ui"]
    },
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./output-ui"]
    },
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./error-ui"]
    },
    { "import-type": "builtin",
      name: "world-lib"
    },
    { "import-type": "builtin",
      name: "load-lib"
    }
  ],
  nativeRequires: [
    "pyret-base/js/runtime-util"
  ],
  provides: {},
  theModule: function(runtime, _, uri,
                      checkUI, outputUI, errorUI,
                      worldLib, loadLib,
                      util) {
    var ffi = runtime.ffi;

    var output = jQuery("<div id='output' class='cm-s-default'>");
    var outputPending = jQuery("<span>").text("Gathering results...");
    var outputPendingHidden = true;
    
    function merge(obj, extension) {
      var newobj = {};
      Object.keys(obj).forEach(function(k) {
        newobj[k] = obj[k];
      });
      Object.keys(extension).forEach(function(k) {
        newobj[k] = extension[k];
      });
      return newobj;
    }
    var animationDivs = [];
    function closeAnimationIfOpen() {
      animationDivs.forEach(function(animationDiv) {
        animationDiv.empty();
        animationDiv.dialog("destroy");
        animationDiv.remove();
      });
      animationDivs = [];
    }
    function closeTopAnimationIfOpen() {
      var animationDiv = animationDivs.pop();
      animationDiv.empty();
      animationDiv.dialog("destroy");
      animationDiv.remove();
    }

    var interactionsCount = 0;

    function formatCode(container, src) {
      CodeMirror.runMode(src, "pyret", container);
    }

    // NOTE(joe): sadly depends on the page and hard to figure out how to make
    // this less global
    function scroll(output) {
      $(".repl").animate({
           scrollTop: output.height(),
         },
         50
      );
    }

    function pyretizePatchLoc(patchLoc) {
      return runtime.makeSrcloc([patchLoc.source,
        patchLoc.startRow, patchLoc.startCol, patchLoc.startChar,
        patchLoc.endRow, patchLoc.endCol, patchLoc.endChar
      ])
    }
    
    // the result of applying `displayResult` is a function that MUST
    // NOT BE CALLED ON THE PYRET STACK.
    function displayResult(output, callingRuntime, resultRuntime, isMain) {
      var runtime = callingRuntime;
      var rr = resultRuntime;

      // MUST BE CALLED ON THE PYRET STACK
      function renderAndDisplayError(runtime, error, stack, click, result) {
        var error_to_html = errorUI.error_to_html;
        // `renderAndDisplayError` must be called on the pyret stack
        // because of this call to `pauseStack`
        return runtime.pauseStack(function (restarter) {
          // error_to_html must not be called on the pyret stack
          return error_to_html(runtime, CPO.documents, error, stack, result). 
            then(function (html) {
              html.on('click', function(){
                $(".highlights-active").removeClass("highlights-active");
                html.trigger('toggleHighlight');
                html.addClass("highlights-active");
              });
              html.addClass('compile-error').appendTo(output);
              if (click) html.click();
            }).done(function () {restarter.resume(runtime.nothing)});
        });
      }

      // this function must NOT be called on the pyret stack
      return function(result) {
        var doneDisplay = Q.defer();
        var didError = false;
        // Start a new pyret stack.
        // this returned function must not be called on the pyret stack
        // b/c `callingRuntime.runThunk` must not be called on the pyret stack
        callingRuntime.runThunk(function() {
          console.log("Full time including compile/load:", JSON.stringify(result.stats));
          if(callingRuntime.isFailureResult(result)) {
            //console.log('ds26gte was failure result', result);
            didError = true;
            var thisExn = undefined;
            // Parse Errors
            if (typeof(result.exn) === 'string') {
              //console.log('quite possibly a patch-parse-error');
              var patchExn = JSON.parse(result.exn);
              if (patchExn.type === 'patch-parse-error') {
                //console.log('dealing with a Patch parse error');
                var patchErrPkt = patchExn.errPkt;
                var patchErrMsg = "";
                var patchErrArgLocs = [];
                if (patchErrPkt) {
                  patchErrMsg = patchErrPkt.errMsg || "";
                  patchErrArgLocs = patchErrPkt.errArgLocs || [];
                }
                // get patchErrArgs & patchErrLocs from patchErrArgLocs
                var patchErrArgs = [];
                var patchErrLocs = [];
                var it;
                for (var i = 0; i < patchErrArgLocs.length; i++) {
                  it = patchErrArgLocs[i];
                  patchErrArgs.push(it[0]);
                  patchErrLocs.push(pyretizePatchLoc(it[1]));
                }
                var patchErrArgsList = ffi.makeList(patchErrArgs);
                var patchErrLocsList = ffi.makeList(patchErrLocs);
                //console.log('calling ffi.makePatchParseException');
                var thisPyretExn = ffi.makePatchParseException(patchErrMsg, patchErrArgsList,
                  patchErrLocsList);
                thisExn = thisPyretExn.exn;
                //console.log('thisExn = ', thisExn);
              } else {
                ;
                //console.log('stringy exception that isnt a Patch parse error!');
              }
            } else {
              thisExn = result.exn.exn;
            }
            //console.log('calling renderAndDisplayError I');
            // `renderAndDisplayError` must be called on the pyret stack
            // this application runs in the context of the above `callingRuntime.runThunk`
            return renderAndDisplayError(callingRuntime, thisExn, undefined, true, result);
          }
          else if(callingRuntime.isSuccessResult(result)) {
            result = result.result;
            return ffi.cases(ffi.isEither, "is-Either", result, {
              left: function(compileResultErrors) {
                closeAnimationIfOpen();
                didError = true;
                // Compile Errors
                var errors = ffi.toArray(compileResultErrors).
                  reduce(function (errors, error) {
                      Array.prototype.push.apply(errors,
                        ffi.toArray(runtime.getField(error, "problems")));
                      return errors;
                    }, []);
                // `safeCall` must be called on the pyret stack
                // this application runs in the context of the above `callingRuntime.runThunk`
                return callingRuntime.safeCall(
                  function() {
                    // eachLoop must be called in the context of the pyret stack
                    // this application runs in the context of the above `callingRuntime.runThunk`
                    return callingRuntime.eachLoop(runtime.makeFunction(function(i) {
                      // `renderAndDisplayError` must be called in the context of the
                      // pyret stack.
                      return renderAndDisplayError(callingRuntime, errors[i], [], true, result);
                    }), 0, errors.length);
                  }, function (result) { return result; }, "renderMultipleErrors");
              },
              right: function(v) {
                // TODO(joe): This is a place to consider which runtime level
                // to use if we have separate compile/run runtimes.  I think
                // that loadLib will be instantiated with callingRuntime, and
                // I think that's correct.
                return callingRuntime.pauseStack(function(restarter) {
                  rr.runThunk(function() {
                    var runResult = rr.getField(loadLib, "internal").getModuleResultResult(v);
                    console.log("Time to run compiled program:", JSON.stringify(runResult.stats));
                    if(rr.isSuccessResult(runResult)) {
                      return rr.safeCall(function() {
                        return checkUI.drawCheckResults(output, CPO.documents, rr, 
                                                        runtime.getField(runResult.result, "checks"), v);
                      }, function(_) {
                        outputPending.remove();
                        outputPendingHidden = true;
                        return true;
                      }, "rr.drawCheckResults");
                    } else {
                      didError = true;
                      // `renderAndDisplayError` must be called in the context of the pyret stack.
                      // this application runs in the context of the above `rr.runThunk`.
                      return renderAndDisplayError(resultRuntime, runResult.exn.exn,
                                                   runResult.exn.pyretStack, true, runResult);
                    }
                  }, function(_) {
                    restarter.resume(callingRuntime.nothing);
                  });
                });
              }
            });
          }
          else {
            doneDisplay.reject("Error displaying output");
            console.error("Bad result: ", result);
            didError = true;
            // `renderAndDisplayError` must be called in the context of the pyret stack.
            // this application runs in the context of `callingRuntime.runThunk`
            return renderAndDisplayError(
              callingRuntime, 
              ffi.InternalError("Got something other than a Pyret result when running the program.",
                                ffi.makeList(result)));
          }
        }, function(_) {
          if (didError) {
            var snippets = output.find(".CodeMirror");
            for (var i = 0; i < snippets.length; i++) {
              snippets[i].CodeMirror.refresh();
            }
          }
          doneDisplay.resolve("Done displaying output");
          return callingRuntime.nothing;
        });
      window.definitionsDone = !didError;
      return doneDisplay.promise;
      }
    }

    //: -> (code -> printing it on the repl)
    function makeRepl(container, repl, runtime, options) {

      var Jsworld = worldLib;
      var items = [];
      var pointer = -1;
      var current = "";
      function loadItem() {
        CM.setValue(items[pointer]);
      }
      function saveItem() {
        items.unshift(CM.getValue());
      }
      function prevItem() {
        if (pointer === -1) {
          current = CM.getValue();
        }
        if (pointer < items.length - 1) {
          pointer++;
          loadItem();
          CM.refresh();
        }
      }
      function nextItem() {
        if (pointer >= 1) {
          pointer--;
          loadItem();
          CM.refresh();
        } else if (pointer === 0) {
          CM.setValue(current);
          CM.refresh();
          pointer--;
        }
      }

      container.append(mkWarningUpper());
      container.append(mkWarningLower());

      var promptContainer = jQuery("<div class='prompt-container'>");
      var prompt = jQuery("<span>").addClass("repl-prompt");
      function showPrompt() {
        promptContainer.hide();
        promptContainer.fadeIn(100);
        CM.setValue("");
        CM.focus();
        CM.refresh();
      }
      promptContainer.append(prompt);

      container.on("click", function(e) {
        if($(CM.getTextArea()).parent().offset().top < e.pageY) {
          CM.focus();
        }
      });

      function maybeShowOutputPending() {
        outputPendingHidden = false;
        setTimeout(function() {
          if(!outputPendingHidden) {
            output.append(outputPending);
          }
        }, 200);
      }
      runtime.setStdout(function(str) {
          ct_log(str);
          output.append($("<pre>").addClass("replPrint").text(str));
        });
      var currentZIndex = 15000;
      runtime.setParam("current-animation-port", function(dom, title, closeCallback) {
          var animationDiv = $("<div>").css({"z-index": currentZIndex + 1});
          animationDivs.push(animationDiv);
          output.append(animationDiv);
          function onClose() {
            Jsworld.shutdownSingle({ cleanShutdown: true });
            closeTopAnimationIfOpen();
          }
          closeCallback(closeTopAnimationIfOpen);
          animationDiv.dialog({
            title: title,
            position: ["left", "top"],
            bgiframe : true,
            modal : true,
            overlay : { opacity: 0.5, background: 'black'},
            //buttons : { "Save" : closeDialog },
            width : "auto",
            height : "auto",
            close : onClose,
            closeOnEscape : true
          });
          animationDiv.append(dom);
          var dialogMain = animationDiv.parent();
        /*
          dialogMain.on('keydown', function(e) {
            if ($(document.activeElement).is('button') &&
                e.keyCode === 32) {
              e.preventDefault();
            }
          });
          */
          dialogMain.css({"z-index": currentZIndex + 1});
          dialogMain.prev().css({"z-index": currentZIndex});
          currentZIndex += 2;
        });

      runtime.setParam("d3-port", function(dom, optionMutator, onExit, buttons) {
          // duplicate the code for now
          var animationDiv = $("<div>");
          animationDivs.push(animationDiv);
          output.append(animationDiv);
          function onClose() {
            onExit();
            closeTopAnimationIfOpen();
          }
          var baseOption = {
            position: [5, 5],
            bgiframe : true,
            modal : true,
            overlay : {opacity: 0.5, background: 'black'},
            width : 'auto',
            height : 'auto',
            close : onClose,
            closeOnEscape : true,
            create: function() {

              // from http://fiddle.jshell.net/JLSrR/116/

              var titlebar = animationDiv.prev();
              buttons.forEach(function(buttonData) {
                var button = $('<button/>'),
                    left = titlebar.find( "[role='button']:last" ).css('left');
                button.button({icons: {primary: buttonData.icon}, text: false})
                       .addClass('ui-dialog-titlebar-close')
                       .css('left', (parseInt(left) + 27) + 'px')
                       .click(buttonData.click)
                       .appendTo(titlebar);
              });
            }
          }
          animationDiv.dialog(optionMutator(baseOption)).dialog("widget").draggable({
            containment: "none",
            scroll: false,
          });
          animationDiv.append(dom);
          var dialogMain = animationDiv.parent();
          dialogMain.css({"z-index": currentZIndex + 1});
          dialogMain.prev().css({"z-index": currentZIndex});
          currentZIndex += 2;
          return animationDiv;
      });
      runtime.setParam("remove-d3-port", function() {
          closeTopAnimationIfOpen();
          // don't call .dialog('close'); because that would trigger onClose and thus onExit.
          // We don't want that to happen.
      });

      var breakButton = options.breakButton;
      container.append(output).append(promptContainer);

      var img = $("<img>").attr({
        "src": (cpoDialect === 'patch'? '/img/patch-treadmill-run.gif': "/img/pyret-spin.gif"),
        "width": (cpoDialect === 'patch'? '18px': "25px"),
      }).css({
        "vertical-align": "middle"
      });
      var runContents;
      function afterRun(cm) {
        return function() {
          outputPending.remove();
          outputPendingHidden = true;
          options.runButton.empty();
          options.runButton.append(runContents);
          options.runButton.attr("disabled", false);
          breakButton.attr("disabled", true);
          if(cm) {
            cm.setValue("");
            cm.setOption("readonly", false);
          }
          //output.get(0).scrollTop = output.get(0).scrollHeight;
          showPrompt();
          setTimeout(function(){
            $("#output > .compile-error .cm-future-snippet").each(function(){this.cmrefresh();});
          }, 200);
        }
      }
      function setWhileRunning() {
        runContents = options.runButton.contents();
        options.runButton.empty();
        var text = $("<span>").text("Running...");
        text.css({
          "vertical-align": "middle"
        });
        options.runButton.append([img, text]);
        options.runButton.attr("disabled", true);
      }

      // SETUP FOR TRACING ALL OUTPUTS
      var replOutputCount = 0;
      outputUI.installRenderers(repl.runtime);
      repl.runtime.setParam("onTrace", function(loc, val, url) {
        if (repl.runtime.getParam("currentMainURL") !== url) { return { "onTrace": "didn't match" }; }
        if (repl.runtime.isNothing(val)) { return { "onTrace": "was nothing" }; }
        return repl.runtime.pauseStack(function(restarter) {
          repl.runtime.runThunk(function() {
            return repl.runtime.toReprJS(val, repl.runtime.ReprMethods["$cpo"]);
          }, function(container) {
            if (repl.runtime.isSuccessResult(container)) {
              $(output)
                .append($("<div>").addClass("trace")
                        .append($("<span>").addClass("trace").text("Trace #" + (++replOutputCount)))
                        .append(container.result));
              scroll(output);
            } else {
              $(output).append($("<div>").addClass("error trace")
                               .append($("<span>").addClass("trace").text("Trace #" + (++replOutputCount)))
                               .append($("<span>").text("<error displaying value: details logged to console>")));
              console.log(container.exn);
              scroll(output);
            }
            restarter.resume(val);
          });
        });
      });

      repl.runtime.setParam("onSpy", function(loc, message, locs, names, vals) {
        return repl.runtime.safeCall(function() {
          /*
          var toBeRepred = [];
          for (var i = 0; i < names.length; i++)
            toBeRepred.push({name: names[i], val: vals[i]});
          toBeRepred.push({name: "Message", val: message, method: repl.runtime.ReprMethods._tostring});
          */
          // Push this afterward, to keep rendered aligned with renderedLocs below
          vals = [message].concat(vals);
          return repl.runtime.safeCall(function() {
            return repl.runtime.toReprJS(message, repl.runtime.ReprMethods._tostring);
          }, function(message) {
            return repl.runtime.safeCall(function() {
              return repl.runtime.raw_array_map(repl.runtime.makeFunction(function(val) {
                 return repl.runtime.toReprJS(val, repl.runtime.ReprMethods["$cpo"]);
              }, "spy-to-repr"), vals);
            }, function(rendered) {
              return {
                message: message,
                rendered: rendered
              }
            }, "CPO-onSpy-render-values");
          }, "CPO-onSpy-render-message");
        }, function(spyInfo) {
          var message = spyInfo.message;
          var rendered = spyInfo.rendered
          // Note: renderedLocs is one element shorter than rendered
          var renderedLocs = locs.map(repl.runtime.makeSrcloc);
          var spyBlock = $("<div>").addClass("spy-block");
          spyBlock.append($("<img>").addClass("spyglass").attr("src", "/img/spyglass.gif"));
          if (message !== "") {
            spyBlock.append($("<div>").addClass("spy-title").append(message));
          }

          var table = $("<table>");
          table
            .append($("<th>")
                    .append($("<tr>")
                            .append($("<td>").text("Name"))
                            .append($("<td>").text("Value"))));
          spyBlock.append(table);
          var palette = outputUI.makePalette();
          function color(i) {
            return outputUI.hueToRGB(palette(i));
          }
          for (let i = 0; i < names.length; i++) {
            let row = $("<tr>");
            table.append(row);
            let name = $("<a>").text(names[i]).addClass("highlight");
            name.attr("title", "Click to scroll source location into view");
            if (locs[i].length === 7) {
              var pos = outputUI.Position.fromSrcArray(locs[i], CPO.documents, {});
              name.hover((function(pos) {
                  return function() {
                    pos.hint();
                    pos.blink(color(i));
                  }
                })(pos),
                (function(pos) {
                  return function() {
                    outputUI.unhintLoc();
                    pos.blink(undefined);
                  };
                })(pos));
              name.on("click", (function(pos) {
                return function() { pos.goto(); };
              })(pos));
              // TODO: this is ugly code, copied from output-ui because
              // getting the right srcloc library is hard
              let cmLoc = {
                source: locs[i][0],
                start: {line: locs[i][1] - 1, ch: locs[i][3]},
                end: {line: locs[i][4] - 1, ch: locs[i][6]}
              };
              /*
              name.on("click", function() {
                outputUI.emphasizeLine(CPO.documents, cmLoc);
                CPO.documents[cmLoc.source].scrollIntoView(cmLoc.start, 100);
              });
              */
            }
            row.append($("<td>").append(name).append(":"));
            row.append($("<td>").append(rendered[i]));
          }
          $(output).append(spyBlock);
          return repl.runtime.nothing;
        }, "CPO-onSpy");
      });

      var runMainCode = function(src, uiOptions) {
        breakButton.attr("disabled", false);
        output.empty();
        promptContainer.hide();
        lastEditorRun = uiOptions.cm || null;
        setWhileRunning();

        CPO.documents.forEach(function(doc, name) {
          if (name.indexOf("interactions://") === 0)
            CPO.documents.delete(name);
        });

        CPO.documents.set("definitions://", uiOptions.cm.getDoc());

        interactionsCount = 0;
        replOutputCount = 0;
        logger.log('run', { name      : "definitions://",
                            type_check: !!uiOptions["type-check"]
                          });
        var options = {
          typeCheck: !!uiOptions["type-check"],
          checkAll: false // NOTE(joe): this is a good spot to fetch something from the ui options
                          // if this becomes a check box somewhere in CPO
        };
        var replResult = repl.restartInteractions(src, options);
        var startRendering = replResult.then(function(r) {
          maybeShowOutputPending();
          return r;
        });
        var doneRendering = startRendering.then(displayResult(output, runtime, repl.runtime, true)).fail(function(err) {
          console.error("Error displaying result: ", err);
        });
        doneRendering.fin(afterRun(false));
      };

      var runner = function(code) {
        items.unshift(code);
        pointer = -1;
        var echoContainer = $("<div class='echo-container'>");
        var echoSpan = $("<span>").addClass("repl-echo");
        var echo = $("<textarea>");
        echoSpan.append(echo);
        echoContainer.append(echoSpan);
        write(echoContainer);
        var echoCM = CodeMirror.fromTextArea(echo[0], { readOnly: true });
        echoCM.setValue(code);
        breakButton.attr("disabled", false);
        CM.setValue("");
        promptContainer.hide();
        setWhileRunning();
        interactionsCount++;
        var thisName = 'interactions://' + interactionsCount;
        CPO.documents.set(thisName, echoCM.getDoc());
        logger.log('run', { name: thisName });
        var replResult = repl.run(code, thisName, interactionsCount);
//        replResult.then(afterRun(CM));
        var startRendering = replResult.then(function(r) {
          maybeShowOutputPending();
          return r;
        });
        var doneRendering = startRendering.then(displayResult(output, runtime, repl.runtime, false)).fail(function(err) {
          console.error("Error displaying result: ", err);
        });
        doneRendering.fin(afterRun(CM));
      };

      var CM = CPO.makeEditor(prompt, {
        simpleEditor: true,
        run: runner,
        initial: "",
        cmOptions: {
          extraKeys: {
            'Enter': function(cm) { runner(cm.getValue(), {cm: cm}); },
            'Shift-Enter': "newlineAndIndent",
            'Up': prevItem,
            'Down': nextItem,
            'Ctrl-Up': "goLineUp",
            'Ctrl-Alt-Up': "goLineUp",
            'Ctrl-Down': "goLineDown",
            'Ctrl-Alt-Down': "goLineDown"
          }
        }
      }).cm;

      CPO.documents.set('definitions://', CM.getDoc());

      var lastNameRun = 'interactions';
      var lastEditorRun = null;

      var write = function(dom) {
        output.append(dom);
      };

      var onBreak = function() {
        breakButton.attr("disabled", true);
        repl.stop();
        closeAnimationIfOpen();
        Jsworld.shutdown({ cleanShutdown: true });
        showPrompt();
      };

      breakButton.attr("disabled", true);
      breakButton.click(onBreak);

      return {
        runCode: runMainCode,
        focus: function() { CM.focus(); }
      };
    }

    return runtime.makeJSModuleReturn({
      makeRepl: makeRepl,
      makeEditor: CPO.makeEditor
    });

  }
})
