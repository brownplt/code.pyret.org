define(["js/ffi-helpers", "trove/option", "trove/srcloc", "./output-ui.js", "./error-ui.js"], function(ffiLib, optionLib, srclocLib, outputUI, errorUI) {

 function drawCheckResults(container, editors, runtime, checkResults) {
   var ffi = ffiLib(runtime, runtime.namespace);
   var cases = ffi.cases;
   var get = runtime.getField;
   var inspect = runtime.getFields;

   var checkResultsArr = ffi.toArray(checkResults);

   runtime.loadModules(runtime.namespace, [optionLib, srclocLib], function(option, srcloc) {

     var checkContainer = $("<div>");
     function addPreToDom(cssClass, txt, loc) {
       var dom = $("<pre>").addClass(cssClass).text(txt);
       outputUI.hoverLocs(editors, runtime, srcloc, dom, [loc], "check-highlight");
       checkContainer.append(dom);
     }

     // These counters keep cumulative statistics for all the check blocks. 
     var checkTotalAll = 0;
     var checkPassedAll = 0;
     var checkBlockCount = checkResultsArr.length;
     var checkBlocksErrored = 0;

     // Sort through all the check blocks.
     checkResultsArr.reverse().forEach(function(cr) {

       // Counters for cumulative stats within a check block.
       var checkTotal = 0;
       var checkPassed = 0;

       var name = get(cr, "name");
       var trArr = ffi.toArray(get(cr, "test-results"));

       addPreToDom("replOutput", "Check block: " + name, get(cr, "loc"));

       // Sort through the collection of test results within a check
       // block.
       trArr.reverse().forEach(function(tr) {

         checkTotal = checkTotal + 1;
         checkTotalAll = checkTotalAll + 1;

 
         // Success for a test is signaled by the *absence* of a "reason" field.
         if (runtime.hasField(tr, "reason")) {

           // The "reason" field is a function that returns a text
           // string to be displayed to the user.  We pack it in its
           // own <pre> object so it can be colored and indented for
           // contrast.
           runtime.runThunk(
             function() { return get(tr, "reason").app(); },
             function(returnVal) { 

               addPreToDom("replOutputFailed", "  test (" + get(tr, "code") + "): failed, reason:", get(tr, "loc"));
               addPreToDom("replOutputReason", returnVal.result, get(tr, "loc"));

             });
         } else {

           // If you're here, the test passed, all is well.
           checkPassed = checkPassed + 1;
           checkPassedAll = checkPassedAll + 1;

           addPreToDom("replOutputPassed", "  test (" + get(tr, "code") + "): ok", get(tr, "loc"));
         }
       });

// Print a message about the total passed in this check block.

     
       var thisCheckBlockErrored = false;
       // Necessary check because this field was not present in older versions
       if (runtime.hasField(cr, "maybe-err")) {
         var error = get(cr, "maybe-err");
         if(get(option, "is-some").app(error)) {
           thisCheckBlockErrored = true;
           checkBlocksErrored = checkBlocksErrored + 1;
           addPreToDom("replOutputFailed", "  Check block " + name + " ended in an error (all tests may not have run):", get(cr, "loc"));
           var errorDiv = $("<div>").addClass("check-block-error");
           checkContainer.append(errorDiv);
           checkContainer.append("<br/>");
           var errorDom = errorUI.drawError(errorDiv, editors, runtime, get(error, "value").val);
         }
       }

       if(!thisCheckBlockErrored) {
         if (checkTotal > 1) {
           if (checkPassed == checkTotal) {
             addPreToDom("replOutputPassed", "  " + checkPassed + "/" + checkTotal + " tests passed in check block: " + name, get(cr, "loc"));
           } else {
             addPreToDom("replOutput", "  " + checkPassed + "/" + checkTotal + " tests passed in check block: " + name, get(cr, "loc"));
           }

         } else if (checkTotal == 1 && checkPassed == 1) {
           addPreToDom("replOutputPassed", "  The test passed.", get(cr, "loc"));
         } else if (checkTotal == 1 && checkPassed == 0) {
           addPreToDom("replOutputFailed", "  The test failed.", get(cr, "loc"));
         }
       }

       
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
       container.append(checkContainer); 
       if (checkBlockCount > 1) {

         var outerDom = $("<pre>").addClass("replOutput").text(checkPassedAll + "/" + checkTotalAll + " tests passed in all check blocks");
         container.append(outerDom);

       }
     }

   });

 }

 return {
   drawCheckResults: drawCheckResults
 }

});
