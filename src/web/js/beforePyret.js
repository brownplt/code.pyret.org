/* global $ jQuery CPO CodeMirror storageAPI Q createProgramCollectionAPI makeShareAPI */

var shareAPI = makeShareAPI(process.env.CURRENT_PYRET_RELEASE);

var url = require('url.js');

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

    var textarea = jQuery("<textarea>");
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

    var cmOptions = {
      extraKeys: {
        "Shift-Enter": function(cm) { runFun(cm.getValue()); },
        "Shift-Ctrl-Enter": function(cm) { runFun(cm.getValue()); },
        "Tab": "indentAuto",
        "Ctrl-I": reindentAllLines
      },
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
      logging: true
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
      focus: function() { CM.focus(); }
    };
  };
  CPO.RUN_CODE = function() {

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
    storageAPI = createProgramCollectionAPI("code.pyret.org", false);
    storageAPI.then(function(api) {
      api.collection.then(function() {
        $(".loginOnly").show();
        $(".logoutOnly").hide();
        setUsername($("#username"));
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

  function truncateName(name) {
    if(name.length < 14) { return name; }
    return name.slice(0, 6) + "⋯" + name.slice(name.length - 6, name.length);
  }

  function updateName(p) {
    filename = p.getName();
    $("#filename").text(" (" + truncateName(filename) + ")");
    setTitle(filename);
  }

  function loadProgram(p) {
    return p.then(function(p) {
      if(p !== null) {
        updateName(p);
        return p.getContents();
      }
    });
  }

  var programLoaded = loadProgram(initialProgram);

  var programToSave = initialProgram;

  function showShareContainer(p) {
    $("#shareContainer").empty();
    $("#shareContainer").append(shareAPI.makeShareLink(p));
  }

  function nameOrUntitled() {
    return filename || "Untitled";
  }
  function autoSave() {
    programToSave.then(function(p) {
      if(p !== null) { save(); }
    });
  }

  function enableFileOptions() {
    $(".filemenuContents *").removeClass("disabled");
  }

  function menuItemDisabled(id) {
    return $("#" + id).attr("class").indexOf("disabled") !== -1;
  }

  /*
    save : string (optional) -> undef

    If a string argument is provided, create a new file with that name and save
    the editor contents in that file.

    If no filename is provided, save the existing file referenced by the editor
    with the current editor contents.  If no filename has been set yet, just
    set the name to "Untitled".

  */
  function saveEvent(e) {
    if(menuItemDisabled("save")) { return; }
    return save();
  }

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
      if(create) {
        programToSave = storageAPI
          .then(function(api) { return api.createFile(useName); })
          .then(function(p) {
            // showShareContainer(p); TODO(joe): figure out where to put this
            history.pushState(null, null, "#program=" + p.getUniqueId());
            updateName(p);
            enableFileOptions();
            return save();
          });
        return programToSave;
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
    var saveAsDiv = $("<div>").css({"z-index": 15000});
    saveAsDiv.dialog({
      title: "Save As",
      modal: true,
      overlay : { opacity: 0.5, background: 'black'},
      width : "70%",
      height : "auto",
      closeOnEscape : true
    });
    var currentName = $("<textarea>").val(filename || "Untitled");
    var submit = $("<button>").addClass("blueButton").text("Save As");
    var cancel = $("<button>").addClass("blueButton").text("Cancel");
    saveAsDiv.append(cancel);
    saveAsDiv.append(submit);
    saveAsDiv.append(currentName);
    submit.click(function() {
      var newName = currentName.val();
      save(newName);
      saveAsDiv.dialog("close");
    });
    cancel.click(function() { saveAsDiv.dialog("close"); });
  }

  function rename() {
    if(menuItemDisabled("rename")) { return; }
    var renameDiv = $("<div>").css({"z-index": 15000});
    renameDiv.dialog({
      title: "Rename File",
      modal: true,
      overlay : { opacity: 0.5, background: 'black'},
      width : "70%",
      height : "auto",
      closeOnEscape : true
    });
    var currentName = $("<textarea>").val(filename || "Untitled");
    var submit = $("<button>").addClass("blueButton").text("Rename");
    var cancel = $("<button>").addClass("blueButton").text("Cancel");
    renameDiv.append(cancel);
    renameDiv.append(submit);
    renameDiv.append(currentName);
    submit.click(function() {
      programToSave.then(function(p) {
        var newName = currentName.val();
        programToSave = p.rename(newName).then(function(newP) {
          return newP;
        });
        return programToSave;
      })
      .then(function(p) {
        window.flashMessage("Program saved as " + p.getName());
        updateName(p);
      })
      .fail(function(err) {
        console.err("Failed to rename: ", err);
        window.flashError("Failed to rename file");
      })
      .fin(function() {
        renameDiv.dialog("close");
      });
    });
    cancel.click(function() { renameDiv.dialog("close"); });
  }

  CPO.save = save;

  $("#runButton").click(CPO.autoSave);

  $("#save").click(saveEvent);
  $("#rename").click(rename);
  $("#saveas").click(saveAs);

  shareAPI.makeHoverMenu($("#filemenu"), $("#filemenuContents"), false, function(){});
  shareAPI.makeHoverMenu($("#bonniemenu"), $("#bonniemenuContents"), false, function(){});

  var codeContainer = $("<div>").addClass("replMain");
  $("#main").prepend(codeContainer);

  CPO.editor = CPO.makeEditor(codeContainer, {
    runButton: $("#runButton"),
    simpleEditor: false,
    run: CPO.RUN_CODE,
    initialGas: 100
  });
  CPO.editor.cm.setOption("readOnly", "nocursor");
  
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
  $(pyretLoad).on("error", function() {
    $("#loader").hide();
    $("#runPart").hide();
    $("#breakButton").hide();
    window.stickError("Pyret failed to load; check your connection or try refreshing the page.  If this happens repeatedly, please report it as a bug.");
  });

  programLoaded.fin(function() {
    CPO.editor.focus();
    CPO.editor.cm.setOption("readOnly", false);
  });

  CPO.autoSave = autoSave;
  CPO.save = save;
  CPO.showShareContainer = showShareContainer;
  CPO.loadProgram = loadProgram;

});
