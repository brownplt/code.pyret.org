define(["js/ffi-helpers", "trove/option", "trove/srcloc", "trove/error-display", "./output-ui.js", "./error-ui.js", "trove/parse-pyret", "trove/ast"], function(ffiLib, optionLib, srclocLib, errordisplayLib, outputUI, errorUI, parsePyret, astLib) {
  var highlightCounter = 0;
  function drawCheckResults(container, editors, runtime, checkResults) {
    var ffi = ffiLib(runtime, runtime.namespace);
    var cases = ffi.cases;
    var get = runtime.getField;
    var inspect = runtime.getFields;
  
    var checkResultsArr = ffi.toArray(checkResults);
  
    runtime.loadModules(runtime.namespace, [optionLib, srclocLib, errordisplayLib, parsePyret, astLib], function(option, srcloc, ED, PP, AST) {
  
      // These counters keep cumulative statistics for all the check blocks.
      var checkTotalAll = 0;
      var checkPassedAll = 0;
      var checkBlockCount = checkResultsArr.length;
      var checkBlocksErrored = 0;
  
      var checkContainer = $("<div>");
  
      // Sort through all the check blocks.
      checkResultsArr.reverse().forEach(function(cr) {
        var eachContainer = $("<div>").addClass("check-block");
        var testContainer = $("<div>").addClass("check-block-test-container");
        var checkLoc      = get(cr,"loc");
        var checkCMLoc    = outputUI.cmPosFromSrcloc(runtime, srcloc, checkLoc);
        var checkCSS      = outputUI.cmlocToCSSClass(checkCMLoc);
        var checkCSSID    = "check-" + checkCSS;    
        eachContainer.attr("id", checkCSSID);
        
        function editorMessage(cssClass, msg) {
          editors[checkCMLoc.source].widgets.push(
            editors[checkCMLoc.source].addLineWidget(checkCMLoc.start.line,
              function(){ 
                var marker = document.createElement("div");
                $(marker)
                  .addClass("editor-check-block-message")
                  .addClass(cssClass)
                  .attr('id',"check-marker" + checkCSS)
                  .text(msg)
                  .on("click", function(){
                    var errorel = document.getElementById(checkCSSID);
                    errorel.style.animation = "emphasize-error 1s 1";
                    $(errorel).on("animationend", function(){this.style.animation = "";});
                    errorel.scrollIntoView(true);
                  });
                return marker;
              }(),
              {coverGutter: false, noHScroll: true, above: true}));
        }
  
        // Counters for cumulative stats within a check block.
        var checkTotal = 0;
        var checkPassed = 0;
  
        // Check block header
        var name = $("<a>").text(get(cr, "name"))
          .addClass("hinted-highlight")
          .addClass(checkCSS);
          
        var trArr = ffi.toArray(get(cr, "test-results"));
        
        eachContainer
          .append($("<div>").addClass("check-block-header")
            .text("Testing Report: ")
            .append(name));
        
        expandButton = $("<pre>").addClass("expandElement expandText").text("Show Details");
        eachContainer.append(expandButton);
        eachContainer.addClass("expandElement");
        var testEditors = new Array();
        
        var testNumber = 1;
        function testTitle(loc, passed) {
          testNumber++;
          var header = $("<header>")
            .addClass("hinted-highlight")
            .text(
              "Test " + testNumber + ": " +
              (passed ? "Passed"
                      : "Failed"))
            .attr('alt',"Click to scroll editor to test.");
          var cmloc = outputUI.cmPosFromSrcloc(runtime, srcloc, loc);
          var testContext = outputUI.cmlocToCSSClass(cmloc);
          // Highlight the whole test on hover
          var testMarker = outputUI.highlightSrcloc(runtime, editors, srcloc, loc, 
            (passed ? "hsl(88, 50%, 76%)" : "hsl(45, 100%, 85%)"), testContext, false);
          var currentHighlight = "";
          var contextManager = document.getElementById("main").dataset;
          header.on("click", function(e){
            outputUI.emphasizeLine(editors, cmloc);
            outputUI.gotoLoc(runtime, editors, srcloc, loc);
            e.stopPropagation();});
          header.on("mouseenter", function(e){
            if(header.parent().hasClass("highlights-active")) return;
            currentHighlight = contextManager.highlights;
            contextManager.highlights = testContext;
            outputUI.hintLoc(runtime, editors, srcloc, loc);
            e.stopPropagation();});
          header.on("mouseleave", function(e) {
            if(header.parent().hasClass("highlights-active")) return;
            contextManager.highlights = currentHighlight;
            outputUI.unhintLoc(runtime, editors, srcloc, loc);
            e.stopPropagation();});
          return header;
        }
  
        // Sort through the collection of test results within a check
        // block.
        trArr.reverse().forEach(function(tr) {
          var me = highlightCounter++;
          checkTotal = checkTotal + 1;
          checkTotalAll = checkTotalAll + 1;
  
          var eachTest = $("<div>").addClass("check-block-test");
          function addPreToTest(cssClass, txt, loc) {
            var dom = $("<pre>").addClass(cssClass).text(txt);
            outputUI.hoverLocs(editors, runtime, srcloc, dom, [loc], "check-highlight");
            eachTest.append(dom);
          }
          
          function addPassToTest(loc) {
            eachTest.attr('data-result', "Passed");
            eachTest.addClass("passing-test");
            eachTest.prepend(testTitle(loc, true));
            var cmloc = outputUI.cmPosFromSrcloc(runtime, srcloc, loc);
            var editor = editors[cmloc.source];
            var mainDoc = editors[cmloc.source].getDoc();
            var handle = mainDoc.markText(cmloc.start, cmloc.end,
                            {inclusiveLeft:false, inclusiveRight:false});
            var cmLinked = CodeMirror(eachTest[0], {
              readOnly: true,
              indentUnit: 2,
              tabSize: 2,
              viewportMargin: Infinity,
              lineNumbers: true,
              lineWrapping: true,
              lineNumberFormatter: function(line){
                return (handle.find() === undefined)
                  ? " "
                  : "" + line;
                }
            });
            content = mainDoc.getRange(cmloc.start, cmloc.end);
            cmLinked.getDoc().setValue(content);
            cmLinked.setOption("firstLineNumber",handle.find().from.line+1); 
            editor.on("change",function(cm, change) {
              var handleloc = handle.find();
              if(handleloc != undefined) {
                cmLinked.setOption("firstLineNumber",handleloc.from.line+1);
              } else {
                cmLinked.setOption("firstLineNumber",0);
              }
            });
            testEditors.push(cmLinked);
          }
          
          function addReasonToTest(cssClass, errorDisp, loc) {
            var dom = $(outputUI.renderErrorDisplay(editors, runtime, errorDisp, [], "eg-"+me)).addClass(cssClass);
            var cmloc = outputUI.cmPosFromSrcloc(runtime, srcloc, loc);
            var reasonID = "reason-" + outputUI.cmlocToCSSClass(cmloc);
            dom.attr('id',reasonID);
            var cm = editors[cmloc.source];
            var doc = cm.getDoc();
            var textMarker = doc.markText(cmloc.start, cmloc.end,
                            {inclusiveLeft:false, inclusiveRight:false});
            var thisTest = eachTest;
            var thisContainer = testContainer;
            
            var marker = document.createElement("div");
            marker.innerHTML = cmloc.start.line + 1;
            marker.alt = "Test failed! Click to see why.";
            marker.classList.add("failedTestMarker");
            marker.classList.add("CodeMirror-linenumber");
            $(marker).on("click", function(){
              thisContainer.parent(".check-block.expandElement").children(".expandText").trigger("click");
              thisTest.on("animationend", function(){this.style.animation = "";});
              thisTest[0].style.animation = "emphasize-error 1s 1";
              thisTest[0].scrollIntoView(true);
              $(thisTest.children(".highlightToggle")[0]).trigger( "click" );
            });
            var gutterHandle = cm.setGutterMarker(cmloc.start.line, "CodeMirror-linenumbers", marker);
            var onChange = function(cm, change) {
              var gutterLine = doc.getLineNumber(gutterHandle);
              var markerLoc  = textMarker.find();
              if(markerLoc === undefined)
                return;
              var markerLine = markerLoc.from.line;
              marker.innerHTML = markerLine + 1;
              if(gutterLine != markerLine) {
                cm.setGutterMarker(gutterHandle, "CodeMirror-linenumbers", null);
                cm.refresh();
                gutterHandle = cm.setGutterMarker(markerLine, "CodeMirror-linenumbers", marker);
              }
            };
            cm.on("change",onChange);
            eachTest.append(testTitle(loc, false));
            eachTest.append(dom);
            eachTest.attr('data-result', "Failed");
            eachTest.addClass('failing-test');
          }
          
          if (!ffi.isTestSuccess(tr)) {
            runtime.runThunk(
              function() { return get(tr, "render-fancy-reason").app(PP, AST, outputUI.makePalette(runtime)); },
              function(out) {
                if (runtime.isSuccessResult(out)) {
                    var toggle = $("<div>").addClass("highlightToggle");
                    toggle.on('click', function(e){
                      var prev = document.querySelector(".highlights-active");
                      if (prev != null) prev.classList.remove("highlights-active");
                      document.getElementById("main").dataset.highlights = "eg-" + me;
                      eachTest.addClass("highlights-active");
                      e.stopPropagation();
                    });
                  addReasonToTest("replOutputReason", out.result, get(tr, "loc"));
                  eachTest.prepend(toggle);
                } else {
                  addPreToTest("replOutputReason", "<error rendering result; details logged to console>", get(tr, "loc"));
                  console.log(out.exn);
                }
              }
            );
          } else {
            // If you're here, the test passed, all is well.
            checkPassed = checkPassed + 1;
            checkPassedAll = checkPassedAll + 1;
            addPassToTest(get(tr, "loc"));
            //addPreToTest("replOutputPassed", "  test (" + get(tr, "code") + "): ok", get(tr, "loc"));
          }
          testContainer.append(eachTest);
        });
        eachContainer.append(testContainer);
        var firstClick = true;
        $(eachContainer).on("click", ".expandElement", function(e) {
          e.stopPropagation();
          if (firstClick) {
            setTimeout(function(){
              for(var i=0; i<testEditors.length; i++) {
                testEditors[i].refresh();
              }
              firstClick = false;
            },100);
          }
          if (testContainer.is(":visible")) {
            eachContainer.addClass("expandElement");
            this.textContent = "Show Details";
            var prev = testContainer.children(".highlights-active");
            if(!eachContainer.hasClass("check-block-error")) {
              if (prev.length != 0)
                prev.removeClass("highlights-active");
              document.getElementById("main").dataset.highlights = "";
            }
          }
          else {
            eachContainer.removeClass("expandElement");
            this.textContent = "Hide Details";
            if (firstClick) {
              setTimeout(function(){
                for(var i=0; i<testEditors.length; i++) {
                  testEditors[i].refresh();
                }
                firstClick = false;
              },100);
            }
          }
          testContainer.toggle();
          });
          
        var summary = $("<div>").addClass("check-block-summary");
        var me = highlightCounter++;
        var thisCheckBlockErrored = false;
        // Necessary check because this field was not present in older versions
        if (runtime.hasField(cr, "maybe-err")) {
          var error = get(cr, "maybe-err");
          if(get(option, "is-some").app(error)) {
            thisCheckBlockErrored = true;
            checkBlocksErrored = checkBlocksErrored + 1;
            var errorDiv = $("<div>").addClass("check-block-error");
            errorDiv.text("The unexpected error:");
            eachContainer.append(errorDiv);
            var errorDom = errorUI.drawError(errorDiv, editors, runtime, get(error, "value").val, "eg-"+me);
            var toggle = $("<div>").addClass("highlightToggle");
            toggle.on('click', function(e){
              var prev = document.querySelector(".highlights-active");
              if (prev != null) prev.classList.remove("highlights-active");
              document.getElementById("main").dataset.highlights = "eg-" + me;
              errorDiv.addClass("highlights-active");
              e.stopPropagation();
              });
            errorDiv.children().first().prepend(toggle);
            eachContainer.addClass("check-block-errored");
            summary.text("An unexpected error halted the check-block before Pyret was finished with it. Some tests may not have run.");
            editorMessage("editor-check-block-error", "Unexpected Error");
            if(checkTotal > 0) {
              testContainer.prepend(
                "Before the unexpected error, "
                + checkTotal + ((checkTotal > 1) ? " tests " : " test ")
                + "in this block ran (" + checkPassed + " passed):");
            }
          }
        }
  
        if(!thisCheckBlockErrored) {
          var message = "";
          if(checkTotal == checkPassed) {
            eachContainer.addClass("check-block-success");
          } else {
            eachContainer.addClass("check-block-failed");
          }
          if (checkTotal > 1) {
            if (checkPassed == checkTotal) {
              message = "All " + checkTotal + " tests in this block passed.";
            } else {
              message = "" + checkPassed + " out of " + checkTotal + " tests passed in this block.";
            }
          } else if (checkTotal == 1 && checkPassed == 1) {
            message = "The test in this block passed.";
          } else if (checkTotal == 1 && checkPassed == 0) {
            message = "The test in this block failed.";
          }
          summary.text(message);
          editorMessage(((checkTotal == checkPassed) ?
            "editor-check-block-success"
            : "editor-check-block-failed"), message);
        }
        
        // Highlight the test block name appropriately
        var nameMarker = outputUI.highlightSrcloc(runtime, editors, srcloc, checkLoc, 
           eachContainer.hasClass("check-block-success") ? "hsl(88, 50%, 76%)"
         : eachContainer.hasClass("check-block-failed")  ? "hsl(45, 100%, 85%)"
         : eachContainer.hasClass("check-block-errored") ? "hsl(0, 100%, 90%)":""
         , checkCSS, false);
        var currentHighlight = "";
        var contextManager = document.getElementById("main").dataset;
        name.on("click", function(e){
          outputUI.emphasizeLine(editors, checkCMLoc);
          outputUI.gotoLoc(runtime, editors, srcloc, checkLoc);
          e.stopPropagation();});
        name.on("mouseenter", function(e){
          currentHighlight = contextManager.highlights;
          contextManager.highlights = checkCSS;
          outputUI.hintLoc(runtime, editors, srcloc, checkLoc);
          e.stopPropagation();});
        name.on("mouseleave", function(e) {
          contextManager.highlights = currentHighlight;
          outputUI.unhintLoc(runtime, editors, srcloc, checkLoc);
          e.stopPropagation();});
       
        testContainer.hide();
        name.after(summary);
        checkContainer.append(eachContainer);
      });
  
      var summary = $("<div>").addClass("check-block testing-summary");
      var errored;
      // If there was more than one check block, print a message about
      // the grand total of checks and passes.
      if (checkPassedAll == checkTotalAll && checkBlocksErrored === 0) {
        if (checkTotalAll > 0) {
          if (checkTotalAll == 1) {
            summary.text("Looks shipshape, your test passed, mate!");
          } else if (checkTotalAll == 2) {
            summary.text("Looks shipshape, both tests passed, mate!");
          } else {
            summary.text("Looks shipshape, all " + checkTotalAll + " tests passed, mate!");
          }
        }
      } else {
        var testsFailedAll = (checkTotalAll - checkPassedAll);
        function TESTS(n){return n == 1 ? "TEST" : "TESTS";}
        summary.append(
          $("<div>").addClass("summary-bits")
            .append($("<div>").addClass("summary-bit summary-passed").html("<span class='summary-count'>" + checkPassedAll + "</span> " + TESTS(checkPassedAll) + " PASSED"))
            .append($("<div>").addClass("summary-bit summary-failed").html("<span class='summary-count'>" + testsFailedAll + "</span> " + TESTS(testsFailedAll) + " FAILED")));
            
        if (checkBlocksErrored > 0) {
          summary.append($("<div>").addClass("summary-errored")
            .append($("<span class='summary-count'>").text(checkBlocksErrored))
            .append($("<span class='summary-text'>")
              .html(" ended in an unexpected error, and <b>some tests in "
                + (checkBlocksErrored == 1 ? "this block":"these blocks")
                + " may not have run</b>.")
              .prepend($("<code>").text(checkBlocksErrored == 1 ? "check-block":"check-blocks"))));
        }
      }
      container.append(checkContainer.append(summary));
  
    });
  
  }
  
  return {
    drawCheckResults: drawCheckResults
  }
  
});
