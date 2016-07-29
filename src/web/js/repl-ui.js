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
    var editors = {};
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

    var makeErrorContext = (function () {
      var counter = 0;
      var makeNew = function () {
        makeNew.current = "eg-" + counter++
        return makeNew.current;
      }
      return makeNew;
    })();

    function displayResult(output, callingRuntime, resultRuntime, isMain) {
      var runtime = callingRuntime;
      var rr = resultRuntime;
      return function(result) {
        var doneDisplay = Q.defer();
        callingRuntime.runThunk(function() {
          console.log("Full time including compile/load:", JSON.stringify(result.stats));
          if(callingRuntime.isFailureResult(result)) {
            return errorUI.drawError(output, editors, callingRuntime, result.exn, makeErrorContext);
          }
          else if(callingRuntime.isSuccessResult(result)) {
            result = result.result;
            ffi.cases(ffi.isEither, "is-Either", result, {
              left: function(compileResultErrors) {
                closeAnimationIfOpen();
                var errs = [];
                var results = ffi.toArray(compileResultErrors);
                results.forEach(function(r) {
                  errs = errs.concat(ffi.toArray(runtime.getField(r, "problems")));
                });
                return errorUI.drawError(output, editors, runtime, {exn: errs}, makeErrorContext);
              },
              right: function(v) {
                // TODO(joe): This is a place to consider which runtime level
                // to use if we have separate compile/run runtimes.  I think
                // that loadLib will be instantiated with callingRuntime, and
                // I think that's correct.
                callingRuntime.pauseStack(function(restarter) {
                  rr.runThunk(function() {
                    var runResult = rr.getField(loadLib, "internal").getModuleResultResult(v);
                    console.log("Time to run compiled program:", JSON.stringify(runResult.stats));
                    if(rr.isSuccessResult(runResult)) {
                      return rr.safeCall(function() {
                        return checkUI.drawCheckResults(output, editors, rr, 
                                                        runtime.getField(runResult.result, "checks"), 
                                                        makeErrorContext);
                      }, function(_) {
                        outputPending.remove();
                        outputPendingHidden = true;
                        return true;
                      }, "rr.drawCheckResults");
                    } else {
                      return errorUI.drawError(output, editors, rr, runResult.exn, makeErrorContext);
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
            return errorUI.drawError(output, editors, callingRuntime, ffi.makeMessageException("Got something other than a Pyret result when running the program: " + String(result)), makeErrorContext);
          }
        }, function(_) {
          doneDisplay.resolve("Done displaying output");
          return callingRuntime.nothing;
        });
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

      var promptContainer = jQuery("<div class='prompt-container'>");
      var promptArrow = drawPromptArrow();
      var prompt = jQuery("<span>").addClass("repl-prompt");
      function showPrompt() {
        promptContainer.hide();
        promptContainer.fadeIn(100);
        CM.setValue("");
        CM.focus();
        CM.refresh();
      }
      promptContainer.append(promptArrow).append(prompt);

      container.on("click", function(e) {
        if($(CM.getTextArea()).parent().offset().top < e.pageY) {
          CM.focus();
        }
      });

      var output = jQuery("<div id='output' class='cm-s-default'>");
      var outputPending = jQuery("<span>").text("Gathering results...");
      var outputPendingHidden = true;
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
    runtime.setParam("current-animation-port", function(dom, closeCallback) {
        var animationDiv = $("<div>").css({"z-index": currentZIndex + 1});
        animationDivs.push(animationDiv);
          output.append(animationDiv);
          function onClose() {
          Jsworld.shutdownSingle({ cleanShutdown: true });
          closeTopAnimationIfOpen();
          }
        closeCallback(closeTopAnimationIfOpen);
          animationDiv.dialog({
            title: 'big-bang',
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
        dialogMain.css({"z-index": currentZIndex + 1});
        dialogMain.prev().css({"z-index": currentZIndex});
        currentZIndex += 2;
        });

      var breakButton = options.breakButton;
      container.append(output).append(promptContainer);

      var img = $("<img>").attr({
        "src": "/img/pyret-spin.gif",
        "width": "25px",
      }).css({
        "vertical-align": "middle"
      });
      var runContents;

        function classify(queue) {
            /**
             * Classify a queue of webgazer data with a given behavior.
             */
            if (queue.length == 0)
                return "empty list of observations";

            var leftAndRightArray = queue.map((x) => {
                if (x.xpos < x.barpos)
                    return -1;
                else if (x.xpos > x.barpos)
                    return 1;
                else
                    return 0;
            });
            var sum = leftAndRightArray.reduce((a, b) => a + b, 0);
            var normalizedSum = sum / leftAndRightArray.length;
            const normalDisLimit = 0.43; // point such that [x,x] is one third of the area of std. dist.

            var classifyFunction = function(x, left, middle, right) {
                if (x <= -normalDisLimit)
                    return left;
                else if (x < normalDisLimit)
                    return middle;
                else
                    return right;
            };

            var eyeLocation = classifyFunction(normalizedSum, "editor", "middle", "repl");

            // now find out if they went back and forth quickly
            // can use slice(1) and then index form of map
            var changingHalfArray = leftAndRightArray.slice(1).map((x, index, arr) => {
                if (x == arr[index - 1])
                    return 0;
                else
                    return 1;
            });
            var changeHalfSum = changingHalfArray.reduce((a, b) => a + b, 0);
            var normalizedHalfSum = changeHalfSum / (queue.length - 1) - (1 - 0) / 2;
            var changeHalfFrequency = classifyFunction(normalizedHalfSum, "not often",
                                                   "somewhat frequently", "often");
            return "looking " + eyeLocation + ", switching " + changeHalfFrequency;
        }
        var setGazeListenerFunction = false;
        var eventQueue = [];
        var testNum = 0;
        const testPrefix = "test";

        var outputTest = (cm, change) => {
            // only output things once. and stop webgazer.
            cm.off("change", outputTest);
            if (eventQueue.length > 0) {
                console.log("change, so outputting list of size " + eventQueue.length);
                // store eventQueue to localforage
                var otherQueue = eventQueue.slice(0);
                // classify eventQueue
                var interactionClass = classify(otherQueue);

                localforage.setItem(testPrefix + testNum, [interactionClass, otherQueue], function(err, value) {
                    console.log("classified that interaction as " + interactionClass);
                })
            }
            // fine to do even if webgazer off, ie, eventQueue is empty
            // but feels more robust in case wierd inconsistency of eventQueue
            webgazer.pause();
        }

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
            cm.getDoc().eachLine(function (line) {
              cm.removeLineClass(line, 'background', 'cptteach-fixed');
            });
          }
          //output.get(0).scrollTop = output.get(0).scrollHeight;
          showPrompt();
          setTimeout(function(){
            $("#output > .compile-error .cm-future-snippet").each(function(){this.cmrefresh();});
          }, 200);
            /* BEGINNING WEBGAZER ADDITION */

            // prepare for new test run
            eventQueue = [];
            webgazer.resume();
            testNum = testNum + 1;

            // register onchange event
            // should store the thing to storage, and maybe classify
            editors["definitions://"].on("change", outputTest);

            // if we haven't set the gaze listener function before
            if (!setGazeListenerFunction) {
                webgazer.setGazeListener((data, elapsedTime) => {
                    if (data == null) {
                        return;
                    }

                    var repl = document.getElementById("REPL");
                    var splitLocationX = document.body.offsetWidth - repl.offsetWidth;

                    var timeData = {
                        xpos: data.x,
                        ypos: data.y,
                        timestamp: elapsedTime,
                        barpos: splitLocationX
                    }

                    eventQueue.push(timeData);
                });

                setGazeListenerFunction = true;
            } // end setting gaze listener function

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
        repl.runtime.pauseStack(function(restarter) {
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

      var runMainCode = function(src, uiOptions) {
        breakButton.attr("disabled", false);
        output.empty();
        promptContainer.hide();
        lastEditorRun = uiOptions.cm || null;
        setWhileRunning();

        editors = {};
        editors["definitions://"] = uiOptions.cm;
        function invalidateHighlights(cm, change) {
          cm.off("change", invalidateHighlights);
          document.getElementById("main").dataset.highlights = "";
        }
        editors["definitions://"].on("change", invalidateHighlights);
        interactionsCount = 0;
        replOutputCount = 0;
        var replResult = repl.restartInteractions(src, !!uiOptions["type-check"]);
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
        document.getElementById("main").dataset.highlights = "";
        items.unshift(code);
        pointer = -1;
        var echoContainer = $("<div class='echo-container'>");
        var echoSpan = $("<span>").addClass("repl-echo");
        var echo = $("<textarea>");
        echoSpan.append(echo);
        echoContainer.append(drawPromptArrow()).append(echoSpan);
        write(echoContainer);
        var echoCM = CodeMirror.fromTextArea(echo[0], { readOnly: true });
        echoCM.setValue(code);
        breakButton.attr("disabled", false);
        CM.setValue("");
        promptContainer.hide();
        setWhileRunning();
        interactionsCount++;
        var thisName = 'interactions://' + interactionsCount;
        editors[thisName] = echoCM;
        var replResult = repl.run(code, thisName);
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

      editors['definitions://'] = CM;

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
