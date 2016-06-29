({
  requires: [
    { "import-type": "builtin",
      name: "parse-pyret" },
    { "import-type": "builtin",
      name: "error-display" },
    { "import-type": "builtin",
      name: "srcloc" },
    { "import-type": "builtin",
      name: "image-lib" }
  ],
  provides: {},
  nativeRequires: [
    "pyret-base/js/js-numbers",
    "cpo/share"
  ],
  theModule: function(runtime, _, uri, parsePyret, errordisplayLib, srclocLib, image, jsnums, share) {

    srcloc = runtime.getField(srclocLib, "values");
    ED = runtime.getField(errordisplayLib, "values");
    PP = runtime.getField(parsePyret, "values");

    // TODO(joe Aug 18 2014) versioning on shared modules?  Use this file's
    // version or something else?
    var shareAPI = makeShareAPI("");

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


    function expandable(dom, name) {
      var container = $("<div>");
      var moreLink = $("<a>").text("(Show "+name+"...)");
      var lessLink = $("<a>").text("(Hide "+name+"...)");
      function toggle() {
        dom.toggle();
        lessLink.toggle();
        moreLink.toggle();
      }
      moreLink.on("click", toggle);
      moreLink.one("click", function(){
        dom.find(".CodeMirror").each(function(){this.CodeMirror.refresh();});});
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

    function getLastUserLocation(runtime, srcloc, editors, e, ix, local) {
      var srclocStack = e.map(runtime.makeSrcloc);
      var isSrcloc = function(s) { return runtime.unwrap(runtime.getField(srcloc, "is-srcloc").app(s)); }
      var userLocs = srclocStack.filter(function(l) {
        if(!(l && isSrcloc(l))) { return false; }
        var source = runtime.getField(l, "source");
        return source === "definitions://"
                || source.indexOf("interactions://") !== -1
                || source.indexOf("gdrive") !== -1
                || (local ? editors[source] !== undefined : false);
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
          if (warnDesired === 0) {
            obj[0].style.pointerEvents = "none";
          } else {
            obj[0].style.pointerEvents = "all";
          }
          if (warnDesired === fadeAmt) {
            obj.fadeTo("fast", fadeAmt, function() {
              setTimeout(function() {
                obj.fadeTo("slow", 0.0);
                warnDesired = 0;
              }, warnDuration);});
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
      var locKey = cmlocToCSSClass(cmLoc);
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
      var locKey = cmlocToCSSClass(cmLoc);
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
      var locKey = cmlocToCSSClass(cmLoc);
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

      function highlightSrcloc(s, cls, withMarker) {
        return runtime.safeCall(function() {
          return cases(get(srcloc, "is-Srcloc"), "Srcloc", s, {
            "builtin": function(_) { /* no-op */ },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var cmLoc = cmPosFromSrcloc(runtime, srcloc, s);
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
        }, withMarker, "highlightSrcloc");
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
          cases(get(srcloc, "is-Srcloc"), "Srcloc", curLoc, {
            "builtin": function(_) { },
            "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
              var charCh = editor.charCoords(cmPosFromSrcloc(runtime, srcloc, curLoc).start, "local");
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

            return cases(get(srcloc, "is-Srcloc"), "Srcloc", curLoc, {
              "builtin": function(_) { rotateLoc(); gotoNextLoc(); },
              "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
                editor.scrollIntoView(cmPosFromSrcloc(runtime, srcloc, curLoc).start, 100);
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

    var sharedPrefix = "shared-gdrive";
    var mydrivePrefix = "my-gdrive";
    var jsdrivePrefix = "gdrive-js";

    function isSharedImport(filename) {
      var gdriveIndex = filename.indexOf(sharedPrefix);
      return gdriveIndex === 0;
    }

    function getSharedId(filename) {
      return filename.slice(filename.lastIndexOf(":")+1);
    }

    function getMyDriveId(filename) {
      return filename.slice(filename.lastIndexOf(":")+1);
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

    function cmlocToCSSClass(cmloc) {
      return cssSanitize(
        "" + cmloc.source
        + "-" + cmloc.start.line
        + "-" + cmloc.start.ch
        + "-" + cmloc.end.line
        + "-" + cmloc.end.ch);
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

    function drawCMloc(editors, cmloc) {
      var srcElem = $("<a>").addClass("srcloc").text(cmloc.source);
      if(editors.hasOwnProperty(cmloc.source)) {
        return srcElem;
      } else if(isSharedImport(cmloc.source)) {
        var sharedId = getSharedId(cmloc.source);
        var srcUrl = shareAPI.makeShareUrl(sharedId);
        return srcElem.attr({href: srcUrl, target: "_blank"});
      } else if(isGDriveImport(cmloc.source)) {
        var MyDriveId = getMyDriveId(cmloc.source);
        var srcUrl = makeMyDriveUrl(MyDriveId);
        return srcElem.attr({href: srcUrl, target: "_blank"});
      } else if(isJSImport(cmloc.source)) {
          /* NOTE(joe): No special handling here, since it's opaque code */
      } else {
        // TODO: something better here.
        var srcUrl = "https://github.com/brownplt/pyret-lang/blob/horizon/"
                   + cmloc.source
                   + "#L" + (cmloc.start.line + 1) + "-"
                   + "#L" + (cmloc.end.line + 1);
        return srcElem.attr({href: srcUrl, target: "_blank"});
      }
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
      return runtime.ffi.cases(runtime.getField(srcloc, "is-Srcloc"), "Srcloc", loc, {
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

    function emphasizeLine(editors, cmloc) {
      var editor = editors[cmloc.source];
      if(!editor) return;
      for(var i = cmloc.start.line; i <= cmloc.end.line; i++) {
        setTimeout(
          function(){editor.removeLineClass(this, "background", "emphasize-line");}
            .bind(editor.addLineClass(i, "background", "emphasize-line")),
          500);
      }
    }

    var converter = $.colorspaces.converter('CIELAB', 'hex');

    function hueToRGB(hue) {
      var a = 40*Math.cos(hue);
      var b = 40*Math.sin(hue)
      return converter([74, a, b]);
    }

    var goldenAngle = 2.39996322972865332;
    var lastHue = 0;

    function locToSrc(runtime, editors, srcloc) {
      return runtime.makeFunction(function(loc) {
        var cmloc = cmPosFromSrcloc(runtime, srcloc, loc);
        return getSourceContent(editors, cmloc, true);
      });
    }
    
    function makeSrclocAvaliable(runtime, editors, srcloc) {
      return runtime.makeFunction(function(loc) {
        return runtime.ffi.cases(runtime.getField(srcloc, "is-Srcloc"), "Srcloc", loc, {
          "builtin": function(_) {
            console.error("srclocAvaliable should not be passed a builtin source location.", srcloc);
            return runtime.pyretFalse;
          },
          "srcloc": function(filename, _, _, _, _, _, _) {
            if(editors.hasOwnProperty(filename)) {
              return runtime.pyretTrue;
            } else if (!!sessionStorage.getItem(filename)) {
              return runtime.pyretTrue;
            } else {
              runtime.pauseStack(function(restarter){
                $.ajax({url: "/arr/" + filename.slice(10) + ".arr", async:false}).done(
                  function(response){
                    sessionStorage.setItem(filename, response);
                    restarter.resume(runtime.pyretTrue);
                  }).fail(function(){
                    restarter.resume(runtime.pyretFalse);
                  });
              });
            }
          }
        });
      });
    }
    
    function getSourceContent(editors, cmloc, tight) {
      if(editors.hasOwnProperty(cmloc.source)) {
        if(!tight) {
          cmloc =
            {start:{
              line: cmloc.start.line,
              ch: 0},
             end:{
              line: cmloc.end.line,
              ch: editors[cmloc.source].getLine(cmloc.end.line).length}};
        }
        return editors[cmloc.source].getRange(cmloc.start, cmloc.end);
      } else {
        var source = sessionStorage.getItem(cmloc.source);
        if(!source) {
          return undefined;
        }
        var lines = source.split("\n").slice(cmloc.start.line, cmloc.end.line + 1);
        if(tight) {
          lines[lines.length - 1] = lines[lines.length - 1].substr(0, cmloc.end.ch);
          lines[0] = lines[0].substr(cmloc.start.ch);
        }
        return lines.join("\n");
      }
    }

    function locToAST(runtime, editors, srcloc) {
      return runtime.makeFunction(function(loc) {
        var cmloc = cmPosFromSrcloc(runtime, srcloc, loc);
        var source = getSourceContent(editors, cmloc, true);
        var prelude = ""
        var start_line = runtime.getField(loc,"start-line");
        var start_col = runtime.getField(loc,"start-column");
        for(var i=1; i < start_line; i++) { prelude += "\n"; }
        for(var i=0; i < start_col; i++) { prelude += " "; }
        return astFromText(runtime,prelude + source, cmloc.source);
      });
    }
    
    function makeMaybeLocToAST(runtime, editors, srcloc) {
      return runtime.makeFunction(function(loc) {
        return runtime.ffi.cases(runtime.getField(srcloc, "is-Srcloc"), "Srcloc", loc, {
          "builtin": function(_) {
            console.error("maybeLocToAST should not be passed a builtin source location.", loc);
            return runtime.ffi.makeNone();
          },
          "srcloc": function(filename, start_line, start_col, startCh, endL, endC, endCh) {
            var prelude = ""
            for(var i=1; i < start_line; i++) {prelude += "\n";}
            for(var i=0; i < start_col; i++)  {prelude += " "; }
            var source = getSourceContent(editors, cmPosFromSrcloc(runtime, srcloc, loc), true);
            if(source === undefined) {
              return runtime.ffi.makeNone();
            } else {
              runtime.pauseStack(function(restarter) {
                runtime.run(function(_, __) {
                  return runtime.getField(PP, "surface-parse").app(prelude + source, filename);
                }, runtime.namespace, {
                  sync: false
                }, function(result) {
                  if(runtime.isSuccessResult(result)) {
                    restarter.resume(runtime.ffi.makeSome(result.result.dict.block.dict.stmts.dict.first));
                  } else {
                    restarter.resume(runtime.ffi.makeNone());
                  }
                });
              });
            }
          }
        });
      });
    }
    
    function makeMaybeStackLoc(runtime, editors, srcloc, stack) {
      return runtime.makeFunction(function(n, userFramesOnly) {
        var probablyErrorLocation;
        if (userFramesOnly) { probablyErrorLocation = getLastUserLocation(runtime, srcloc, editors, stack, n, false); }
        else if (stack.length >= n) { probablyErrorLocation = runtime.makeSrcloc(stack[n]); }
        else { probablyErrorLocation = false; }
        if (probablyErrorLocation) {
          return runtime.ffi.makeSome(probablyErrorLocation);
        } else {
          return runtime.ffi.makeNone();
        }
      });
    }
      
    function highlightSrcloc(runtime, editors, srcloc, loc, cssColor, context, underline) {
      if (underline === undefined) underline = true;
      var styles = document.getElementById("highlight-styles").sheet;
      return runtime.ffi.cases(runtime.getField(srcloc, "is-Srcloc"), "Srcloc", loc, {
        "builtin": function(_) { /* no-op */ },
        "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
          var cmLoc = cmPosFromSrcloc(runtime, srcloc, loc);
          var locKey = cmlocToCSSClass(cmLoc);
          var editor = editors[source];
          if(editor) {
            styles.insertRule(
                  ((context === undefined) ? "" : "#main[data-highlights=" + context + "]")
                   + " ." + locKey + " { " + (!!cssColor ? "background-color:" + cssColor : "") +
                  (underline ? ";border-bottom: 2px hsla(0, 0%, 0%,.5) solid" : "") + ";}",
                  styles.cssRules.length);
              return editor.markText(
                cmLoc.start,
                cmLoc.end,
               {className: locKey + " highlight", shared: true});
          } else {
            return null;
          }
        }
      });
    }

    function highlightLines(runtime, editors, srcloc, loc, cssColor, context) {
      var styles = document.getElementById("highlight-styles").sheet;
      return runtime.ffi.cases(runtime.getField(srcloc, "is-Srcloc"), "Srcloc", loc, {
        "builtin": function(_) { /* no-op */ },
        "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
          var cmLoc = cmPosFromSrcloc(runtime, srcloc, loc);
          var locKey = cmlocToCSSClass(cmLoc);
          var editor = editors[source];
          if(editor) {
            styles.insertRule(
                  ((context === undefined) ? "" : "#main[data-highlights=" + context + "]")
                  + " ." + locKey + " { background-color:" + cssColor + ";}",
                  0);
            for(var i=cmLoc.start.line;i<=cmLoc.end.line;i++){
              editor.addLineClass(i,"background",locKey);
            }
            return locKey;
          } else {
            return null;
          }
        }
      });
    }

    function spotlight(editors, cmloc) {
      if(!(cmloc.source in editors))
        throw new Error("Cannot spotlight a location not shown in the editor.");
      var styles = document.getElementById("highlight-styles").sheet;
      var lockey = "spotlight-" + cmlocToCSSClass(cmloc);
      var handle = editors[cmloc.source].markText(cmloc.start, cmloc.end,
       {className: lockey,
        inclusiveLeft: false,
        inclusiveRight:false,
        shared: false,
        clearWhenEmpty: true,
        addToHistory: false});
      var editorSelector = (cmloc.source == "definitions"
        ? " > div.replMain "
        : " .repl-echo ");
      styles.insertRule(
        "#main[data-highlights=" + lockey + "]"
        + editorSelector + " div.CodeMirror > div > pre > span > span:not(."
        + lockey + "){opacity:0.4;}", 0);
      styles.insertRule(
        "#main[data-highlights=" + lockey + "]"
        + editorSelector + " span." + lockey + "{background:white!important;}", 0);
      return {marker: handle, key: lockey};
    }

    function snippet(editors, featured, srcloc, ul){
      var cmloc = featured;
      var lockey = "snippet-" + cmlocToCSSClass(cmloc);
      var snippetWrapper = $("<div>").addClass("cm-snippet");
      if(cmloc.source in editors) {
        var cmSnippet = CodeMirror(snippetWrapper[0],{
          readOnly: "nocursor",
          disableInput: true,
          indentUnit: 2,
          lineWrapping: false,
          lineNumbers: true,
          viewportMargin: 1,
          scrollbarStyle: "null"});
        var endch;
        var cmsrc = editors[featured.source];
        var handle = cmsrc.markText(cmloc.start, cmloc.end,
         {className: lockey,
          inclusiveLeft: false,
          inclusiveRight:false,
          shared: false,
          clearWhenEmpty: true,
          addToHistory: false});
        if(cmloc.source.startsWith("interactions")) {
          cmSnippet.setOption("lineNumberFormatter",
            function(line) {
              return ">";
            });
        } else {
          cmSnippet.setOption("lineNumberFormatter",
            function(line) {
              var handleLoc = handle.find();
              return (handleLoc === undefined) ? " ": handleLoc.from.line + line;
            });
        }
        // Copy relevant part of document.
        endch = cmsrc.getLine(cmloc.end.line).length;
        cmSnippet.getDoc().setValue(cmsrc.getRange(
          {line: cmloc.start.line, ch: 0},
          {line: cmloc.end.line, ch: endch}));

        // Fade areas outside featured range
        cmSnippet.getDoc().markText(
          {line: 0, ch: 0},
          {line: 0, ch: cmloc.start.ch},
          {className: "highlight-irrelevant"});
        cmSnippet.getDoc().markText(
          {line: cmloc.end.line - cmloc.start.line, ch: cmloc.end.ch},
          {line: cmloc.end.line - cmloc.start.line, ch: endch},
          {className: "highlight-irrelevant"});

        if(cmloc.source in editors) {
          // Refresh the gutters when a change is made to the source document
          var refresh = function(cm, change) {
            cmSnippet.setOption("firstLineNumber",0);
            cmSnippet.setOption("firstLineNumber",1);};
          cmsrc.on("change", refresh);
          handle.on("clear", function(){cmsrc.off("change", refresh);});
        }

        // render header
        snippetWrapper.prepend(
          $("<header>").append(drawCMloc(editors, cmloc)));
        snippetWrapper[0].cmrefresh = function(){cmSnippet.refresh();};
        return {wrapper: snippetWrapper.addClass("cm-future-snippet"), editor: cmSnippet, featured: featured};

      } else {
        snippetWrapper.removeClass("cm-snippet");
        snippetWrapper.append($("<span>").text(runtime.getField(ul, "format").app(runtime.pyretTrue)));
        return {wrapper: snippetWrapper.addClass("cm-future-snippet"), featured: featured};
      }

    }

    function renderStackTrace(runtime, editors, srcloc, error) {
      var srclocStack = error.pyretStack.map(runtime.makeSrcloc);
      var isSrcloc = function(s) { return runtime.unwrap(runtime.getField(srcloc, "is-srcloc").app(s)); }
      var userLocs = srclocStack.filter(function(l) { return l && isSrcloc(l); });
      var snippets = new Array();
      var contextManager = document.getElementById("main").dataset;
      var currentHighlight;
      var container = $("<div>").addClass("stacktrace")
        .on('mouseenter', function(){
          if(!contextManager.highlights.startsWith("spotlight")) {
            currentHighlight = contextManager.highlights;
            contextManager.highlights = "spotlight";
          }
        })
        .on('mouseleave', function(){
          contextManager.highlights = currentHighlight;
        });
      if(userLocs.length > 0) {
        container.append($("<p>").text("Evaluation in progress when the error occurred (most recent first):"));
        userLocs.forEach(function(ul) {
          var slContainer = $("<div>");
          var cmLoc = cmPosFromSrcloc(runtime, srcloc, ul);
          var cmSnippet = snippet(editors, cmLoc, srcloc, ul);
          if (cmSnippet.editor) {
            snippets.push(cmSnippet.editor);
            cmSnippet.editor.getWrapperElement().style.height =
              (cmLoc.start.line == cmLoc.end.line ? "1rem" : "1.5rem");
            if(editors[cmLoc.source] === undefined) {
              cmSnippet.wrapper.on("mouseenter", function(e){
                contextManager.highlights = "spotlight-external";
                flashMessage("This code isn't in this editor.")
              });
              cmSnippet.wrapper.on("mouseleave", function(e){
                clearFlash();
              });
            } else {
              var lockey = spotlight(editors, cmLoc).key;
              cmSnippet.wrapper.on("mouseenter", function(e){
                gotoLoc(runtime, editors, srcloc, ul);
                contextManager.highlights = lockey;
              });
            }
          } else {
            cmSnippet.wrapper.on("mouseenter", function(e){
              contextManager.highlights = "spotlight-external";
              flashMessage("This code isn't in this editor.")
            });
            cmSnippet.wrapper.on("mouseleave", function(e){
              clearFlash();
            });
          }
          slContainer.append(cmSnippet.wrapper);
          container.append(slContainer);
        });
        return expandable(container, "program execution trace");
      } else {
        return container;
      }
    }

    function renderErrorDisplay(editors, runtime, errorDisp, stack, context) {
      var get = runtime.getField;
      var ffi = runtime.ffi;
      installRenderers(runtime);

      var makePalette = function(){
        var palette = new Map();
        return function(n){
          if(n === -1) {
            return undefined;
          } else {
            if(highlightMode == "scsh" || highlightMode == "scmh")
              return 0;
            if(!palette.has(n)) {
              lastHue = (lastHue + goldenAngle)%(Math.PI*2.0);
              palette.set(n, lastHue);
            }
            return palette.get(n);
          }
        };};

      var palette = makePalette();
      var snippets = new Array();
      var highlights = new Map();
         
      function help(errorDisp, stack) {
        return ffi.cases(get(ED, "is-ErrorDisplay"), "ErrorDisplay", errorDisp, {
          "v-sequence": function(seq) {
            var result = $("<div>");
            var contents = ffi.toArray(seq);
            return runtime.safeCall(function() {
              return runtime.eachLoop(runtime.makeFunction(function(i) {
                if (i != 0) result.append($("<br>"));
                return runtime.safeCall(function() {
                  return help(contents[i], stack);
                }, function(helpContents) {
                  result.append(helpContents);
                  return runtime.nothing;
                }, "help(contents[i])");
              }), 0, contents.length);
            }, function(_) { return result; }, "v-sequence: each: contents");
          },
          "bulleted-sequence": function(seq) {
            var contents = ffi.toArray(seq);
            var result = $("<ul>");
            return runtime.safeCall(function() {
              return runtime.eachLoop(runtime.makeFunction(function(i) {
                return runtime.safeCall(function() { 
                  return help(contents[i], stack); 
                }, function(helpContents) {
                  result.append($("<li>").append(helpContents));
                  return runtime.nothing;
                }, "help(contents[i])");
              }), 0, contents.length)
            }, function(_) { return result; }, "bulleted-sequence: each: contents");
          },
          "h-sequence": function(seq, separator) {
            var result = $("<p>");
            var contents = ffi.toArray(seq);
            return runtime.safeCall(function() {
              return runtime.eachLoop(runtime.makeFunction(function(i) { 
                if (i != 0 && separator !== "") result.append(separator);
                return runtime.safeCall(function() {
                  return help(contents[i], stack);
                }, function(helpContents) { 
                  result.append(helpContents);
                  return runtime.nothing;
                }, "help(contents[i])");
              }), 0, contents.length);
            }, function(_) { return result.contents(); }, "h-sequence: each: contents");
          },
          "paragraph": function(seq) {
            var result = $("<p>");
            var contents = ffi.toArray(seq);
            return runtime.safeCall(function() {
              return runtime.eachLoop(runtime.makeFunction(function(i) {
                return runtime.safeCall(function() { 
                  return help(contents[i], stack);
                }, function(helpContents) {
                  result.append(helpContents);
                  return runtime.nothing;
                }, "help(contents[i])");
              }), 0, contents.length);
            }, function(_) { return result; }, "paragraph: each: contents");
          },
          "embed": function(val) {
            if (runtime.isPyretException(val.val)) {
              var e = val.val;
              var maybeStackLoc   = makeMaybeStackLoc(runtime, editors, srcloc, e.pyretStack);
              var srclocAvaliable = makeSrclocAvaliable(runtime, editors, srcloc);
              var maybeLocToAST   = makeMaybeLocToAST(runtime, editors, srcloc);
              var container = $("<div>").addClass("compile-error");
              runtime.pauseStack(function(restarter) {
                runtime.runThunk(function() {
                  return runtime.getField(e.exn, "render-fancy-reason").app(
                    maybeStackLoc,
                    srclocAvaliable,
                    maybeLocToAST);
                }, function(errorDisp) {
                  if (runtime.isSuccessResult(errorDisp)) {
                    var highlightLoc = getLastUserLocation(runtime, srcloc, editors, e.pyretStack,
                                                           e.exn.$name == "arity-mismatch" ? 1
                                                           : 0, true);
                    runtime.runThunk(function() {
                      return runtime.safeCall(function() {
                        if(highlightMode === "scsh" && highlightLoc != undefined) {
                          return highlightSrcloc(runtime, editors, srcloc, highlightLoc, 
                                                 "hsl(0, 100%, 89%);", context);
                        }
                        return null;
                      }, function(_) {
                        return help(errorDisp.result, e.pyretStack);
                      });
                    }, function(containerResult) {
                      if (runtime.isSuccessResult(containerResult)) {
                        var container = containerResult.result;
                        container.addClass("compile-error");
                        container.append(renderStackTrace(runtime,editors, srcloc, e));
                        restarter.resume(container);
                      } else {
                        container.add($("<span>").addClass("output-failed")
                                      .text("<error rendering reason for exception; details logged to console>"));
                        console.error("help: embed: highlightSrcloc or help failed:", errorDisp);
                        console.log(errorDisp.exn);
                        restarter.resume(container);
                      }
                    });
                  } else {
                    container.add($("<span>").addClass("output-failed")
                                  .text("<error rendering fancy-reason of exception; details logged to console>"));
                    console.error("help: embed: render-fancy-reason failed:", errorDisp);
                    console.log(errorDisp.exn);
                    restarter.resume(container);
                  }
                });
              });
            } else {
              runtime.pauseStack(function(restarter) {
                runtime.runThunk(function() {
                  return runtime.toReprJS(val, runtime.ReprMethods["$cpo"]);
                }, function(out) {
                  if (runtime.isSuccessResult(out)) {
                    restarter.resume(out.result);
                  } else {
                    var result = $("<span>").addClass("output-failed")
                      .text("<error rendering embedded value; details logged to console>");
                    console.error(out.exn);
                    restarter.resume(result);
                  }
                });
              });
            }
          },
          "optional": function(contents) {
            return runtime.safeCall(function() {
              return help(contents, stack);
            }, function(helpContents) {
              return expandableMore(helpContents);
            }, "optional: help(contents)");
          },
          "text": function(txt) {
            return $("<span>").text(txt);
          },
          "code": function(contents) {
            return runtime.safeCall(function() {
              return help(contents, stack);
            }, function(helpContents) {
              return $("<code>").append(helpContents);
            }, "code: help(contents)");
          },
          "styled": function(contents, style) {
            return runtime.safeCall(function() {
              return help(contents, stack);
            }, function(helpContents) {
              return helpContents.addClass(style);
            }, "styled: help(contents)");
          },
          "cmcode": function(loc) {
            var cmloc = cmPosFromSrcloc(runtime, srcloc, loc);
            var s = snippet(editors, cmloc);
            snippets.push(s);
            return s.wrapper;
          },
          "maybe-stack-loc": function(n, userFramesOnly, contentsWithLoc, contentsWithoutLoc) {
            var probablyErrorLocation;
            if (userFramesOnly) { 
              probablyErrorLocation = getLastUserLocation(runtime, srcloc, editors, stack, n, false); 
            } else if (stack.length >= n) { 
              probablyErrorLocation = runtime.makeSrcloc(stack[n]); 
            } else {
              probablyErrorLocation = false; 
            }
            if (probablyErrorLocation) {
              runtime.pauseStack(function(restarter) {
                runtime.runThunk(function() {
                  return contentsWithLoc.app(probablyErrorLocation);
                }, function(out) {
                  if (runtime.isSuccessResult(out)) {
                    runtime.runThunk(function() { 
                      return help(out.result, stack);
                    }, function(helpOut) { 
                      restarter.resume(helpOut); 
                    });
                  } else {
                    runtime.runThunk(function() {
                      return help(contentsWithoutLoc, stack);
                    }, function(helpOut) { 
                      var result = $("<div>");
                      result.append($("<span>").addClass("error")
                                    .text("<error displaying srcloc-specific message; "
                                          + "details logged to console; " 
                                          + "less-specific message displayed instead>"));
                      result.append(helpOut);
                      restarter.resume(result); 
                    });
                  }
                });
              });
            } else {              
              return help(contentsWithoutLoc, stack);
            }
          },
          "loc": function(loc) {
            return drawSrcloc(editors, runtime, loc);
          },
          "highlight": function(contents, locs, color) {
            if(highlightMode == "scsh") return help(contents,stack);

            return runtime.safeCall(function () {
              return help(contents, stack);
            }, function(helpContents) {
              var anchor = $("<a>").append(helpContents).addClass("highlight");

              var isSrcloc = function(s) { return runtime.unwrap(runtime.getField(srcloc, "is-srcloc").app(s)); }
              var locArray = ffi.toArray(locs).filter(function(l) { return l && isSrcloc(l); });
              
              anchor.attr('title',
                          "Click to scroll source location into view.");
              
              var cmLocs = locArray.map(
                function(l){return cmPosFromSrcloc(runtime, srcloc, l);});
              
              var hue = palette(color);
              var cssColor = hue === undefined ? undefined : hueToRGB(hue);
              
              var locClasses = cmLocs.map(
                function(l){return cmlocToCSSClass(l);});
              
              //for (var h = 0; h < locArray.length; h++) {
              //  anchor.addClass(locClasses[h]);
              //  var highlight = highlights.get({pl:locArray[h],l:cmLocs[h],c:cssColor});
              //  if(highlight == undefined) {
              //    highlights.set({pl:locArray[h],l:cmLocs[h],c:cssColor},
              //      highlightSrcloc(runtime, editors, srcloc, locArray[h], cssColor, context, true));
              //  }
              //}
              for (var h = 0; h < locArray.length; h++) {
                anchor.addClass(locClasses[h]);
                var highlight = highlights.get({pl: locArray[h], l: cmLocs[h], c: cssColor});
                if(highlight == undefined) {
                  highlights.set({pl: locArray[h], l: cmLocs[h], c: cssColor},
                                 highlightSrcloc(runtime, editors, srcloc, locArray[h], cssColor, context, true));
                }
              }
              
              
              anchor.on("mouseenter", function() {
                for (var i = 0; i < locClasses.length; i++) {
                  hintLoc(runtime, editors, srcloc, locArray[i]);
                  $("."+locClasses[i]).css("animation", "pulse 0.4s infinite alternate");
                }
              });
              
              anchor.on("click", function() {
                for (var z = 0; z < locClasses.length; z++) {
                  var cmloc = cmLocs[z];
                  var els = document.getElementsByClassName(locClasses[z]);
                  emphasizeLine(editors, cmloc);
                }
              });
              
              anchor.on("mouseleave", function() {
                for (var i = 0; i < locClasses.length; i++) {
                  unhintLoc(runtime, editors, srcloc, locArray[i]);
                  $("."+locClasses[i]).css("animation", "");
                }
              });
              
              anchor.on("click", function() {
                gotoLoc(runtime, editors, srcloc, locArray[0]);
              });
              
              return anchor;
            }, "highlight: help(contents)");
          },
          "loc-display": function(loc, style, contents) {
            return runtime.safeCall(function () {
              return help(contents, stack);
            }, function(inner) {
              hoverLink(editors, runtime, srcloc, inner, loc, "error-highlight");
              return inner;
            }, "loc-display: help(contents)");
          }
        });
      }
      
      return runtime.safeCall(function() {
        return help(errorDisp, stack);
      }, function(rendering) {
        snippets.forEach(function(s){
          highlights.forEach(function(value,key){
            if(key.l.source != s.featured.source)
              return;
            s.editor.markText(
              {line: key.l.start.line - s.featured.start.line, ch: key.l.start.ch},
              {line: key.l.end.line - s.featured.start.line, ch: key.l.end.ch},
              {className:"highlight " + cmlocToCSSClass(key.l),
               handleMouseEvents: false, atomic: true});
            var updated = false;
            s.editor.on("update", function() {
              if(updated) return;
              updated = true;
              $(s.wrapper).find(".highlight." + cmlocToCSSClass(key.l)).on("mouseenter", function() {
                hintLoc(runtime, editors, srcloc, key.pl);
                $("."+cmlocToCSSClass(key.l)).css("animation", "pulse 0.4s infinite alternate");
              });
              $(s.wrapper).find(".highlight." + cmlocToCSSClass(key.l)).on("click", function() {
                emphasizeLine(editors, key.l);
                gotoLoc(runtime, editors, srcloc, key.pl);
              });
              $(s.wrapper).find(".highlight." + cmlocToCSSClass(key.l)).on("mouseleave", function() {
                unhintLoc(runtime, editors, srcloc, key.pl);
                $("."+cmlocToCSSClass(key.l)).css("animation", "");
              });});
          })});

        if(context === undefined) 
          rendering.addClass("highlights-active");
        else if(context != undefined) {
          rendering.bind('toggleHighlight',function() {
            $(".highlights-active").removeClass("highlights-active");
            document.getElementById("main").dataset.highlights = context;
            rendering.addClass("highlights-active");
          });
        }

        return rendering;
      }, "renderErrorDisplay: help(contents)");
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
    // A function to use the class of a container to toggle
    // between the two representations of a string.  The
    // three arguments are a string with Unicode escapes, and a string without
    $.fn.toggleEscaped = function(escaped, unescaped) {
      if (this.hasClass("escaped")) {
        this.text(unescaped);
        this.removeClass("escaped");
      } else {
        this.text(escaped);
        this.addClass("escaped");
      }
      return this;
    }

    function installRenderers(runtime) {
      if (!runtime.ReprMethods.createNewRenderer("$cpo", runtime.ReprMethods._torepr)) return;
      var renderers = runtime.ReprMethods["$cpo"];
      renderers["opaque"] = function renderPOpaque(val) {
        if (image.isImage(val.val)) {
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
          var scaled = image.makeScaleImage(scaleFactor, scaleFactor, img);
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
        if (jsnums.isRational(num) && !jsnums.isInteger(num)) {
          // This function returns three string values, numerals to
          // appear before the decimal point, numerals to appear
          // after, and numerals to be repeated.
          var decimal = jsnums.toRepeatingDecimal(num.numerator(), num.denominator());
          var decimalString = decimal[0].toString() + "." + decimal[1].toString();

          var outText = $("<span>").addClass("replToggle replTextOutput rationalNumber fraction")
            .text(num.toString());

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
          CodeMirror.runMode(echo.text(), "pyret", echo[0]);
          echo.addClass("cm-s-default");
        }, 0);
        return echo;
      };
      renderers["boolean"] = function(val) { return renderers.renderText("boolean", val); };
      renderers["string"] = function(val) {
        var outText = $("<span>").addClass("replTextOutput escaped");
        var escapedUnicode = '"' + replaceUnprintableStringChars(val, true) + '"';
        var unescapedUnicode = '"' + replaceUnprintableStringChars(val, false) + '"';
        outText.text(unescapedUnicode);
        if (escapedUnicode !== unescapedUnicode) {
          outText.addClass("replToggle");
          outText.toggleEscaped(escapedUnicode, unescapedUnicode);
          outText.click(function(e) {
            $(this).toggleEscaped(escapedUnicode, unescapedUnicode);
            e.stopPropagation();
          });
        }
        return outText;
      };
      // Copied from runtime-anf, and tweaked.  Probably should be exported from runtime-anf instad
      var replaceUnprintableStringChars = function (s, toggleUnicode) {
        var ret = [], i;
        for (i = 0; i < s.length; i++) {
          var val = s.charCodeAt(i);
          switch(val) {
            case 7: ret.push('\\a'); break;
            case 8: ret.push('\\b'); break;
            case 9: ret.push('\\t'); break;
            case 10: ret.push('\\n'); break;
            case 11: ret.push('\\v'); break;
            case 12: ret.push('\\f'); break;
            case 13: ret.push('\\r'); break;
            case 34: ret.push('\\"'); break;
            case 92: ret.push('\\\\'); break;
            default:
              if ((val >= 32 && val <= 126) || !toggleUnicode) {
                ret.push( s.charAt(i) );
              }
              else {
                var numStr = val.toString(16).toUpperCase();
                while (numStr.length < 4) {
                  numStr = '0' + numStr;
                }
                ret.push('\\u' + numStr);
              }
              break;
          }
        }
        return ret.join('');
      };
      renderers["method"] = function(val) { return renderers.renderText("method", val); };
      renderers["function"] = function(val) { return renderers.renderText("function", val); };
      renderers["render-array"] = function(top) {
        var container = $("<span>").addClass("replToggle replOutput");
        // inlining the code for the VSCollection case of helper() below, without having to create the extra array
        // this means we don't get grouping behavior yet, but since that's commented out right now anyway, it's ok
        container.append($("<span>").text("[raw-array: "));
        var ul = $("<ul>").addClass("inlineCollection");
        container.append(ul);
        var maxIdx = top.done.length;
        for (var i = maxIdx - 1; i >= 0; i--) {
          var li = $("<li>").addClass("expanded");
          var title = $("<span>").addClass("label").text("Item " + (maxIdx - 1 - i));
          var contents = $("<span>").addClass("contents");
          ul.append(li.append(title).append(contents.append(top.done[i])));
        }
        container.append($("<span>").text("]"));
        container.click(function(e) {
          ul.each(makeInline);
          e.stopPropagation();
        });
        return container;
      };
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
      renderers["tuple"] = function(t, pushTodo) {
        pushTodo(undefined, undefined, undefined, Array.prototype.slice.call(t.vals), "render-tuple");
      };
      renderers["render-tuple"] = function(top){
        var container = $("<span>").addClass("replOutput");
        var openBrace = $("<span>").text("{");
        var closeBrace = $("<span>").text("}");
        var values = $("<span>");
        for (var i = top.done.length - 1; i >= 0; i--) {
          values.append(top.done[i]);
          if (i > 0) {
             values.append("; ");
          }
        }
        container.append(openBrace);
        container.append(values);
        container.append(closeBrace);
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
      }
      function helper(container, val, values) {
        if (runtime.ffi.isVSValue(val)) { container.append(values.pop()); }
        else if (runtime.ffi.isVSStr(val)) { container.append(runtime.unwrap(runtime.getField(val, "s"))); }
        else if (runtime.ffi.isVSCollection(val)) {
          container.addClass("replToggle");
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
          var items = runtime.ffi.toArray(runtime.getField(val, "args"));
          for (var i = 0; i < items.length; i++) {
            if (i > 0) { container.append($("<span>").text(", ")); }
            helper(container, items[i], values);
          }
          container.append($("<span>").text(")"));
        } else {
          var items = runtime.ffi.toArray(runtime.getField(val, "items"));
          for (var i = 0; i < items.length; i++) {
            helper(container, items[i], values);
          }
        }
        return container;
      }
      function groupItems(ul, items, values, minIdx, maxIdx) {
        // The grouping behavior isn't visually clean yet, so commenting out for now...
        // if (Math.log10(maxIdx - minIdx) <= 1) {
          for (var i = minIdx; i < maxIdx; i++) {
            var li = $("<li>").addClass("expanded");
            var title = $("<span>").addClass("label").text("Item " + i);
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
        var container = $("<span>").addClass("replOutput");
        return helper(container, top.extra.skeleton, top.done);
      };
    }
    // Because some finicky functions (like images and CodeMirrors), require
    // extra events to happen for them to show up, we provide this as an
    // imperative API: the DOM node created will be appended to the output
    // and also returned
    // NOTE: THIS MUST BE CALLED WHILE RUNNING ON runtime's STACK
    function renderPyretValue(output, runtime, answer) {
      installRenderers(runtime);
      runtime.pauseStack(function(restarter) {
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
          restarter.resume(container);
        });
      });
    }
    return runtime.makeJSModuleReturn({
      renderPyretValue: renderPyretValue,
      renderStackTrace: renderStackTrace,
      hoverLocs: hoverLocs,
      hoverLink: hoverLink,
      highlightSrcloc: highlightSrcloc,
      highlightLines: highlightLines,
      gotoLoc: gotoLoc,
      snippet: snippet,
      hintLoc: hintLoc,
      unhintLoc: unhintLoc,
      emphasizeLine: emphasizeLine,
      renderErrorDisplay: renderErrorDisplay,
      cmPosFromSrcloc: cmPosFromSrcloc,
      drawSrcloc: drawSrcloc,
      expandableMore: expandableMore,
      getLastUserLocation: getLastUserLocation,
      cssSanitize: cssSanitize,
      cmlocToCSSClass: cmlocToCSSClass,
      locToAST: locToAST,
      locToSrc: locToSrc,
      makeMaybeLocToAST: makeMaybeLocToAST,
      makeMaybeStackLoc: makeMaybeStackLoc,
      makeSrclocAvaliable: makeSrclocAvaliable
    });


  }
})
