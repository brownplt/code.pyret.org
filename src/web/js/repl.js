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
  var key = "share-explanation-has-been-shown";
  var shownBefore = window.localStorage.getItem(key);
  if(params.get["share"] && !shownBefore) {
    window.localStorage.setItem(key, true);
    var explanation = $("<div>").append([$("<p>")
      .text("You're viewing a copy of a shared program." +
            "Feel free to edit it: don't worry, you won't change the original!" +
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
});

$(function() {
  var BASE = "http://cs.brown.edu/~joe/private/pyret-dev/";
  define("repl-main", ["js/repl-lib", "/js/repl-ui.js", "js/runtime-anf", "js/dialects-lib"], function(replLib, replUI, rtLib, dialectLib) {
    makeHoverMenu($("#menu"), $("#menuContents"), function() {});
    var replContainer = $("<div>").addClass("repl");
    $("#REPL").append(replContainer);
    var runtime = rtLib.makeRuntime({stdout: function(str) { console.log(str); } });


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
      runtime.safeCall(function() {
        return replLib.create(runtime, replNS, replEnv, {name: "definitions", dialect: dialectStr});
      }, function(repl) {

        // NOTE(joe): This forces the loading of all the built-in compiler libs
        var interactionsReady = repl.restartInteractions("");

        var replWidget = replUI.makeRepl(replContainer, repl, runtime, {
            breakButton: $("#breakButton"),
            runButton: $("#runButton")
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
            initialGas: 500
          });
        $(window).on("keyup", function(e) {
          if(e.keyCode === 27) { // "ESC"
            $("#help-keys").fadeOut(500);
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        });
        $(window).on("keydown", function(e) {
          if(e.ctrlKey) {
            if(e.keyCode === 83) { // "Ctrl-s"
              save();
              e.stopImmediatePropagation();
              e.preventDefault();
            }
            else if(e.keyCode === 13) { // "Ctrl-Enter"
              editor.run();
              e.stopImmediatePropagation();
              e.preventDefault();
            } else if(e.keyCode === 68) { // "Ctrl-d"
              editor.focus();
              e.stopImmediatePropagation();
              e.preventDefault();
            } else if(e.keyCode === 73) { // "Ctrl-i"
              replWidget.focus();
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
              flashError("The program failed to load.");
            });
            return programLoad;
          } else {
            return null;
          }
        });

        function setTitle(progName) {
          document.title = progName + " - code.pyret.org";
        }

        function loadProgram(p) {
          return p.then(function(p) {
            if(p !== null) {
              $("#program-name").val(p.getName());
              setTitle(p.getName());
              return p.getContents().then(function(c) {
                editor.cm.setValue(c);
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
          flashMessage("Saving...");
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
            flashError("Program failed to save.");
            console.error(err);
          });
        }
        $("#saveButton").click(save);

        programLoaded.then(function() { $("#loader").hide(); });
        Q.all([programLoaded, interactionsReady]).fin(function() { $("#loader").hide(); });
        editor.focus();
      });
      load.fail(function(err) {
        console.error("Pyret failed to load.", err);
      });
    });
  });
  require(["repl-main"]);
});
function clearFlash() {
  $(".notificationArea").empty();
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

$(window).bind("beforeunload", function(_) {
  return "Because this page can load slowly, and you may have outstanding changes, we ask that you confirm before leaving the editor in case closing was an accident.";
});
    
