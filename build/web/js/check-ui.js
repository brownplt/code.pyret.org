({
  requires: [
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./output-ui"] },
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./error-ui"] },
    { "import-type": "builtin",
      name: "option" },
    { "import-type": "builtin",
      name: "srcloc" },
    { "import-type": "builtin",
      name: "checker" }
  ],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, _, uri, outputUI, errorUI, option, srcloc, checker) {

    option = runtime.getField(option, "values");
    srcloc = runtime.getField(srcloc, "values");
    CH = runtime.getField(checker, "values");

    function isTestResult(val) { return runtime.unwrap(runtime.getField(CH, "TestResult").app(val)); }
    function isTestSuccess(val) { return runtime.unwrap(runtime.getField(CH, "is-success").app(val)); }

    var highlightCounter = 0;
    // NOTE: MUST BE CALLED WHILE RUNNING ON runtime's STACK
    function drawCheckResults(container, editors, runtime, checkResults, contextFactory) {
      var ffi = runtime.ffi;
      var cases = ffi.cases;
      var get = runtime.getField;
      var inspect = runtime.getFields;
    
      var checkResultsArr = ffi.toArray(checkResults).reverse();
    
      // These counters keep cumulative statistics for all the check blocks.
      var checkTotalAll = 0;
      var checkPassedAll = 0;
      var checkBlockCount = checkResultsArr.length;
      var checkBlocksErrored = checkResultsArr.reduce(
        function(n, test) {
          return n + get(option, "is-some").app(get(test, "maybe-err"));
        }, 0);
  
      var checkContainer = $("<div>").addClass("test-results");
  
      // Sort through all the check blocks.
      return runtime.safeCall(function() {
        return runtime.eachLoop(runtime.makeFunction(function(i) { 
          var cr = checkResultsArr[i];

          var eachContainer = $("<div>").addClass("check-block").addClass("check-block-results");
          var testContainer = $("<div>").addClass("check-block-test-container");
          var checkLoc      = get(cr,"loc");
          var checkCMLoc    = outputUI.cmPosFromSrcloc(runtime, srcloc, checkLoc);
          var checkCSS      = outputUI.cmlocToCSSClass(checkCMLoc);
          var checkCSSID    = "check-" + checkCSS;    
          
          // Counters for cumulative stats within a check block.
          var trArr = ffi.toArray(get(cr, "test-results")).reverse();
          
          var testsInBlock = trArr.length;
          var testsPassingInBlock = trArr.reduce(
            function(n, test) {
              return n + isTestSuccess(test);
            }, 0);
          var thisCheckBlockErrored =
            get(option, "is-some").app(get(cr, "maybe-err"));
          checkTotalAll += testsInBlock;
          checkPassedAll += testsPassingInBlock;
          

          eachContainer.attr("id", checkCSSID);
          
          
          // Check block header
          var name = $("<a>").text(get(cr, "name"))
            .addClass("hinted-highlight")
            .addClass(checkCSS);
          
          
          
          eachContainer
            .append($("<div>").addClass("check-block-header")
                    .append(name.append(": ")));
          
          var testEditors = new Array();
          
          var testNumber = 0;
          function testTitle(loc, passed) {
            testNumber++;
            var testName = $("<a class='hinted-highlight'>").text("Test " + testNumber);
            var header = $("<header>")
              .append(testName)
              .append(": " +
                      (passed ? "Passed"
                       : "Failed"))
              .attr('title',"Click to scroll editor to test.");
            var cmloc = outputUI.cmPosFromSrcloc(runtime, srcloc, loc);
            var testContext = outputUI.cmlocToCSSClass(cmloc);
            // Highlight the whole test on hover
            var testMarker = outputUI.highlightSrcloc(runtime, editors, srcloc, loc, 
                                                      (passed ? "hsl(88, 50%, 76%)" : "hsl(45, 100%, 85%)"), testContext, false);
            var currentHighlight = "";
            var contextManager = document.getElementById("main").dataset;
            testName.on("click", function(e){
              outputUI.emphasizeLine(editors, cmloc);
              outputUI.gotoLoc(runtime, editors, srcloc, loc);
              e.stopPropagation();});
            testName.on("mouseenter", function(e){
              if(header.parent().hasClass("highlights-active")) return;
              currentHighlight = contextManager.highlights;
              contextManager.highlights = testContext;
              outputUI.hintLoc(runtime, editors, srcloc, loc);
              e.stopPropagation();});
            testName.on("mouseleave", function(e) {
              if(header.parent().hasClass("highlights-active")) return;
              contextManager.highlights = currentHighlight;
              outputUI.unhintLoc(runtime, editors, srcloc, loc);
              e.stopPropagation();});
            return header;
          }
          
          // Sort through the collection of test results within a check
          // block.
          return runtime.safeCall(function() {
            return runtime.eachLoop(runtime.makeFunction(function(i) {
              var tr = trArr[i];
              var errorID = contextFactory();
              
              var eachTest = $("<div>").addClass("check-block-test");
              testContainer.append(eachTest);

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
                var cmLinked = outputUI.snippet(editors, cmloc);
                eachTest.append(cmLinked.wrapper);
                testEditors.push(cmLinked);
              }
              
              function addReasonToTest(cssClass, errorDisp, loc) {
                return runtime.safeCall(function() {
                  return outputUI.renderErrorDisplay(editors, runtime, errorDisp, [], errorID).addClass(cssClass);
                }, function(dom) { 
                  var cmloc = outputUI.cmPosFromSrcloc(runtime, srcloc, loc);
                  var reasonID = "reason-" + outputUI.cmlocToCSSClass(cmloc);
                  dom.addClass(cssClass);
                  dom.attr('id',reasonID);
                  var cm = editors[cmloc.source];
                  var doc = cm.getDoc();
                  var textMarker = doc.markText(cmloc.start, cmloc.end,
                                                {inclusiveLeft:false, inclusiveRight:false});
                  var thisTest = eachTest;
                  var thisContainer = eachContainer;
                  if(highlightMode === "scsh")
                    outputUI.highlightLines(runtime, editors, srcloc, loc, "hsl(45, 100%, 85%)", errorID);
                  var marker = document.createElement("div");
                  marker.innerHTML = cmloc.start.line + 1;
                  marker.title = "Test failed! Click to see why.";
                  marker.classList.add("failedTestMarker");
                  marker.classList.add("CodeMirror-linenumber");
                  $(marker).on("click", function(){
                    if(!thisContainer.hasClass("expanded"))
                      thisContainer.children(".check-block-header").click();
                    thisTest.on("animationend", function(){this.style.animation = "";});
                    thisTest[0].style.animation = "emphasize-error 1s 1";
                    thisTest[0].scrollIntoView(true);
                    dom.parent().trigger('click');
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
                  return dom;
                }, "addReasonToTest: renderErrorDisplay");
              }
              
              if (!isTestSuccess(tr)) {
                var maybeLocToAST   = outputUI.makeMaybeLocToAST(runtime, editors, srcloc);
                var srclocAvaliable = outputUI.makeSrclocAvaliable(runtime, editors, srcloc);
                var maybeStackLoc   = (runtime.hasField(tr, "actual-exn")) ?
                  (outputUI.makeMaybeStackLoc(runtime, editors, srcloc, get(tr, "actual-exn").val.pyretStack))
                  : (runtime.makeFunction(function(n, userFramesOnly) {
                    return runtime.ffi.makeNone();
                  }));
                runtime.pauseStack(function(restarter) {
                  runtime.runThunk(
                    function() { 
                      return get(tr, "render-fancy-reason").app(maybeStackLoc, srclocAvaliable, maybeLocToAST); 
                    }, function(out) {
                      if (runtime.isSuccessResult(out)) {
                        runtime.runThunk(function() {
                          return addReasonToTest("test-reason", out.result, get(tr, "loc"));
                        }, function(reasonResult) {
                          var reason = reasonResult.result;
                          eachTest.on('click', function(){
                            reason.trigger('toggleHighlight');
                            eachTest.addClass('highlights-active');
                          });
                          restarter.resume(runtime.nothing);
                        });
                      } else {
                        addPreToTest("replOutputReason", "<error rendering result; details logged to console>", get(tr, "loc"));
                        console.log(out.exn);
                        restarter.resume(runtime.nothing);
                      }
                    });
                });
              } else {
                // If you're here, the test passed, all is well.
                addPassToTest(get(tr, "loc"));
                return runtime.nothing;
              }
            }), 0, (testsInBlock === testsPassingInBlock && !thisCheckBlockErrored) ? 0 : trArr.length);
          }, function(_) {
            eachContainer.append(testContainer);
            
            /* Expand check block results when their header is clicked */
            eachContainer.on("click", ".check-block-header", function(e) {
              // Collapse the currently expanded check block, if any
              eachContainer.siblings(".expanded").children(".check-block-header").click();
              // Clear the current highlight
              document.getElementById("main").dataset.highlights = "";
              // Expand/Collapse the clicked check block results
              eachContainer.toggleClass("expanded");
              // If the block results have just been expanded, highlight the first thing available.
              if(eachContainer.hasClass("expanded")) {
                testContainer.children().first().trigger('click');
              }
            });
            
            /* on the first expansion, refresh the CodeMirror snippets */
            $(eachContainer).one("click", ".check-block-header", function(){
              $(eachContainer).find(".cm-future-snippet").each(
                function(){this.cmrefresh();});
            });
            
            var summary = $("<div>").addClass("check-block-summary");
            
            eachContainer.addClass(
              thisCheckBlockErrored               ? "check-block-errored"
                : testsInBlock == testsPassingInBlock ? "check-block-success"
                :                                       "check-block-failed");

            return runtime.safeCall(function() {
              // Necessary check because this field was not present in older versions
              if (thisCheckBlockErrored) {
                var errorDiv = $("<div>")
                  .addClass("check-block-error")
                  .text("The unexpected error:");
                return runtime.safeCall(function() {
                  return errorUI.drawError(errorDiv, editors, runtime, get(get(cr, "maybe-err"), "value").val, contextFactory);
                }, function(_) {
                  var reason = errorDiv.children(".compile-error");
                  eachContainer.append(errorDiv);
                  summary.text("An unexpected error halted the check-block before Pyret was finished with it. Some tests may not have run.");
                  
                  if(testsInBlock > 0) {
                    testContainer.prepend(
                      "Before the unexpected error, "
                        + testsInBlock + ((testsInBlock > 1) ? " tests " : " test ")
                        + "in this block ran (" + testsPassingInBlock + " passed):");
                  }
                  
                  // Highlight the point the check block errored at.
                  var errorLoc = outputUI.getLastUserLocation(runtime, srcloc, editors, 
                                                              get(get(cr, "maybe-err"), "value").val.pyretStack, 0, true);
                  
                  errorDiv.on('click', function(){
                    reason.trigger('toggleHighlight');
                  });
                  
                  if(errorLoc !== undefined) {
                    var cmloc = outputUI.cmPosFromSrcloc(runtime, srcloc, errorLoc);
                    var editor = editors[cmloc.source];
                    var textMarker = editor.markText(cmloc.start, cmloc.end,
                                                     {inclusiveLeft:false, inclusiveRight:false});
                    var thisContainer = eachContainer;
                    var marker = document.createElement("div");
                    marker.innerHTML = cmloc.start.line + 1;
                    marker.title = "Check block ended with an unexpected error here. Click to see why.";
                    marker.classList.add("erroredTestMarker");
                    marker.classList.add("CodeMirror-linenumber");
                    
                    $(marker).on("click", function(){
                      thisContainer.on("animationend", function(){this.style.animation = "";});
                      thisContainer[0].style.animation = "emphasize-error 1s 1";
                      reason[0].scrollIntoView(true);
                      reason.trigger('toggleHighlight');
                    });
                    
                    var gutterHandle = editor.setGutterMarker(cmloc.start.line, "CodeMirror-linenumbers", marker);
                    var onChange = function(cm, change) {
                      var gutterLine = editor.getLineNumber(gutterHandle);
                      var markerLoc  = textMarker.find();
                      if(markerLoc === undefined)
                        return;
                      var markerLine = markerLoc.from.line;
                      marker.innerHTML = markerLine + 1;
                      if(gutterLine != markerLine) {
                        editor.setGutterMarker(gutterHandle, "CodeMirror-linenumbers", null);
                        editor.refresh();
                        gutterHandle = cm.setGutterMarker(markerLine, "CodeMirror-linenumbers", marker);
                      }
                    };
                    editor.on("change",onChange);
                  }
                  return runtime.nothing;
                }, "about to drawError");
              } else { // !thisCheckBlockErrored
                var message = 
                  // Only one test in block; it passes.
                  (testsInBlock == 1 && testsPassingInBlock == 1)
                  ? "The test in this block passed."
                // Only one test in block; it fails
                  : (testsInBlock == 1 && testsPassingInBlock == 0)
                  ? "The test in this block failed."
                  : (testsInBlock == testsPassingInBlock)
                //  More than one test; all pass.
                  ? "All " + testsInBlock + " tests in this block passed."
                //  More than one test; some pass
                  : testsPassingInBlock + " out of " + testsInBlock + " tests passed in this block.";
                summary.text(message);
                return runtime.nothing;
              }
            }, function(_) {
              
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
              
              name.after(summary);
              checkContainer.append(eachContainer);

              return runtime.nothing;
            }, "thisCheckBlockErrored check");
          }, "each: testResult");
        }), 0, checkResultsArr.length);
      }, function(_) {
      
        var onChange = 
          function(cm, change){
            cm.off("change", onChange);
            if(checkContainer.hasClass("stale"))
              return;
            checkContainer.addClass("stale");
            var staleWarning = 
              $('<div>').addClass('check-block').addClass('stale-warning')
                .text('This test report is stale and may be inaccurate. Run your code again for an up-to-date report.');
            checkContainer.prepend(staleWarning);
            // This is a little jarring.
            // staleWarning[0].scrollIntoView(true);
          };
        editors["definitions://"].on("change", onChange);
        
      
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
            container.append(checkContainer.append(summary));
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
          container.append(checkContainer.append(summary));
        }
      }, "drawCheckResults: each: checkResult");
    }
    
    return runtime.makeJSModuleReturn({
      drawCheckResults: drawCheckResults
    });
  }
})
