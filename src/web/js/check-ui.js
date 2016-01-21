define(["js/ffi-helpers", "trove/option", "trove/srcloc", "trove/error-display", "./output-ui.js", "./error-ui.js", "trove/parse-pyret", "trove/ast"], function(ffiLib, optionLib, srclocLib, errordisplayLib, outputUI, errorUI, parsePyret, astLib) {

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
       var testContainer = $("<div>").addClass("check-block-collapsible");
       
       eachContainer.attr("id", "check-" + outputUI.cssSanitize(runtime.getField(get(cr,"loc"),"format").app(true)));
       
       function addPreToDom(cssClass, txt, loc) {
         var dom = $("<pre>").addClass(cssClass).text(txt);
         eachContainer.append(dom);
       }
       
       function editorMessage(cssClass, loc, msg) {
         var cmloc = outputUI.cmPosFromSrcloc(runtime, srcloc, loc);
         editors[cmloc.source].widgets.push(
           editors[cmloc.source].addLineWidget(cmloc.start.line,
             function(){ 
               var marker = document.createElement("div");
               var checkID = "check-" + outputUI.cssSanitize(runtime.getField(loc,"format").app(true));
               $(marker).addClass("editor-check-block-message").addClass(cssClass)
                 .text(msg)
                 .on("click", function(){
                   var errorel = document.getElementById(checkID)
                   $(errorel).toggleClass("emphasize-error").on("animationend", function(){
                    $(this).removeClass("emphasize-error");});
                   errorel.scrollIntoView(true);
                 });
               return marker;
             }(),
             {coverGutter: false, noHScroll: true, above: true}));
       }

       // Counters for cumulative stats within a check block.
       var checkTotal = 0;
       var checkPassed = 0;

       var name = get(cr, "name");
       var trArr = ffi.toArray(get(cr, "test-results"));

       addPreToDom("replOutput check-title expandElement", "Check block: " + name, get(cr, "loc"));
       expandButton = $("<pre>").addClass("expandElement expandText").text("Click to Expand");
       eachContainer.append(expandButton);
       eachContainer.addClass("expandElement");

       // Sort through the collection of test results within a check
       // block.
       trArr.reverse().forEach(function(tr) {

         checkTotal = checkTotal + 1;
         checkTotalAll = checkTotalAll + 1;

         var eachTest = $("<div>").addClass("check-block-test");
         function addPreToTest(cssClass, txt, loc) {
           var dom = $("<pre>").addClass(cssClass).text(txt);
           outputUI.hoverLocs(editors, runtime, srcloc, dom, [loc], "check-highlight");
           eachTest.append(dom);
         }

         function addReasonToTest(cssClass, errorDisp, loc) {
           var dom = $("<div>").addClass(cssClass);
           outputUI.hoverLocs(editors, runtime, srcloc, dom, [loc], "check-highlight");
           eachTest.append(dom);
           dom.append(outputUI.renderErrorDisplay(editors, runtime, errorDisp, []));
         }

         if (!ffi.isTestSuccess(tr)) {
           runtime.runThunk(
             function() { return get(tr, "render-fancy-reason").app(PP, AST, outputUI.makePalette(runtime)); },
             function(out) {
               addPreToTest("replOutputFailed", 
                            "  test (" + get(tr, "code") + "): failed, reason:", get(tr, "loc"));
               if (runtime.isSuccessResult(out)) {
                 addReasonToTest("replOutputReason", out.result, get(tr, "loc"));
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
           addPreToTest("replOutputPassed", "  test (" + get(tr, "code") + "): ok", get(tr, "loc"));
         }
         testContainer.append(eachTest);
       });
       eachContainer.append(testContainer);
       $(eachContainer).on("click", ".expandElement", function(e) {
         if (testContainer.is(":visible")) {
           eachContainer.addClass("expandElement");
           expandButton.text("Click to Expand");
         }
         else {
           eachContainer.removeClass("expandElement");
           expandButton.text("Click to Collapse");
         }
         testContainer.toggle();
         e.stopPropagation();
         });

// Print a message about the total passed in this check block.


       var thisCheckBlockErrored = false;
       // Necessary check because this field was not present in older versions
       if (runtime.hasField(cr, "maybe-err")) {
         var error = get(cr, "maybe-err");
         if(get(option, "is-some").app(error)) {
           thisCheckBlockErrored = true;
           checkBlocksErrored = checkBlocksErrored + 1;
           var loc = get(cr, "loc");
           addPreToDom("replOutputFailed", "  Check block " + name + " ended in an error (all tests may not have run):", loc);

           editorMessage("editor-check-block-error", loc,
             "Unexpected error caused check-block to fail!");

           var errorDiv = $("<div>").addClass("check-block-error");
           errorDiv.hover(function(event) {event.stopPropagation();})
           eachContainer.append(errorDiv);
           eachContainer.append("<br/>");
           var errorDom = errorUI.drawError(errorDiv, editors, runtime, get(error, "value").val);
           eachContainer.addClass("check-block-errored");
         }
       }

       if(!thisCheckBlockErrored) {
         if (checkTotal > 1) {
           if (checkPassed == checkTotal) {
             addPreToDom("replOutputPassed", "  All " + checkTotal + " tests passed in check block: " + name, get(cr, "loc"));
             eachContainer.addClass("check-block-success");
             testContainer.hide();
             editorMessage("editor-check-block-success", get(cr, "loc"),
               "All tests passed!");
           } else {
            addPreToDom("replOutput", "  " + checkPassed + "/" + checkTotal + " tests passed in check block: " + name, get(cr, "loc"));
            eachContainer.addClass("check-block-failed");
            testContainer.hide();
            editorMessage("editor-check-block-failed", get(cr, "loc"),
               "" + checkPassed + "/" + checkTotal + " tests passed.");
          }
         } else if (checkTotal == 1 && checkPassed == 1) {
           addPreToDom("replOutputPassed", "  The test passed.", get(cr, "loc"));
           eachContainer.addClass("check-block-success");
           testContainer.hide();
           editorMessage("editor-check-block-success", get(cr, "loc"),
               "All tests passed!");
         } else if (checkTotal == 1 && checkPassed == 0) {
           addPreToDom("replOutputFailed", "  The test failed.", get(cr, "loc"));
          eachContainer.addClass("check-block-failed");
          testContainer.hide();
          editorMessage("editor-check-block-failed", get(cr, "loc"),
               "All tests failed!");
         }
       }
       checkContainer.append(eachContainer);
     });

     // If there was more than one check block, print a message about
     // the grand total of checks and passes.

     if (checkPassedAll == checkTotalAll && checkBlocksErrored === 0) {
       if (checkTotalAll > 0) {
         if (checkTotalAll == 1) {
           var outerDom = $("<pre>").addClass("replOutput").text("Looks shipshape, your test passed, mate!");
         } else if (checkTotalAll == 2) {
           var outerDom = $("<pre>").addClass("replOutput").text("Looks shipshape, both tests passed, mate!");
         } else {
           var outerDom = $("<pre>").addClass("replOutput").text("Looks shipshape, all " + checkTotalAll + " tests passed, mate!");
         }
       }
       container.append(outerDom);
     } else {
       if (checkBlocksErrored > 0) {
         var sumDiv = $('<div>').addClass("check-block check-block-summary");
         var count = $("<pre>").addClass("replOutput").text(checkPassedAll + " tests passed and " + (checkTotalAll - checkPassedAll) + " failed in all check blocks.");
         var however = $("<pre>").addClass("replOutputFailed").text("HOWEVER " + checkBlocksErrored + " check block(s) ended in error, so some tests may not have run.");
         var so = $("<pre>").addClass("replOutputFailed").text("Check the output above to see what errors occured.");
         sumDiv.append([count, however, so]);
         checkContainer.append(sumDiv);

       }
       else {
         if(checkBlockCount > 1) {
           var outerDom = $("<pre>").addClass("replOutput").text(checkPassedAll + "/" + checkTotalAll + " tests passed in all check blocks");
           var sumDiv = $('<div>').addClass("check-block check-block-summary");
           sumDiv.append(outerDom);
           checkContainer.append(sumDiv);
         }
       }
       container.append(checkContainer);
     }

   });

 }

 return {
   drawCheckResults: drawCheckResults
 }

});
