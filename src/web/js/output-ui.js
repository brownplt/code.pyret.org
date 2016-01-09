define(["js/js-numbers","/js/share.js","trove/srcloc", "trove/error-display", "/js/gdrive-locators.js", "compiler/compile-structs.arr", "compiler/compile-lib.arr", "trove/parse-pyret"], function(jsnums,share,srclocLib,errordisplayLib,gdriveLocators, compileLib, compileStructs, parsePyret) {

  // TODO(joe Aug 18 2014) versioning on shared modules?  Use this file's
  // version or something else?
  var shareAPI = makeShareAPI("");
  Math.LN10 = Math.LN10 || Math.log(10);
  Math.log10 = Math.log10 || function log10(n) { return Math.log(n) / Math.LN10; };
  
  function mapK(inList, f, k, outList) {
    if (inList.length === 0) { k(outList || []); }
    else {
      var newInList = inList.slice(1, inList.length);
      f(inList[0], function(v) {
        mapK(newInList, f, k, (outList || []).concat([v]))
      });
    }
  }

  function expandableMore(dom) {
    var container = $("<div>");
    var moreLink = $("<a>").text("(More...)");
    var lessLink = $("<a>").text("(Less...)");
    function toggle() {
      dom.toggle();
      lessLink.toggle();
      moreLink.toggle();
    }
    moreLink.on("click", toggle);
    lessLink.on("click", toggle);
    container.append(moreLink).append(lessLink).append(dom);
    dom.hide();
    lessLink.hide();
    return container;
  }
  
  //http://stackoverflow.com/a/7627603
  function cssSanitize(name) {
    return name.replace(/[^a-z0-9]/g, function(s) {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
  }

  function getLastUserLocation(runtime, srcloc, e, ix) {
    var srclocStack = e.map(runtime.makeSrcloc);
    var isSrcloc = function(s) { return runtime.unwrap(runtime.getField(srcloc, "is-srcloc").app(s)); }
    var userLocs = srclocStack.filter(function(l) {
      if(!(l && isSrcloc(l))) { return false; }
      var source = runtime.getField(l, "source");
      return (source === "definitions" 
              || source.indexOf("interactions") !== -1
              || source.indexOf("gdrive") !== -1);
    });
    var probablyErrorLocation = userLocs[ix];
    return probablyErrorLocation;
  }
  
  var warnDesired = 0;
  var warnWait = 250;
  var warnDuration = 5000;
  var fadeAmt = 0.5;
  
  function setWarningState(obj) {
    var opacity = Number(obj.css("opacity"));
    if (warnDesired !== opacity) {
      // Only act if the warning is all the way in or out.  The '1'
      // in the following test is because the initial state is
      // opacity = 1, though the element is not visible.
      if ((opacity === 0) || (opacity === fadeAmt) || (opacity === 1)) {
        if (warnDesired === fadeAmt) {
          obj.fadeTo("fast", fadeAmt, function() {
            setTimeout(function() {
              obj.fadeTo("slow", 0.0);
              warnDesired = 0;
            }, warnDuration) });
        } else {
          obj.fadeTo("fast", 0.0);
        }
      }
    }
  }
  
  function hintLoc(runtime, editors, srcloc, loc) {
    var editor = editors[runtime.getField(loc, "source")];
    if(!editor) { return; }
    var cmLoc = cmPosFromSrcloc(runtime, srcloc, loc);
    var locKey = cssSanitize(runtime.getField(loc,"format").app(true));
    var view = editor.getScrollInfo();
    var charCh = editor.charCoords(cmLoc.start, "local");
    $("."+locKey).addClass("hover");
    if (view.top > charCh.top) {
      warnDesired = fadeAmt;
      var warningUpper = jQuery(editor.getWrapperElement()).find(".warning-upper");
      setTimeout(function() {setWarningState(warningUpper);}, warnWait);
    } else if (view.top + view.clientHeight < charCh.bottom) {
      warnDesired = fadeAmt;
      var warningLower = jQuery(editor.getWrapperElement()).find(".warning-lower");
      setTimeout(function() {setWarningState(warningLower);}, warnWait);
    }
  }
  
  function unhintLoc(runtime, editors, srcloc, loc) {
    var editor = editors[runtime.getField(loc, "source")];
    if(!editor) { return; }
    var cmLoc = cmPosFromSrcloc(runtime, srcloc, loc);
    var locKey = cssSanitize(runtime.getField(loc,"format").app(true));
    $("."+locKey).removeClass("hover");
    warnDesired = 0;
    setTimeout(function() { setWarningState(jQuery(".warning-upper"));},
               warnWait);
    setTimeout(function() { setWarningState(jQuery(".warning-lower"));},
               warnWait);
  }
  
  function gotoLoc(runtime, editors, srcloc, loc) {
    var editor = editors[runtime.getField(loc, "source")];
    if(!editor) { return; }
    var cmLoc = cmPosFromSrcloc(runtime, srcloc, loc);
    warnDesired = 0;
    jQuery(".warning-upper").fadeOut("fast");
    jQuery(".warning-lower").fadeOut("fast");
    editor.scrollIntoView(cmLoc.start, 100)
  }
  
  function hoverSrclocAnchor(runtime, editors, srcloc, elt, loc) {
    var warnDesired = 0;
    var warnWait = 250;
    var warnDuration = 5000;
    var fadeAmt = 0.5;
      
    var editor = editors[runtime.getField(loc, "source")];
    if(!editor) { return; }
    cmLoc = cmPosFromSrcloc(runtime, srcloc, loc);
    var locKey = cssSanitize(runtime.getField(loc,"format").app(true));
    function setWarningState(obj) {
      var opacity = Number(obj.css("opacity"));
      if (warnDesired !== opacity) {
        // Only act if the warning is all the way in or out.  The '1'
        // in the following test is because the initial state is
        // opacity = 1, though the element is not visible.
        if ((opacity === 0) || (opacity === fadeAmt) || (opacity === 1)) {
          if (warnDesired === fadeAmt) {
            obj.fadeTo("fast", fadeAmt, function() {
              setTimeout(function() {
                obj.fadeTo("slow", 0.0);
                warnDesired = 0;
              }, warnDuration) });
          } else {
            obj.fadeTo("fast", 0.0);
          }
        }
      }
    }
    
    elt.on("mouseenter", function() {
      var view = editor.getScrollInfo();
      var charCh = editor.charCoords(cmLoc.start, "local");
      $("."+locKey).addClass("hover");
      if (view.top > charCh.top) {
        warnDesired = fadeAmt;
        var warningUpper = jQuery(editor.getWrapperElement()).find(".warning-upper");
        setTimeout(function() {setWarningState(warningUpper);}, warnWait);
      } else if (view.top + view.clientHeight < charCh.bottom) {
        warnDesired = fadeAmt;
        var warningLower = jQuery(editor.getWrapperElement()).find(".warning-lower");
        setTimeout(function() {setWarningState(warningLower);}, warnWait);
      }
    });
    
    elt.on("mouseleave", function() {
      $("."+locKey).removeClass("hover");
      warnDesired = 0;
      setTimeout(function() { setWarningState(jQuery(".warning-upper"));},
                 warnWait);
      setTimeout(function() { setWarningState(jQuery(".warning-lower"));},
                 warnWait);
    });
    
    elt.on("click", function() {
      warnDesired = 0;
      jQuery(".warning-upper").fadeOut("fast");
      jQuery(".warning-lower").fadeOut("fast");
      editor.scrollIntoView(cmLoc.start, 100)
    });
  }
  
  function hoverLocs(editors, runtime, srcloc, elt, locs, cls) {
    var get = runtime.getField;
    var cases = runtime.ffi.cases;

     // Produces a Code Mirror position from a Pyret location.  Note
     // that Code Mirror seems to use zero-based lines.
    function cmPosFromSrcloc(s) {
      return cases(get(srcloc, "Srcloc"), "Srcloc", s, {
        "builtin": function(_) {
           throw new Error("Cannot get CodeMirror loc from builtin location");
        },

        "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
          var extraCharForZeroWidthLocs = endCh === startCh ? 1 : 0;
          return {
            start: { line: startL - 1, ch: startC },
            end: { line: endL - 1, ch: endC + extraCharForZeroWidthLocs }
          };
        }
      });
    }
    // not this one
    function highlightSrcloc(s, cls, withMarker) {
      return runtime.safeCall(function() {
        return cases(get(srcloc, "Srcloc"), "Srcloc", s, {
          "builtin": function(_) { /* no-op */ },
          "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
            var cmLoc = cmPosFromSrcloc(s);
            var editor = editors[source];
            if(editor) {
              return editor.markText(
                cmLoc.start,
                cmLoc.end,
                { className: cls });
            } else {
              return null;
            }
          }
        });
      }, withMarker);
    }

    // There are warnings to show indicating whether the check output
    // is from a check that is currently off screen.  The problem is
    // that the repl output is a bunch of little elements, so moving
    // from one line to another of the check output is likely to
    // trigger a mouseleave and then a mouseenter event. Showing the
    // warnings in a sensible way (not having them flicker in and out)
    // involves ignoring some of these transitions.
    //
    // The other problem is that the mouse events are not 100%
    // reliable. That is, a fast swipe through a bunch of small areas
    // is probably not going to provide an even number of enter and
    // leave events. More likely one or more enter and leave events
    // will be skipped.  So we arrange for a fadeout of the warning
    // after a few seconds.

    // Set this to the opacity desired for the warning.  This should
    // be either fadeAmt or zero.
    var warnDesired = 0;
    // These are just fixed parameters and can be eliminated if
    // efficiency demands it.
    var warnWait = 250;
    var warnDuration = 5000;
    var fadeAmt = 0.5;

    function setWarningState(obj) {

      var opacity = Number(obj.css("opacity"));

      if (warnDesired !== opacity) {
        // Only act if the warning is all the way in or out.  The '1'
        // in the following test is because the initial state is
        // opacity = 1, though the element is not visible.
        if ((opacity === 0) || (opacity === fadeAmt) || (opacity === 1)) {
          if (warnDesired === fadeAmt) {
            obj.fadeTo("fast", fadeAmt, function() {
              setTimeout(function() {
                obj.fadeTo("slow", 0.0);
                warnDesired = 0;
              }, warnDuration) });
          } else {
            obj.fadeTo("fast", 0.0);
          }
        }
      }
    }
    var cases = runtime.ffi.cases;
    var get = runtime.getField;
    // CLICK to *cycle* through locations
    var marks = [];
    elt.on("mouseenter", function() {
      var curLoc = locs[locIndex];
      var editor = editors[get(curLoc, "source")];
      if(!editor) { return; }
      if (jQuery(editor.getWrapperElement()).find(".warning-upper").length !== 0) { 
        var view = editor.getScrollInfo();
        cases(get(srcloc, "Srcloc"), "Srcloc", curLoc, {
          "builtin": function(_) { },
          "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
            var charCh = editor.charCoords(cmPosFromSrcloc(curLoc).start, "local");
            if (view.top > charCh.top) {
              warnDesired = fadeAmt;
              // We set a timeout so that a quick pass through the area
              // won't bring up the warning.
              var warningUpper = jQuery(editor.getWrapperElement()).find(".warning-upper");
              setTimeout(function() { setWarningState(warningUpper); },
                         warnWait);
            } else if (view.top + view.clientHeight < charCh.bottom) {
              warnDesired = fadeAmt;
              var warningLower = jQuery(editor.getWrapperElement()).find(".warning-lower");
              setTimeout(function() { setWarningState(warningLower); },
                         warnWait);
            }
          }
        });
      }
      mapK(locs, function(l, k) { highlightSrcloc(l, cls, k); }, function(ms) {
        marks = marks.concat(ms.filter(function(m) { return m !==  null; }));
      });
    });
    elt.on("mouseleave", function() {
      warnDesired = 0;
      setTimeout(function() { setWarningState(jQuery(".warning-upper"));},
                 warnWait);
      setTimeout(function() { setWarningState(jQuery(".warning-lower"));},
                 warnWait);

      marks.forEach(function(m) { return m && m.clear(); })
      marks = [];
    });
    var locIndex = 0;
    if (locs.filter(function(e) { return runtime.isObject(e) && get(srcloc, "is-srcloc").app(e); }).length > 0) {
      elt.on("click", function() {
        warnDesired = 0;
        jQuery(".warning-upper").fadeOut("fast");
        jQuery(".warning-lower").fadeOut("fast");
        function gotoNextLoc() {
          var curLoc = locs[locIndex];
          var editor = editors[get(curLoc, "source")];
          if(!editor) { return; }
          function rotateLoc() { locIndex = (locIndex + 1) % locs.length; }

          return cases(get(srcloc, "Srcloc"), "Srcloc", curLoc, {
            "builtin": function(_) { rotateLoc(); gotoNextLoc(); },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              editor.scrollIntoView(cmPosFromSrcloc(curLoc).start, 100);
              rotateLoc();
            }
          });
        }
        gotoNextLoc();
      });
    }
  }
 
  function basename(str) {
     var base = new String(str).substring(str.lastIndexOf('/') + 1);
     if(base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
     return base;
  }

  var sharedPrefix = "@shared-gdrive";
  var mydrivePrefix = "@my-gdrive";
  var jsdrivePrefix = "gdrive-js";

  function isSharedImport(filename) {
    var gdriveIndex = filename.indexOf(sharedPrefix);
    return gdriveIndex === 0;
  }

  function getSharedId(filename) {
    var path = filename.slice(sharedPrefix.length);
    var id = basename(path);
    return id;
  }

  function getMyDriveId(filename) {
    var path = filename.slice(mydrivePrefix.length);
    var id = basename(path);
    return id;
  }

  function makeMyDriveUrl(id){
    var localDriveUrl = "/editor#program=" + id;
    //Pyret version??
    return window.location.origin + localDriveUrl;
  }

  function isGDriveImport(filename) {
    var mydriveIndex = filename.indexOf(mydrivePrefix);
    return mydriveIndex === 0;
  }
  function isJSImport(filename) {
    var jsdriveIndex = filename.indexOf(jsdrivePrefix);
    return jsdriveIndex === 0;
  }
  function getJSFilename(filename) {
    var path = filename.slice(jsdrivePrefix.length);
    var id = basename(path);
    return id;
  }

  function hoverLink(editors, runtime, srcloc, dom, loc, className) {
    // http://stackoverflow.com/questions/3820381/need-a-basename-function-in-javascript
    var cases = runtime.ffi.cases;
    var get = runtime.getField;
    if(!runtime.hasField(loc, "source")) {
      var module = runtime.unwrap(get(loc, "module-name"));
      dom.attr("title", get(loc, "format").app(true) + ":  This code is internal to Pyret.  Try searching the documentation for " + basename(module) + " if you want more information.");
      return;
    }
    var src = runtime.unwrap(get(loc, "source"));
    if (!editors.hasOwnProperty(src)) {
      if(isSharedImport(src)) {
        /*var url = shareAPI.makeShareUrl(getSharedId(src));
        var hoverDiv = $("<div>").addClass("module-info-hover").append(
        get(loc, "format").app(true) +
        You can see the file ",
        $("<a>").attr({"href": url, "target": "_blank"}).text("here"),
        ".");
        shareAPI.makeHoverMenu(dom, hoverDiv, true, function() {});*/
        var msg = "This code is in a shared module on Google Drive. Click to open the file.";
        return errorTooltip(dom, msg);
      }
      else if(isGDriveImport(src)) {
        /* var hoverDiv = $("<div>").addClass("module-info-hover").append(
          get(loc, "format").app(true) +
        shareAPI.makeHoverMenu(dom, hoverDiv, true, function() {});*/
        var msg = "This code is in your Google Drive in the file named " + basename(src) + ".";
        return errorTooltip(dom, msg);
      }
      else if(isJSImport(src)) {
        dom.attr("title", get(loc, "format").app(true) + ":  This code is part of a library defined in " + getJSFilename(src));
        dom.tooltip();
        return dom;
      }
      else {
        var msg = get(loc, "format").app(true) + ":  This code is internal to Pyret.  Try searching the documentation for " + basename(get(loc, "source")) + " if you want more information.";
        return errorTooltip(dom, msg);
      }
    }
    else {
      hoverLocs(editors, runtime, srcloc, dom, [loc], className);
    }
  }

  function errorTooltip(dom, msg){
    dom.attr("title", msg);
    dom.tooltip();
    return dom;
  }

  function drawSrcloc(editors, runtime, s) {
    if (!s) { return $("<span>"); }
    var get = runtime.getField;
    var srcElem = $("<a>").addClass("srcloc").text(get(s, "format").app(true));
    if(!runtime.hasField(s, "source")) {
      return srcElem;
    }
    var src = runtime.unwrap(get(s, "source"));
    if(!editors.hasOwnProperty(src)) {
      if(isSharedImport(src)) {
        var sharedId = getSharedId(src);
        var srcUrl = shareAPI.makeShareUrl(sharedId);
        return srcElem.attr({href: srcUrl, target: "_blank"});
      }
      else if(isGDriveImport(src)) {
        var MyDriveId = getMyDriveId(src);
        var srcUrl = makeMyDriveUrl(MyDriveId);
        srcElem.attr({href: srcUrl, target: "_blank"});
      }
      else if(isJSImport(src)) {
        /* NOTE(joe): No special handling here, since it's opaque code */
      }
    }
    return srcElem;
  }
  
  function cmPosFromSrcloc(runtime, srcloc, loc) {
    return runtime.ffi.cases(runtime.getField(srcloc, "Srcloc"), "Srcloc", loc, {
      "builtin": function(_) {
         throw new Error("Cannot get CodeMirror loc from builtin location");
      },
      "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
        var extraCharForZeroWidthLocs = endCh === startCh ? 1 : 0;
        return {
          source: source,
          start: { line: startL - 1, ch: startC },
          end: { line: endL - 1, ch: endC + extraCharForZeroWidthLocs }
        };
      }
    });
  }
  
  function makePallet(runtime) {
    return runtime.makeFunction(function(numColors) {
      var start = Math.random() * 290;
      var separation = 290/numColors;
      var pallet = new Array();
      for(var i=0; i < numColors; i++) {
        var hue = (((start + (i * separation)) % 290) + 90) % 360;
        pallet.push(hue);
      }
      return runtime.ffi.makeList(pallet);
    });
  }

  function astFromText(runtime, source, filename) {
    return runtime.loadModules(runtime.namespace, [parsePyret], function(PP) {
      return runtime.unwrap(runtime.getField(PP, "surface-parse").app(source, filename));
    });
  }
  
  function locToSrc(runtime, editors, srcloc) {
    return runtime.makeFunction(function(loc) {
      return getSourceContent(editors, runtime, srcloc, loc);
    });
  }
  
  function locToAST(runtime, editors, srcloc) {
    return runtime.makeFunction(function(loc) {
      var source = getSourceContent(editors, runtime, srcloc, loc);
      var prelude = ""
      var start_line = runtime.getField(loc,"start-line");
      var start_col = runtime.getField(loc,"start-column");
      for(var i=1; i < start_line; i++) { prelude += "\n"; }
      for(var i=0; i < start_col; i++) { prelude += " "; }
      return astFromText(runtime,prelude + source, runtime.getField(loc,"source"));
    });
  }
  
  function getSourceContent(editors, runtime, srcloc, loc) {
    console.log("start-getSourceContent");
    cmLoc = cmPosFromSrcloc(runtime, srcloc, loc);
    console.log(cmLoc.source);
    if(editors.hasOwnProperty(cmLoc.source)) {
      return editors[cmLoc.source].getRange(cmLoc.start, cmLoc.end);
    }
    else {
      var src = cmLoc.source;
      var constructors = gdriveLocators.makeLocatorConstructors(storageAPI, runtime, compileLib, compileStructs);
      console.log(constructors);
      if(isSharedImport(src)) {
        var sharedId = getSharedId(src);
        var srcUrl = shareAPI.makeShareUrl(sharedId);
        return srcElem.attr({href: srcUrl, target: "_blank"});
      }
      else if(isGDriveImport(src)) {
        var MyDriveId = getMyDriveId(src);
        var srcUrl = makeMyDriveUrl(MyDriveId);
        srcElem.attr({href: srcUrl, target: "_blank"});
      }
      else if(isJSImport(src)) {
        /* NOTE(joe): No special handling here, since it's opaque code */
      }
    }
    console.log("end-getSourceContent");
    /*
    var get = runtime.getField;
    var src = runtime.unwrap(get(s, "source"));
    console.log(src);
    if(!editors.hasOwnProperty(src)) {
      if(isSharedImport(src)) {
        console.log("isSharedImport");
        var sharedId = getSharedId(src);
        var srcUrl = shareAPI.makeShareUrl(sharedId);
        console.log(srcUrl);
      }
      else if(isGDriveImport(src)) {
        console.log("isGDriveImport");
        var MyDriveId = getMyDriveId(src);
        var srcUrl = makeMyDriveUrl(MyDriveId);
        console.log(srcUrl);
      }
      else if(isJSImport(src)) {
      }
    }
    console.log(editors);*/
  }
  
  function highlightSrcloc(runtime, editors, srcloc, loc, cls) {
    var locKey = cssSanitize(runtime.getField(loc,"format").app(true));
    return runtime.ffi.cases(runtime.getField(srcloc, "Srcloc"), "Srcloc", loc, {
      "builtin": function(_) { /* no-op */ },
      "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
        var cmLoc = cmPosFromSrcloc(runtime, srcloc, loc);
        var editor = editors[source];
        if(editor) {
          // Don't add duplicate markers
          if(editor.getWrapperElement().getElementsByClassName(locKey).length > 0) {
            return editor.findMarks(cmLoc.start, cmLoc.end)[0];
          } else {
            return editor.markText(
              cmLoc.start,
              cmLoc.end,
              { className: locKey + " " + "highlight", css: "background-color: " + cls });
          }
        } else {
          return null;
        }
      }
    });
  }

  function renderErrorDisplay(editors, runtime, errorDisp, stack) {
    var get = runtime.getField;
    var ffi = runtime.ffi;
    installRenderers(runtime);
    
    function makeColorPicker() {
      var colors = 1;
      var pallet = {};
      return function(loc) {
        key = runtime.getField(loc,"format").app(true);
        if (!pallet.hasOwnProperty(key)) {
          pallet[key] = colors++;
        }
        return "loc-highlight-color-" + pallet[key];
      };
    }

    return runtime.loadModules(runtime.namespace, [srclocLib, errordisplayLib], function(srcloc, ED) {
      var pickColor = makeColorPicker();
      function help(errorDisp) {
        return ffi.cases(get(ED, "ErrorDisplay"), "ErrorDisplay", errorDisp, {
          "v-sequence": function(seq) { 
            var result = $("<div>");
            var contents = ffi.toArray(seq);
            for (var i = 0; i < contents.length; i++) {
              result.append(help(contents[i]));
            }
            return result;
          },
          "numbered-sequence": function(seq) { 
            var result = $("<ol>");
            var contents = ffi.toArray(seq);
            for (var i = 0; i < contents.length; i++) {
              result.append($("<li>").append(help(contents[i])));
            }
            return result;
          },
          "bulleted-sequence": function(seq) { 
            var result = $("<ul>");
            var contents = ffi.toArray(seq);
            for (var i = 0; i < contents.length; i++) {
              result.append($("<li>").append(help(contents[i])));
            }
            return result;
          },
          "h-sequence": function(seq, separator) { 
            var result = $("<p>");
            var contents = ffi.toArray(seq);
            for (var i = 0; i < contents.length; i++) {
              if (i != 0 && separator !== "") result.append(separator);
              result.append(help(contents[i]));
            }
            return result.contents();
          },
          "paragraph": function(seq) { 
            var separator = "";
            var result = $("<p>");
            var contents = ffi.toArray(seq);
            for (var i = 0; i < contents.length; i++) {
              if (i != 0 && separator !== "") result.append(separator);
              result.append(help(contents[i]));
            }
            return result;
          },
          "embed": function(val) {
            var placeholder = $("<span>").text("Rendering...");
            var replace = function(replacement) {
              if ($.contains(document.documentElement, placeholder[0])) {
                placeholder.replaceWith(replacement);
              } else {
                placeholder = replacement;
              }
            }
            var tryTorepr = function() { return runtime.toReprJS(val, runtime.ReprMethods["$cpo"]); }
            var processTryTorepr = function(out) {
              var replacement;
              if (runtime.isSuccessResult(out)) {
                replacement = out.result;
              } else {
                replacement = $("<span>").addClass("output-failed")
                  .text("<error rendering embedded value; details logged to console>");
                console.log(out.exn);
              }
              replace(replacement);
              return placeholder;
            }
            var tryRenderReason = function() { return runtime.getField(val, "render-reason").app(); }
            var processTryRenderReason = function(out) {
              if (runtime.isSuccessResult(out)) {
                var replacement = help(out.result);
                $(replacement).addClass("nestedReason");
                replace(replacement);
              } else {
                runtime.runThunk(tryTorepr, processTryTorepr);
              }
              return placeholder;
            }
            if (runtime.isObject(val) && runtime.hasField(val, "render-reason")) {
              runtime.runThunk(tryRenderReason, processTryRenderReason);
              return placeholder;
            } else {
              runtime.runThunk(tryTorepr, processTryTorepr);
              return placeholder;
            }
          },
          "optional": function(contents) {
            return expandableMore(help(contents));
          },
          "text": function(txt) { 
            return $("<span>").text(txt);
          },
          "code": function(contents) {
            return $("<code>").append(help(contents));
          },
          "styled": function(contents, style) {
            return help(contents).addClass(style);
          },
          "maybe-stack-loc": function(n, userFramesOnly, contentsWithLoc, contentsWithoutLoc) {
            var probablyErrorLocation;
            if (userFramesOnly) { probablyErrorLocation = getLastUserLocation(runtime, srcloc, stack, n); }
            else if (stack.length >= n) { probablyErrorLocation = runtime.makeSrcloc(stack[n]); }
            else { probablyErrorLocation = false; }
            if (probablyErrorLocation) {
              var placeholder = $("<span>").text("Rendering...");
              runtime.runThunk(
                function() { return contentsWithLoc.app(probablyErrorLocation); },
                function(out) {
                  if (runtime.isSuccessResult(out)) {
                    var rendered = help(out.result);
                    if ($.contains(document.documentElement, placeholder[0])) {
                      placeholder.replaceWith(rendered);
                    }
                    else { 
                      placeholder = rendered;
                    }
                    return rendered;
                  } else {
                    var msg = $("<span>").addClass("output-failed")
                      .text("<error rendering embedded contents; details logged to console>");
                    console.log(out.exn);
                    return msg;
                  }
                });
              return placeholder;
            } else {
              return help(contentsWithoutLoc);
            }
          },
          "loc": function(loc) {
            var source = getSourceContent(editors, runtime, srcloc, loc);
            return drawSrcloc(editors, runtime, loc);
          },
          "loc-anchor": function(contents, loc) {
            var inner = help(contents);
            var colorClass = pickColor(loc);
            var locClass = cssSanitize(runtime.getField(loc,"format").app(true));
            inner.addClass(colorClass);
            inner.addClass(locClass);
            highlightSrcloc(runtime, editors, srcloc, loc, colorClass);
            hoverSrclocAnchor(runtime, editors, srcloc, inner, loc, colorClass);
            return inner;
          },
          "highlight": function(contents, locs, color) {
            var anchor = $("<a>").append(help(contents));
            var cssColor = "hsl("+color+",100%,80%)";
            anchor.addClass("highlight");
            anchor.css('background-color', cssColor);
            
            var locs = ffi.toArray(locs)
            var locClasses = locs.map(
              function(l){
                return cssSanitize(runtime.getField(l,"format").app(true));
              });
            
            for (var i = 0; i < locs.length; i++) {
              console.log(locClasses[i]);
              anchor.addClass(locClasses[i]);
              highlightSrcloc(runtime, editors, srcloc, locs[i], cssColor);
              //$("."+locClasses[i]).css('background-color', cssColor);
            }
              
            anchor.on("mouseenter", function() {
              for (var i = 0; i < locClasses.length; i++) {
                hintLoc(runtime, editors, srcloc, locs[i]);
                $("."+locClasses[i]).addClass("hover");
              }
            });
            
            anchor.on("click", function() {
              for (var i = 0; i < locClasses.length; i++) {
                var els = document.getElementsByClassName(locClasses[i]);
                $(els).addClass("emphasize");
                setTimeout(function() {
                  $(els).removeClass("emphasize");
                }, 500);
              }
            });
            
            anchor.on("mouseleave", function() {
              for (var i = 0; i < locClasses.length; i++) {
                unhintLoc(runtime, editors, srcloc, locs[i]);
                $("."+locClasses[i]).removeClass("hover");
              }
            });
            
            anchor.on("click", function() {
              gotoLoc(runtime, editors, srcloc, locs[0]);
            });
            
            return anchor;
          },
          
          "underline": function(contents, locs, color) {
            var anchor = $("<a>").append(help(contents));
            var colorClass = "loc-highlight-color-" + color;
            anchor.addClass("underline");
            anchor.addClass(colorClass);
            
            var locs = ffi.toArray(locs)
            var locClasses = locs.map(function(l){
              cssSanitize(runtime.getField(l,"format").app(true));});
              
            var marks = new Array();
            
            for (var i = 0; i < locs.length; i++) {
              anchor.addClass(locClasses[i]);
              highlightSrcloc(runtime, editors, srcloc, locs[i], colorClass);
            }
              
            anchor.on("mouseenter", function() {
              marks = new Array();
              for (var i = 0; i < locClasses.length; i++) {
                var mark = highlightSrcloc(runtime, editors, srcloc, locs[i], colorClass);
                console.log(mark);
                marks.push(mark);
                hintLoc(runtime, editors, srcloc, locs[i]);
                $("."+locClasses[i]).addClass("hover");
              }
            });
            
            anchor.on("mouseleave", function() {
              for (var i = 0; i < locClasses.length; i++) {
                marks[i].clear();
                unhintLoc(runtime, editors, srcloc, locs[i]);
                $("."+locClasses[i]).removeClass("hover");
              }
              marks = new Array();
            });
            
            anchor.on("click", function() {
              gotoLoc(runtime, editors, srcloc, locs[0]);
            });
            
            return anchor;
          },
          
          "loc-display": function(loc, style, contents) {
            var inner = help(contents);
            hoverLink(editors, runtime, srcloc, inner, loc, "error-highlight");
            return inner;
          }
        });
      }
      return help(errorDisp);
    });
  }

  // A function to use the class of a container to toggle
  // between the two representations of a fraction.  The
  // three arguments are a string to be the representation
  // as a fraction, a string to represent the non-repeating
  // part of the decimal number, and a string to be
  // repeated. The 'rationalRepeat' class puts a bar over
  // the string.
  $.fn.toggleFrac = function(frac, dec, decRpt) {
    if (this.hasClass("fraction")) {
      this.text(dec);
      // This is the stuff to be repeated.  If the digit to
      // be repeated is just a zero, then ignore this
      // feature, and leave off the zero.
      if (decRpt != "0") {
        var cont = $("<span>").addClass("rationalNumber rationalRepeat").text(decRpt);
        this.append(cont);
      }
      this.removeClass("fraction");
    } else {
      this.text(frac);
      this.addClass("fraction");
    }
    return this;
  }

  function installRenderers(runtime) {
    if (!runtime.ReprMethods.createNewRenderer("$cpo", runtime.ReprMethods._torepr)) return;
    var renderers = runtime.ReprMethods["$cpo"];
    renderers["opaque"] = function renderPOpaque(val) {
      if (runtime.imageLib.isImage(val.val)) {
        return renderers.renderImage(val.val);
      } else {
        return renderers.renderText("opaque", val);
      }
    };
    renderers["cyclic"] = function renderCyclic(val) {
      return renderers.renderText("cyclic", val);
    };
    renderers.renderImage = function renderImage(img) {
      var container = $("<span>").addClass('replOutput');
      var imageDom;
      var maxWidth = $(document).width() * .375;
      var maxHeight = $(document).height() * .6;
      var realWidth = img.getWidth();
      var realHeight = img.getHeight();
      if(img.getWidth() > maxWidth || img.getHeight() > maxHeight) {
        container.addClass("replToggle replImageThumbnail has-icon");
        container.attr("title", "Click to see full image");
        var scaleFactorX = 100 / realWidth;
        var scaleFactorY = 200 / realHeight;
        var scaleFactor = scaleFactorX < scaleFactorY ? scaleFactorX : scaleFactorY;
        var scaled = runtime.imageLib.makeScaleImage(scaleFactor, scaleFactor, img);
        imageDom = scaled.toDomNode();
        container.append(imageDom);
        container.append($("<img>").attr("src", "/img/magnifier.gif").addClass("info-icon"));
        $(imageDom).trigger({type: 'afterAttach'});
        $('*', imageDom).trigger({type : 'afterAttach'});
        var originalImageDom = img.toDomNode();
        $(container).click(function(e) {
          var dialog = $("<div>");
          dialog.dialog({
            modal: true,
            height: $(document).height() * .9,
            width: $(document).width() * .9,
            resizable: true
          });
          dialog.css({"overflow": "scroll"});
          dialog.append($(originalImageDom));
          $(originalImageDom).trigger({type: 'afterAttach'});
          $('*', originalImageDom).trigger({type : 'afterAttach'});
          e.stopPropagation();
        });
        return container;
      } else {
        imageDom = img.toDomNode();
        container.append(imageDom);
        $(imageDom).trigger({type: 'afterAttach'});
        $('*', imageDom).trigger({type : 'afterAttach'});
        return container;
      }
    };
    renderers["number"] = function renderPNumber(num) {
      // If we're looking at a rational number, arrange it so that a
      // click will toggle the decimal representation of that
      // number.  Note that this feature abandons the convenience of
      // publishing output via the CodeMirror textarea.
      if (jsnums.isExact(num) && !jsnums.isInteger(num)) {
        // This function returns three string values, numerals to
        // appear before the decimal point, numerals to appear
        // after, and numerals to be repeated.
        var decimal = jsnums.toRepeatingDecimal(num.numerator(), num.denominator());
        var decimalString = decimal[0].toString() + "." + decimal[1].toString();

        outText = $("<span>").addClass("replToggle replTextOutput rationalNumber fraction").text(num.toString());

        outText.toggleFrac(num.toString(), decimalString, decimal[2]);

        // On click, switch the representation from a fraction to
        // decimal, and back again.
        outText.click(function(e) {
          $(this).toggleFrac(num.toString(), decimalString, decimal[2]);
          e.stopPropagation();
        });

        return outText;
      } else {
        return renderers.renderText("number", num);
      }
    };
    renderers["nothing"] = function renderPNothing(val) {
      return $("<span>").addClass("replTextOutput").text("nothing");
    };
    renderers.renderText = function renderText(valType, val) {
      var echo = $("<span>").addClass("replTextOutput");
      echo.text(renderers.__proto__[valType](val));
      setTimeout(function() {
        CodeMirror.runMode(echo.text(), "pyret", echo);
        echo.addClass("cm-s-default");
      }, 0);
      return echo;
    };
    renderers["boolean"] = function(val) { return renderers.renderText("boolean", val); };
    renderers["string"] = function(val) { return renderers.renderText("string", val); };
    renderers["method"] = function(val) { return renderers.renderText("method", val); };
    renderers["function"] = function(val) { return renderers.renderText("function", val); };
    renderers["ref"] = function(val, implicit, pushTodo) {
      pushTodo(undefined, undefined, val, [runtime.getRef(val)], "render-ref", { origVal: val, implicit: implicit });
    };
    renderers["render-ref"] = function(top) {
      var container = $("<span>").addClass("replToggle replOutput has-icon");
      container.append(top.done[0]);
      var warning = $("<img>")
        .attr("src", "/img/warning.gif")
        .attr("title", "May be stale! Click to refresh")
        .addClass("info-icon");
      container.append(warning);
      warning.click(function(e) {
        runtime.runThunk(function() { 
          // re-render the value
          return runtime.toReprJS(runtime.getRef(top.extra.origVal), renderers); 
        }, function(newTop) {
          if(runtime.isSuccessResult(newTop)) {
            warning.detach()
            container.empty();
            container.append(newTop.result);
            container.append(warning);
          }
          else {
            warning.detach();
            container.empty();
            container.text("<error displaying value>");
            container.append(warning);
          }
        });
        e.stopPropagation();
      });
      return container;
    };
    renderers["object"] = function(val, pushTodo) {
      var keys = [];
      var vals = [];
      for (var field in val.dict) {
        keys.push(field); // NOTE: this is reversed order from the values,
        vals.unshift(val.dict[field]); // because processing will reverse them back
      }
      pushTodo(undefined, val, undefined, vals, "render-object", { keys: keys, origVal: val });
    };
    renderers["render-object"] = function(top) {
      var container = $("<span>").addClass("replToggle replOutput");
      var name = $("<span>").addClass("expanded").text("Object");
      var openBrace = $("<span>").addClass("collapsed").text("{");
      var closeBrace = $("<span>").addClass("collapsed").text("}");
      var dl = $("<dl>")
      container.append(name);
      container.append(openBrace);
      for (var i = 0; i < top.extra.keys.length; i++) {
        //if (i > 1) { container.append($("<span>").addClass("collapsed").text(", ")); }
        dl.append($("<dt>").text(top.extra.keys[i]));
        dl.append($("<dd>").append(top.done[i]));
      }
      container.append(dl);
      container.append(closeBrace);
      container.click(function(e) { 
        container.toggleClass("expanded"); 
        e.stopPropagation();
      });
      return container;
    };
    renderers["render-data"] = function renderData(top) {
      var container = $("<span>").addClass("replToggle replOutput");
      var name = $("<span>").text(top.extra.constructorName);
      var openParen = $("<span>").addClass("collapsed").text("(");
      var closeParen = $("<span>").addClass("collapsed").text(")");
      var dl = $("<dl>");
      container.append(name);
      if (top.extra.arity !== -1) {
        container.append(openParen);
        var numFields = top.extra.fields.length;
        for (var i = 0; i < numFields; i++) {
          dl.append($("<dt>").text(top.extra.fields[i]).addClass("expanded"));
          dl.append($("<dd>").append(top.done[numFields - i - 1]));
        }
        container.append(dl);
        container.append(closeParen);
      }
      container.click(toggleExpanded);
      return container;
    };
    function toggleExpanded(e) {
      $(this).toggleClass("expanded");
      e.stopPropagation();
    }
    function makeInline() {
      // Assuming this was made by groupItems below, replace all instances of .collection with .inlineCollection
      $(this).toggleClass("collection");
      $(this).toggleClass("inlineCollection");
      $(this).children("li").children("span.contents").children("ul").each(makeInline);
    }
    function helper(container, val, values) {
      if (runtime.ffi.isVSValue(val)) { container.append(values.pop()); }
      else if (runtime.ffi.isVSStr(val)) { container.append(runtime.unwrap(runtime.getField(val, "s"))); }
      else if (runtime.ffi.isVSCollection(val)) {
        container.append($("<span>").text("[" + runtime.unwrap(runtime.getField(val, "name")) + ": "));
        var ul = $("<ul>").addClass("inlineCollection");
        container.append(ul);
        var items = runtime.ffi.toArray(runtime.getField(val, "items"));
        groupItems(ul, items, values, 0, items.length);
        container.append($("<span>").text("]"));
        container.click(function(e) {
          ul.each(makeInline);
          e.stopPropagation();
        });
      } else if (runtime.ffi.isVSConstr(val)) {
        container.append($("<span>").text(runtime.unwrap(runtime.getField(val, "name")) + "("));
        var items = runtime.ffi.toArray(runtime.getField(val, "items"));
        for (var i = items.length - 1; i >= 0; i--) {
          helper(container, items[i], values);
          if (i != 0) { container.append($("<span>").text(", ")); }
        }
        container.append($("<span>").text(")"));
      } else {
        var items = runtime.ffi.toArray(runtime.getField(val, "items"));
        for (var i = items.length - 1; i >= 0; i--) {
          helper(container, items[i], values);
        }
      }
      return container;
    }
    function groupItems(ul, items, values, minIdx, maxIdx) {
      // The grouping behavior isn't visually clean yet, so commenting out for now...
      // if (Math.log10(maxIdx - minIdx) <= 1) {
        for (var i = maxIdx - 1; i >= minIdx; i--) {
          var li = $("<li>").addClass("expanded");
          var title = $("<span>").addClass("label").text("Item " + (minIdx + maxIdx - 1 - i));
          var contents = $("<span>").addClass("contents");
          ul.append(li.append(title).append(contents));
          helper(contents, items[i], values);
        }
      // } else {
      //   var intervalSize = Math.pow(10, Math.ceil(Math.log10(maxIdx - minIdx)) - 1);
      //   for (var i = minIdx; i < maxIdx; i += intervalSize) {
      //     var li = $("<li>");
      //     var title = $("<span>").addClass("label").addClass("expandable")
      //       .text("[Items " + i + "--" + Math.min(i + intervalSize - 1, maxIdx - 1) + "]");
      //     var contents = $("<span>").addClass("contents");
      //     var newUl = $("<ul>").addClass("inlineCollection");
      //     ul.append(li.append(title).append(contents.append(newUl)));
      //     li.click(toggleExpanded);
      //     groupItems(newUl, items, values, i, Math.min(i + intervalSize, maxIdx));
      //   }
      // }
    }
    renderers["render-valueskeleton"] = function renderValueSkeleton(top) {
      var container = $("<span>").addClass("replToggle replOutput");
      return helper(container, top.extra.skeleton, top.done);
    };
  }
  // Because some finicky functions (like images and CodeMirrors), require
  // extra events to happen for them to show up, we provide this as an
  // imperative API: the DOM node created will be appended to the output
  // and also returned
  function renderPyretValue(output, runtime, answer) {
    installRenderers(runtime);
    runtime.runThunk(function() {
      return runtime.toReprJS(answer, runtime.ReprMethods["$cpo"]);
    }, function(container) {
      if(runtime.isSuccessResult(container)) {
        $(output).append(container.result);
      }
      else {
        $(output).append($("<span>").addClass("error").text("<error displaying value: details logged to console>"));
        console.log(container.exn);
      }
      return container;
    });
  }
  return {
    renderPyretValue: renderPyretValue,
    hoverLocs: hoverLocs,
    hoverLink: hoverLink,
    renderErrorDisplay: renderErrorDisplay,
    drawSrcloc: drawSrcloc,
    expandableMore: expandableMore,
    locToAST: locToAST,
    locToSrc: locToSrc,
    makePallet: makePallet
  };

})
