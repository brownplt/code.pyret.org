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
    var CH = runtime.getField(checker, "values");

    function isTestResult(val) { return runtime.unwrap(runtime.getField(CH, "TestResult").app(val)); }
    function isTestSuccess(val) { return runtime.unwrap(runtime.getField(CH, "is-success").app(val)); }

    // NOTE: MUST BE CALLED WHILE RUNNING ON runtime's STACK
    function drawCheckResults(container, editors, runtime, checkResults, contextFactory) {
      var ffi = runtime.ffi;
      var cases = ffi.cases;
      var get = runtime.getField;

      function cssKey(loc) {
        return outputUI.cmlocToCSSClass(
                outputUI.cmPosFromSrcloc(runtime, srcloc, loc));
      }

      function batchOperation(thunk) {
        return Object.keys(editors)
          .map(function(editor){ return editors[editor];})
          .reduce(
            function(acc, editor) {
              return function(){return editor.operation(acc);};
            }, thunk)();
      }

      var checkBlocks = ffi.toArray(checkResults).reverse();

      if (checkBlocks.length === 0)
        return;

      var checkBlockTestReports  = [];
      var checkBlockErrorReports = [];

      var checkTotalAll = 0;
      var checkPassedAll = 0;

      var currentlyExpandedBlock = undefined;
      var resultsContainer = $("<div>").addClass("test-results");
      var contextManager = document.getElementById("main").dataset;

      /* First, we generate a 'skeleton' into which the actual
       * test result reasons can be rendered. The `batchOperation` here
       * batches the `textMarker` calls used for check block and test
       * title links.                                                 */
      batchOperation(
        function() {
          return checkBlocks.map(
            function(checkBlock){
              var thisCheckBlockErrored =
                get(option, "is-some").app(get(checkBlock, "maybe-err"));

              var name =
                $("<a>")
                  .text(get(checkBlock, "name"))
                  .addClass("hinted-highlight")
                  .addClass(cssKey(get(checkBlock, "loc")));

              var checkBlockReport =
                $("<div>")
                  .addClass("check-block")
                  .append(
                    $("<header>")
                      .addClass("check-block-header")
                      .append(name));
              var checkBlockTests =
                $("<div>").addClass("check-block-tests");

              var tests = ffi.toArray(get(checkBlock, "test-results")).reverse();

              checkBlockReport.on("click", ".check-block-header",
                function(e) {
                  if (checkBlockReport.hasClass("expanded")
                   && currentlyExpandedBlock === checkBlockReport) {
                    checkBlockReport.removeClass("expanded");
                    contextManager.highlights = "";
                    currentlyExpandedBlock = undefined;
                  } else {
                    if (currentlyExpandedBlock !== undefined)
                      currentlyExpandedBlock.removeClass("expanded");
                    currentlyExpandedBlock = checkBlockReport;
                    checkBlockReport.addClass("expanded");
                  }
                });

              var testsInBlock        = 0,
                  testsPassingInBlock = 0;

              function makeTitle(loc, passed) {
                var testName =
                  $("<a>")
                    .text("Test " + testsInBlock)
                    .addClass("hinted-highlight");

                var header =
                  $("<header>")
                    .append(testName)
                    .append(": " + (passed ? "Passed" : "Failed"))
                    .attr('title',"Click to scroll editor to test.");

                var source = get(get(checkBlock, "loc"), "source");
                if(editors.hasOwnProperty(source)){
                  var handle = editors[source].markText(
                    { line: get(get(checkBlock, "loc"), "start-line") - 1,
                      ch:   get(get(checkBlock, "loc"), "start-column") },
                    { line: get(get(checkBlock, "loc"), "end-line") - 1,
                      ch:   get(get(checkBlock, "loc"), "end-column") },
                    { inclusiveLeft:false,
                      inclusiveRight:false,
                      type:"bookmark" });
                  header.on("click",
                    function(e){
                      if(source === "definitions://") {
                        editors[source].scrollIntoView(cmLoc.start, 100);
                      } else if (source.indexOf("interactions") != -1) {
                        editors[source].getWrapperElement().scrollIntoView(true);
                      }
                    });
                }

                return header;
              }

              checkBlockTestReports.push(
                { elems:
                    tests.map(
                      function(test){
                        checkTotalAll++;
                        testsInBlock++;
                        checkPassedAll += isTestSuccess(test);
                        testsPassingInBlock += isTestSuccess(test);
                        var reason =
                          $("<div>").addClass("test-reason");
                        var wrapper =
                          $("<div>")
                          .addClass("check-block-test")
                          .append(makeTitle(get(test, "loc"), isTestSuccess(test)))
                          .addClass(isTestSuccess(test) ? "passing-test" : "failing-test")
                          .append(reason);
                        wrapper.appendTo(checkBlockTests);
                        return {wrapper: wrapper,
                                reason : reason };
                      }),
                  tests: tests,
                  block: checkBlockReport });

              if (thisCheckBlockErrored) {
                var checkBlockError = $("<div>").addClass("check-block-error");
                checkBlockReport
                  .append(
                    $("<span>")
                      .addClass("check-block-summary")
                      .text("An unexpected error halted the check-block before Pyret was finished with it. Some tests may not have run."))
                  .append(
                    checkBlockTests
                      .prepend(
                        $("<span>")
                          .addClass("check-block-summary")
                          .text("Before the unexpected error, "
                              + testsInBlock + ((testsInBlock === 0) ? " tests " : " test ")
                              + "in this block ran"
                              + ((testsInBlock > 0) ? (" (" + testsPassingInBlock + " passed):")
                                                    : "."))))
                  .append(checkBlockError);
                checkBlockErrorReports.push(
                  { elem:  checkBlockError,
                    error: get(get(checkBlock, "maybe-err"),"value").val,
                    block: checkBlockReport });
              } else {
                checkBlockReport
                  .append(
                    $("<span>")
                      .addClass("check-block-summary")
                      .text(
                        // Only one test in block; it passes.
                        (testsInBlock == 1 && testsPassingInBlock == 1)
                        ? "The test in this block passed."
                        // Only one test in block; it fails
                        : (testsInBlock == 1 && testsPassingInBlock == 0)
                        ? "The test in this block failed."
                        : (testsInBlock == 0)
                        //  Huh, a block with no tests?
                        ? "There were no tests in this block!"
                        : (testsInBlock == testsPassingInBlock)
                        //  More than one test; all pass.
                        ? "All " + testsInBlock + " tests in this block passed."
                        //  More than one test; some pass
                        : testsPassingInBlock + " out of " + testsInBlock + " tests passed in this block."))
                  .append(checkBlockTests);
              }

              checkBlockReport.addClass(
                  thisCheckBlockErrored               ? "check-block-errored"
                : tests.length == testsPassingInBlock ? "check-block-success"
                :                                       "check-block-failed");

              var source = get(get(checkBlock, "loc"), "source");
              if(editors.hasOwnProperty(source)){
                var handle = editors[source].markText(
                  { line: get(get(checkBlock, "loc"), "start-line") - 1,
                    ch:   get(get(checkBlock, "loc"), "start-column") },
                  { line: get(get(checkBlock, "loc"), "end-line") - 1,
                    ch:   get(get(checkBlock, "loc"), "end-column") },
                  { inclusiveLeft:false,
                    inclusiveRight:false,
                    type:"bookmark" });
                name.on("click",
                  function(e){
                    if(source === "definitions://") {
                      editors[source].scrollIntoView(cmLoc.start, 100);
                    } else if (source.indexOf("interactions") != -1) {
                      editors[source].getWrapperElement().scrollIntoView(true);
                    }
                  });
              }

              return checkBlockReport;
            });
        })
        .forEach(
          function(checkBlock){
            /* Throw the skeleton onto the DOM */
            resultsContainer.append(checkBlock);
          });

      var checkBlockCount = checkBlocks.length;
      var checkBlocksErrored = checkBlockErrorReports.length;

      /* Next, render the summary */

      var onChange =
        function(cm, change){
          cm.off("change", onChange);
          if(resultsContainer.hasClass("stale"))
            return;
          resultsContainer.addClass("stale");
          var staleWarning =
            $('<div>').addClass('check-block').addClass('stale-warning')
              .text('This test report is stale and may be inaccurate. Run your code again for an up-to-date report.');
          resultsContainer.prepend(staleWarning);
          // This is a little jarring.
          // staleWarning[0].scrollIntoView(true);
        };
      editors["definitions://"].on("change", onChange);


      var summary = $("<div>").addClass("check-block testing-summary");
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

      /* At this point, we've gone as far as we can without calling
       * `render-fancy-reason`, and we have summaries for each block, as
       * well as the summary of overall test outcomes. By adding it to
       * the `container`, this skeleton becomes visible on the page.  */
      container.append(resultsContainer.prepend(summary));

      return runtime.safeCall(function(){
        /* First, we'll render errors that caused check-blocks to exit
         * unexpectedly, since those are displayed without further user
         * interaction (unlike typical test results).                 */
          return runtime.eachLoop(runtime.makeFunction(function(i){
            var checkBlockErrorReport = checkBlockErrorReports[i];
            var error = checkBlockErrorReport.error,
                block = checkBlockErrorReport.block,
                elem  = checkBlockErrorReport.elem;
            return runtime.safeCall(
              function(){
                return errorUI.drawError(
                  elem,
                  editors,
                  runtime,
                  error,
                  contextFactory);
              },
              function(_){
                elem.find(".cm-future-snippet")
                  .each(function(){this.cmrefresh();});
                var probableErrorLocation =
                  outputUI.getLastUserLocation(
                    runtime,
                    srcloc,
                    editors,
                    error.pyretStack,
                    0,
                    true);
                if (probableErrorLocation !== undefined
                 && runtime.unwrap(get(srcloc, "is-srcloc").app(probableErrorLocation))
                 && editors.hasOwnProperty(get(probableErrorLocation, "source"))) {
                  var editor = editors[get(probableErrorLocation, "source")];

                  var handle = editor.markText(
                      { line: get(probableErrorLocation, "start-line") - 1,
                        ch:   get(probableErrorLocation, "start-column") },
                      { line: get(probableErrorLocation, "end-line") - 1,
                        ch:   get(probableErrorLocation, "end-column") },
                      { inclusiveLeft:false,
                        inclusiveRight:false});

                  var marker =
                    $("<div>")
                      .html("&nbsp;")
                      .addClass("errored-test-marker")
                      .on("click",
                        function(){
                          block[0].style.animation = "emphasize-error 1s 1";
                          block.on("animationend", function(){this.style.animation = "";});
                          elem[0].scrollIntoView(true);
                          elem.children().trigger('toggleHighlight');
                        });

                  var gutter =
                    editor.setGutterMarker(
                      get(probableErrorLocation, "start-line") - 1,
                      "test-marker-gutter",
                      marker[0]);

                  handle.on("hide",
                    function(){
                      marker.hide();
                    });

                  handle.on("unhide",
                    function(){
                      marker.show();
                    });
                } else {
                  console.log("That's unfortunate, we cannot show where this check-block ended in an error.");
                }
              });
            }), 0, checkBlockErrorReports.length);
        },
        function(_){
          /* Next, we'll render the individual tests reports of each
           * check block, and add them to the skeleton as they become
           * available.                                               */
          return runtime.safeCall(function(){
            return runtime.eachLoop(runtime.makeFunction(function(i){
              return batchOperation(function(){
                var checkBlockTestReport = checkBlockTestReports[i];
                var elems = checkBlockTestReport.elems,
                    tests = checkBlockTestReport.tests,
                    block = checkBlockTestReport.block,
                    neverOpened = true;
                runtime.eachLoop(runtime.makeFunction(function(j){
                  var test    = tests[j],
                      reason  = elems[j].reason,
                      wrapper = elems[j].wrapper,
                      context = contextFactory();
                  if (!isTestSuccess(test)) {
                    var maybeLocToAST   = outputUI.makeMaybeLocToAST(runtime, editors, srcloc);
                    var srclocAvaliable = outputUI.makeSrclocAvaliable(runtime, editors, srcloc);
                    var maybeStackLoc   = (runtime.hasField(test, "actual-exn"))
                      ? (outputUI.makeMaybeStackLoc(runtime, editors, srcloc, get(test, "actual-exn").val.pyretStack))
                      : (runtime.makeFunction(function(n, userFramesOnly) {
                        return runtime.ffi.makeNone();
                      }));
                    runtime.pauseStack(function(restarter) {
                      runtime.runThunk(
                        function() {
                          return get(test, "render-fancy-reason").app(maybeStackLoc, srclocAvaliable, maybeLocToAST);
                        },
                        function(errorDisp) {
                          if (runtime.isSuccessResult(errorDisp)) {
                            runtime.runThunk(function() {
                              return runtime.safeCall(function() {
                                  return outputUI.renderErrorDisplay(editors, runtime, errorDisp.result, [], context);
                                }, function(dom) {
                                  wrapper.on('click', function(){
                                    dom.trigger('toggleHighlight');
                                    wrapper.toggleClass("highlights-active");
                                  });
                                  var loc = get(test, "loc");
                                  if (editors.hasOwnProperty(get(loc, "source"))) {
                                    var editor = editors[get(loc, "source")];

                                    var handle = editor.markText(
                                        { line: get(loc, "start-line") - 1,
                                          ch:   get(loc, "start-column") },
                                        { line: get(loc, "end-line") - 1,
                                          ch:   get(loc, "end-column") },
                                        { inclusiveLeft:false,
                                          inclusiveRight:false});

                                    var marker =
                                      $("<div>")
                                        .html("&nbsp;")
                                        .addClass("failed-test-marker")
                                        .on("click",
                                          function(){
                                            if(!block.hasClass("expanded")){
                                              if (currentlyExpandedBlock !== undefined)
                                                currentlyExpandedBlock.removeClass("expanded");
                                              currentlyExpandedBlock = block;
                                              block.addClass("expanded");
                                            }
                                            if(neverOpened) {
                                              block.find(".cm-future-snippet").each(
                                                function(){this.cmrefresh();});
                                              neverOpened = false;
                                            }
                                            dom[0].style.animation = "emphasize-error 1s 1";
                                            dom.on("animationend", function(){this.style.animation = "";});
                                            dom[0].scrollIntoView(true);
                                            dom.trigger('toggleHighlight');
                                            wrapper.toggleClass("highlights-active");
                                          });

                                    var gutter =
                                      editor.setGutterMarker(
                                        get(loc, "start-line") - 1,
                                        "test-marker-gutter",
                                        marker[0]);

                                    handle.on("hide",
                                      function(){
                                        marker.hide();
                                      });

                                    handle.on("unhide",
                                      function(){
                                        marker.show();
                                      });
                                  }
                                  reason.replaceWith(dom.addClass("test-reason"));
                                });},
                            function(reasonResult) {
                              if(j === 0) {
                                block.on("click", ".check-block-header",
                                  function(e) {
                                    if(block.hasClass("expanded"))
                                      wrapper.trigger('click');
                                  });
                              }
                              block.one("click", ".check-block-header",
                                function(e) {
                                  if (currentlyExpandedBlock === block && neverOpened){
                                    block.find(".cm-future-snippet").each(
                                      function(){this.cmrefresh();});
                                    neverOpened = false;
                                  }
                                });
                              restarter.resume(runtime.nothing);
                            });
                          } else {
                            console.error("ARRRGGH BAD THINGS HAPPENED");
                            restarter.resume(runtime.nothing);
                          }
                        })});
                  } else {
                    var loc = get(test,"loc");
                    var snippet =
                      outputUI.snippet(editors,
                        outputUI.cmPosFromSrcloc(runtime, srcloc, loc), srcloc, loc);
                    var snippetWrapper = snippet.wrapper;
                    reason.replaceWith(snippetWrapper);
                    block.one("click", ".check-block-header",
                      function(e) {
                        snippetWrapper[0].cmrefresh();
                      });
                  }}), 0, tests.length);
              });}), 0, checkBlockTestReports.length)},
              function(_){
                // all done!
              });
          });
      }

      return runtime.makeJSModuleReturn({
        drawCheckResults: drawCheckResults
      });
    }
})
