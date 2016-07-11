({
  requires: [
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-lib.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-structs.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/repl.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../arr/cpo.arr"]
    },
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./repl-ui"]
    },
    { "import-type": "builtin",
      name: "runtime-lib"
    },
    { "import-type": "builtin",
      name: "load-lib"
    },
    { "import-type": "builtin",
      name: "builtin-modules"
    },
    { "import-type": "builtin",
      name: "cpo-builtins"
    }
  ],
  nativeRequires: [
    "cpo/gdrive-locators",
    "cpo/http-imports",
    "cpo/guess-gas",
    "cpo/cpo-builtin-modules",
    "cpo/modal-prompt",
    "pyret-base/js/runtime"
  ],
  provides: {},
  theModule: function(runtime, namespace, uri,
                      compileLib, compileStructs, pyRepl, cpo, replUI,
                      runtimeLib, loadLib, builtinModules, cpoBuiltins,
                      gdriveLocators, http, guessGas, cpoModules, modalPrompt,
                      rtLib) {




    var replContainer = $("<div>").addClass("repl");
    $("#REPL").append(replContainer);

    runtime.setParam("imgUrlProxy", function(s) {
      return APP_BASE_URL + "/downloadImg?" + s;
    });

    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    var gtf = function(m, f) { return gf(m, "types")[f]; };

    var constructors = gdriveLocators.makeLocatorConstructors(storageAPI, runtime, compileLib, compileStructs, builtinModules);

    function findModule(contextIgnored, dependency) {
      return runtime.safeCall(function() {
        return runtime.ffi.cases(gmf(compileStructs, "is-Dependency"), "Dependency", dependency,
          {
            builtin: function(name) {
              var raw = cpoModules.getBuiltinLoadableName(runtime, name);
              if(!raw) {
                throw runtime.throwMessageException("Unknown module: " + name);
              }
              else {
                return gmf(cpo, "make-builtin-js-locator").app(name, raw);
              }
              /*
              if (cpoBuiltin.knownCpoModule(name)) {
                return cpoBuiltin.cpoBuiltinLocator(runtime, compileLib, compileStructs, name);
              }
              else if(okImports.indexOf(name) === -1) {
                throw runtime.throwMessageException("Unknown module: " + name);
              } else {
                return gmf(compileLib, "located").app(
                  gmf(builtin, "make-builtin-locator").app(name),
                  runtime.nothing
                );
              }
              */
            },
            dependency: function(protocol, args) {
              var arr = runtime.ffi.toArray(args);
              if (protocol === "my-gdrive") {
                return constructors.makeMyGDriveLocator(arr[0]);
              }
              else if (protocol === "shared-gdrive") {
                return constructors.makeSharedGDriveLocator(arr[0], arr[1]);
              }
              /*
              else if (protocol === "js-http") {
                // TODO: THIS IS WRONG with the new locator system
                return http.getHttpImport(runtime, args[0]);
              }
              else if (protocol === "gdrive-js") {
                return constructors.makeGDriveJSLocator(arr[0], arr[1]);
              }
              */
              else {
                console.error("Unknown import: ", dependency);
              }

            }
          });
       }, function(l) {
          return gmf(compileLib, "located").app(l, runtime.nothing);
       }, "findModule");
    }

    // NOTE(joe): This line is "cheating" by mixing runtime levels,
    // and uses the same runtime for the compiler and running code.
    // Usually you can only get a new Runtime by calling create, but
    // here we magic the current runtime into one.
    var pyRuntime = gf(gf(runtimeLib, "internal").brandRuntime, "brand").app(
      runtime.makeObject({
        "runtime": runtime.makeOpaque(runtime)
      }));
    var pyRealm = gf(loadLib, "internal").makeRealm(cpoModules.getRealm());


    var builtins = [];
    Object.keys(runtime.getParam("staticModules")).forEach(function(k) {
      if(k.indexOf("builtin://") === 0) {
        builtins.push(runtime.makeObject({
          uri: k,
          raw: cpoModules.getBuiltinLoadable(runtime, k)
        }));
      }
    });
    var builtinsForPyret = runtime.ffi.makeList(builtins);

    var getDefsForPyret = runtime.makeFunction(function() {
        return CPO.editor.cm.getValue();
      });
    var replGlobals = gmf(compileStructs, "standard-globals");

    var replP = Q.defer();
    return runtime.safeCall(function() {
        return gmf(cpo, "make-repl").app(
            builtinsForPyret,
            pyRuntime,
            pyRealm,
            runtime.makeFunction(findModule));
      }, function(repl) {
        var jsRepl = {
          runtime: runtime.getField(pyRuntime, "runtime").val,
          restartInteractions: function(ignoredStr, typeCheck) {
            var ret = Q.defer();
            setTimeout(function() {
              runtime.runThunk(function() {
                return runtime.safeCall(
                  function() {
                    return gf(repl,
                    "make-definitions-locator").app(getDefsForPyret, replGlobals);
                  },
                  function(locator) {
                    return gf(repl, "restart-interactions").app(locator, typeCheck);
                  });
              }, function(result) {
                ret.resolve(result);
              });
            }, 0);
            return ret.promise;
          },
          run: function(str, name) {
            var ret = Q.defer();
            setTimeout(function() {
              runtime.runThunk(function() {
                return runtime.safeCall(
                  function() {
                    return gf(repl,
                    "make-interaction-locator").app(
                      runtime.makeFunction(function() { return str; }))
                  },
                  function(locator) {
                    return gf(repl, "run-interaction").app(locator);
                  });
              }, function(result) {
                ret.resolve(result);
              }, "make-interaction-locator");
            }, 0);
            return ret.promise;
          },
          pause: function(afterPause) {
            runtime.schedulePause(function(resumer) {
              afterPause(resumer);
            });
          },
          stop: function() {
            runtime.breakAll();
          },
          runtime: runtime
        };
        return withRepl(jsRepl);
      }, "make-repl");

    function withRepl(repl) {

      console.log("Loaded");
      clearInterval($("#loader").data("intervalID"));
      $("#loader").hide();

      // NOTE(joe): This forces the loading of all the built-in compiler libs
      var interactionsReady = repl.restartInteractions();
      interactionsReady.fail(function(err) {
        console.error("Couldn't start REPL: ", err);
      });
      interactionsReady.then(function(result) {
        //editor.cm.setValue("print('Ahoy, world!')");
        console.log("REPL ready.");
      });
      var runButton = $("#runButton");

      var codeContainer = $("<div>").addClass("replMain");
      $("#main").prepend(codeContainer);

      var replWidget = 
          replUI.makeRepl(replContainer, repl, runtime, {
            breakButton: $("#breakButton"),
            runButton: runButton
          });

      // NOTE(joe): assigned on window for debuggability
      window.RUN_CODE = function(src, uiOpts, replOpts) {
        doRunAction(src);
      };

      $("#runDropdown").click(function() {
        $("#run-dropdown-content").toggle();
      });

      // CPO.editor is set in beforePyret.js
      var editor = CPO.editor;
      var currentAction = "run";

      $("#select-run").click(function() {
        runButton.text("Run");
        currentAction = "run";
        doRunAction(editor.cm.getValue());
        $("#run-dropdown-content").hide();
      });

      $("#select-tc-run").click(function() {
        runButton.text("Type-check and Run");
        currentAction = "tc-and-run";
        doRunAction(editor.cm.getValue());
        $("#run-dropdown-content").hide();
      });
      /*
      $("#select-scsh").click(function() {
        highlightMode = "scsh"; $("#run-dropdown-content").hide();});
      $("#select-scmh").click(function() {
        highlightMode = "scmh"; $("#run-dropdown-content").hide();});
      $("#select-mcmh").click(function() {
        highlightMode = "mcmh"; $("#run-dropdown-content").hide();});
      */
      function doRunAction(src) {
        editor.cm.clearGutter("test-marker-gutter");
        var marks = editor.cm.getAllMarks();
        document.getElementById("main").dataset.highlights = "";
        editor.cm.eachLine(function(lh){
          editor.cm.removeLineClass(lh, "background");});
        for(var i = 0; i < marks.length; i++) {
          marks[i].clear();
        }
        var sheet = document.getElementById("highlight-styles").sheet;
        for(var i=0; i< sheet.cssRules.length; i++) {
          sheet.deleteRule(i);
        }
        switch (currentAction) {
          case "run":
            replWidget.runCode(src, {check: true, cm: editor.cm});
            break;
          case "tc-and-run":
            replWidget.runCode(src, {check: true, cm: editor.cm, "type-check": true});
            break;
        }
      }

      runButton.on("click", function() { doRunAction(editor.cm.getValue()); });

      $(window).on("keyup", function(e) {
        if(e.keyCode === 27) { // "ESC"
          $("#help-keys").fadeOut(500);
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      });

      /* Documentation Overlay */
      /*
      NOTE(joe): Skipping this for now, until HTTPS solution for docs worked out
      $("#docs").on("click", function(e){
        $("#doc-containment").toggle();
        e.stopImmediatePropagation();
        e.preventDefault();
      });
      */

      $("#doc-close").on("click", function(e){
        $("#doc-containment").toggle();
        e.stopImmediatePropagation();
        e.preventDefault();
      });

      $("#doc-overlay").draggable({
        start: fixIframe,
        stop: fixIframe,
        handle: "#doc-bar",
        cancel: "#doc-close"
        });

      $("#doc-overlay").resizable({
        handles: {
          s:"#doc-bottom",
          e: "#doc-right",
          w:"#doc-left",
          sw: "#doc-sw-corner",
          se:"#doc-se-corner"},
        start: fixIframe,
        stop: fixIframe,
        containment: "#doc-containment",
        scroll: false
        });

        function fixIframe() {
          $("#doc-cover").toggle();
        }

      $('#font-plus').click(changeFont);
      $('#font-minus').click(changeFont);

      function changeFont(e){
        fontSize = parseInt($('#main').css("font-size"));
        if ($(e.target).is("#font-plus") && (fontSize < 55)){
          $('#main').css('font-size', '+=4');
        }
        else if ($(e.target).is("#font-minus") && (fontSize > 10)){
          $('#main').css('font-size', '-=4');
        }
        editor.refresh();
        $('#font-label').text("Font (" + $('#main').css("font-size") + ")");
      }
      $('#font-label').text("Font (" + $('#main').css("font-size") + ")");

      $('.notificationArea').click(function() {$('.notificationArea span').fadeOut(1000);});

      editor.cm.on('beforeChange', curlyQuotes);

      function curlyQuotes(instance, changeObj){
        $('.notificationArea .curlyQ').remove();
        curlybool = false;
        if((changeObj.origin == "paste")){
        var newText = jQuery.map(changeObj.text, function(str, i) {
          curlybool = curlybool || (str.search(/[\u2018\u2019\u201C\u201D]/g) > -1);
          str = str.replace(/\u201D/g, "\"")
          str = str.replace(/\u201C/g, "\"")
          str = str.replace(/\u2019/g, "\'")
          str = str.replace(/\u2018/g, "\'")
          return str;
        });
        if(curlybool){
        curlyQUndo(changeObj.text, changeObj.from);
        changeObj.update(undefined, undefined, newText);
      }
      }}

      function curlyQUndo(oldText, from){
        var lineN = oldText.length - 1
        var to = {line: from.line + lineN, ch: from.ch + oldText[lineN].length}
        console.log(from, to);
        message = "Curly quotes converted"
        var container = $('<div>').addClass("curlyQ")
        var msg = $("<span>").addClass("curlyQ-msg").text(message);
        var button = $("<span>").addClass("curlyQ-button").text("Click to Undo");
        container.append(msg).append(button);
        container.click(function(){
          editor.cm.replaceRange(oldText, from, to);
        });
        $(".notificationArea").prepend(container);
        container.delay(15000).fadeOut(3000);
      }

      // Resizable
      var replHeight = $( "#REPL" ).height();
      var editorEvenSplit = true;
      $( "#REPL" ).resizable({
        maxHeight: replHeight,
        maxWidth: window.innerWidth - 128,
        minHeight: replHeight,
        minWidth: 100,
        handles: {"w": "#handle"}});

      $( "#REPL" ).on( "resize", leftResize);
      $( "#REPL" ).on( "resize", function() {editorEvenSplit = false;});

      function leftResize(event, ui) {
        var leftWidth = (window.innerWidth - ui.size.width)
        $(".replMain").css("width", leftWidth + "px");
      }

      $( "#REPL" ).on( "resizestop", toPercent);

      var rightResizePct = 50;
      var leftResizePct = 50;

      function toPercent(event, ui) {
        rightResizePct = (ui.size.width / window.innerWidth) * 100
        leftResizePct = 100 - rightResizePct
        setEditorSize(leftResizePct, rightResizePct);
      }

      $( window ).resize( function() {
        $( "#REPL" ).resizable( "option", "maxWidth", window.innerWidth - 128);
      });
      // End Resizable

      function setEditorSize(leftPct, rightPct) {
        $( "#REPL" ).css( "width", rightPct + "%");
        $( "#REPL" ).css( "left", leftPct + "%");
        $(".replMain").css("width", leftPct + "%");
      }

      function toggleEditorSize() {
        if(editorEvenSplit) {
          editorEvenSplit = false;
          setEditorSize(leftResizePct, rightResizePct);
        }
        else {
          editorEvenSplit = true;
          setEditorSize("50", "50");
        }
      }

      $(window).on("keydown", function(e) {
        if(e.ctrlKey) {
          if(e.keyCode === 83) { // "Ctrl-s"
            save();
            e.stopImmediatePropagation();
            e.preventDefault();
          }
          else if(e.keyCode === 77) { // "Ctrl-m"
            toggleEditorSize();
            e.stopImmediatePropagation();
            e.preventDefault();
          }
          else if(e.keyCode === 13) { // "Ctrl-Enter"
            doRunAction(editor.cm.getValue());
            CPO.autoSave();
            e.stopImmediatePropagation();
            e.preventDefault();
          } else if(e.keyCode === 191 && e.shiftKey) { // "Ctrl-?"
            $("#help-keys").fadeIn(100);
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }
      });

      // Used for image definition naming (identifier: "img" + curImg)
      var curImg = 0;

      /**
       * Sets curImg to a value which will not clash with the code in
       * contents (note: this is done conservatively -- the estimation
       * is "dumb" in that it pays no attention to token types)
       */
      function inferCurImg(contents) {
        var query = /img([0-9]+)[\s\n\r]*=/g;
        var maxSoFar = 0;
        var res;
        while((res = query.exec(contents)) !== null) {
          maxSoFar = Math.max(maxSoFar, Number(res[1]));
        }
        curImg = maxSoFar + 1;
      }

      var photoPrompt = new modalPrompt([
        {
          message: "Import as Values",
          value: "values",
          example: 'image-url("<URL>")\nimage-url("<URL>")\n# ...'
        },
        {
          message: "Import as Definitions",
          value: "defs",
          example: 'image0 = image-url("<URL>")\nimage1 = image-url("<URL>")\n# ...'
        },
        {
          message: "Import as a List",
          value: "list",
          example: '[list: image-url("<URL>"),\n'
            + '       image-url("<URL>"),\n'
            + '       # ...\n       ]'
        }]);

      var lastSave = 0;
      function handlePickerData(documents, picker, drive) {
        function openFile(id) {
          // FIXME: This causes popup blockers to get triggered...
          window.open('/editor#program=' + id, '_blank');
        }
        // File loaded
        if (documents[0][picker.Document.TYPE] === "file") {
          var id = documents[0][picker.Document.ID];
          // If the editor has not been modified since the last save,
          // load in this window
          if (editor.cm.getDoc().history.lastModTime === lastSave) {
            var p = drive.getFileById(id);
            window.CPO.showShareContainer(p);
            window.location.hash = "#program=" + id;
            window.CPO.setTitle(documents[0][picker.Document.NAME]);
            window.CPO.loadProgram(p).then(function(contents) {
              window.CPO.editor.cm.setValue(contents);
              window.CPO.editor.cm.clearHistory();
            });
          } else {
            openFile(id);
          }
          for (var i = 1; i < documents.length; ++i) {
            openFile(documents[i][picker.Document.ID]);
          }
        }
        // Picture loaded
        else if (documents[0][picker.Document.TYPE] === picker.Type.PHOTO) {

          photoPrompt.show(function(res) {
            // Name of event for CM undo history
            var origin = "+insertImage" + curImg;
            var asValues = (res === "values");
            var asDefs = (res === "defs");
            var asList = (res === "list");
            if (!(asValues || asDefs || asList)) {
              // Check for garbage and log it
              if (res !== null) {
                console.warn("Unknown photoPrompt response: ", res);
              }
              return;
            }
            // http://stackoverflow.com/questions/23733455/inserting-a-new-text-at-given-cursor-position
            var cm = CPO.editor.cm;
            var doc = cm.getDoc();
            function placeInEditor(str) {
              var cursor = doc.getCursor();
              var line = doc.getLine(cursor.line);
              var pos = {
                line: cursor.line,
                ch: line.length
              };
              doc.replaceRange(str, pos, undefined, origin);
              reindent(cursor.line);
            }
            function reindent(line) {
              cm.indentLine(line || doc.getCursor().line);
            }
            function emitNewline() {
              var cursor = doc.getCursor();
              placeInEditor('\n');
              // FIXME: Dunno why this happens.
              if (cursor.line === doc.getCursor().line) {
                doc.setCursor({line: cursor.line + 1, ch: 0});
              }
            }
            function emitLn(s) {
              placeInEditor(s);
              emitNewline();
            }
            function onEmptyLine() {
              var cursor = doc.getCursor("to");
              var line = doc.getLine(cursor.line);
              return (/^\s*$/.test(line));
            }
            // Make newline at cursor position if we are not on an empty line
            if (onEmptyLine()) {
              reindent();
            } else {
              emitNewline();
            }
            if (asList) {
              placeInEditor("[list:");
            }
            documents.forEach(function(d, idx) {
              var pathToImg = "\"https://drive.google.com/uc?export=download&id="
                    + d[picker.Document.ID] + "\"";
              var outstr = asDefs ? ("img" + curImg + " = ") : "";
              ++curImg;
              outstr += "image-url(" + pathToImg + ")";
              var isLast = (idx === (documents.length - 1));
              if (asList) {
                if (idx === 0) {
                  // The space after ":" gets eaten, so we need to enter it here
                  outstr = ' ' + outstr;
                }
                outstr += isLast ? "]" : ",";
              }
              if (isLast) {
                placeInEditor(outstr);
              } else {
                emitLn(outstr);
              }
            });
          });
        } else {
          flashError("Invalid file type: " + documents[0][picker.Document.TYPE]);
        }
      }
      var picker;
      picker = new FilePicker({
        onLoaded: function() {
          $("#openFile").attr("disabled", false);
          picker.openOn($("#openFile")[0], "click");
        },
        onSelect: handlePickerData,
        onError: flashError,
        onInternalError: stickError
      });


      return runtime.makeModuleReturn({}, {});
    }
  }
})
