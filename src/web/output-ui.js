define(["trove/image-lib"], function(imageLib) {

  function mapK(inList, f, k, outList) {
    if (inList.length === 0) { k(outList || []); }
    else {
      var newInList = inList.slice(1, inList.length);
      f(inList[0], function(v) {
        mapK(newInList, f, k, (outList || []).concat([v]))
      });
    }
  }

  function hoverLocs(editor, runtime, srcloc, elt, locs, cls) {
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
             var marker = editor.markText(
               cmLoc.start,
               cmLoc.end,
               { className: cls });
            return marker;
          }
        });
      }, withMarker);
    }
    var cases = runtime.ffi.cases;
    var get = runtime.getField;
    // CLICK to *cycle* through locations
    var marks = [];
    elt.on("mouseenter", function() {
      var curLoc = locs[locIndex];
      var view = editor.getScrollInfo();
      cases(get(srcloc, "Srcloc"), "Srcloc", curLoc, {
        "builtin": function(_) { },
        "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
          var charCh = editor.charCoords(cmPosFromSrcloc(curLoc).start, "local");
          if (view.top > charCh.top) {
            jQuery(".warning-upper").fadeIn("fast");
          } else if (view.top + view.clientHeight < charCh.bottom) {
            jQuery(".warning-lower").fadeIn("fast");
          }
        }
      });
      mapK(locs, function(l, k) { highlightSrcloc(l, cls, k); }, function(ms) {
        marks = marks.concat(ms);
      });
    });
    elt.on("mouseleave", function() {
      jQuery(".warning-upper").fadeOut("fast");
      jQuery(".warning-lower").fadeOut("fast");
      marks.forEach(function(m) { return m && m.clear(); })
      marks = [];
    });
    var locIndex = 0;
    if (locs.filter(function(e) { return runtime.isObject(e) && get(srcloc, "is-srcloc").app(e); }).length > 0) {
      elt.on("click", function() {
        jQuery(".warning-upper").fadeOut("fast");
        jQuery(".warning-lower").fadeOut("fast");
        function gotoNextLoc() {
          var curLoc = locs[locIndex];
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
      if (!runtime.isNothing(answer)) {
        var echoContainer = $("<div>").addClass("replTextOutput");
        var text = runtime.toReprJS(answer, "_torepr");
        var echo = $("<textarea class='CodeMirror'>");
        output.append(echoContainer);
        echoContainer.append(echo);
        var echoCM = CodeMirror.fromTextArea(echo[0], { readOnly: 'nocursor' });
        echoCM.setValue(text);
        return echoContainer;
      }
    }
  }
  return {
    renderPyretValue: renderPyretValue,
    hoverLocs: hoverLocs
  };

})
