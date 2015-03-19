define(["trove/image-lib","js/js-numbers","/js/share.js"], function(imageLib,jsnums) {

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

  function hoverLocs(editors, runtime, srcloc, elt, locs, cls) {

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
      var view = editor.getScrollInfo();
      cases(get(srcloc, "Srcloc"), "Srcloc", curLoc, {
        "builtin": function(_) { },
        "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
          var charCh = editor.charCoords(cmPosFromSrcloc(curLoc).start, "local");
          if (view.top > charCh.top) {
            warnDesired = fadeAmt;
            // We set a timeout so that a quick pass through the area
            // won't bring up the warning.
            setTimeout(function() { setWarningState(jQuery(".warning-upper")); },
                       warnWait);
          } else if (view.top + view.clientHeight < charCh.bottom) {
            warnDesired = fadeAmt;
            setTimeout(function() { setWarningState(jQuery(".warning-lower")); },
                       warnWait);
          }
        }
      });
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

  // Because some finicky functions (like images and CodeMirrors), require
  // extra events to happen for them to show up, we provide this as an
  // imperative API: the DOM node created will be appended to the output
  // and also returned
  function renderPyretValue(output, runtime, answer) {
    var image = imageLib(runtime, runtime.namespace);

    if(runtime.isOpaque(answer) && image.isImage(answer.val)) {
      var container = $("<div>").addClass('replOutput');
      output.append(container);
      var imageDom;
      var maxWidth = output.width() * .75;
      var maxHeight = $(document).height() * .6;
      var realWidth = answer.val.getWidth();
      var realHeight = answer.val.getHeight();
      if(answer.val.getWidth() > maxWidth || answer.val.getHeight() > maxHeight) {
        container.addClass("replImageThumbnail");
        container.attr("title", "Click to see full image");
        var scaleFactorX = 100 / realWidth;
        var scaleFactorY = 200 / realHeight;
        var scaleFactor = scaleFactorX < scaleFactorY ? scaleFactorX : scaleFactorY;
        var scaled = image.makeScaleImage(scaleFactor, scaleFactor, answer.val);
        imageDom = scaled.toDomNode();
        container.append(imageDom);
        $(imageDom).trigger({type: 'afterAttach'});
        $('*', imageDom).trigger({type : 'afterAttach'});
        var originalImageDom = answer.val.toDomNode();
        $(imageDom).on("click", function() {
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
        });

      } else {
        imageDom = answer.val.toDomNode();
        container.append(imageDom);
        $(imageDom).trigger({type: 'afterAttach'});
        $('*', imageDom).trigger({type : 'afterAttach'});
        return imageDom;
      }
    } else {
      var echoContainer = $("<div>").addClass("replTextOutput");

      if (!runtime.isNothing(answer)) {

        // If we're looking at a rational number, arrange it so that a
        // click will toggle the decimal representation of that
        // number.  Note that this feature abandons the convenience of
        // publishing output via the CodeMirror textarea.
        if (runtime.isNumber(answer) && jsnums.isExact(answer) && !jsnums.isInteger(answer)) {

          outText = $("<span>").addClass("rationalNumber fraction").text(answer.toString());
          // On click, switch the representation from a fraction to
          // decimal, and back again.
          outText.click(function() {

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

            // This function returns three string values, numerals to
            // appear before the decimal point, numerals to appear
            // after, and numerals to be repeated.
            var decimal = jsnums.toRepeatingDecimal(answer.numerator(),
                                                    answer.denominator());
            var decimalString = decimal[0].toString() + "." +
              decimal[1].toString();

            $(this).toggleFrac(answer.toString(), decimalString, decimal[2]);

          });
          echoContainer.append(outText);
          output.append(echoContainer);

        } else {

          // Either we're looking at a string or some number with only
          // one representation. Just print it, using the CodeMirror
          // textarea for styling.
          runtime.runThunk(function() {
            return runtime.toReprJS(answer, "_torepr");
          }, function(outText) {
            var echo = $("<textarea class='CodeMirror'>");
            output.append(echoContainer);
            echoContainer.append(echo);
            if(runtime.isSuccessResult(outText)) {
              echo.text(outText.result);
            }
            else {
              echo.text("<error displaying value>");
            }
            setTimeout(function() {
              CodeMirror.fromTextArea(echo[0], { readOnly: true });
            }, 0);
          });
        }

        return echoContainer;
      }
    }
  }
  return {
    renderPyretValue: renderPyretValue,
    hoverLocs: hoverLocs,
    hoverLink: hoverLink,
    isSharedImport: isSharedImport,
    basename: basename,
    getSharedId: getSharedId,
    getMyDriveId: getMyDriveId,
    isGDriveImport: isGDriveImport,
    isJSImport: isJSImport,
    getJSFilename: getJSFilename
  };

})
