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
      name: "checker" },
    { "import-type": "builtin",
      name: "load-lib" }
  ],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, _, uri, outputUI, errorUI, option, srcloc, checker, loadLib) {

    option = runtime.getField(option, "values");
    srcloc = runtime.getField(srcloc, "values");
    var CH = runtime.getField(checker, "values");

    function isTestResult(val) { return runtime.unwrap(runtime.getField(CH, "TestResult").app(val)); }
    function isTestSuccess(val) { return runtime.unwrap(runtime.getField(CH, "is-success").app(val)); }

    // NOTE: MUST BE CALLED WHILE RUNNING ON runtime's STACK
    function drawCheckResults(container, documents, runtime, checkResults, result) {
      var ffi = runtime.ffi;
      var cases = ffi.cases;
      var get = runtime.getField;
      
      var noFramesMaybeStackLoc = 
        runtime.makeFunction(function(n, userFramesOnly) {
          return runtime.ffi.makeNone();
        });
      
      function makeNameHandle(text, loc, color) {
        var anchor = document.createElement("a");
        anchor.classList.add("hinted-highlight");
        anchor.textContent = text;
        var source = get(loc, "source");
        var handle = undefined;
        if (documents.has(source)) {
          handle = outputUI.Position.fromPyretSrcloc(runtime, srcloc, loc, documents);
          anchor.addEventListener("click", function(e) {
            handle.goto();
            e.stopPropagation();
          });
          anchor.addEventListener("mouseover", function(e) {
            handle.hint();
          });
          anchor.addEventListener("mouseleave", function(e) {
            outputUI.unhintLoc();
          });
        } else {
          anchor.addEventListener("click", function(e){
            window.flashMessage("This code is not in this editor.");
          });
        }
        return {anchor: anchor, handle: handle};
      }

      function makeGutterMarker(spanHandle, clickFunc) {
        var editor = spanHandle.doc.getEditor();
        
        var lineHandle = 
          editor.addLineClass(
            spanHandle.from.line,
            "gutter",
            "failed-test-marker");
            
        function onClick(cm, line, gutter) {
          if (cm.getLineNumber(lineHandle) !== line)
            return;
          clickFunc();
        }

        editor.on("gutterClick", onClick);

        function onChange(line) {
          var spanLineNo = spanHandle.from;
          if(spanLineNo === undefined)
            return;
          var lineNo = line.lineNo();
          if(lineNo === undefined)
            return;
          else if (spanLineNo.line != lineNo) {
            line.off("change", onChange);
            line.off("delete", onDelete);
            editor.removeLineClass(lineNo, "gutter", "failed-test-marker");
            lineHandle = editor.addLineClass(spanLineNo.line, "gutter", "failed-test-marker");
            lineHandle.on("change", onChange);
            lineHandle.on("delete", onDelete);
          }
        }
        
        function onDelete(line) {
          var spanLineNo = spanHandle.from;
          if (spanLineNo === undefined)
            lineHandle = undefined;
          if (lineHandle !== undefined) {
            lineHandle = editor.addLineClass(spanLineNo.line, "gutter", "failed-test-marker");
            lineHandle.on("change", onChange);
            lineHandle.on("delete", onDelete);
          }
        }
        
        lineHandle.on("change", onChange);
        lineHandle.on("delete", onDelete);

        spanHandle.on("clear", function (from, _) {
          editor.off("gutterClick", onClick);
          editor.removeLineClass(from.line, "gutter", "failed-test-marker");
        });

        spanHandle.on("hide",
          function(){
            if(lineHandle === undefined)
              return;
            editor.off("gutterClick", onClick);
            lineHandle.off("change", onChange);
            lineHandle.off("delete", onDelete);
            editor.removeLineClass(lineHandle.lineNo(), "gutter", "failed-test-marker");
            lineHandle = undefined;
          });

        spanHandle.on("unhide",
          function(){
            lineHandle = editor.addLineClass(spanHandle.from.line, "gutter", "failed-test-marker");
            editor.on("gutterClick", onClick);
            lineHandle.on("change", onChange);
            lineHandle.on("delete", onDelete);
          });

      }
      
      function makeTestHeader(testNumber, loc, isPassing) {
        var header = document.createElement("header");
        var nameHandle   = makeNameHandle("Test " + testNumber, loc,
          (isPassing ? "hsl(88, 50%, 76%)" : "hsl(45, 100%, 85%)"));
        var name   = nameHandle.anchor;
        var handle = nameHandle.handle;
        var status = document.createTextNode(isPassing ? ": Passed" : ": Failed");
        header.appendChild(name);
        header.appendChild(status);
        return {header : header, handle : handle};
      }
      
      var lastHighlighted = undefined;
      
      var FailingTestSkeleton = function () {
        function FailingTestSkeleton(test, testNumber) {
          var container = document.createElement("div");
          var headerHandle = makeTestHeader(testNumber, get(test, "loc"), false);
          var header = headerHandle.header;
          var handle = headerHandle.handle;
          var tombstone = document.createElement("div");
          container.classList.add("check-block-test");
          container.classList.add("failing-test");
          tombstone.classList.add("test-reason");
          container.appendChild(header);
          container.appendChild(tombstone);
          var thisTest = this;
          var source = get(get(test, "loc"), "source");
          if (documents.has(source)) {
            var doc = documents.get(source);
            var editor   = doc.getEditor();
            if (editor !== undefined) {
              makeGutterMarker(handle, function () {
                thisTest.block.showTest(thisTest);
              });
            }
          }
          
          if(runtime.hasField(test, "actual-exn")) {
            var stack = get(loadLib, "internal")
              .enrichStack(get(test, "actual-exn").val, get(loadLib, "internal").getModuleResultRealm(result));
            this.maybeStackLoc = outputUI.makeMaybeStackLoc(
              runtime, documents, srcloc, stack);
          } else {
            this.maybeStackLoc = noFramesMaybeStackLoc;
          }
          this.renderable = test;
          this.container = container;
          this.tombstone = tombstone;
        }

        FailingTestSkeleton.prototype.highlight = function highlight() {
          outputUI.clearEffects();
          if (this.rendering) {
            this.rendering.addClass("highlights-active");
            this.rendering.trigger("toggleHighlight");
          }
          lastHighlighted = this;
          lastHighlighted.container.classList.add("highlights-active");
          lastHighlighted.tombstone.classList.add("highlights-active");
        };

        FailingTestSkeleton.prototype.refresh = function refresh() {
          var snippets = this.tombstone.querySelectorAll(".CodeMirror");
          for (var i = 0; i < snippets.length; i++) {
            window.requestAnimationFrame(
              CodeMirror.prototype.refresh.bind(snippets[i].CodeMirror));
          }
        };

        /* Replace the placeholder for the failing test with the error rendering */


        FailingTestSkeleton.prototype.vivify = function vivify(rendering) {
          this.tombstone.appendChild(rendering[0]);
          this.rendering = rendering;
          var thisTest = this;
          this.container.addEventListener("click", function (e) {
            thisTest.highlight();
            e.stopPropagation();
          });
          if (this.block.container.classList.contains("expanded")) {
            this.refresh();
          } else {
            this.block.needRefreshing.push(this);
          }
        };

        return FailingTestSkeleton;
      }();

      var PassingTestSkeleton = function () {
        function PassingTestSkeleton(test, testNumber) {
          var loc = get(test, "loc");
          var container = document.createElement("div");
          var headerHandle = makeTestHeader(testNumber, loc, true);
          var header = headerHandle.header;
          var handle = headerHandle.handle;
          var tombstone = document.createElement("div");
          container.classList.add("check-block-test");
          container.classList.add("passing-test");
          tombstone.classList.add("test-reason");
          container.appendChild(header);
          container.appendChild(tombstone);
          this.handle = handle;
          this.container = container;
          this.tombstone = tombstone;
        }

        PassingTestSkeleton.prototype.highlight = function highlight() {
          return;
        };

        /* Replace the placeholder for the failing test with the error rendering */
        PassingTestSkeleton.prototype.vivify = function vivify() {
          var snippet  = new outputUI.Snippet(this.handle);
          this.tombstone.appendChild(snippet.container);
          if (this.block.container.classList.contains("expanded")) {
            snippet.editor.refresh();
          } else {
            this.block.needRefreshing.push(snippet.editor);
          }
        };

        return PassingTestSkeleton;
      }();

      var expandedCheckBlock = undefined;

      var CheckBlockSkeleton = function () {
        function CheckBlockSkeleton(name, loc, keywordCheck, tests, error) {
          var _this = this;

          var container = document.createElement("div");
          var testList = document.createElement("div");
          var testFrag = document.createDocumentFragment();
          var header = document.createElement("header");
          var summary = document.createElement("span");

          for (var i = 0; i < tests.skeletons.length; i++) {
            var test = tests.skeletons[i];
            test.block = this;
            testFrag.appendChild(test.container);
          }

          if (error !== undefined) {
            summary.textContent =
              "An unexpected error halted the " +
              (keywordCheck ? "check" : "examples") + "-block before Pyret was finished with it. "
              + "Some tests may not have run.";
            var errorTestsSummary = document.createTextNode("Before the unexpected error, " + tests.executed + (tests.executed === 0 ? " tests " : " test ") + "in this block ran" + (tests.executed > 0 ? " (" + tests.passing + " passed):" : "."));
            testList.appendChild(errorTestsSummary);
          } else {
            summary.textContent = tests.executed == 1 && tests.passing == 1 ? "The test in this block passed."
            // Only one test in block; it fails
            : tests.executed == 1 && tests.passing == 0 ? "The test in this block failed." : tests.executed == 0 ?
            //  Huh, a block with no tests?
            "There were no tests in this block!" : tests.executed == tests.passing ?
            //  More than one test; all pass.
            "All " + tests.executed + " tests in this block passed."
            //  More than one test; some pass
            : tests.passing + " out of " + tests.executed + " tests passed in this block.";
          }

          testList.classList.add("check-block-tests");
          summary.classList.add("check-block-summary");

          header.classList.add("check-block-header");
          header.title = "Click to view test results.";
          header.appendChild(makeNameHandle(name, loc, error !== undefined ? "hsl(0, 100%, 85%)" : tests.executed == tests.passing ? "hsl(88, 50%, 76%)" : "hsl(45, 100%, 85%)").anchor);

          container.classList.add("check-block");
          container.classList.add(error !== undefined ? "check-block-errored" : tests.executed == tests.passing ? "check-block-success" : "check-block-failed");
          container.appendChild(header);
          testList.appendChild(testFrag);
          container.appendChild(summary);
          container.appendChild(testList);

          var tombstone = undefined;
          if (error !== undefined) {
            tombstone = document.createElement("div"); 
            tombstone.classList.add("check-block-error"); 
            tombstone.addEventListener("click", function (e) {
              _this.highlight();
            });
            this.renderable = error.exn;
            container.appendChild(tombstone);
            var richStack = get(loadLib, "internal")
              .enrichStack(error, get(loadLib, "internal").getModuleResultRealm(result)); 
            this.maybeStackLoc = outputUI.makeMaybeStackLoc(runtime, documents, srcloc, richStack);
            this.pyretStack = richStack;
          }

          header.addEventListener("click", function (e) {
            if (this.container.classList.contains("expanded"))
              this.hideTests();
            else
              this.showTests();
          }.bind(this));

          summary.addEventListener("click", function (e) {
            if (this.container.classList.contains("expanded"))
              this.hideTests();
            else
              this.showTests();
          }.bind(this));

          this.needRefreshing = new Array();
          this.container = container;
          this.tombstone = tombstone;
        }

        CheckBlockSkeleton.prototype.highlight = function highlight() {
          if (this.tombstone === undefined) 
            return;
          outputUI.clearEffects();
          lastHighlighted = this;
          lastHighlighted.tombstone.classList.add("highlights-active");
          if(this.rendering) {
            this.rendering.trigger('toggleHighlight');
            this.rendering.addClass('highlights-active');
          }
        };

        CheckBlockSkeleton.prototype.refreshSnippets = function refreshSnippets() {
          for (var i = 0; i < this.needRefreshing.length; i++) {
            this.needRefreshing[i].refresh();
          }
          this.needRefreshing = new Array();
        };

        CheckBlockSkeleton.prototype.showTest = function showTest(test) {
          if (expandedCheckBlock !== undefined) 
            expandedCheckBlock.hideTests();
          expandedCheckBlock = this;
          this.container.classList.add("expanded");
          this.refreshSnippets();
          test.container.scrollIntoView(true);
          test.highlight();
        };

        CheckBlockSkeleton.prototype.showTests = function showTests() {
          if (expandedCheckBlock !== undefined) 
            expandedCheckBlock.hideTests();
          expandedCheckBlock = this;
          this.container.classList.add("expanded");
          this.refreshSnippets();
        };

        CheckBlockSkeleton.prototype.hideTests = function hideTests() {
          this.container.classList.remove("expanded");
          var innerHighlights = $(this.container).find(".highlights-active");
          if(innerHighlights.length > 0)
            outputUI.clearEffects();
          outputUI.clearEffects();
          lastHighlighted = undefined;
        };
        
        /* Replace the placeholder for the error with the error rendering */
        CheckBlockSkeleton.prototype.vivify = function vivify(rendering) {
          if (this.tombstone === undefined) return;
          this.rendering = rendering;
          rendering[0].classList.add("compile-error");
          rendering[0].addEventListener("click", this.highlight);
          this.tombstone.appendChild(rendering[0]);
          var snippets = rendering.find(".CodeMirror");
          for (var i = 0; i < snippets.length; i++) {
            window.requestAnimationFrame(
              CodeMirror.prototype.refresh.bind(snippets[i].CodeMirror));
          }
        };

        return CheckBlockSkeleton;
      }();
    
      var checkBlocks = ffi.toArray(checkResults);

      if (checkBlocks.length === 0)
        return;
        
      var checkErroredSkeletons = new Array();
      var testsFailedSkeletons  = new Array();
      var testsPassedSkeletons  = new Array();

      var keywordCheck = false;
      var keywordExamples = false;
      for (var i = 0; i < checkBlocks.length; i++) {
        if (get(option, "is-some").app(get(checkBlocks[i], "maybe-err"))) {
          if (get(checkBlocks[i], "keyword-check")) keywordCheck = true;
          else keywordExamples = true;
        }
      }
      var blockType;
      if (keywordCheck && keywordExamples) {
        blockType = $("<span>")
          .append("testing (")
          .append($("<code>").text("check")).append(" or ").append($("<code>").text("examples"))
          .append(")");
      } else if (keywordExamples) {
        blockType = $("<span>").append($("<code>").text("examples"));
      } else {
        blockType = $("<span>").append($("<code>").text("check"));
      }
      
      var checkResultsContainer = document.createElement("div");
      checkResultsContainer.classList.add("test-results");
      try{
      for(var i = checkBlocks.length - 1; i >= 0; i--) {
        var checkBlock = checkBlocks[i];
        var maybeError  = get(checkBlock, "maybe-err");
        
        var testsPassing  = 0;
        var testsExecuted = 0;
        
        var tests = ffi.toArray(get(checkBlock, "test-results")).
          reverse().
          map(function(test) {
            var testSuccess = isTestSuccess(test);
            testsExecuted++;
            var skeleton = undefined;
            if (testSuccess) {
              testsPassing++;
              skeleton = new PassingTestSkeleton(test, testsExecuted);
              testsPassedSkeletons.push(skeleton);
            } else {
              skeleton = new FailingTestSkeleton(test, testsExecuted);
              testsFailedSkeletons.push(skeleton);
            }
            return skeleton;
          });
          
        var endedInError    = get(option, "is-some").app(maybeError);
        var allTestsPassing = testsPassing === testsExecuted;
        
        var error = endedInError ? get(maybeError, "value").val : undefined;
        
        var skeleton =
          new CheckBlockSkeleton(
            get(checkBlock, "name"), 
            get(checkBlock, "loc"),
            get(checkBlock, "keyword-check"),
            { skeletons: tests,
              passing  : testsPassing,
              executed : testsExecuted }, error);
        
        if (endedInError)
          checkErroredSkeletons.push(skeleton);
        checkResultsContainer.appendChild(skeleton.container);
      }
      
      
      var checkPassedAll      = testsPassedSkeletons.length;
      var checkBlocksErrored  = checkErroredSkeletons.length;
      var checkTotalAll       = checkPassedAll + testsFailedSkeletons.length;

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
                                 .prepend(blockType.append(checkBlocksErrored == 1 ? " block" : " blocks"))));
        }
      }


      container.append($(checkResultsContainer).prepend(summary));
      
      }catch(e){console.error(e);}
      
      // must be called on the pyret stack
      function vivifySkeleton(skeleton) {
        var error_to_html = errorUI.error_to_html;
        return runtime.pauseStack(function (restarter) {
          // the skeleton's pyretStack must already be enriched
          return error_to_html(runtime, documents, skeleton.renderable, skeleton.pyretStack, result).
            then(function(html) {
              skeleton.vivify(html);
            }).done(function () {restarter.resume(runtime.nothing)});
        });
      }

      return runtime.safeCall(
        function(){
          return runtime.eachLoop(runtime.makeFunction(function(i) {
            return vivifySkeleton(checkErroredSkeletons[i]);
          }), 0, checkErroredSkeletons.length);
        }, function(_) {
          return runtime.safeCall(function() {
            return runtime.eachLoop(runtime.makeFunction(function(i) {
              return vivifySkeleton(testsFailedSkeletons[i]);
            }), 0, testsFailedSkeletons.length);
            return runtime.nothing;
          }, function(_) {
            for(var i = 0; i < testsPassedSkeletons.length; i++)
              testsPassedSkeletons[i].vivify();
            checkResultsContainer.classList.add("check-results-done-rendering");
            return runtime.nothing;
          }, "drawCheckResults:vivifySkeleton:failures");
        }, "drawCheckResults:vivifySkeleton:errors");
    }

    return runtime.makeJSModuleReturn({
      drawCheckResults: drawCheckResults
    });
  }
})
