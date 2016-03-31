/*
 * NOTE: This file is designed to have as few dependencies as possible!
 *
 * This will initialize the CPO Editor. Because there are a few items
 * which the runtime is needed for, it resolves to a continuation-style
 * function which backpatches in those items once the runtime and REPL
 * instances are available.
 */
var editorUI;
require(["/js/repl-ui.js"], function(replUI) {
  var editorPromise = Q.defer();
  editorUI = editorPromise.promise;
  setTimeout(function(){
    var replContainer = $("<div>").addClass("repl");
    var runButton = $("#runButton");
    var codeContainer = $("<div>").addClass("replMain");
    var replWidget;
    var currentAction = "run";
    // doRunAction filled in once REPL is loaded
    var doRunAction = function(){};
    $("#main").prepend(codeContainer);

    // NOTE(joe): assigned on window for debuggability
    window.RUN_CODE = function(src, uiOpts, replOpts) {
      doRunAction(src);
    };

    editor = replUI.makeEditor(codeContainer, {
      runButton: $("#runButton"),
      simpleEditor: false,
      initial: "",
      run: RUN_CODE,
      initialGas: 100
    });

    runButton.on("click", function() { doRunAction(editor.cm.getValue()); });

    $("#runDropdown").click(function() {
      $("#run-dropdown-content").toggle();
    });

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

    $(window).on("keyup", function(e) {
      if(e.keyCode === 27) {
        $("#help-keys").fadeOut(500);
        e.stopImmediatePropogation();
        e.preventDefault();
      }
    });
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
      message = "Curly quotes converted";
      var container = $('<div>').addClass("curlyQ");
      var msg = $("<span>").addClass("curlyQ-msg").text(message);
      var button = $("<span>").addClass("curlyQ-button").text("Click to Undo");
      container.append(msg).append(button);
      container.click(function(){
        editor.cm.replaceRange(oldText, from, to);
      });
      $(".notificationArea").prepend(container);
      container.delay(15000).fadeOut(3000);
    }
    function autoSave() {
      programToSave.then(function(p) {
        if(p !== null && !copyOnSave) { save(); }
      });
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
          autoSave();
          e.stopImmediatePropagation();
          e.preventDefault();
        } else if(e.keyCode === 191 && e.shiftKey) { // "Ctrl-?"
          $("#help-keys").fadeIn(100);
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }
    });
    storageAPI.then(function(api) {
      api.collection.then(function() {
        $(".loginOnly").show();
        $(".logoutOnly").hide();
        api.api.getCollectionLink().then(function(link) {
          $("#drive-view a").attr("href", link);
        });
      });
      api.collection.fail(function() {
        $(".loginOnly").hide();
        $(".logoutOnly").show();
      });
    });

    storageAPI = storageAPI.then(function(api) { return api.api; });
    $("#connectButton").click(function() {
      $("#connectButton").text("Connecting...");
      $("#connectButton").attr("disabled", "disabled");
      storageAPI = createProgramCollectionAPI(clientId, apiKey, "code.pyret.org", false);
      storageAPI.then(function(api) {
        api.collection.then(function() {
          $(".loginOnly").show();
          $(".logoutOnly").hide();
          api.api.getCollectionLink().then(function(link) {
            $("#drive-view a").attr("href", link);
          });
          if(params["get"] && params["get"]["program"]) {
            var toLoad = api.api.getFileById(params["get"]["program"]);
            console.log("Logged in and has program to load: ", toLoad);
            loadProgram(toLoad);
            programToSave = toLoad;
          } else {
            programToSave = Q.fcall(function() { return null; });
          }
        });
        api.collection.fail(function(err) {
          $("#connectButton").text("Connect to Google Drive");
          $("#connectButton").attr("disabled", false);
        });
      });
      storageAPI = storageAPI.then(function(api) { return api.api; });
    });

    var copyOnSave = false;

    var initialProgram = storageAPI.then(function(api) {
      var programLoad = null;
      if(params["get"] && params["get"]["program"]) {
        programLoad = api.getFileById(params["get"]["program"]);
        programLoad.then(function(p) { showShareContainer(p); });
      }
      if(params["get"] && params["get"]["share"]) {
        programLoad = api.getSharedFileById(params["get"]["share"]);
        $("#saveButton").text("Save a Copy");
        copyOnSave = true;
      }
      if(programLoad) {
        programLoad.fail(function(err) {
          console.error(err);
          stickError("The program failed to load.");
        });
        return programLoad;
      } else {
        return null;
      }
    });

    function setTitle(progName) {
      document.title = progName + " - code.pyret.org";
    }

    $("#download a").click(function() {
      var downloadElt = $("#download a");
      var contents = editor.cm.getValue();
      var downloadBlob = window.URL.createObjectURL(new Blob([contents], {type: 'text/plain'}));
      var filename = $("#program-name").val();
      if(!filename) { filename = 'untitled_program.arr'; }
      if(filename.indexOf(".arr") !== (filename.length - 4)) {
        filename += ".arr";
      }
      downloadElt.attr({
        download: filename,
        href: downloadBlob
      });
      $("#download").append(downloadElt);
    });

    function loadProgram(p) {
      return p.then(function(p) {
        if(p !== null) {
          $("#program-name").val(p.getName());
          setTitle(p.getName());
          return p.getContents().then(function(c) {
            editor.cm.setValue(c);
            // NOTE(joe): Clearing history to address https://github.com/brownplt/pyret-lang/issues/386,
            // in which undo can revert the program back to empty
            editor.cm.clearHistory();
          });
        }
      });
    }

    var programLoaded = loadProgram(initialProgram);

    var programToSave = initialProgram;

    function showShareContainer(p) {
      $("#shareContainer").empty();
      $("#shareContainer").append(makeShareLink(p));
    }

    function nameOrUntitled() {
      return $("#program-name").val() || "Untitled";
    }
    function save() {
      stickMessage("Saving...");
      var savedProgram = programToSave.then(function(p) {
        if(p !== null && !copyOnSave) {
          if(p.getName() !== $("#program-name").val()) {
            programToSave = p.rename(nameOrUntitled()).then(function(newP) {
              return newP;
            });
          }
          return programToSave
            .then(function(p) {
              showShareContainer(p);
              return p.save(editor.cm.getValue(), false);
            })
            .then(function(p) {
              $("#program-name").val(p.getName());
              $("#saveButton").text("Save");
              history.pushState(null, null, "#program=" + p.getUniqueId());
              window.location.hash = "#program=" + p.getUniqueId();
              flashMessage("Program saved as " + p.getName());
              setTitle(p.getName());
              return p;
            })
        }
        else {
          var programName = $("#program-name").val() || "Untitled";
          $("#program-name").val(programName);
          programToSave = storageAPI
            .then(function(api) { return api.createFile(programName); });
          copyOnSave = false;
          return save();
        }
      });
      savedProgram.fail(function(err) {
        stickError("Unable to save", "Your internet connection may be down, or something else might be wrong with this site or saving to Google.  You should back up any changes to this program somewhere else.  You can try saving again to see if the problem was temporary, as well.");
        console.error(err);
      });
    }
    $("#runButton").click(autoSave);

    $("#saveButton").click(save);

    var doWithReplAndRuntime = function(repl, runtime) {
      window.saveJSFile = function() {
        var progName = $("#program-name").val() + ".js";
        function createFile(text) {
          storageAPI.then(function(api) {
            var jsfile = api.createFile(progName);
            jsfile.then(function(f) {
              f.save(text).
                then(function(f) {
                  return f.makeShareCopy();
                }).
                then(function(copied) {
                  console.log(makeImportText(progName, copied.getUniqueId()));
                });
            });
          });
        }
        function makeImportText(name, id) {
          return "import compiled-gdrive-js(\"" + name + "\", \"" + id + "\") as G";
        }
        var str = editor.cm.getValue();
        require([ 
          "compiler/compile-lib.arr",
          "compiler/compile-structs.arr",
          "compiler/repl-support.arr"], function(cl, cs, rs) {
            runtime.runThunk(function(_, __) {
              return runtime.loadModulesNew(runtime.namespace, [cl, cs, rs],
                                            function(cl, mod, rs) {
                                              return runtime.safeCall(
                                                function() {
                                                  return gmf(cl, "compile-to-js-string").app(
                                                    runtime.makeFunction(globals.findModule),
                                                    editor.cm.getValue(),
                                                    progName,
                                                    runtime.nothing,
                                                    gmf(mod, "default-compile-options")
                                                  );
                                                }, 
                                                function(string) {
                                                  return string;
                                                });
                                            });
            }, function(result) {
              if(runtime.isSuccessResult(result)) {
                createFile(result.result);
              }
              else {
                console.error("Error: ", result);
              }
            });
          });
      }; // end window.saveJSFile

      var gassed = Q(repl);
      gassed.fail(function(err) {
        console.error("Couldn't guess gas: ", err);
      });
      var done = gassed.then(function(repl){
        console.log("Gas assumed safe at: ", repl.runtime.INITIAL_GAS);

        // NOTE(joe): This forces the loading of all the builtin compiler libs
        var interactionsReady = repl.restartInteractions();
        interactionsReady.fail(function(err) {
          console.error("Couldn't start REPL: ", err);
        });
        interactionsReady.then(function(result) {
          console.log("REPL ready.");
        });
        doRunAction = function(src) {
          switch(currentAction) {
          case "run":
            replWidget.runCode(src, {check: true, cm: editor.cm});
            break;
          case "tc-and-run":
            replWidget.runCode(src, {check: true, cm: editor.cm, "type-check": true});
            break;
          }
        };
        var replMade = Q();
        runtime.runThunk(function() {
          replMade = replUI.makeRepl(replContainer, repl, runtime, {
            breakButton: $("#breakButton"),
            runButton: runButton
          });
          return replMade;
        }, function(ans) {
          if (runtime.isSuccessResult(ans)) {
            ans.result.done(function(repl) { replWidget = repl; });
          } else {
            console.error("MakeRepl failed: ", ans);
          }
        });
        Q.all([programLoaded, interactionsReady, replMade]).fin(function() {
          clearInterval($("#loader").data("intervalID"));
          $("#loader").hide();
          $("#REPL").append(replContainer);
        });
      });
      done.fail(function(err) {
        console.error("Pyret failed to load. ", err);
      });
    }; // end doWithReplAndRuntime
    editorPromise.resolve({ cont : doWithReplAndRuntime, editor : editor });
  }, 0);
});
