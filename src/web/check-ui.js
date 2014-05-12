define(["js/ffi-helpers", "trove/srcloc"], function(ffiLib, srclocLib) {

 function drawCheckResults(container, editor, runtime, checkResults) {
   var ffi = ffiLib(runtime, runtime.namespace);
   var cases = ffi.cases;
   var get = runtime.getField;
   var inspect = runtime.getFields;

   var checkResultsArr = ffi.toArray(checkResults);

   runtime.loadModules(runtime.namespace, [srclocLib], function(srcloc) {

     // Produces a Code Mirror position from a Pyret location.  Note
     // that Code Mirror seems to use zero-based lines.
     function cmPosFromSrcloc(s) {
       return cases(get(srcloc, "Srcloc"), "Srcloc", s, {
         "builtin": function(_) { 
   throw new Error("Cannot get CodeMirror loc from builtin location"); 
 },

         "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
           var extraCharForZeroWidthLocs = endCh === startCh ? 1 : 0;
           return {
             start: { line: startL - 1, ch: startC },
             end: { line: endL - 1, ch: endC + extraCharForZeroWidthLocs }
           };
         }
       });
     }

     
     function highlightSrcloc(s, withMarker) {
       return runtime.safeCall(function() {
 return cases(get(srcloc, "Srcloc"), "Srcloc", s, {
           "builtin": function(_) { /* no-op */ },
           "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
             var cmLoc = cmPosFromSrcloc(s);
             var marker = editor.markText(
cmLoc.start,
cmLoc.end,
{ className: "check-highlight" });
             return marker;
           }
 })
}, withMarker);
     }

     function mapK(inList, f, k, outList) {
       if (inList.length === 0) { k(outList || []); }
       else {
         var newInList = inList.slice(1, inList.length);
         f(inList[0], function(v) {
           mapK(newInList, f, k, (outList || []).concat([v]))
         });
       }
     }

     function hoverLocs(elt, locs) {
       // CLICK to *cycle* through locations
       var marks = [];
       elt.on("mouseenter", function() {
         var curLoc = locs[locIndex];
         var view = editor.getScrollInfo();
         cases(get(srcloc, "Srcloc"), "Srcloc", curLoc, {
           "builtin": function(_) { },
           "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
             var charCh = editor.charCoords(cmPosFromSrcloc(curLoc).start, "local");
             if (view.top > charCh.top) {
               jQuery(".warning-upper").fadeIn("fast");
             } else if (view.top + view.clientHeight < charCh.bottom) {
               jQuery(".warning-lower").fadeIn("fast");
             }
           }
         });
         mapK(locs, highlightSrcloc, function(ms) {
           marks = marks.concat(ms);
         });
       });
       elt.on("mouseleave", function() {
         jQuery(".warning-upper").fadeOut("fast");
         jQuery(".warning-lower").fadeOut("fast");
         marks.forEach(function(m) { return m && m.clear(); })
         marks = [];
       });
       var locIndex = 0;
       if (locs.filter(function(e) { return runtime.isObject(e) && get(srcloc, "is-srcloc").app(e); }).length > 0) {
         elt.on("click", function() {
           jQuery(".warning-upper").fadeOut("fast");
           jQuery(".warning-lower").fadeOut("fast");
           function gotoNextLoc() {
             var curLoc = locs[locIndex];
             function rotateLoc() { locIndex = (locIndex + 1) % locs.length; }
             
             return cases(get(srcloc, "Srcloc"), "Srcloc", curLoc, {
               "builtin": function(_) { rotateLoc(); gotoNextLoc(); },
               "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
                 editor.scrollIntoView(cmPosFromSrcloc(curLoc).start, 100);
                 rotateLoc();
               }
             });
           }
           gotoNextLoc();
         });
       }
     }

     function addPreToDom(cssClass, txt, loc) {
var dom = $("<pre>").addClass(cssClass).text(txt);
hoverLocs(dom, [loc]);
container.append(dom);
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

addPreToDom("replOutput", "Check block: " + name, get(cr, "loc"));

var trArr = ffi.toArray(get(cr, "test-results"));
     
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

addPreToDom("replOutput", "  test (" + get(tr, "code") + "): failed, reason:", get(tr, "loc"));
addPreToDom("replOutputReason", returnVal.result, get(tr, "loc"));

     });
 } else {

   // If you're here, the test passed, all is well.
   checkPassed = checkPassed + 1;
   checkPassedAll = checkPassedAll + 1;
   addPreToDom("replOutput", "  test (" + get(tr, "code") + "): ok", get(tr, "loc"));
 }
});

// Print a message about the total passed in this check block.

if (checkTotal > 1) {
 addPreToDom("replOutput", checkPassed + "/" + checkTotal + " tests passed in check block: " + name, get(cr, "loc"));

} else if (checkTotal == 1 && checkPassed == 1) {
 addPreToDom("replOutput", "Your test passed.", get(cr, "loc"));
} else if (checkTotal == 1 && checkPassed == 0) {
 addPreToDom("replOutput", "Your test failed.", get(cr, "loc"));
}

     });

     // If there was more than one check block, print a message about
     // the grand total of checks and passes.

     if (checkBlockCount > 1) {

       var outerDom = $("<pre>").addClass("replOutput").text(checkPassedAll + "/" + checkTotalAll + " tests passed in all check blocks");
       container.append(outerDom);

     }

     if (checkPassedAll == checkTotalAll) {
       if (checkTotalAll > 0) {
	 if (checkTotalAll == 1) {
	   var outerDom = $("<pre>").addClass("replOutput").text("Looks shipshape, mate!");
	 } else if (checkTotalAll == 2) {
	   var outerDom = $("<pre>").addClass("replOutput").text("Looks shipshape, both tests passed, mate!");
	 } else {
	   var outerDom = $("<pre>").addClass("replOutput").text("Looks shipshape, all " + checkTotalAll + " tests passed, mate!");
	 }
       }
       container.append(outerDom);
     }

   });

 }

 return {
   drawCheckResults: drawCheckResults
 }

});
