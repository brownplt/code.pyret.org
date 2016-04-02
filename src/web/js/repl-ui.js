define([],function(){
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
  var animationDiv = null;
  function closeAnimationIfOpen() {
    if(animationDiv) {
      animationDiv.empty();
      animationDiv.dialog("destroy");
      animationDiv = null;
    }
  }
  var editors = {};
  var interactionsCount = 0;
  function makeEditor(container, options) {
    var initial = "";
    if (options.hasOwnProperty("initial")) {
      initial = options.initial;
    }

    var textarea = jQuery("<textarea>");
    textarea.val(initial);
    container.append(textarea);

    var runFun = function (code, replOptions) {
      options.run(code, {cm: CM}, replOptions);
    }

    var useLineNumbers = !options.simpleEditor;

    function reindentAllLines(cm) {
      var last = cm.lineCount();
      cm.operation(function() {
        for (var i = 0; i < last; ++i) cm.indentLine(i);
      });
    }

    var cmOptions = {
      extraKeys: {
        "Shift-Enter": function(cm) { runFun(cm.getValue()); },
        "Shift-Ctrl-Enter": function(cm) { runFun(cm.getValue()); },
        "Tab": "indentAuto",
        "Ctrl-I": reindentAllLines
      },
      indentUnit: 2,
      tabSize: 2,
      viewportMargin: Infinity,
      lineNumbers: useLineNumbers,
      matchKeywords: true,
      matchBrackets: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      lineWrapping: true
    };

    cmOptions = merge(cmOptions, options.cmOptions || {});

    var CM = CodeMirror.fromTextArea(textarea[0], cmOptions);


    if (useLineNumbers) {
      var upperWarning = jQuery("<div>").addClass("warning-upper");
      var upperArrow = jQuery("<img>").addClass("warning-upper-arrow").attr("src", "/img/up-arrow.png");
      upperWarning.append(upperArrow);
      CM.display.wrapper.appendChild(upperWarning.get(0));
      var lowerWarning = jQuery("<div>").addClass("warning-lower");
      var lowerArrow = jQuery("<img>").addClass("warning-lower-arrow").attr("src", "/img/down-arrow.png");
      lowerWarning.append(lowerArrow);
      CM.display.wrapper.appendChild(lowerWarning.get(0));
    }

    return {
      cm: CM,
      refresh: function() { CM.refresh(); },
      run: function() {
        runFun(CM.getValue());
      },
      focus: function() { CM.focus(); }
    };
  }

  // Lazily requires Pyret runtime dependencies and memoizes the result
  var doMakeRepl = null;
  function makeRepl(container, repl, runtime, options) {
    if (doMakeRepl) {
      Q(doMakeRepl(container, repl, runtime, options));
    }
    else {
      var initMakeRepl = Q.defer();
      var makeReplLoaded = initMakeRepl.promise;
      require(["js/ffi-helpers", "js/runtime-util", "trove/image-lib", "/js/check-ui.js", "/js/error-ui.js", "/js/output-ui.js", "trove/world-lib"], function(ffi, util, imageLib, checkUI, errorUI, outputUI, worldLib) {
        function formatCode(container, src) {
          CodeMirror.runMode(src, "pyret", container);
        }

        // NOTE(joe): sadly depends on the page and hard to figure out how to make
        // this less global
        function scroll(output) {
          $(".repl").animate({
              scrollTop: output.height(),
            },
            500
          );
        }

        function displayResult(output, callingRuntime, resultRuntime, isMain) {
          var runtime = callingRuntime;
          var rr = resultRuntime;
          return function(result) {
            runtime.loadJSModules(runtime.namespace, [ffi], function(ffi) {
              console.log("Management/compile run stats:", JSON.stringify(result.stats));
              if(callingRuntime.isFailureResult(result)) {
                errorUI.drawError(output, editors, callingRuntime, result.exn);
              }
              else if(callingRuntime.isSuccessResult(result)) {
                result = result.result;
                ffi.cases(ffi.isEither, "Either", result,
                          {
                            left: function(compileResultErrors) {
                              closeAnimationIfOpen();
                              var errs = [];
                              var results = ffi.toArray(compileResultErrors);
                              results.forEach(function(r) {
                                errs = errs.concat(ffi.toArray(runtime.getField(r, "problems")));
                              });
                              errorUI.drawError(output, editors, runtime, {exn: errs});
                            },
                            right: function(v) {
                              rr.loadBuiltinModules(
                                [util.modBuiltin("load-lib")],
                                "repl-ui",
                                function(loadLib) {
                                  var runResult = rr.getField(loadLib, "internal").getModuleResultResult(v);
                                  console.log("Stats for running definitions:", JSON.stringify(runResult.stats));
                                  if(rr.isSuccessResult(runResult)) {
                                    if(!isMain) {
                                      var answer = rr.getColonField(runResult.result, "answer");
                                      if(!rr.isNothing(answer)) {
                                        outputUI.renderPyretValue(output, rr, answer);
                                        scroll(output);
                                      }
                                    }

                                    checkUI.drawCheckResults(output, editors, rr,
                                                             runtime.getField(runResult.result, "checks"));
                                    scroll(output);

                                    return true;
                                    
                                  } else {
                                    errorUI.drawError(output, editors, rr, runResult.exn);
                                  }
                                });
                            }
                          });
              }
              else {
                console.error("Bad result: ", result);
                errorUI.drawError(output, editors, callingRuntime,
                                  ffi.makeMessageException("Got something other than a Pyret result when running the program: " + String(result)));
              }
            });
          }
        }

        //: -> (code -> printing it on the repl)
        doMakeRepl = function(container, repl, runtime, options) {
          
          var Jsworld = worldLib(runtime, runtime.namespace);
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
            }
          }
          function nextItem() {
            if (pointer >= 1) {
              pointer--;
              loadItem();
            } else if (pointer === 0) {
              CM.setValue(current);
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
          runtime.setStdout(function(str) {
            ct_log(str);
            output.append($("<pre>").addClass("replPrint").text(str));
          });
          runtime.setParam("current-animation-port", function(dom) {
            animationDiv = $("<div>").css({"z-index": 10000});
            output.append(animationDiv);
            function onClose() {
              Jsworld.shutdown({ cleanShutdown: true });
              showPrompt();
            }
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
          function afterRun(cm) {
            return function() {
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
              output.get(0).scrollTop = output.get(0).scrollHeight;
              showPrompt();
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

          var runMainCode = function(src, uiOptions) {
            breakButton.attr("disabled", false);
            output.empty();
            promptContainer.hide();
            lastEditorRun = uiOptions.cm || null;
            setWhileRunning();

            editors = {};
            editors["definitions"] = uiOptions.cm;
            interactionsCount = 0;
            var replResult = repl.restartInteractions(src, !!uiOptions["type-check"]);
            var doneRendering =
                replResult.then(displayResult(output, runtime, repl.runtime, true)).fail(
                  function(err) {
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
            echoContainer.append(drawPromptArrow()).append(echoSpan);
            write(echoContainer);
            var echoCM = CodeMirror.fromTextArea(echo[0], { readOnly: true });
            echoCM.setValue(code);
            breakButton.attr("disabled", false);
            CM.setValue("");
            promptContainer.hide();
            setWhileRunning();
            interactionsCount++;
            var thisName = 'interactions' + interactionsCount;
            editors[thisName] = echoCM;
            var replResult = repl.run(code, thisName);
            var doneRendering = replResult.then(displayResult(output, runtime, repl.runtime, false)).fail(
              function(err) {
                console.error("Error displaying result: ", err);
              });
            doneRendering.fin(afterRun(CM));
          };

          var CM = makeEditor(prompt, {
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
        };
        initMakeRepl.resolve(doMakeRepl)
      });
      return makeReplLoaded.then(
        // onSuccess
        function(makeRepl) {
          return doMakeRepl(container, repl, runtime, options);
        },
        // onRejected
        function(err) {
          console.error("Failed to create makeRepl: ", err);
        });
    }
  }

  return {
    makeRepl: makeRepl,
    makeEditor: makeEditor
  };
});
