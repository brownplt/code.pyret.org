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
  define("repl-main", ["/js/repl-ui.js", "js/runtime-anf",
  "/js/guess-gas.js",
  "/js/http-imports.js", "compiler/compile-lib.arr", "trove/repl",
  "trove/runtime-lib", "compiler/repl-support.arr",
  "compiler/locators/builtin.arr", "/js/cpo-builtins.js", "/js/gdrive-locators.js",
  "compiler/compile-structs.arr"],
  function(replUI, rtLib, guessGas, http, compileLib,
  pyRepl, runtimeLib, replSupport, builtin, cpoBuiltin, gdriveLocators, compileStructs) {
    makeHoverMenu($("#menu"), $("#menuContents"), false, function() {});
    var runtime = rtLib.makeRuntime({stdout: function(str) { console.log(str); } });
    runtime.setParam("imgUrlProxy", function(s) {
      return APP_BASE_URL + "/downloadImg?" + s;
    });

    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    var gtf = function(m, f) { return gf(m, "types")[f]; };
    var okImports = [
        "world",
        "image",
        "image-structs",
        "string-dict",
        "checkers",
        "lists",
        "error",
        "option",
        "pick",
        "either",
        "sets",
        "arrays",
        "contracts",
        "ast",
        "parse-pyret",
        "s-exp",
        "s-exp-structs",
        "pprint",
        "srcloc",
        "format",
        "equality",
        "valueskeleton",
        "plot",
        "graph",
        "particle",
        "json"
    ];

    // Back-patched in later
    var editor = { cm : { getValue : function() { return ""; }}};

    runtime.runThunk(function() {
      return runtime.loadModulesNew(runtime.namespace,
        [compileLib, pyRepl, runtimeLib, replSupport, builtin, compileStructs],
        function(compileLib, pyRepl, runtimeLib, replSupport, builtin, compileStructs) {
          var replNS = runtime.namespace;
          var replEnv = gmf(compileStructs, "standard-builtins");
          var constructors = gdriveLocators.makeLocatorConstructors(storageAPI, runtime, compileLib, compileStructs);
          function findModule(contextIgnored, dependency) {
            return runtime.safeCall(function() {
              return runtime.ffi.cases(gmf(compileStructs, "is-Dependency"), "Dependency", dependency, 
                {
                  builtin: function(name) {
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
                  },
                  dependency: function(protocol, args) {
                    var arr = runtime.ffi.toArray(args);
                    if (protocol === "my-gdrive") {
                      return constructors.makeMyGDriveLocator(arr[0]);
                    }
                    else if (protocol === "shared-gdrive") {
                      return constructors.makeSharedGDriveLocator(arr[0], arr[1]);
                    }
                    else if (protocol === "js-http") {
                      // TODO: THIS IS WRONG with the new locator system
                      return http.getHttpImport(runtime, args[0]);
                    }
                    else if (protocol === "gdrive-js") {
                      return constructors.makeGDriveJSLocator(arr[0], arr[1]);
                    }
                    else {
                      console.error("Unknown import: ", dependency);
                    }
                  }
                });
             }, function(l) {
                return gmf(compileLib, "located").app(l, runtime.nothing); 
             });
          }

          // NOTE(joe): This line is "cheating" by mixing runtime levels,
          // and uses the same runtime for the compiler and running code.
          // Usually you can only get a new Runtime by calling create, but
          // here we magic the current runtime into one.
          var pyRuntime = gf(gf(runtimeLib, "internal").brandRuntime, "brand").app(
            runtime.makeObject({
              "runtime": runtime.makeOpaque(runtime)
            }));

          return runtime.safeCall(function() {
            return gmf(replSupport, "make-repl-definitions-locator").app(
              "definitions",
              "definitions",
              runtime.makeFunction(function() {
                return editor.cm.getValue();
              }),
              gmf(compileStructs, "standard-globals"));
          }, function(locator) {
            return runtime.safeCall(function() {
              return gmf(pyRepl, "make-repl").app(pyRuntime, locator, runtime.nothing, runtime.makeFunction(findModule));
            }, function(repl) {
              var jsRepl = {
                runtime: runtime.getField(pyRuntime, "runtime").val,
                restartInteractions: function(ignoredStr, typeCheck) {
                  var ret = Q.defer();
                  setTimeout(function() {
                    runtime.runThunk(function() {
                      return gf(repl, "restart-interactions").app(typeCheck);
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
                          return gmf(replSupport,
                          "make-repl-interaction-locator").app(
                            name,
                            name,
                            runtime.makeFunction(function() { return str; }),
                            repl);
                        },
                        function(locator) {
                          return gf(repl, "run-interaction").app(locator); 
                        });
                    }, function(result) {
                      ret.resolve(result);
                    });
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
              return jsRepl;
            });
          });
        });
    }, function(jsRepl) {
      if(runtime.isSuccessResult(jsRepl)) {
        editorUI.then(function(res) {
          editor = res.editor;
          res.cont(jsRepl.result, runtime);
        });
        editorUI.fail(function(err) {
          console.error("Error loading Editor UI: ", err);
        });
      }
      else {
        console.error("Error loading REPL: ", jsRepl);
      }
      
      /* intentional no-op - continuation in doWithRepl above does the next
       * thing */
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
  var msg = $("<div>").addClass("active").text(message);
  $(".notificationArea").prepend(msg);
  msg.fadeOut(7000);
}
function stickMessage(message) {
  clearFlash();
  var err = $("<div>").addClass("active").text(message);
  $(".notificationArea").prepend(err);
}

$(window).bind("beforeunload", function(_) {
  return "Because this page can load slowly, and you may have outstanding changes, we ask that you confirm before leaving the editor in case closing was an accident.";
});
