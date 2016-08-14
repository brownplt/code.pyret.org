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
    return this.documents.set(name, doc);
  };
  
  Documents.prototype.delete = function (name) {
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
  var highlightEagerness    = sessionStorage.getItem('highlight-eagerness');
  var highlightColorfulness = sessionStorage.getItem('highlight-colorfulness');
  if(highlightEagerness !== null) {
    $("#highlight-eager").prop("checked",   highlightEagerness === 'eager');
    $("#highlight-lazy").prop("checked",    highlightEagerness === 'lazy');
  } else {
    sessionStorage.setItem('highlight-eagerness', 'eager');
  }
  if(highlightColorfulness !== null) {
    $("#highlight-vibrant").prop("checked",  highlightColorfulness === 'vibrant');
    $("#highlight-drab").prop("checked",     highlightColorfulness === 'drab');
  } else {
    sessionStorage.setItem('highlight-colorfulness', 'vibrant');
  }
  function logChange() {
    $(".highlight-settings").trigger('settingChanged',
      sessionStorage.getItem('highlight-eagerness'),
      sessionStorage.getItem('highlight-colorfulness'));
  }
  $("#highlight-eager").change(function(e) {
    if(this.checked) {sessionStorage.setItem('highlight-eagerness', 'eager');logChange();}
  });
  $("#highlight-lazy").change(function(e) {
    if(this.checked) {sessionStorage.setItem('highlight-eagerness', 'lazy');logChange();}
  });
  $("#highlight-vibrant").change(function(e) {
    if(this.checked) {sessionStorage.setItem('highlight-colorfulness', 'vibrant');logChange();}
  });
  $("#highlight-drab").change(function(e) {
    if(this.checked) {sessionStorage.setItem('highlight-colorfulness', 'drab');logChange();}
  });

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
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "test-marker-gutter"],
      lineWrapping: true
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
    storageAPI = createProgramCollectionAPI("code.pyret.org", false);
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
      api.collection.fail(function() {
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

  $("#download a").click(function() {
    var downloadElt = $("#download a");
    var contents = CPO.editor.cm.getValue();
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
    return $("#program-name").val() || "Untitled";
  }
  function autoSave() {
    programToSave.then(function(p) {
      if(p !== null && !copyOnSave) { save(); }
    });
  }
  CPO.autoSave = autoSave;
  CPO.showShareContainer = showShareContainer;
  CPO.loadProgram = loadProgram;

  function save() {
    window.stickMessage("Saving...");
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
          return p.save(CPO.editor.cm.getValue(), false);
        })
        .then(function(p) {
          $("#program-name").val(p.getName());
          $("#saveButton").text("Save");
          history.pushState(null, null, "#program=" + p.getUniqueId());
          window.location.hash = "#program=" + p.getUniqueId();
          window.flashMessage("Program saved as " + p.getName());
          setTitle(p.getName());
          return p;
        });
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
      window.stickError("Unable to save", "Your internet connection may be down, or something else might be wrong with this site or saving to Google.  You should back up any changes to this program somewhere else.  You can try saving again to see if the problem was temporary, as well.");
      console.error(err);
    });
  }
  CPO.save = save;
  $("#runButton").click(CPO.autoSave);
  $("#saveButton").click(save);
  shareAPI.makeHoverMenu($("#menu"), $("#menuContents"), false, function(){});

  programLoaded.then(function(c) {
    var codeContainer = $("<div>").addClass("replMain");
    $("#main").prepend(codeContainer);

    CPO.editor = CPO.makeEditor(codeContainer, {
      runButton: $("#runButton"),
      simpleEditor: false,
      initial: c,
      run: CPO.RUN_CODE,
      initialGas: 100
    });
    
    CPO.documents.set("definitions://", CPO.editor.cm.getDoc());
    
    // NOTE(joe): Clearing history to address https://github.com/brownplt/pyret-lang/issues/386,
    // in which undo can revert the program back to empty
    CPO.editor.cm.clearHistory();
  });

  programLoaded.fail(function() {
    var codeContainer = $("<div>").addClass("replMain");
    $("#main").prepend(codeContainer);

    CPO.editor = CPO.makeEditor(codeContainer, {
      runButton: $("#runButton"),
      simpleEditor: false,
      run: CPO.RUN_CODE,
      initialGas: 100
    });
    
    CPO.documents.set("definitions://", CPO.editor.cm.getDoc());
  });

  programLoaded.fin(function() {
    var pyretLoad = document.createElement('script');
    console.log(process.env.PYRET);
    pyretLoad.src = process.env.PYRET;
    pyretLoad.type = "text/javascript";
    document.body.appendChild(pyretLoad);
    CPO.editor.focus();
  });

});
