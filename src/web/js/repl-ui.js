define(["trove/image-lib", "./check-ui.js", "./error-ui.js", "./output-ui.js", "trove/world-lib"], function(imageLib, checkUI, errorUI, outputUI, worldLib) {
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

    var runFun = function (code, options) {};
    if (options.hasOwnProperty("run")) {
      runFun = function (code, replOptions) {
        options.run(code, {cm: CM}, replOptions);
      }
    }

    var useLineNumbers = !options.simpleEditor;

    if(options.cmOptions && options.cmOptions.gutters) {
      var optGutters = options.cmOptions.gutters;
      delete options.cmOptions.gutters;
    }
    else {
      var optGutters = [];
    }
    var cmOptions = {
      extraKeys: {
        "Shift-Enter": function(cm) { runFun(cm.getValue(), {check: true, "type-env": !options.simpleEditor }); },
        "Shift-Ctrl-Enter": function(cm) { runFun(cm.getValue(), {check: false, "type-env": !options.simpleEditor}); },
        "Tab": "indentAuto"
      },
      indentUnit: 2,
      tabSize: 2,
      viewportMargin: Infinity,
      lineNumbers: useLineNumbers,
      matchBrackets: true,
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

    if(options.runButton) {
      options.runButton.on("click", function() {
        runFun(CM.getValue(), {check: true});
      });
    }

    return {
      cm: CM,
      refresh: function() { CM.refresh(); },
      run: function() {
        runFun(CM.getValue(), {check: true});
      },
      focus: function() { CM.focus(); }
    };
  }

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

  function makeHighlightingRunCode(runtime, codeRunner, isMain) {
    var image = imageLib(runtime, runtime.namespace);

    return function(src, uiOptions, options) {
      function highlightingOnError(output) { return function(err) {
        closeAnimationIfOpen();
        ct_log(err);
        if (!runtime.isFailureResult(err)) {
          ct_err("Got a non-failure result in OnError handler: ", err);
        }
        else {
          var exn = err.exn;
          try {
            errorUI.drawError(output, editors, runtime, exn);
            scroll(output);
          }
          catch(e) {
            console.error("There was an error while reporting the error: ", e);
          }
        }
      };}

      function highlightingCheckReturn(output) { return function(obj) {
        if(!isMain) {
          var answer = runtime.getField(obj.result, "answer");
          outputUI.renderPyretValue(output, runtime, answer);
          scroll(output);
        }

        checkUI.drawCheckResults(output, editors, runtime, runtime.getField(obj.result, "checks"));
        scroll(output);

        console.log(JSON.stringify(obj.stats));

        return true;

      };}

      var theseUIOptions = merge(uiOptions, {
          wrappingOnError: highlightingOnError
      });
      theseUIOptions.wrappingReturnHandler = highlightingCheckReturn;
      codeRunner(src, theseUIOptions, options);
    }
  }
  //: -> (code -> printing it on the repl)
  function makeRepl(container, repl, runtime, options) {
    
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

    function clearAllMarks() {
      CM.getAllMarks().forEach(function(m) {
        m.clear();
      });
    }

    var img = $("<img>").attr({
      "src": "/img/pyret-spin.gif",
      "width": "25px",
    }).css({
      "vertical-align": "middle"
    });
    function afterRun() {
      options.runButton.empty();
      options.runButton.text("Run");
      options.runButton.attr("disabled", false);
    }
    function setWhileRunning() {
      options.runButton.empty();
      var text = $("<span>").text("Running...");
      text.css({
        "vertical-align": "middle"
      });
      options.runButton.append([img, text]);
      options.runButton.attr("disabled", true);
    }

    var runCode = makeHighlightingRunCode(runtime, function (src, uiOptions, options) {
      breakButton.attr("disabled", false);
      output.empty();
      promptContainer.hide();
      var defaultReturnHandler = checkModePrettyPrint;
      var thisReturnHandler;
      if (uiOptions.wrappingReturnHandler) {
        thisReturnHandler = uiOptions.wrappingReturnHandler(output);
      } else {
        thisReturnHandler = uiOptions.handleReturn || defaultReturnHandler;
      }
      var thisError;
      if (uiOptions.wrappingOnError) {
        thisError = uiOptions.wrappingOnError(output);
      } else {
        thisError = uiOptions.error || onError;
      }
      var thisWrite = uiOptions.write || write;
      lastNameRun = uiOptions.name || "interactions";
      lastEditorRun = uiOptions.cm || null;
      setWhileRunning();

      editors = {};
      editors["definitions"] = uiOptions.cm;
      interactionsCount = 0;
      evaluator.runMain(uiOptions.name || "run", src, enablePrompt(thisReturnHandler), thisWrite, enablePrompt(thisError), options, afterRun);
    }, true);

    var enablePrompt = function (handler) { return function (result) {
        breakButton.attr("disabled", true);
        CM.setValue("");
        CM.setOption("readOnly", false);
        CM.getDoc().eachLine(function (line) {
          CM.removeLineClass(line, 'background', 'cptteach-fixed');
        });
        output.get(0).scrollTop = output.get(0).scrollHeight;
        showPrompt();
        return handler(result);
      };
    }

    var runner = makeLoggingRunCode(function(code, opts, replOpts){
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
          makeHighlightingRunCode(runtime, function(src, uiOptions, options) {
            interactionsCount++;
            var thisName = 'interactions' + interactionsCount;
            editors[thisName] = echoCM;
            evaluator.runRepl(thisName,
                        code,
                        enablePrompt(uiOptions.wrappingReturnHandler(output)),
                        write,
                        enablePrompt(uiOptions.wrappingOnError(output)),
                        merge(options, merge(replOpts, {name: lastNameRun, check: true})),
                        afterRun);
          }, false)(code, merge(opts, {cm: echoCM}), replOpts);
        },
        "interactions");

    var CM = makeEditor(prompt, {
      simpleEditor: true,
      run: runner,
      initial: "",
      cmOptions: {
        extraKeys: {
          'Enter': function(cm) { runner(cm.getValue(), {cm: cm}, {check: true, "type-env": false }); },
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

    var onError = function(err, editor) {
      ct_log("onError: ", err);
      if (err.message) {
        write(jQuery('<span/>').css('color', 'red').append(err.message));
        write(jQuery('<br/>'));
      }
    };

    var checkModePrettyPrint = function(obj) {
      function drawSuccess(name, message) {
        return $("<div>").text(name +  ": " + message)
          .addClass("check check-success")
          .append("<br/>");
      }
      function drawFailure(name, message) {
        return $('<div>').text(name + ": " + message)
          .addClass("check check-failure")
          .append("<br/>");
      }
      var dict = pyretMaps.toDictionary(obj);
      var blockResults = pyretMaps.toDictionary(pyretMaps.get(dict, "results"));
      function getPrimField(v, field) {
        return pyretMaps.getPrim(pyretMaps.get(pyretMaps.toDictionary(v), field));
      }

      pyretMaps.map(blockResults, function(result) {
        pyretMaps.map(pyretMaps.toDictionary(result), function(checkBlockResult) {
          var cbDict = pyretMaps.toDictionary(checkBlockResult);
          var container = $("<div>");
          var message = $("<p>");
          var name = getPrimField(checkBlockResult, "name");
          container.append("<p>").text(name);
          container.append(message);
          container.addClass("check-block");
          if (pyretMaps.hasKey(cbDict, "err")) {
            var messageText = pyretMaps.get(cbDict, "err");
            if (pyretMaps.hasKey(pyretMaps.toDictionary(messageText), "message")) {
              messageText = getPrimField(pyretMaps.get(cbDict, "err"), "message");
            } else {
              messageText = pyretMaps.getPrim(pyretMaps.get(cbDict, "err"));
            }
            message.text("Check block ended in error: " + messageText);
            container.css({
              "background-color": "red"
            });
          }


          pyretMaps.map(pyretMaps.toDictionary(pyretMaps.get(pyretMaps.toDictionary(checkBlockResult), "results")), function(individualResult) {
            if (pyretMaps.hasKey(pyretMaps.toDictionary(individualResult), "reason")) {
              container.append(drawFailure(
                  getPrimField(individualResult, "name"),
                  getPrimField(individualResult, "reason")));
            } else {
              container.append(drawSuccess(
                  getPrimField(individualResult, "name"),
                  "Success!"));
            }
          });
          output.append(container);
        });
      });
      return true;
    }

    var evaluator = makeEvaluator(container, repl, runtime);


    var onBreak = function() {
      breakButton.attr("disabled", true);
      evaluator.requestBreak(function() {
          closeAnimationIfOpen();
          Jsworld.shutdown({ cleanShutdown: true });
          showPrompt();
        });
    };


    breakButton.attr("disabled", true);
    breakButton.click(onBreak);

    return {
      runCode: runCode,
      focus: function() { CM.focus(); }
    };
  }

  function makeEvaluator(container, repl, runtime) {
    var runMainCode = function(name, src, returnHandler, writer, onError, options, noMatterWhat) {
      var evaluation = repl.restartInteractions(src);
      evaluation.then(function(result) {
        if(runtime.isSuccessResult(result)) {
          returnHandler(result);
        } else {
          onError(result);
        }
      });
      if(noMatterWhat) {
        evaluation.fin(noMatterWhat);
      }
    };

    var runReplCode = function(name, src, returnHandler, writer, onError, options, noMatterWhat) {
      var evaluation = repl.run(src, name);
      evaluation.then(function(result) {
        if(runtime.isSuccessResult(result)) {
          returnHandler(result);
        } else {
          onError(result);
        }
      });
      if(noMatterWhat) {
        evaluation.fin(noMatterWhat);
      }
    };

    var breakFun = function(afterBreak) {
      repl.stop();
      afterBreak();
    };

    var resetFun = function(afterReset) {
      repl.restartInteractions("").then(afterReset);
    };

    return {
      runMain: runMainCode,
      runRepl: runReplCode,
      requestBreak: breakFun,
      requestReset: resetFun
    };
  }

  function namedRunner(runFun, name) {
    return function(src, uiOptions, langOptions) {
      runFun(src, merge(uiOptions, { name: name }), langOptions);
    };
  }

  function makeLoggingRunCode(codeRunner, name) {
    return codeRunner;
/*
    var toLog = [];
    function codeLog(src, uiOpts, replOpts) {
      toLog.push({name: name, url: String(window.location), src: src, name: uiOpts.name, time: String(Date.now())});
    }
    function sendLog() {
      if(toLog.length > 0) {
        $.ajax("/notification/code_run", {
          type: "POST",
          dataType: "json",
          data: {run_events: JSON.stringify(toLog)}
        });
        toLog = [];
      }
      window.setTimeout(sendLog, 30000);
    }
    sendLog();
    
    return namedRunner(function(src, uiOpts, replOpts) {
      codeLog(src, uiOpts, replOpts);
      codeRunner(src, uiOpts, replOpts);
    }, name);
*/
  }

  return {
    makeRepl: makeRepl,
    makeEditor: makeEditor
  };


});
