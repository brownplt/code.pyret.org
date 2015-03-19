LOG = true;
function ct_log(/* varargs */) {
  if (window.console && LOG) {
    console.log.apply(console, arguments);
  }
}
function ct_error(/* varargs */) {
  if (window.console && LOG) {
    console.error.apply(console, arguments);
  }
}
var initialParams = url.parse(document.location.href);
var params = url.parse("/?" + initialParams["hash"]);

$(function() {
  var key = "firefox-warning-has-been-shown";
  var shownBefore = window.localStorage.getItem(key);
  var ua = "";
  if(window.navigator && window.navigator.userAgent) {
    ua = window.navigator.userAgent;
  }
  if(ua.indexOf("Firefox") !== -1 && !shownBefore) {
    window.localStorage.setItem(key, true);
    var explanation = $("<div>").append([$("<p>")
      .text("It looks like you're using a version of Firefox.  " +
            "Some Pyret programs run slowly on Firefox, so if you have a poor experience, consider using Chrome or Chromium, which interact with Pyret more efficiently."),
      $("<p>").text("(Press escape or click the X to close this window)")]);
    explanation.dialog({
      title: "Firefox",
      modal: true,
			overlay : { opacity: 0.5, background: 'black'},
      width : "500px",
      height : "auto",
      closeOnEscape : true,
      close: checkShare
    });
  }
  else {
    checkShare();
  }
  function checkShare() {
    var key = "share-explanation-has-been-shown";
    var shownBefore = window.localStorage.getItem(key);
    if(params.get["share"] && !shownBefore) {
      window.localStorage.setItem(key, true);
      var explanation = $("<div>").append([$("<p>")
        .text("You're viewing a copy of a shared program.  " +
              "Feel free to edit it: don't worry, you won't change the original!"),
        $("<p>").text(
              "You can save a copy of the program to " +
              "your Google drive that's completely separate from the original " +
              "if you want to have your own version. "),
        $("<p>").text("(Press escape or click the X to close this window and get started!)")]);
      explanation.dialog({
        title: "Sharing",
        modal: true,
        overlay : { opacity: 0.5, background: 'black'},
        width : "500px",
        height : "auto",
        closeOnEscape : true
      });
    }
  }
});

$(function() {
  define("repl-main", ["js/repl-lib", "/js/repl-ui.js", "js/runtime-anf", "js/dialects-lib", "/js/guess-gas.js", "/js/gdrive-imports.js", "/js/http-imports.js"],
  function(replLib, replUI, rtLib, dialectLib, guessGas, gdrive, http) {
    makeHoverMenu($("#menu"), $("#menuContents"), false, function() {});
    var replContainer = $("<div>").addClass("repl");
    $("#REPL").append(replContainer);
    var runtime = rtLib.makeRuntime({stdout: function(str) { console.log(str); } });
    runtime.setParam("imgUrlProxy", function(s) {
      return APP_BASE_URL + "/downloadImg?" + s;
    });

    var dialects = Q.defer();
    runtime.runThunk(function() {
      return dialectLib(runtime, runtime.namespace);
    }, function(dialectsResult) {
      dialects.resolve(dialectsResult.result);
    });
    var load = dialects.promise.then(function(dialects) {
      var dialectStr = params["get"] ? params["get"]["lang"] : "Pyret";
      if (!dialects.dialects[dialectStr]) { dialectStr = "Pyret"; }
      var dialect = dialects.dialects[dialectStr]; // TODO: CHANGE THIS AS NEEDED
      var replNS = dialect.makeNamespace(runtime);
      var replEnv = dialect.compileEnv;
      var getDriveImports = gdrive.makeDriveImporter(storageAPI);
      var getSpecialImport = function(runtime, importStmt) {
        var loc = runtime.getField(importStmt, "l");
        var kind = runtime.getField(importStmt, "kind");
        var args = runtime.ffi.toArray(runtime.getField(importStmt, "args"));
        if(kind === "my-gdrive") {
          return getDriveImports.getMyDriveImport(runtime, args[0]);
        } else if(kind === "shared-gdrive") {
          return getDriveImports.getSharedDriveImport(runtime, args[0], args[1]);
        } else if(kind === "gdrive-js") {
          return http.getHttpImport(runtime, args[0], args[1]);
        } else {
          var ret = Q.defer();
          // TODO(joe): How to export this from ffi-helpers?
          var cs = require("compiler/compile-structs.arr");
          runtime.loadModules(runtime.namespace, [cs], function(cs) {
            ret.reject([runtime.getField(cs, "wf-err").app("No such import type: " + kind +
                ", did you mean my-gdrive or shared-gdrive?", loc)]);
          });
          return ret.promise;
        }
      };
      runtime.safeCall(function() {
        return replLib.create(runtime, replNS, replEnv, {
            name: "definitions",
            dialect: dialectStr,
            getSpecialImport: getSpecialImport
          });
      }, function(repl) {
        var gassed = guessGas.guessGas(3000, repl);
        gassed.fail(function(err) {
          console.error("Couldn't guess gas: ", err);
        });
        var done = gassed.then(function(repl) {
          console.log("Gas assumed safe at: ", repl.runtime.INITIAL_GAS);

          // NOTE(joe): This forces the loading of all the built-in compiler libs
          var interactionsReady = repl.restartInteractions("");
          interactionsReady.fail(function(err) {
            console.error("Couldn't start REPL: ", err);
          });
          interactionsReady.then(function(result) {
            console.log("REPL ready.");
          });
          var runButton = $("#runButton");

          var replWidget = replUI.makeRepl(replContainer, repl, runtime, {
              breakButton: $("#breakButton"),
              runButton: runButton
            });
          window.RUN_CODE = function(src, uiOpts, replOpts) {
            replWidget.runCode(src, uiOpts, replOpts);
          };
          var codeContainer = $("<div>").addClass("replMain");
          $("#main").prepend(codeContainer);
          var editor = replUI.makeEditor(codeContainer, {
              runButton: $("#runButton"),
              simpleEditor: false,
              initial: "print('Ahoy, world!')",
              run: RUN_CODE,
              initialGas: 100
            });
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
                editor.run();
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

          window.saveJSFile = function() {
            function makeImportText(name, id) {
              return "import gdrive-js(\"" + name + "\", \"" + id + "\") as G";
            }
            var str = editor.cm.getValue();
            require(["js/eval-lib", "compiler/compile-structs.arr"], function(e, cs) {
              runtime.loadModules(runtime.namespace, [cs],
                function(mod) {
                  var progName = $("#program-name").val() + ".js";
                  e.runCompileSrcPyret(runtime, str, {name: "gdrive-js/" + progName}, function(result) {
                    storageAPI.then(function(api) {
                      var jsfile = api.createFile(progName);
                      jsfile.then(function(f) {
                        if(!runtime.isSuccessResult(result)) {
                          console.error("Failed to create JS file", result);
                        }
                        else {
                          f.save(result.result).
                            then(function(f) {
                              return f.makeShareCopy();
                            }).
                            then(function(copied) {
                              console.log(makeImportText(progName, copied.getUniqueId()));
                            });
                        }
                      });
                    });
                  });
                });
            });
          };

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

          Q.all([programLoaded, interactionsReady]).fin(function() { $("#loader").hide(); });
          editor.focus();
        });
        done.fail(function(err) {
          console.error("Pyret failed to load.", err);
        });
      });
    });
    load.fail(function(err) {
      console.error("Pyret failed to load.", err);
    });
  });
  require(["repl-main"]);
});
function clearFlash() {
  $(".notificationArea").empty();
}
function stickError(message, more) {
  clearFlash();
  var err = $("<div>").addClass("error").text(message);
  if(more) {
    err.attr("title", more);
  }
  err.tooltip();
  $(".notificationArea").prepend(err);
}
function flashError(message) {
  clearFlash();
  var err = $("<div>").addClass("error").text(message);
  $(".notificationArea").prepend(err);
  err.fadeOut(7000);
}
function flashMessage(message) {
  clearFlash();
  var err = $("<div>").addClass("active").text(message);
  $(".notificationArea").prepend(err);
  err.fadeOut(7000);
}
function stickMessage(message) {
  clearFlash();
  var err = $("<div>").addClass("active").text(message);
  $(".notificationArea").prepend(err);
}

$(window).bind("beforeunload", function(_) {
  return "Because this page can load slowly, and you may have outstanding changes, we ask that you confirm before leaving the editor in case closing was an accident.";
});
