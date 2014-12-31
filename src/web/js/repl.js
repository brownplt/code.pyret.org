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
  define("repl-main", ["js/repl-lib", "/js/repl-ui.js", "js/runtime-anf", "js/dialects-lib", "/js/guess-gas.js", "/js/gdrive-imports.js"],
  function(replLib, replUI, rtLib, dialectLib, guessGas, gdrive) {
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
          function autoSave() {
            programToSave.then(function(p) {
              if(p !== null && !copyOnSave) { save(); }
            });
          }
        /* Moved to resize.js for development:
          var editorBig = false;
          function toggleEditorSize() {
            if(editorBig) {
              editorBig = false;
              $(".replMain").css("width", "50%");
              $("#REPL").css("width", "50%");
              $("#REPL").css("left", "50%");
            }
            else {
              editorBig = true;
              $(".replMain").css("width", "95%");
            }
            editor.refresh();
          } */
          $(window).on("keydown", function(e) {
            if(e.ctrlKey) {
              if(e.keyCode === 83) { // "Ctrl-s"
                save();
                e.stopImmediatePropagation();
                e.preventDefault();
              }
              /* moved to resize.js for development:
              else if(e.keyCode === 77) { // "Ctrl-m"
                toggleEditorSize();
                e.stopImmediatePropagation();
                e.preventDefault();
              }*/
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
  var err = $("<span>").addClass("error").text(message);
  if(more) {
    err.attr("title", more);
  }
  err.tooltip();
  $(".notificationArea").append(err);
}
function flashError(message) {
  clearFlash();
  var err = $("<span>").addClass("error").text(message);
  $(".notificationArea").append(err);
  err.fadeOut(7000);
}
function flashMessage(message) {
  clearFlash();
  var err = $("<span>").addClass("active").text(message);
  $(".notificationArea").append(err);
  err.fadeOut(7000);
}
function stickMessage(message) {
  clearFlash();
  var err = $("<span>").addClass("active").text(message);
  $(".notificationArea").append(err);
}

$(window).bind("beforeunload", function(_) {
  return "Because this page can load slowly, and you may have outstanding changes, we ask that you confirm before leaving the editor in case closing was an accident.";
});
