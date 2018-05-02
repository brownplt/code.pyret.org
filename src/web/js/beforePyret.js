/* global $ jQuery CPO CodeMirror storageAPI Q createProgramCollectionAPI makeShareAPI */

var shareAPI = makeShareAPI(process.env.CURRENT_PYRET_RELEASE);

var url = require('url.js');
var modalPrompt = require('./modal-prompt.js');
window.modalPrompt = modalPrompt;

const LOG = true;
window.ct_log = function(/* varargs */) {
  if (window.console && LOG) {
    console.log.apply(console, arguments);
  }
};

window.ct_error = function(/* varargs */) {
  if (window.console && LOG) {
    console.error.apply(console, arguments);
  }
};
var initialParams = url.parse(document.location.href);
var params = url.parse("/?" + initialParams["hash"]);
window.highlightMode = "mcmh"; // what is this for?
window.clearFlash = function() {
  $(".notificationArea").empty();
}
window.stickError = function(message, more) {
  clearFlash();
  var err = $("<div>").addClass("error").text(message);
  if(more) {
    err.attr("title", more);
  }
  err.tooltip();
  $(".notificationArea").prepend(err);
};
window.flashError = function(message) {
  clearFlash();
  var err = $("<div>").addClass("error").text(message);
  $(".notificationArea").prepend(err);
  err.fadeOut(7000);
};
window.flashMessage = function(message) {
  clearFlash();
  var msg = $("<div>").addClass("active").text(message);
  $(".notificationArea").prepend(msg);
  msg.fadeOut(7000);
};
window.stickMessage = function(message) {
  clearFlash();
  var err = $("<div>").addClass("active").text(message);
  $(".notificationArea").prepend(err);
};
window.mkWarningUpper = function(){return $("<div class='warning-upper'>");}
window.mkWarningLower = function(){return $("<div class='warning-lower'>");}

$(window).bind("beforeunload", function() {
  return "Because this page can load slowly, and you may have outstanding changes, we ask that you confirm before leaving the editor in case closing was an accident.";
});

var Documents = function() {

  function Documents() {
    this.documents = new Map();
  }

  Documents.prototype.has = function (name) {
    return this.documents.has(name);
  };

  Documents.prototype.get = function (name) {
    return this.documents.get(name);
  };

  Documents.prototype.set = function (name, doc) {
    if(logger.isDetailed)
      logger.log("doc.set", {name: name, value: doc.getValue()});
    return this.documents.set(name, doc);
  };

  Documents.prototype.delete = function (name) {
    if(logger.isDetailed)
      logger.log("doc.del", {name: name});
    return this.documents.delete(name);
  };

  Documents.prototype.forEach = function (f) {
    return this.documents.forEach(f);
  };

  return Documents;
}();

var VERSION_CHECK_INTERVAL = 120000 + (30000 * Math.random());

function checkVersion() {
  $.get("/current-version").then(function(resp) {
    resp = JSON.parse(resp);
    if(resp.version && resp.version !== process.env.CURRENT_PYRET_RELEASE) {
      window.flashMessage("A new version of Pyret is available. Save and reload the page to get the newest version.");
    }
  });
}
window.setInterval(checkVersion, VERSION_CHECK_INTERVAL);

window.CPO = {
  save: function() {},
  autoSave: function() {},
  documents : new Documents()
};
$(function() {
  function merge(obj, extension) {
    var newobj = {};
    Object.keys(obj).forEach(function(k) {
      newobj[k] = obj[k];
    });
    Object.keys(extension).forEach(function(k) {
      newobj[k] = extension[k];
    });
    return newobj;
  }
  var animationDiv = null;
  function closeAnimationIfOpen() {
    if(animationDiv) {
      animationDiv.empty();
      animationDiv.dialog("destroy");
      animationDiv = null;
    }
  }
  CPO.makeEditor = function(container, options) {
    var initial = "";
    if (options.hasOwnProperty("initial")) {
      initial = options.initial;
    }

    var textarea = jQuery("<textarea aria-hidden='true'>");
    textarea.val(initial);
    container.append(textarea);

    var runFun = function (code, replOptions) {
      options.run(code, {cm: CM}, replOptions);
    };

    var useLineNumbers = !options.simpleEditor;
    var useFolding = !options.simpleEditor;

    var gutters = !options.simpleEditor ?
      ["CodeMirror-linenumbers", "CodeMirror-foldgutter"] :
      [];

    function reindentAllLines(cm) {
      var last = cm.lineCount();
      cm.operation(function() {
        for (var i = 0; i < last; ++i) cm.indentLine(i);
      });
    }

    // place a vertical line at character 80 in code editor, not repl
    var rulers, rulersMinCol;
    if (options.simpleEditor) {
      rulers = [];
    } else{
      rulers = [{color: "#317BCF", column: 80, lineStyle: "dashed", className: "hidden"}];
      rulersMinCol = 80;
    }

    var cmOptions = {
      extraKeys: CodeMirror.normalizeKeyMap({
        "Shift-Enter": function(cm) { runFun(cm.getValue()); },
        "Shift-Ctrl-Enter": function(cm) { runFun(cm.getValue()); },
        "Tab": "indentAuto",
        "Ctrl-I": reindentAllLines,
        "Esc Left": "goBackwardSexp",
        "Alt-Left": "goBackwardSexp",
        "Esc Right": "goForwardSexp",
        "Alt-Right": "goForwardSexp",
        "Ctrl-Left": "goBackwardToken",
        "Ctrl-Right": "goForwardToken"
      }),
      indentUnit: 2,
      tabSize: 2,
      viewportMargin: Infinity,
      lineNumbers: useLineNumbers,
      matchKeywords: true,
      matchBrackets: true,
      styleSelectedText: true,
      foldGutter: useFolding,
      gutters: gutters,
      lineWrapping: true,
      logging: true,
      rulers: rulers,
      rulersMinCol: rulersMinCol
    };

    cmOptions = merge(cmOptions, options.cmOptions || {});

    var CM = CodeMirror.fromTextArea(textarea[0], cmOptions);


    if (useLineNumbers) {
      CM.display.wrapper.appendChild(mkWarningUpper()[0]);
      CM.display.wrapper.appendChild(mkWarningLower()[0]);
    }

    return {
      cm: CM,
      refresh: function() { CM.refresh(); },
      run: function() {
        runFun(CM.getValue());
      },
      focus: function() { CM.focus(); },
      focusCarousel: null //initFocusCarousel
    };
  };
  CPO.RUN_CODE = function() {
    console.log("Running before ready", arguments);
  };

  function setUsername(target) {
    return gwrap.load({name: 'plus',
      version: 'v1',
    }).then((api) => {
      api.people.get({ userId: "me" }).then(function(user) {
        var name = user.displayName;
        if (user.emails && user.emails[0] && user.emails[0].value) {
          name = user.emails[0].value;
        }
        target.text(name);
      });
    });
  }

  storageAPI.then(function(api) {
    api.collection.then(function() {
      $(".loginOnly").show();
      $(".logoutOnly").hide();
      setUsername($("#username"));
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
    storageAPI = createProgramCollectionAPI("code.pyret.org", false);
    storageAPI.then(function(api) {
      api.collection.then(function() {
        $(".loginOnly").show();
        $(".logoutOnly").hide();
        setUsername($("#username"));
        if(params["get"] && params["get"]["program"]) {
          var toLoad = api.api.getFileById(params["get"]["program"]);
          console.log("Logged in and has program to load: ", toLoad);
          loadProgram(toLoad);
          programToSave = toLoad;
        } else {
          programToSave = Q.fcall(function() { return null; });
        }
      });
      api.collection.fail(function() {
        $("#connectButton").text("Connect to Google Drive");
        $("#connectButton").attr("disabled", false);
      });
    });
    storageAPI = storageAPI.then(function(api) { return api.api; });
  });

  /*
    initialProgram holds a promise for a Drive File object or null

    It's null if the page doesn't have a #share or #program url

    If the url does have a #program or #share, the promise is for the
    corresponding object.
  */
  var initialProgram = storageAPI.then(function(api) {
    var programLoad = null;
    if(params["get"] && params["get"]["program"]) {
      enableFileOptions();
      programLoad = api.getFileById(params["get"]["program"]);
      programLoad.then(function(p) { showShareContainer(p); });
    }
    if(params["get"] && params["get"]["share"]) {
      logger.log('shared-program-load',
        {
          id: params["get"]["share"]
        });
      programLoad = api.getSharedFileById(params["get"]["share"]);
    }
    if(programLoad) {
      programLoad.fail(function(err) {
        console.error(err);
        window.stickError("The program failed to load.");
      });
      return programLoad;
    } else {
      return null;
    }
  });

  function setTitle(progName) {
    document.title = progName + " - code.pyret.org";
  }
  CPO.setTitle = setTitle;

  var filename = false;

  $("#download a").click(function() {
    var downloadElt = $("#download a");
    var contents = CPO.editor.cm.getValue();
    var downloadBlob = window.URL.createObjectURL(new Blob([contents], {type: 'text/plain'}));
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

  var TRUNCATE_LENGTH = 20;

  function truncateName(name) {
    if(name.length <= TRUNCATE_LENGTH + 1) { return name; }
    return name.slice(0, TRUNCATE_LENGTH / 2) + "…" + name.slice(name.length - TRUNCATE_LENGTH / 2, name.length);
  }

  function updateName(p) {
    filename = p.getName();
    $("#filename").text(" (" + truncateName(filename) + ")");
    setTitle(filename);
    showShareContainer(p);
  }

  function loadProgram(p) {
    programToSave = p;
    return p.then(function(prog) {
      if(prog !== null) {
        updateName(prog);
        return prog.getContents();
      }
    });
  }

  function cycleAdvance(currIndex, maxIndex, reverseP) {
    var nextIndex = currIndex + (reverseP? -1 : +1);
    nextIndex = ((nextIndex % maxIndex) + maxIndex) % maxIndex;
    return nextIndex;
  }

  function populateFocusCarousel(editor) {
    if (!editor.focusCarousel) {
      editor.focusCarousel = [];
    }
    var fc = editor.focusCarousel;
    var docmain = document.getElementById("main");
    if (!fc[0]) {
      fc[0] = document.getElementById("Toolbar");
      //fc[0] = document.getElementById("headeronelegend");
    }
    if (!fc[1]) {
      var docreplMain = docmain.getElementsByClassName("replMain");
      var docreplMain0;
      if (docreplMain.length === 0) {
        docreplMain0 = undefined;
      } else if (docreplMain.length === 1) {
        docreplMain0 = docreplMain[0];
      } else {
        for (var i = 0; i < docreplMain.length; i++) {
          if (docreplMain[i].innerText !== "") {
            docreplMain0 = docreplMain[i];
          }
        }
      }
      fc[1] = docreplMain0;
    }
    if (!fc[2]) {
      var docrepl = docmain.getElementsByClassName("repl");
      var docreplcode = docrepl[0].getElementsByClassName("prompt-container")[0].
        getElementsByClassName("CodeMirror")[0];
      fc[2] = docreplcode;
    }
    if (!fc[3]) {
      fc[3] = document.getElementById("announcements");
    }
  }

  function cycleFocus(reverseP) {
    var editor = this.editor;
    var fCarousel = editor.focusCarousel;
    populateFocusCarousel(editor);
    var fCarousel = editor.focusCarousel;
    var maxIndex = fCarousel.length;
    var currentFocusedElt = fCarousel.find(function(node) {
      if (!node) {
        return false;
      } else {
        return node.contains(document.activeElement);
      }
    });
    var currentFocusIndex = fCarousel.indexOf(currentFocusedElt);
    var nextFocusIndex = currentFocusIndex;
    var focusElt;
    do {
      nextFocusIndex = cycleAdvance(nextFocusIndex, maxIndex, reverseP);
      focusElt = fCarousel[nextFocusIndex];
    } while (!focusElt);

    var focusElt0;
    if (focusElt.classList.contains("replMain") ||
      focusElt.classList.contains("CodeMirror")) {
      var textareas = focusElt.getElementsByTagName("textarea");
      if (textareas.length === 0) {
        focusElt0 = focusElt;
      } else if (textareas.length === 1) {
        focusElt0 = textareas[0];
      } else {
        for (var i = 0; i < textareas.length; i++) {
          if (textareas[i].getAttribute('tabIndex')) {
            focusElt0 = textareas[i];
          }
        }
      }
    } else {
      focusElt0 = focusElt;
    }

    document.activeElement.blur();
    focusElt0.click();
    focusElt0.focus();
  }

  var programLoaded = loadProgram(initialProgram);

  var programToSave = initialProgram;

  function showShareContainer(p) {
    if(!p.shared) {
      $("#shareContainer").empty();
      $("#shareContainer").append(shareAPI.makeShareLink(p));
    }
  }

  function nameOrUntitled() {
    return filename || "Untitled";
  }
  function autoSave() {
    programToSave.then(function(p) {
      if(p !== null && !p.shared) { save(); }
    });
  }

  function enableFileOptions() {
    $("#filemenuContents *").removeClass("disabled");
  }

  function menuItemDisabled(id) {
    return $("#" + id).hasClass("disabled");
  }


  function newEvent(e) {
    window.open(window.APP_BASE_URL + "/editor");
  }

  function saveEvent(e) {
    if(menuItemDisabled("save")) { return; }
    return save();
  }

  /*
    save : string (optional) -> undef

    If a string argument is provided, create a new file with that name and save
    the editor contents in that file.

    If no filename is provided, save the existing file referenced by the editor
    with the current editor contents.  If no filename has been set yet, just
    set the name to "Untitled".

  */
  function save(newFilename) {
    if(newFilename !== undefined) {
      var useName = newFilename;
      var create = true;
    }
    else if(filename === false) {
      filename = "Untitled";
      var create = true;
    }
    else {
      var useName = filename; // A closed-over variable
      var create = false;
    }
    window.stickMessage("Saving...");
    var savedProgram = programToSave.then(function(p) {
      if(p !== null && p.shared && !create) {
        return p; // Don't try to save shared files
      }
      if(create) {
        programToSave = storageAPI
          .then(function(api) { return api.createFile(useName); })
          .then(function(p) {
            // showShareContainer(p); TODO(joe): figure out where to put this
            history.pushState(null, null, "#program=" + p.getUniqueId());
            updateName(p); // sets filename
            enableFileOptions();
            return p;
          });
        return programToSave.then(function(p) {
          return save();
        });
      }
      else {
        return programToSave.then(function(p) {
          if(p === null) {
            return null;
          }
          else {
            return p.save(CPO.editor.cm.getValue(), false);
          }
        }).then(function(p) {
          if(p !== null) {
            window.flashMessage("Program saved as " + p.getName());
          }
          return p;
        });
      }
    });
    savedProgram.fail(function(err) {
      window.stickError("Unable to save", "Your internet connection may be down, or something else might be wrong with this site or saving to Google.  You should back up any changes to this program somewhere else.  You can try saving again to see if the problem was temporary, as well.");
      console.error(err);
    });
    return savedProgram;
  }

  function saveAs() {
    if(menuItemDisabled("saveas")) { return; }
    programToSave.then(function(p) {
      var name = p === null ? "Untitled" : p.getName();
      var saveAsPrompt = new modalPrompt({
        title: "Save a copy",
        style: "text",
        options: [
          {
            message: "The name for the copy:",
            defaultValue: name
          }
        ]
      });
      return saveAsPrompt.show().then(function(newName) {
        if(newName === null) { return null; }
        window.stickMessage("Saving...");
        return save(newName);
      }).
      fail(function(err) {
        console.error("Failed to rename: ", err);
        window.flashError("Failed to rename file");
      });
    });
  }

  function rename() {
    programToSave.then(function(p) {
      var renamePrompt = new modalPrompt({
        title: "Rename this file",
        style: "text",
        options: [
          {
            message: "The new name for the file:",
            defaultValue: p.getName()
          }
        ]
      });
      // null return values are for the "cancel" path
      return renamePrompt.show().then(function(newName) {
        if(newName === null) {
          return null;
        }
        window.stickMessage("Renaming...");
        programToSave = p.rename(newName);
        return programToSave;
      })
      .then(function(p) {
        if(p === null) {
          return null;
        }
        updateName(p);
        window.flashMessage("Program saved as " + p.getName());
      })
      .fail(function(err) {
        console.error("Failed to rename: ", err);
        window.flashError("Failed to rename file");
      });
    })
    .fail(function(err) {
      console.error("Unable to rename: ", err);
    });
  }

  $("#runButton").click(function() {
    CPO.autoSave();
  });

  $("#new").click(newEvent);
  $("#save").click(saveEvent);
  $("#rename").click(rename);
  $("#saveas").click(saveAs);

  shareAPI.makeHoverMenu($("#filemenu"), $("#filemenuContents"), false, function(){});
  shareAPI.makeHoverMenu($("#bonniemenu"), $("#bonniemenuContents"), false, function(){});

  var codeContainer = $("<div>").addClass("replMain");
  codeContainer.attr("role", "region").
    attr("aria-label", "Definitions");
    //attr("tabIndex", "-1");
  $("#main").prepend(codeContainer);

  CPO.editor = CPO.makeEditor(codeContainer, {
    runButton: $("#runButton"),
    simpleEditor: false,
    run: CPO.RUN_CODE,
    initialGas: 100
  });
  CPO.editor.cm.setOption("readOnly", "nocursor");
  CPO.editor.cm.setOption("longLines", new Map());
  function removeShortenedLine(lineHandle) {
    var rulers = CPO.editor.cm.getOption("rulers");
    var rulersMinCol = CPO.editor.cm.getOption("rulersMinCol");
    var longLines = CPO.editor.cm.getOption("longLines");
    if (lineHandle.text.length <= rulersMinCol) {
      lineHandle.rulerListeners.forEach((f, evt) => lineHandle.off(evt, f));
      longLines.delete(lineHandle);
      // console.log("Removed ", lineHandle);
      refreshRulers();
    }
  }
  function deleteLine(lineHandle) {
    var longLines = CPO.editor.cm.getOption("longLines");
    lineHandle.rulerListeners.forEach((f, evt) => lineHandle.off(evt, f));
    longLines.delete(lineHandle);
    // console.log("Removed ", lineHandle);
    refreshRulers();
  }
  function refreshRulers() {
    var rulers = CPO.editor.cm.getOption("rulers");
    var longLines = CPO.editor.cm.getOption("longLines");
    var minLength;
    if (longLines.size == 0) {
      minLength = 0; // if there are no long lines, then we don't care about showing any rulers
    } else {
      minLength = Number.MAX_VALUE;
      longLines.forEach(function(lineNo, lineHandle) {
        if (lineHandle.text.length < minLength) { minLength = lineHandle.text.length; }
      });
    }
    for (var i = 0; i < rulers.length; i++) {
      if (rulers[i].column >= minLength) {
        rulers[i].className = "hidden";
      } else {
        rulers[i].className = undefined;
      }
    }
    // gotta set the option twice, or else CM short-circuits and ignores it
    CPO.editor.cm.setOption("rulers", undefined);
    CPO.editor.cm.setOption("rulers", rulers);
  }
  CPO.editor.cm.on('changes', function(instance, changeObjs) {
    var minLine = instance.lastLine(), maxLine = 0;
    var rulersMinCol = instance.getOption("rulersMinCol");
    var longLines = instance.getOption("longLines");
    changeObjs.forEach(function(change) {
      if (minLine > change.from.line) { minLine = change.from.line; }
      if (maxLine < change.from.line + change.text.length) { maxLine = change.from.line + change.text.length; }
    });
    var changed = false;
    instance.eachLine(minLine, maxLine, function(lineHandle) {
      if (lineHandle.text.length > rulersMinCol) {
        if (!longLines.has(lineHandle)) {
          changed = true;
          longLines.set(lineHandle, lineHandle.lineNo());
          lineHandle.rulerListeners = new Map([
            ["change", removeShortenedLine],
            ["delete", function() { // needed because the delete handler gets no arguments at all
              deleteLine(lineHandle);
            }]
          ]);
          lineHandle.rulerListeners.forEach((f, evt) => lineHandle.on(evt, f));
          // console.log("Added ", lineHandle);
        }
      } else {
        if (longLines.has(lineHandle)) {
          changed = true;
          longLines.delete(lineHandle);
          // console.log("Removed ", lineHandle);
        }
      }
    });
    if (changed) {
      refreshRulers();
    }
  });

  programLoaded.then(function(c) {
    CPO.documents.set("definitions://", CPO.editor.cm.getDoc());

    // NOTE(joe): Clearing history to address https://github.com/brownplt/pyret-lang/issues/386,
    // in which undo can revert the program back to empty
    CPO.editor.cm.clearHistory();
    CPO.editor.cm.setValue(c);
  });

  programLoaded.fail(function() {
    CPO.documents.set("definitions://", CPO.editor.cm.getDoc());
  });

  var pyretLoad = document.createElement('script');
  console.log(process.env.PYRET);
  pyretLoad.src = process.env.PYRET;
  pyretLoad.type = "text/javascript";
  document.body.appendChild(pyretLoad);

  var pyretLoad2 = document.createElement('script');

  function logFailureAndManualFetch(url, e) {

    // NOTE(joe): The error reported by the "error" event has essentially no
    // information on it; it's just a notification that _something_ went wrong.
    // So, we log that something happened, then immediately do an AJAX request
    // call for the same URL, to see if we can get more information. This
    // doesn't perfectly tell us about the original failure, but it's
    // something.

    // In addition, if someone is seeing the Pyret failed to load error, but we
    // don't get these logging events, we have a strong hint that something is
    // up with their network.
    logger.log('pyret-load-failure',
      {
        event : 'initial-failure',
        url : url,

        // The timestamp appears to count from the beginning of page load,
        // which may approximate download time if, say, requests are timing out
        // or getting cut off.

        timeStamp : e.timeStamp
      });

    var manualFetch = $.ajax(url);
    manualFetch.then(function(res) {
      // Here, we log the first 100 characters of the response to make sure
      // they resemble the Pyret blob
      logger.log('pyret-load-failure', {
        event : 'success-with-ajax',
        contentsPrefix : res.slice(0, 100)
      });
    });
    manualFetch.fail(function(res) {
      logger.log('pyret-load-failure', {
        event : 'failure-with-ajax',
        status: res.status,
        statusText: res.statusText,
        // Since responseText could be a long error page, and we don't want to
        // log huge pages, we slice it to 100 characters, which is enough to
        // tell us what's going on (e.g. AWS failure, network outage).
        responseText: res.responseText.slice(0, 100)
      });
    });
  }

  $(pyretLoad).on("error", function(e) {
    logFailureAndManualFetch(process.env.PYRET, e);
    console.log(process.env);
    pyretLoad2.src = process.env.PYRET_BACKUP;
    pyretLoad2.type = "text/javascript";
    document.body.appendChild(pyretLoad2);
  });

  $(pyretLoad2).on("error", function(e) {
    $("#loader").hide();
    $("#runPart").hide();
    $("#breakButton").hide();
    window.stickError("Pyret failed to load; check your connection or try refreshing the page.  If this happens repeatedly, please report it as a bug.");
    logFailureAndManualFetch(process.env.PYRET_BACKUP, e);

  });

  programLoaded.fin(function() {
    CPO.editor.focus();
    CPO.editor.cm.setOption("readOnly", false);
  });

  CPO.autoSave = autoSave;
  CPO.save = save;
  CPO.updateName = updateName;
  CPO.showShareContainer = showShareContainer;
  CPO.loadProgram = loadProgram;
  CPO.cycleFocus = cycleFocus;

});
