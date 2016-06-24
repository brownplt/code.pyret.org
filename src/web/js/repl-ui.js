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
        console.log("Management/compile run stats:", JSON.stringify(result.stats));
        if(callingRuntime.isFailureResult(result)) {
          errorUI.drawError(output, editors, callingRuntime, result.exn, makeErrorContext);
        }
        else if(callingRuntime.isSuccessResult(result)) {
          result = result.result;
          ffi.cases(ffi.isEither, "is-Either", result,
            {
              left: function(compileResultErrors) {
                closeAnimationIfOpen();
                var errs = [];
                var results = ffi.toArray(compileResultErrors);
                results.forEach(function(r) {
                  errs = errs.concat(ffi.toArray(runtime.getField(r, "problems")));
                });
                errorUI.drawError(output, editors, runtime, {exn: errs}, makeErrorContext);
              },
              right: function(v) {
                // TODO(joe): This is a place to consider which runtime level
                // to use if we have separate compile/run runtimes.  I think
                // that loadLib will be instantiated with callingRuntime, and
                // I think that's correct.
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

                  checkUI.drawCheckResults(output, editors, rr, runtime.getField(runResult.result, "checks"), makeErrorContext);
                  scroll(output);
                  return true;

                } else {
                  errorUI.drawError(output, editors, rr, runResult.exn, makeErrorContext);
                }
              }
            });
        }
        else {
          console.error("Bad result: ", result);
          errorUI.drawError(output, editors, callingRuntime, ffi.makeMessageException("Got something other than a Pyret result when running the program: " + String(result)), makeErrorContext);
        }
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
          setTimeout(function(){
            $(".check-block-error .cm-future-snippet").each(function(){this.cmrefresh();});
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

      var runMainCode = function(src, uiOptions) {
        breakButton.attr("disabled", false);
        output.empty();
        promptContainer.hide();
        lastEditorRun = uiOptions.cm || null;
        setWhileRunning();

        editors = {};
        editors["definitions://"] = uiOptions.cm;
        interactionsCount = 0;
        var replResult = repl.restartInteractions(src, !!uiOptions["type-check"]);
        var doneRendering = replResult.then(displayResult(output, runtime, repl.runtime, true)).fail(function(err) {
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
        var doneRendering = replResult.then(displayResult(output, runtime, repl.runtime, false)).fail(function(err) {
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
