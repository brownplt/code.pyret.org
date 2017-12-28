({
  requires: [
    { "import-type": "builtin",
      name: "parse-pyret" },
    { "import-type": "builtin",
      name: "error-display" },
    { "import-type": "builtin",
      name: "srcloc" },
    { "import-type": "builtin",
      name: "ast" },
    { "import-type": "builtin",
      name: "image-lib" },
    { "import-type": "builtin",
      name: "load-lib" }
  ],
  provides: {},
  nativeRequires: [
    "pyret-base/js/runtime-util",
    "pyret-base/js/js-numbers"
  ],
  theModule: function(runtime, _, uri, parsePyret, errordisplayLib, srclocLib, astLib, image, loadLib, util, jsnums) {

    var srcloc = runtime.getField(srclocLib, "values");
    var isSrcloc = runtime.getField(srcloc, "is-Srcloc");
    var AST = runtime.getField(astLib, "values");
    var ED = runtime.getField(errordisplayLib, "values");
    var PP = runtime.getField(parsePyret, "values");

    // TODO(joe Aug 18 2014) versioning on shared modules?  Use this file's
    // version or something else?
    var shareAPI = makeShareAPI("");

    var highlightedPositions = [];

    var converter = $.colorspaces.converter('CIELAB', 'hex');

    function hueToRGB(hue) {
      var a = 40*Math.cos(hue);
      var b = 40*Math.sin(hue)
      return converter([74, a, b]);
    }

    var goldenAngle = 2.39996322972865332;
    var lastHue = 0;

    var makePalette = function(){
      var palette = new Map();
      return function(n){
        if(!palette.has(n)) {
          lastHue = (lastHue + goldenAngle)%(Math.PI*2.0);
          palette.set(n, lastHue);
        }
        return palette.get(n);
      };};


    var Position = function() {

      function cached_find(doc, positionCache, textMarker) {
        var changeGeneration = doc.changeGeneration();
        if (positionCache.has(changeGeneration))
          return positionCache.get(changeGeneration);
        else {
          var pos = textMarker.find();
          positionCache.set(changeGeneration, pos);
          return pos;
        }
      }

      function Position(doc, source, from, to, inclusiveLeft, inclusiveRight) {
        if (inclusiveLeft === undefined)
          inclusiveLeft = true;
        if (inclusiveRight === undefined)
          inclusiveRight = true;
        this.inclusiveLeft  = inclusiveLeft;
        this.inclusiveRight = inclusiveLeft;

        this.doc = doc;
        this.source = source;

        var textMarker = doc.markText(from, to, this.options);
        this._textMarker = textMarker;

        var positionCache = new Map();

        Object.defineProperty(this, 'from', {
          get: function() {
            var pos = cached_find(doc, positionCache, textMarker);
            return pos !== undefined ? pos.from : undefined;
          }
        });

        Object.defineProperty(this, 'to', {
          get: function() {
            var pos = cached_find(doc, positionCache, textMarker);
            return pos !== undefined ? pos.to : undefined;
          }
        });

        positionCache.set(doc.changeGeneration(), {from: from, to: to});
      }

      Position.prototype.on = function on(type, f) {
        this._textMarker.on(type, f);
      };

      Position.prototype.off = function on(type, f) {
        this._textMarker.off(type, f);
      };

      Position.prototype.hint = function hint() {
        if (this.from === undefined
            || !(this.doc.getEditor() instanceof CodeMirror)) {
          console.info("This position could not be hinted because it is not in this editor:", this);
        } else {
          hintLoc(this);
        }
      };

      Position.prototype.goto = function goto() {
        if (this.from === undefined
            || !(this.doc.getEditor() instanceof CodeMirror)) {
          flashMessage("This code is not open in this tab.");
        } else {
          this.doc.getEditor().getWrapperElement().scrollIntoView(true);
          this.doc.getEditor().scrollIntoView(this.from.line, 50);
          unhintLoc();
        }
      };

      Position.prototype.toString = function toString() {
        return (this.source
          + ":" + this.from.line + ":" + this.from.ch
          + "-" + this.to.line   + ":" + this.to.ch);
      };

      Position.prototype.highlight = function highlight(color) {
        if (this.from === undefined)
          return;
        if (this.highlighter !== undefined)
          this.highlighter.clear();
        if (color === undefined) {
          this.highlighter = undefined;
          return;
        }
        this.highlighter = this.doc.markText(this.from, this.to,
          { inclusiveLeft   : this.inclusiveLeft,
            inclusiveRight  : this.inclusiveRight,
            shared          : false,
            clearOnEnter    : true,
            css             : "background-color:" + color });
        this.highlighter.on('clear', function (_) {
          this.highlighter === undefined;
        });
      };

      Position.prototype.spotlight = function spotlight() {
        return this.doc.markText(this.from, this.to,
          { inclusiveLeft   : this.inclusiveLeft,
            inclusiveRight  : this.inclusiveRight,
            shared          : false,
            className       : "spotlight" });
      };

      Position.prototype.blink = function highlight(color) {
        if (this.highlighter !== undefined)
          this.highlighter.clear();
        if (color === undefined)
          return;
        this.highlighter = this.doc.markText(this.from, this.to,
          { inclusiveLeft   : this.inclusiveLeft,
            inclusiveRight  : this.inclusiveRight,
            shared          : false,
            className       : "highlight-blink",
            css             : "background-color:" + color + ";" });
      };

      Position.fromPyretSrcloc = function (runtime, srcloc, loc, documents, options) {
        return runtime.ffi.cases(isSrcloc, "Srcloc", loc, {
          "builtin": function(_) {
             throw new Error("Cannot get Position from builtin location", loc);
          },
          "srcloc": function(source, startL, startC, startCh, endL, endC, endCh) {
            if (!documents.has(source))
              throw new Error("No document for this location: ", loc);
            else {
              var extraCharForZeroWidthLocs = endCh === startCh ? 1 : 0;
              return new Position(
                documents.get(source),
                source,
                new CodeMirror.Pos(startL - 1, startC),
                new CodeMirror.Pos(  endL - 1, endC + extraCharForZeroWidthLocs),
                options);
            }
          }
        });
      };

      Position.fromSrcArray = function (locarray, documents, options) {
        if (locarray.length === 7) {
          var extraCharForZeroWidthLocs = locarray[3] === locarray[6] ? 1 : 0;
          var source = locarray[0];
          if (!documents.has(source)) {
            throw new Error("No document for this location: ", loc);
          }
          return new Position(
            documents.get(source),
            source,
            new CodeMirror.Pos(locarray[1] - 1, locarray[2]),
            new CodeMirror.Pos(locarray[4] - 1, locarray[5] + extraCharForZeroWidthLocs),
            options);
        }
      }

      return Position;
    }();

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

    function getLastUserLocation(runtime, srcloc, documents, e, ix, local) {
      var srclocStack = e.map(runtime.makeSrcloc);
      var isSrcloc = function(s) { return runtime.unwrap(runtime.getField(srcloc, "is-srcloc").app(s)); }
      var userLocs = srclocStack.filter(function(l) {
        if(!(l && isSrcloc(l))) { return false; }
        var source = runtime.getField(l, "source");
        return source === "definitions://"
                || source.indexOf("interactions://") !== -1
                || (!local ? source.indexOf("gdrive") !== -1 : false);
      });
      var probablyErrorLocation = userLocs[ix];
      return probablyErrorLocation;
    }

    function hintLoc(position) {
      $(".warning-upper.hinting, .warning-lower.hinting").removeClass("hinting");

      var editor = position.doc.getEditor();

      if (!(editor instanceof CodeMirror))
        throw new Error("Source location not in editor", position);

      var coord = editor.charCoords(
        {line: position.from.line, ch:0},
        position.source === "definitions://" ? "local" : "page");

      var viewportMin;
      var viewportMax;

      if (position.source === "definitions://") {
        var scrollInfo = editor.getScrollInfo();
        viewportMin = scrollInfo.top;
        viewportMax = scrollInfo.clientHeight + viewportMin;
      } else {
        var repl = document.querySelector('.repl');
        viewportMin = repl.scrollTop;
        viewportMax = viewportMin + repl.scrollHeight;
      }

      var direction;
      var TOP     = 0,
          BOTTOM  = 1;

      if(coord.top < viewportMin) {
        direction = TOP
      } else if (coord.top > viewportMax) {
        direction = BOTTOM;
      } else {
        return;
      }

      var hinter = document.querySelector(
          ((position.source === "definitions://") ? ".replMain > .CodeMirror" : ".repl")
        + " > "
        + ((direction === TOP) ? ".warning-upper" : ".warning-lower"));

      hinter.classList.add("hinting");
    }

    function unhintLoc() {
      $(".warning-upper.hinting, .warning-lower.hinting").removeClass("hinting");
    }

    function basename(str) {
       var base = new String(str).substring(str.lastIndexOf('/') + 1);
       if(base.lastIndexOf(".") != -1)
          base = base.substring(0, base.lastIndexOf("."));
       return base;
    }

    var interactionsPrefix = "interactions";
    var definitionsPrefix = "definitions";
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

    function isDefinitions(filename) {
      var definitionsIndex = filename.indexOf(definitionsPrefix);
      return definitionsIndex === 0;
    }

    function isInteractions(filename) {
      var interactionsIndex = filename.indexOf(interactionsPrefix);
      return interactionsIndex === 0;
    }

    function isLocal(filename) {
      return isDefinitions(filename) || isInteractions(filename);
    }

    function drawSrcloc(documents, runtime, s) {
      if (!s) { return $("<span>"); }
      var get = runtime.getField;

      var in_editor =
        runtime.hasField(s, "source")
          && isLocal(runtime.getField(s, "source"));

      var srcElem = $(in_editor ? "<a>" : "<span>")
            .addClass("srcloc").text(get(s, "format").app(true));

      if(!runtime.hasField(s, "source")) {
        return srcElem;
      }

      var src = runtime.unwrap(get(s, "source"));
      if(!(documents.has(src) && (documents.get(src).getEditor() !== undefined))) {
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

    function drawPosition(position) {
      var in_editor = isLocal(position.source);
      var srcElem = $(in_editor ? "<a>" : "<div>")
                      .addClass("srcloc").text(position.toString());
      srcElem.on("click", function() {
        position.goto();
      });
      if(isSharedImport(position.source)) {
        var sharedId = getSharedId(position.source);
        var srcUrl = shareAPI.makeShareUrl(sharedId);
        return srcElem.attr({href: srcUrl, target: "_blank"});
      }
      else if(isGDriveImport(position.source)) {
        var MyDriveId = getMyDriveId(position.source);
        var srcUrl = makeMyDriveUrl(MyDriveId);
        return srcElem.attr({href: srcUrl, target: "_blank"});
      }
      else if(isJSImport(position.source)) {
        /* NOTE(joe): No special handling here, since it's opaque code */
        return srcElem.attr;
      }
      srcElem.on("mouseover", function() {
        position.hint();
      });
      srcElem.on("mouseleave", function() {
        clearFlash();
        unhintLoc();
      });
      return srcElem;
    }

    function makeSrclocAvaliable(runtime, documents, srcloc) {
      return runtime.makeFunction(function(loc) {
        return runtime.ffi.cases(isSrcloc, "Srcloc", loc, {
          "builtin": function(_) {
            console.error("srclocAvaliable should not be passed a builtin source location.", loc);
            return runtime.pyretFalse;
          },
          "srcloc": function(filename, _, __, ___, ____, _____, ______) {
            if (documents.has(filename)) {
              return runtime.pyretTrue;
            } else {
              return runtime.pyretFalse;
            }
          }
        });
      });
    }

    function maybeParse(runtime, documents, loc) {
      return runtime.ffi.cases(isSrcloc, "Srcloc", loc, {
        "builtin": function(_) {
            console.error("maybeLocToAST should not be passed a builtin source location.", loc);
            return runtime.ffi.makeNone();
          },
        "srcloc": function(filename, start_line, start_col, _, end_line, end_col, __) {
            if(!documents.has(filename)) return runtime.ffi.makeNone();
            let source = documents.get(filename).getValue()

            // MUST NOT BE CALLED ON PYRET STACK.
            function parse(source, filename) {
              var ret = Q.defer();
              runtime.runThunk(function() {
                return runtime.getField(PP, "surface-parse").app(source, filename);
              }, function (result) {
                if (runtime.isSuccessResult(result)) {
                  ret.resolve(result.result);
                } else {
                  console.error(result.exn);
                  ret.reject(result.exn);
                }
              });
              return ret.promise;
            }

            var isSBlock = runtime.getField(AST, "is-s-block");
            var isSProgram = runtime.getField(AST, "is-s-program");
            var isSModule = runtime.getField(AST, "is-s-module");
            function ignorable(ast) {
              // This function deliberately ignores some types of AST nodes that shouldn't
              // be reported to the user.
              // Currently, the only such exception is s-block nodes, which are implicitly
              // added by the parser but don't represent any code the user explcitly wrote
              return isSProgram.app(ast) || isSModule.app(ast) || isSBlock.app(ast);
            }

            function search(ast) {
              // CONTRACT: This ast input must result from the parser directly, and not be the result
              // of desugaring.  It assumes that the source locations in the ast are well-nested:
              // if one node's srcloc is within another node's srcloc, then the former node must be a
              // descendant of the latter.  This allows us to prune the search tree.
              var todo = [ast];
              var ans = undefined;
              while (todo.length > 0) {
                var first = todo.pop();
                if (runtime.hasField(first, "l")) {
                  // not every AST item has an "l" field (eg. s-global, s-type-global, s-base)
                  var l = runtime.getField(first, "l");
                  if (isSrcloc.app(l)) { // just extra checking; should be unnecessary
                    if (runtime.equal_always(l, loc)) { // stack-safe because srclocs are flat data
                      if (!ignorable(first)) {
                        return runtime.ffi.makeSome(first);
                      }
                    } else if (!runtime.getField(l, "contains").app(loc)) {
                      continue;                       // ASSUMES that srclocs are well-nested
                    }
                  }
                }
                if (runtime.ffi.isLink(first)) {
                  // Minor optimization: push rest then first, so that our todo list stays short
                  todo.push(runtime.getField(first, "rest"));
                  todo.push(runtime.getField(first, "first"));
                } else {
                  var fields = runtime.getFields(first);
                  for (var i = 0; i < fields.length; i++) {
                    if (fields[i] === "l") continue;
                    var val = runtime.getField(first, fields[i]);
                    if (runtime.isObject(val)) {
                      todo.push(val);
                    }
                  }
                }
              }
              return runtime.ffi.makeNone();
            }

            return runtime.pauseStack(function(restarter) {
                return parse(source, filename).
                  then(search).
                  catch(function(error) {
                    console.error("Unexpected error encountered in `maybeParse`:", error);
                    return runtime.ffi.makeNone();
                    }).
                  done(function(result) { return restarter.resume(result); });
              });
        }
      });
    }

    function makeMaybeLocToAST(runtime, documents, loc) {
      return runtime.makeFunction(function(loc) {
          return maybeParse(runtime, documents, loc);
        });
    }

    function makeMaybeStackLoc(runtime, documents, srcloc, stack) {
      return runtime.makeFunction(function(n, userFramesOnly) {
        var probablyErrorLocation;
        if (userFramesOnly) { probablyErrorLocation = getLastUserLocation(runtime, srcloc, documents, stack, n, false); }
        else if (stack.length >= n) { probablyErrorLocation = runtime.makeSrcloc(stack[n]); }
        else { probablyErrorLocation = false; }
        if (probablyErrorLocation) {
          return runtime.ffi.makeSome(probablyErrorLocation);
        } else {
          return runtime.ffi.makeNone();
        }
      });
    }

    var Snippet = function () {
      function Snippet(position) {
        var lines = [];
        position.doc.eachLine(position.from.line, position.to.line + 1,
          function (line) {
            lines.push(line.text);
          });
        var container = document.createElement("div");
        var header = document.createElement("header");
        if (isLocal(position.source)) {
          container.addEventListener("click", function() {
            position.goto();
          });
          container.addEventListener("mouseover", function() {
            position.hint();
          });
          container.addEventListener("mouseleave", function() {
            unhintLoc();
            clearFlash();
          });
        }
        $(header).append(drawPosition(position));
        container.appendChild(header);
        container.classList.add("cm-snippet");
        var editor = CodeMirror(container, {
          readOnly:       "nocursor",
          disableInput:   true,
          indentUnit:     2,
          lineWrapping:   true,
          lineNumbers:    true,
          viewportMargin: 1,
          scrollbarStyle: "null"});
        editor.swapDoc(new CodeMirror.Doc(
          lines,
           position.doc.mode,
           position.from.line,
           position.doc.lineSep));
        editor.getDoc().markText(
          {line: position.from.line, ch: 0},
          position.from,
          {className: "highlight-irrelevant"});
        editor.getDoc().markText(
          position.to,
          {line: position.to.line, ch: lines[lines.length - 1].length},
          {className: "highlight-irrelevant"});
        this.container = container;
        this.position  = position;
        this.editor    = editor;
        this.doc       = editor.doc;
      }
      return Snippet;
    }();

    function renderStackTrace(runtime, documents, srcloc, pyretStack) {
      function isSrcloc(s) {
        return s && runtime.unwrap(runtime.getField(srcloc, "is-srcloc").app(s));
      }
      var container = $("<div>").addClass("stacktrace");
      container.append($("<p>").text("Evaluation in progress when the error occurred (most recent first):"));
      container.on("mouseover", function () {
        $("#main").addClass("spotlight");
      });
      container.on("mouseleave", function () {
        $("#main").removeClass("spotlight");
      });
      pyretStack.
        map(runtime.makeSrcloc).
        filter(isSrcloc).
        map(function (loc) {
          if (!documents.has(loc.dict.source)) {
            return $('<div>').append(drawSrcloc(documents, runtime, loc).css('display', 'block'));
          } else {
            var position = Position.fromPyretSrcloc(runtime, srcloc, loc, documents);
            var snippet  = new Snippet(position);
            var spotlight;
            snippet.container.addEventListener("mouseover", function() {
              if(spotlight !== undefined)
                return;
              spotlight = position.spotlight();
            });
            snippet.container.addEventListener("mouseleave", function() {
              if(spotlight !== undefined)
                spotlight.clear();
              spotlight = undefined;
            });
            return $(snippet.container);
          }
        }).
        forEach(function(frame) {
          container.append(frame);
        });
      return expandable(container, "program execution trace");
    }

    var allHighlightAnchors   = new Map();
    var allHighlightPositions = new Map();
    var colorsEmphasized      = new Set();
    var colorsHighlighted     = new Set();
    lastHue = (lastHue + goldenAngle)%(Math.PI*2.0);
    var globalColor = lastHue;

    function highlight(color) {
      if(colorsHighlighted.has(color))
        return;
      else {
        colorsHighlighted.add(color);
        var anchors   = allHighlightAnchors.get(color);
        var positions = allHighlightPositions.get(color);
        var cssColor = hueToRGB(color);
        for(var i = 0; i < anchors.length; i++) {
          anchors[i].css('background-color', cssColor);
        }
        for(var i = 0; i < positions.length; i++) {
          positions[i].highlight(cssColor);
        }
      }
    }

    function unhighlight(color) {
      if(colorsHighlighted.has(color)) {
        var anchors   = allHighlightAnchors.get(color);
        var positions = allHighlightPositions.get(color);
        for(var i = 0; i < anchors.length; i++) {
          anchors[i].css('background-color', 'initial');
        }
        for(var i = 0; i < positions.length; i++) {
          positions[i].highlight(undefined);
        }
        colorsHighlighted.delete(color)
      }
    }

    function emphasize(color) {
      if(colorsEmphasized.has(color))
        return;
      else {
        colorsEmphasized.add(color);
        var anchors   = allHighlightAnchors.get(color);
        var positions = allHighlightPositions.get(color);
        var cssColor = hueToRGB(color);
        for(var i = 0; i < anchors.length; i++) {
          anchors[i].css('background-color', cssColor);
          anchors[i].addClass('highlight-blink');
        }
        for(var i = 0; i < positions.length; i++) {
          positions[i].blink(cssColor);
        }
      }
    }

    function demphasize(color) {
      if(!colorsEmphasized.has(color))
        return;
      else {
        colorsEmphasized.delete(color);
        var anchors   = allHighlightAnchors.get(color);
        var positions = allHighlightPositions.get(color);
        for(var i = 0; i < anchors.length; i++) {
          anchors[i].removeClass('highlight-blink');
        }
        if(colorsHighlighted.has(color)) {
          var cssColor = hueToRGB(color);
          for(var i = 0; i < positions.length; i++) {
            positions[i].highlight(cssColor);
          }
        } else {
          for(var i = 0; i < positions.length; i++) {
            positions[i].highlight(undefined);
          }
          for(var i = 0; i < anchors.length; i++) {
            anchors[i].css('background-color', 'initial');
          }
        }
      }
    }

    function clearEffects() {
      logger.log("clearedEffects");
      $(".highlights-active").removeClass("highlights-active");
      colorsHighlighted.forEach(function(color) {
        unhighlight(color);
      });
      colorsEmphasized.forEach(function(color) {
        demphasize(color);
      });
    }

    function settingChanged(eagerness, colorfulness) {
      logger.log("highlight_settings_changed",
        { eagerness: eagerness,
          colorfulness: colorfulness
        });
      window.requestAnimationFrame(function() {
        colorsHighlighted.forEach(function(color) {
          unhighlight(color);
        });
        colorsEmphasized.forEach(function(color) {
          demphasize(color);
        });
        if (eagerness == 'eager') {
          $(".compile-error.highlights-active, " +
            ".test-reason.highlights-active > .highlights-active")
                .first().trigger('toggleHighlight');
        }
      });
    }

    function renderErrorDisplay(documents, runtime, errorDisp, stack, context, result) {
      var get = runtime.getField;
      var ffi = runtime.ffi;
      installRenderers(runtime);

      function isSrcloc(s) {
        return s && runtime.unwrap(runtime.getField(srcloc, "is-srcloc").app(s));
      }

      var palette = makePalette();
      var snippets = new Map();
      var messageAnchors = new Map();
      var messagePositions = new Map();
      var messageHintedColors = new Set();

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
          "h-sequence-sep": function(seq, separator, lastSep) {
            var result = $("<p>");
            var contents = ffi.toArray(seq);
            return runtime.safeCall(function() {
              return runtime.eachLoop(runtime.makeFunction(function(i) {
                if (i === contents.length - 1 && lastSep !== "") result.append(lastSep);
                else if (i != 0 && separator !== "") result.append(separator);
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
              var richStack = runtime.getField(loadLib, "internal")
                .enrichStack(e, runtime.getField(loadLib, "internal").getModuleResultProgram(result));
              var maybeStackLoc   = makeMaybeStackLoc(runtime, documents, srcloc, richStack);
              var srclocAvaliable = makeSrclocAvaliable(runtime, documents, srcloc);
              var maybeLocToAST   = makeMaybeLocToAST(runtime, documents, srcloc);
              var container = $("<div>").addClass("compile-error");
              return runtime.pauseStack(function(restarter) {
                runtime.runThunk(function() {
                  return runtime.getField(e.exn, "render-fancy-reason").app(
                    maybeStackLoc,
                    srclocAvaliable,
                    maybeLocToAST);
                }, function(errorDisp) {
                  if (runtime.isSuccessResult(errorDisp)) {
                    var highlightLoc = getLastUserLocation(runtime, srcloc, documents, richStack,
                                                           e.exn.$name == "arity-mismatch" ? 1
                                                           : 0, true);
                    runtime.runThunk(function() {
                      return runtime.safeCall(function() {
                        return null;
                      }, function(_) {
                        return help(errorDisp.result, richStack);
                      }, "highlightSrcloc, then help");
                    }, function(containerResult) {
                      if (runtime.isSuccessResult(containerResult)) {
                        var container = containerResult.result;
                        if (container.length > 0) {
                          container = $("<div>").append(container);
                        }
                        container.addClass("compile-error");
                        container.append(renderStackTrace(runtime,documents, srcloc, richStack));
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
              return runtime.pauseStack(function(restarter) {
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
            if (!isSrcloc(loc)) {
              return $("<div>").text("Code not in editor.");
            } else {
              var pos = new Position.fromPyretSrcloc(runtime, srcloc, loc, documents,
                  { inclusiveLeft: false,
                    inclusiveRight: false });
              var snippet = new Snippet(pos);
              if(snippets.has(pos.source))
                snippets.get(pos.source).push(snippet.doc)
              else snippets.set(pos.source, [snippet.doc])
              return $(snippet.container);
            }
          },
          "maybe-stack-loc": function(n, userFramesOnly, contentsWithLoc, contentsWithoutLoc) {
            var probablyErrorLocation;
            if (userFramesOnly) {
              probablyErrorLocation = getLastUserLocation(runtime, srcloc, documents, stack, n, false);
            } else if (stack.length >= n) {
              probablyErrorLocation = runtime.makeSrcloc(stack[n]);
            } else {
              probablyErrorLocation = false;
            }
            if (probablyErrorLocation) {
              return runtime.pauseStack(function(restarter) {
                runtime.runThunk(function() {
                  return contentsWithLoc.app(probablyErrorLocation);
                }, function(out) {
                  if (runtime.isSuccessResult(out)) {
                    runtime.runThunk(function() {
                      return help(out.result, stack);
                    }, function(helpOut) {
                      restarter.resume(helpOut.result);
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
                      result.append(helpOut.result);
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
            return drawSrcloc(documents, runtime, loc);
          },
          "highlight": function(contents, locs, id) {
            return runtime.safeCall(function () {
              return help(contents, stack);
            }, function(helpContents) {
              var hue = palette(id);
              var color = hue;
              var anchor = $("<a>").append(helpContents).addClass("highlight");
              var positions = ffi.toArray(locs).
                filter(isSrcloc).
                map(function(loc){
                  return Position.fromPyretSrcloc(runtime, srcloc, loc, documents);
                });
              if (id < 0) {
                messageHintedColors.add(color);
              }
              if(!messageAnchors.has(color))
                messageAnchors.set(color, [anchor]);
              else messageAnchors.get(color).push(anchor);
              if(!messagePositions.has(color))
                messagePositions.set(color, positions);
              else Array.prototype.push.apply(messagePositions.get(color),
                                              positions);
              anchor.on("click", function (e) {
                logger.log("highlight_anchor_click",
                  { error_id: context, anchor_id: id });
                e.stopPropagation();
                window.requestAnimationFrame(function() {
                  if (positions[0] !== undefined)
                    positions[0].goto();
                });
              });
              anchor.on("mouseenter", function () {
                logger.log("highlight_anchor_mouseenter",
                  { error_id: context, anchor_id: id });
                window.requestAnimationFrame(function() {
                  logger.log("highlight_anchor_hover",
                    { error_id: context, anchor_id: id });
                  if (positions[0] !== undefined)
                    positions[0].hint();
                  emphasize(color);
                });
              });
              anchor.on("mouseleave", function () {
                logger.log("highlight_anchor_mouseleave",
                  { error_id: context, anchor_id: id });
                window.requestAnimationFrame(function() {
                  unhintLoc();
                  demphasize(color);
                });
              });
              return anchor;
            }, "highlight: help(contents)");
          },
          "loc-display": function(loc, style, contents) {
            return runtime.safeCall(function () {
              if (runtime.hasField(loc, "source")
                  && documents.has(runtime.getField(loc, "source"))) {
                return help(runtime.getField(ED, "highlight").app(
                              contents,
                              runtime.ffi.makeList([loc]),
                              runtime.makeNumber(Math.floor(Math.random() * -1000 - 1))));
              } else {
                  return help(contents).
                          append(" at (").
                          append(drawSrcloc(documents, runtime, loc)).
                          append(")");
              }
            }, function(result) {
              return result;
            }, "loc-display: help(contents)");
          }
        });
      }

      return runtime.safeCall(function() {
        return help(errorDisp, stack);
      }, function(rendering) {
        if (rendering.length > 0) {
          rendering = $("<div>").append(rendering);
        }

        messagePositions.forEach(function(positions, color) {
          var snippetPositions = [];
          positions.forEach(function (position) {
            Array.prototype.push.apply(snippetPositions,
              (snippets.get(position.source) || []).
                map(function (doc) {
                  return new Position(doc, position.source, position.from, position.to);
                }));
          });
          Array.prototype.push.apply(positions, snippetPositions);
          allHighlightPositions.set(color, positions);
        });

        messageAnchors.forEach(function(anchors, color) {
          allHighlightAnchors.set(color, anchors);
        });

        rendering.bind('toggleHighlight',function() {
            logger.log("error_highlights_toggled",
              { error_id: context });
            colorsHighlighted.forEach(function(color) {
              unhighlight(color);
            });
            colorsEmphasized.forEach(function(color) {
              demphasize(color);
            });
            messageAnchors.forEach(function (_, color) {
              if (!messageHintedColors.has(color))
                highlight(color);
            });
        });

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
      function renderText(txt) {
        var echo = $("<span>").addClass("replTextOutput");
        echo.text(txt);
        // setTimeout(function() {
        //   CodeMirror.runMode(echo.text(), "pyret", echo[0]);
        //   echo.addClass("cm-s-default");
        // }, 0);
        return echo;
      };
      function sooper(renderers, valType, val) {
        return renderers.__proto__[valType](val);
      }
      function collapsedComma() {
        return $("<span>").text(", ").addClass("collapsed").css("white-space", "pre");
      }
      var renderers = runtime.ReprMethods["$cpo"];
      renderers["opaque"] = function renderPOpaque(val) {
        if (image.isImage(val.val)) {
          return renderers.renderImage(val.val);
        } else {
          return renderText(sooper(renderers, "opaque", val));
        }
      };
      renderers["cyclic"] = function renderCyclic(val) {
        return renderText(sooper(renderers, "cyclic", val));
      };
      renderers["render-color"] = function renderColor(top) {
        var val = top.extra;
        var container = $("<span>").addClass("replToggle replOutput replCycle");
        var renderings = [];

        var brush = $("<img>").addClass("paintBrush").attr("src", "/img/brush.svg");
        var raw_r = runtime.unwrap(runtime.getField(val, "red"));
        var raw_g = runtime.unwrap(runtime.getField(val, "green"));
        var raw_b = runtime.unwrap(runtime.getField(val, "blue"));
        var raw_a = runtime.unwrap(runtime.getField(val, "alpha"));
        var raw_rgba =
            runtime.num_tostring(raw_r) + ", " +
            runtime.num_tostring(raw_g) + ", " +
            runtime.num_tostring(raw_b) + ", " +
            runtime.num_tostring(raw_a);
        var colorName = image.colorDb.colorName(raw_rgba);
        var r = jsnums.toFixnum(raw_r); r = (r < 0 ? 0 : (r > 255 ? 255 : r));
        var g = jsnums.toFixnum(raw_g); g = (g < 0 ? 0 : (g > 255 ? 255 : g));
        var b = jsnums.toFixnum(raw_b); b = (b < 0 ? 0 : (b > 255 ? 255 : b));
        var a = jsnums.toFixnum(raw_a); a = (a < 0 ? 0 : (a > 1.0 ? 1.0 : a));
        var rgba = r + ", " + g + ", " + b + ", " + a;
        var checkers = $("<span>").addClass("checkersBlob");
        var paintBlob = $("<span>").addClass("paintBlob")
            .css("background-color", "rgba(" + rgba + ")")
            .css("margin-right", "0.25em");
        var paint = $("<span>").addClass("paintSpan").append(checkers).append(paintBlob);
        var paintBrush = $("<span>").addClass("cycleTarget replToggle replOutput").append(brush).append(paint);
        if (colorName !== undefined) {
          paintBrush.append($("<span>").text(colorName));
        }
        renderings.push(paintBrush);


        var colorDisplay = $("<span>")
            .append("color(")
            .append(renderers.number(raw_r))
            .append(", ")
            .append(renderers.number(raw_g))
            .append(", ")
            .append(renderers.number(raw_b))
            .append(", ")
            .append(renderers.number(raw_a))
            .append(")");
        renderings.push($("<span>").addClass("cycleTarget replToggle replOutput").append(colorDisplay));


        var dl = $("<dl>");
        dl.append($("<dt>").addClass("label").text("red"))
          .append($("<dd>").append(renderers.number(raw_r)))
          .append($("<dt>").addClass("label").text("green"))
          .append($("<dd>").append(renderers.number(raw_g)))
          .append($("<dt>").addClass("label").text("blue"))
          .append($("<dd>").append(renderers.number(raw_b)))
          .append($("<dt>").addClass("label").text("alpha"))
          .append($("<dd>").append(renderers.number(raw_a)));
        renderings.push($("<span>").addClass("cycleTarget replToggle replOutput expanded")
                        .append($("<span>").text("color"))
                        .append(dl));

        $(renderings[0]).click(toggleCycle);
        for (var i = 1; i < renderings.length; i++)
          $(renderings[i]).addClass("hidden").click(toggleCycle);

        container.append(renderings);
        return container;
      };
      function toggleCycle(e) {
        var cur = $(this);
        var next = cur.next();
        if (next.length === 0) { next = cur.parent(".replCycle").find(".cycleTarget").first(); }
        cur.addClass("hidden");
        next.removeClass("hidden");
        e.stopPropagation();
      }
      renderers.renderImage = function renderImage(img) {
        var container = $("<span>").addClass('replOutput');
        var imageDom;
        var maxWidth = $(document).width() * .375;
        var maxHeight = $(document).height() * .6;
        var realWidth = img.getWidth();
        var realHeight = img.getHeight();
        if(realWidth > maxWidth || realHeight > maxHeight) {
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
            // NOTE(Oak): some magic numbers that "display" nicely
            dialog.dialog({
              title: 'Image',
              modal: true,
              height: Math.min($(document).height() * .95, realHeight + (9 * 2) + 60),
              width: Math.min($(document).width() * .95, realWidth + (18 * 2)),
              resizable: true,
              close: function() {
                dialog.empty();
                dialog.dialog("destroy");
                dialog.remove();
              }
            });
            dialog.css({"overflow": "auto"});
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
          var decimal = jsnums.toRepeatingDecimal(num.numerator(), num.denominator(), runtime.NumberErrbacks);
          var decimalString = decimal[0].toString() + "." + decimal[1].toString();

          var outText = $("<span>").addClass("replToggle replTextOutput rationalNumber fraction")
            .text(num.toString());

          outText.toggleFrac(num.toString(), decimalString, decimal[2]);

          // On click, switch the representation from a fraction to
          // decimal, and back again.
          // https://stackoverflow.com/a/10390111/7501301
          var isClick = false;
          outText.click(function() {
            if (isClick) {
              outText.toggleFrac(num.toString(), decimalString, decimal[2]);
            }
            e.stopPropagation();
          }).mousedown(function () {
            isClick = true;
          }).mousemove(function () {
            isClick = false;
          });

          return outText;
        } else {
          return renderText(sooper(renderers, "number", num));
        }
      };
      renderers["nothing"] = function(val) { return renderText("nothing"); }
      renderers["boolean"] = function(val) { return renderText(sooper(renderers, "boolean", val)); };
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
      renderers["method"] = function(val) { return renderText("<method:" + val.name + ">"); };
      renderers["function"] = function(val) { return renderText("<function:" + val.name + ">"); };
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
          if (i != 0) { contents.append(collapsedComma()); }
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
          dl.append($("<dt>").text(top.extra.keys[i] + ": "));
          var dd = $("<dd>").append(top.done[i]);
          if (i + 1 < top.extra.keys.length) { dd.append(collapsedComma()); }
          dl.append(dd);
        }
        container.append(dl);
        container.append(closeBrace);
        container.click(function(e) {
          container.toggleClass("expanded");
          e.stopPropagation();
        });
        return container;
      };
      renderers["data"] = function(val, pushTodo) {
        if (image.isColor(val)) {
          pushTodo(undefined, undefined, undefined, [], "render-color", val);
        } else {
          return renderers.__proto__["data"](val, pushTodo);
        }
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
            dl.append($("<dt>").addClass("label").text(top.extra.fields[i]).addClass("expanded"));
            var dd = $("<dd>").append(top.done[numFields - i - 1]);
            if (i + 1 < numFields) { dd.append(collapsedComma()); }
            dl.append(dd);
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
      function helper(container, val, values, wantCommaAtEnd) {
        if (runtime.ffi.isVSValue(val)) { container.append(values.pop()); }
        else if (runtime.ffi.isVSStr(val)) { container.append($("<span>").text(runtime.unwrap(runtime.getField(val, "s")))); }
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
            helper(container, items[i], values, (i + 1 < items.length));
          }
          container.append($("<span>").text(")"));
        } else if (runtime.ffi.isVSSeq(val)) {
          var items = runtime.ffi.toArray(runtime.getField(val, "items"));
          for (var i = 0; i < items.length; i++) {
            helper(container, items[i], values, (i + 1 < items.length));
          }
        } else if (runtime.ffi.isVSRow(val)) {

          var cols = runtime.getField(val, "headers")
          var rowVals = runtime.getField(val, "values")

          var table = document.createElement("table");
          table.className = "pyret-row";
          var thead = document.createElement("thead");
          var trow = document.createElement("tr");
          thead.append(trow);
          table.append(thead);

          var colElts = [];
          for(var i = 0; i < cols.length; i++) {
            var col = document.createElement("th");
            helper($(col), cols[i], values);
            colElts.push(col);
          }
          var datumElts = [];
          for(var i = 0; i < cols.length; i++) {
            var datum = document.createElement("td");
            helper($(datum), rowVals[i], values);
            datumElts.push(datum);
          }
          for(var i = 0; i < cols.length; i++) {
            trow.appendChild(colElts[i]);
            trow.appendChild(datumElts[i]);
          }

          container.append(table);

        } else if (runtime.ffi.isVSTable(val)) {
          var showText = document.createElement("a");
          $(showText).html("<i class=\"fa fa-clipboard\" aria-hidden=\"true\"></i>");
          $(showText).css({
            'margin-top': '0.3em',
            'margin-right': '0.3em'
          });
          $(showText).addClass("info-icon-top");
          var textDiv = $("<div>").css({"z-index": 15000});
          $(showText).click(function() {
            // Do this at the end, so the table is populated
            textDiv.empty();

            var textLines = tableAsText.map(function(line) {
              return line.join("\t");
            });
            var allText = textLines.join("\n");

            var textBox = $("<textarea>").addClass("auto-highlight");
            textBox.attr("editable", false);
            textBox.on("focus", function() { $(this).select(); });
            textBox.on("mouseup", function() { $(this).select(); });
            textBox.val(allText);

            textDiv.append(textBox);
            textDiv.dialog({
              title: "table data",
              modal: true,
              overlay : { opacity: 0.5, background: 'black'},
              width : "70%",
              height : "auto",
              closeOnEscape : true
            });

          });
          var tableAsText = [];
          var table = document.createElement("table");
          table.className = "pyret-table";
          $(table).append(showText);
          $(table).addClass("has-icon");
          $(table).hover(function() {
            $(showText).show();
          }, function() {
            $(showText).hide();
          });
          var cols = runtime.getField(val, "headers")
          var headers = document.createElement("thead");
          var header = document.createElement("tr");
          var headersAsText = [];
          for(var i = 0; i < cols.length; i++) {
            var col = document.createElement("th");
            helper($(col), cols[i], values);
            header.appendChild(col);
            headersAsText.push($(col).text());
          }
          tableAsText.push(headersAsText);
          headers.appendChild(header);
          table.appendChild(headers);
          var body = document.createElement("tbody");
          var rows = runtime.getField(val, "rows")
          function drawRows(start, end) {
            var realEnd = end > rows.length ? rows.length : end;
            for(var i = start; i < realEnd; i++) {
              var rowAsText = [];
              tableAsText.push(rowAsText);
              var rowv  = rows[i]
              var rowel = document.createElement("tr");
              for(var j = 0; j < cols.length; j++) {
                var cellel = document.createElement("td");
                helper($(cellel), rowv[j], values);
                rowel.appendChild(cellel);
                rowAsText.push($(cellel).text());
              }
              body.appendChild(rowel);
            }
          }
          var previewLimit = 10;
          if(rows.length <= previewLimit) {
            drawRows(0, rows.length);
          }
          else {
            var clickForMore = document.createElement("a");
            clickForMore.href = "javascript:void(0)";
            var remaining = rows.length - previewLimit;
            if (remaining == 1) {
              clickForMore.textContent = "Click to show the remaining row";
            } else {
              clickForMore.textContent = "Click to show the remaining " + remaining + " rows...";
            }
            var clickTR = document.createElement("tr");
            var clickTD = document.createElement("td");
            clickTD.colSpan = String(rows[0].length);
            clickTR.appendChild(clickTD);
            clickTD.appendChild(clickForMore);
            $(clickForMore).on("click", function() {
              body.removeChild(clickTR);
              drawRows(previewLimit, rows.length);
            });
            drawRows(0, previewLimit);
            body.appendChild(clickTR);
          }
          table.appendChild(body);
          container.append(table);

        } else {
          var items = runtime.ffi.toArray(runtime.getField(val, "items"));
          for (var i = 0; i < items.length; i++) {
            helper(container, items[i], values, (i + 1 < items.length));
          }
        }
        if (wantCommaAtEnd) { container.append(collapsedComma()); }
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
            helper(contents, items[i], values, (i + 1 < maxIdx));
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
      return runtime.pauseStack(function(restarter) {
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
      installRenderers: installRenderers,
      renderPyretValue: renderPyretValue,
      renderStackTrace: renderStackTrace,
      Position: Position,
      Snippet: Snippet,
      clearEffects: clearEffects,
      unhintLoc: unhintLoc,
      renderErrorDisplay: renderErrorDisplay,
      drawSrcloc: drawSrcloc,
      expandableMore: expandableMore,
      getLastUserLocation: getLastUserLocation,
      makeMaybeLocToAST: makeMaybeLocToAST,
      makeMaybeStackLoc: makeMaybeStackLoc,
      makeSrclocAvaliable: makeSrclocAvaliable,
      makePalette: makePalette,
      hueToRGB: hueToRGB
    });
  }
})
