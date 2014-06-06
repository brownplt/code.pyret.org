define(["js/ffi-helpers", "trove/srcloc", "./output-ui.js"], function(ffiLib, srclocLib, outputUI) {

 function drawCheckResults(container, editors, runtime, checkResults) {
   var ffi = ffiLib(runtime, runtime.namespace);
   var cases = ffi.cases;
   var get = runtime.getField;
   var inspect = runtime.getFields;

   var checkResultsArr = ffi.toArray(checkResults);

   runtime.loadModules(runtime.namespace, [srclocLib], function(srcloc) {

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

       if (checkTotal > 1) {
         if (checkPassed == checkTotal) {
           addPreToDom("replOutputPassed", checkPassed + "/" + checkTotal + " tests passed in check block: " + name, get(cr, "loc"));
         } else {
           addPreToDom("replOutput", checkPassed + "/" + checkTotal + " tests passed in check block: " + name, get(cr, "loc"));
         }

       } else if (checkTotal == 1 && checkPassed == 1) {
         addPreToDom("replOutputPassed", "Your test passed.", get(cr, "loc"));
       } else if (checkTotal == 1 && checkPassed == 0) {
         addPreToDom("replOutputFailed", "Your test failed.", get(cr, "loc"));
       }
       
     });

     // If there was more than one check block, print a message about
     // the grand total of checks and passes.

     if (checkPassedAll == checkTotalAll) {
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
