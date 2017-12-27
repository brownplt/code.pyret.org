({
  requires: [
    { "import-type": "builtin", "name": "image-lib" }
  ],
  nativeRequires: [
    "pyret-base/js/js-numbers"
  ],
  provides: {
    shorthands: {
      "FillMode": { tag: "name",
                    origin: { "import-type": "uri", uri: "builtin://image-structs" },
                    name: "FillMode" },
      "FontFamily": { tag: "name",
                    origin: { "import-type": "uri", uri: "builtin://image-structs" },
                    name: "FontFamily" },
      "FontStyle": { tag: "name",
                    origin: { "import-type": "uri", uri: "builtin://image-structs" },
                    name: "FontStyle" },
      "FontWeight": { tag: "name",
                    origin: { "import-type": "uri", uri: "builtin://image-structs" },
                    name: "FontWeight" },
      "XPlace": { tag: "name",
                  origin: { "import-type": "uri", uri: "builtin://image-structs" },
                  name: "XPlace" },
      "YPlace": { tag: "name",
                  origin: { "import-type": "uri", uri: "builtin://image-structs" },
                  name: "YPlace" },
      "Color": { tag: "name",
                 origin: { "import-type": "uri", uri: "builtin://image-structs" },
                 name: "Color" },
      "OptColor": ["tyapp", { tag: "name",
                              origin: { "import-type": "uri", uri: "builtin://option" },
                              name: "Option" },
                   [{ tag: "name",
                      origin: { "import-type": "uri", uri: "builtin://image-structs" },
                      name: "Color" }]],
      "Either": { tag: "name",
                  origin: { "import-type": "uri", uri: "builtin://either" },
                  name: "Either" },
      "LoC": ["tyapp", { tag: "name",
                         origin: { "import-type": "uri", uri: "builtin://lists" },
                         name: "List" },
              [{ tag: "name",
                 origin: { "import-type": "uri", uri: "builtin://image-structs" },
                 name: "Color" }]],
      "Image": ["local", "Image"]
    },
    values: {
      "circle": ["arrow", ["Number", "FillMode", "Color"], "Image"],
      "is-angle": ["arrow", ["tany"], "Boolean"],
      "is-side-count": ["arrow", ["tany"], "Boolean"],
      "is-step-count": ["arrow", ["tany"], "Boolean"],
      "is-image": ["arrow", ["tany"], "Boolean"],
      "image-url": ["arrow", ["String"], "Image"],
      "images-equal": ["arrow", ["Image", "Image"], "Boolean"],
      "images-difference": ["arrow", ["Image", "Image"], ["tyapp", "Either", ["String", "Number"]]],
      "text": ["arrow", ["String", "Number", "Color"], "Image"],
      "text-font": ["arrow",
                    ["String", "Number", "Color", "String", "FontFamily", "FontStyle", "FontWeight", "Boolean"],
                    "Image"],
      "overlay": ["arrow", ["Image", "Image"], "Image"],
      "overlay-xy": ["arrow", ["Image", "Number", "Number", "Image"], "Image"],
      "overlay-align": ["arrow", ["XPlace", "YPlace", "Image", "Image"], "Image"],
      "overlay-onto-offset": ["arrow",
                              ["Image", "XPlace", "YPlace", "Number", "Number", "Image", "XPlace", "YPlace"],
                              "Image"],
      "underlay": ["arrow", ["Image", "Image"], "Image"],
      "underlay-xy": ["arrow", ["Image", "Number", "Number","Image"], "Image"],
      "underlay-align": ["arrow", ["XPlace", "YPlace", "Image", "Image"], "Image"],
      "beside": ["arrow", ["Image", "Image"], "Image"],
      "beside-align": ["arrow", ["YPlace", "Image", "Image"], "Image"],
      "above": ["arrow", ["Image", "Image"], "Image"],
      "above-align": ["arrow", ["XPlace", "Image", "Image"], "Image"],
      "empty-scene": ["arrow", ["Number", "Number"], "Image"],
      "put-image": ["arrow", ["Image", "Number", "Number", "Image"], "Image"],
      "translate": ["arrow", ["Image", "Number", "Number", "Image"], "Image"],
      "place-image": ["arrow", ["Image", "Number", "Number", "Image"], "Image"],
      "place-image-align": ["arrow", ["Image", "Number", "Number", "XPlace", "YPlace", "Image"], "Image"],
      "place-pinhole": ["arrow", ["Number", "Number", "Image"], "Image"],
      "center-pinhole": ["arrow", ["Image"], "Image"],
      "rotate": ["arrow", ["Number", "Image"], "Image"],
      "scale": ["arrow", ["Number", "Image"], "Image"],
      "scale-xy": ["arrow", ["Number", "Number", "Image"], "Image"],
      "flip-horizontal": ["arrow", ["Image"], "Image"],
      "flip-vertical": ["arrow", ["Image"], "Image"],
      "reflect-x": ["arrow", ["Image"], "Image"],
      "reflect-y": ["arrow", ["Image"], "Image"],
      "frame": ["arrow", ["Image"], "Image"],
      "draw-pinhole": ["arrow", ["Image"], "Image"],
      "crop": ["arrow", ["Number", "Number", "Number", "Number", "Image"], "Image"],
      "line": ["arrow", ["Number", "Number", "Color"], "Image"],
      "add-line": ["arrow", ["Image", "Number", "Number", "Number", "Number", "Color"], "Image"],
      "scene-line": ["arrow", ["Image", "Number", "Number", "Number", "Number", "Color"], "Image"],
      "square": ["arrow", ["Number", "FillMode", "Color"], "Image"],
      "rectangle": ["arrow", ["Number", "Number", "FillMode", "Color"], "Image"],
      "regular-polygon": ["arrow", ["Number", "Number", "FillMode", "Color"], "Image"],
      "ellipse": ["arrow", ["Number", "Number", "FillMode", "Color"], "Image"],
      "wedge": ["arrow", ["Number", "Number", "FillMode", "Color"], "Image"],
      "triangle": ["arrow", ["Number", "FillMode", "Color"], "Image"],
      "triangle-sas": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "triangle-sss": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "triangle-ass": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "triangle-ssa": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "triangle-aas": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "triangle-asa": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "triangle-saa": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "right-triangle": ["arrow", ["Number", "Number", "FillMode", "Color"], "Image"],
      "isosceles-triangle": ["arrow", ["Number", "Number", "FillMode", "Color"], "Image"],
      "star": ["arrow", ["Number", "FillMode", "Color"], "Image"],
      "star-sized": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "radial-star": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "star-polygon": ["arrow", ["Number", "Number", "Number", "FillMode", "Color"], "Image"],
      "rhombus": ["arrow", ["Number", "Number", "FillMode", "Color"], "Image"],
      "image-to-color-list": ["arrow", ["Image"], "LoC"],
      "color-list-to-image": ["arrow", ["LoC", "Number", "Number"], "Image"],
      "image-width": ["arrow", ["Image"], "Number"],
      "image-height": ["arrow", ["Image"], "Number"],
      "image-baseline": ["arrow", ["Image"], "Number"],
      "name-to-color": ["arrow", ["String"], "OptColor"],
      "color-named": ["arrow", ["String"], "Color"],
      "empty-image": "Image"
    },
    aliases: {
      "Image": ["local", "Image"]
    },
    datatypes: { "Image": ["data", "Image", [], [], {}] }
  },
  theModule: function(runtime, namespace, uri, image, jsnums) {
    var colorDb = image.colorDb;
    var ffi = runtime.ffi

    var isString = runtime.isString;

    var less = function(lhs, rhs) {
      return (rhs - lhs) > 0.00001;
    }

    var p = function(pred, name) {
      return function(val) { runtime.makeCheckType(pred, name)(val); return val; }
    }

    var ann = function(name, pred) {
      return runtime.makePrimitiveAnn(name, pred);
    };

    var annString = runtime.String;
    var annNumber = runtime.Number;
    var annPositive = runtime.NumPositive;
    var annNumNonNegative = runtime.NumNonNegative;

    var checkString = p(runtime.isString, "String");

    var annByte = ann("Number between 0 and 255", function(val) {
      return runtime.isNumber(val)
        && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks)
        && jsnums.greaterThanOrEqual(255, val, runtime.NumberErrbacks);
    });
    var annReal = ann("Real Number", function(val) {
      return runtime.isNumber(val) && jsnums.isReal(val);
    });

    var annNatural = ann("Natural Number", function(val) {
      return runtime.isNumber(val) && jsnums.isInteger(val)
        && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks);
    });

    var annPositiveInteger = ann("Positive Integer", function(val) {
      return runtime.isNumber(val) && jsnums.isInteger(val)
        && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks);
    });


    var identity = function(x) { return x; };
    var pyAlwaysTrue = runtime.makeFunction(function(_) { return true; }, "No-op");
    var unwrapColor = identity;
    var annColor = image.annColor;
    
    var annMode = image.annFillMode;
    var unwrapMode = function(m) {
      return runtime.ffi.cases(pyAlwaysTrue, "FillMode", m, {
        "mode-solid":   function(_) { return "solid"; },
        "mode-outline": function(_) { return "outline"; },
        "mode-fade":    function(v) { return jsnums.toFixnum(v); },
      });
    }

    var annFontFamily = image.annFontFamily;
    var unwrapFontFamily = function(ff) {
      return runtime.ffi.cases(pyAlwaysTrue, "FontFamily", ff, {
        "ff-default":    function(_) { return "default"; },
        "ff-decorative": function(_) { return "decorative"; },
        "ff-roman":      function(_) { return "roman"; },
        "ff-script":     function(_) { return "script"; },
        "ff-swiss":      function(_) { return "swiss"; },
        "ff-modern":     function(_) { return "modern"; },
        "ff-symbol":     function(_) { return "symbol"; },
        "ff-system":     function(_) { return "system"; },
      });
    };
    var annFontStyle = image.annFontStyle;
    var unwrapFontStyle = function(fs) {
      return runtime.ffi.cases(pyAlwaysTrue, "FontStyle", fs, {
        "fs-normal": function(_) { return "normal"; },
        "fs-italic": function(_) { return "italic"; },
        "fs-slant":  function(_) { return "slant"; },
      });
    };
  
    var annFontWeight = image.annFontWeight;
    var unwrapFontWeight = function(fw){
      return runtime.ffi.cases(pyAlwaysTrue, "FontWeight", fw, {
        "fw-normal": function(_) { return "normal"; },
        "fw-bold": function(_) { return "bold"; },
        "fw-light": function(_) { return "light"; },
      });
    };

    var annPlaceX = image.annXPlace;
    var unwrapPlaceX = function(px) {
      return runtime.ffi.cases(pyAlwaysTrue, "XPlace", px, {
        "x-left": function(_) { return "left"; },
        "x-middle": function(_) { return "middle"; },
        "x-pinhole": function(_) { return "pinhole"; },
        "x-right": function(_) { return "right"; }
      });
    }
    var annPlaceY = image.annYPlace;
    var unwrapPlaceY = function(py) {
      return runtime.ffi.cases(pyAlwaysTrue, "YPlace", py, {
        "y-top": function(_) { return "top"; },
        "y-center": function(_) { return "center"; },
        "y-pinhole": function(_) { return "pinhole"; },
        "y-baseline": function(_) { return "baseline"; },
        "y-bottom": function(_) { return "bottom"; }
      });
    }

    var checkImagePred = function(val) {
      return runtime.isOpaque(val) && image.isImage(val.val);
    };
    var annImage = ann("Image", checkImagePred);
    var unwrapImage = function(val) {
      return val.val;
    }
    var checkImageOrScenePred = function(val) {
      return runtime.isOpaque(val) && (image.isImage(val.val) || image.isScene(val.val));
    };
    var annImageOrScene = ann("Image", checkImageOrScenePred);
    var unwrapImageOrScene = function(val) {
      return val.val;
    }

    var checkScenePred = function(val) {
      return runtime.isOpaque(val) && image.isScene(val.val);
    };

    var annAngle = ann("Angle (a number 'x' where 0 <= x < 360)", image.isAngle);
    var checkAngle = p(image.isAngle, "Angle");

    var canonicalizeAngle = function(angle) {
      angle = jsnums.remainder(angle, 360, runtime.NumberErrbacks);
      if (jsnums.lessThan(angle, 0, runtime.NumberErrbacks)) {
        angle = jsnums.add(angle, 360, runtime.NumberErrbacks);
      }
      return angle;
    };

    var annListColor = ann("List<Color>", function(val) {
      if (!runtime.ffi.isList(val)) return false;
      var cur = val;
      var gf = runtime.getField;
      while (runtime.unwrap(ffi.isLink(cur))) {
        var f = gf(cur, "first");
        if (!image.isColor(f)) return false;
        cur = gf(cur, "rest");
      }
      return true;
    });
    var unwrapListofColor = identity;


    var annSideCount = ann("Side Count", image.isSideCount);

    var annStepCount = ann("Step Count", image.isStepCount);

    var annPointCount = ann("Points Count", image.isPointsCount);

    var checkArity = ffi.checkArity;

    var throwMessage = ffi.throwMessageException;

    function makeImage(i) {
      return runtime.makeOpaque(i, image.imageEquals);
    }

    // Useful trigonometric functions based on htdp teachpack

    // excess : compute the Euclidean excess
    //  Note: If the excess is 0, then C is 90 deg.
    //        If the excess is negative, then C is obtuse.
    //        If the excess is positive, then C is acuse.
    function excess(sideA, sideB, sideC) {
      return sideA*sideA + sideB*sideB - sideC*sideC;
    }

    // return c^2 = a^2 + b^2 - 2ab cos(C)
    function cosRel(sideA, sideB, angleC) {
      return (sideA*sideA) + (sideB*sideB) - (2*sideA*sideB*Math.cos(angleC * Math.PI/180));
    }

    var c = function(name, ...argsAndAnns) {
      runtime.checkArgsInternalInline("image", name, ...argsAndAnns);
    };
    var c1 = function(name, arg, ann) {
      runtime.checkArgsInternal1("image", name, arg, ann);
    };
    var c2 = function(name, arg1, ann1, arg2, ann2) {
      runtime.checkArgsInternal2("image", name, arg1, ann1, arg2, ann2);
    };
    var c3 = function(name, arg1, ann1, arg2, ann2, arg3, ann3) {
      runtime.checkArgsInternal3("image", name, arg1, ann1, arg2, ann2, arg3, ann3);
    };
    //////////////////////////////////////////////////////////////////////
    var values = {};
    function f(name, fun) {
      values[name] = runtime.makeFunction(fun, name);
    }
    f("circle", function(radius, maybeMode, maybeColor) {
      checkArity(3, arguments, "image", false);
      c3("circle", radius, annNumNonNegative, maybeMode, annMode, maybeColor, annColor);
      var color = unwrapColor(maybeColor);
      var mode = unwrapMode(maybeMode)
      return makeImage(image.makeCircleImage(jsnums.toFixnum(radius), mode, color));
    });
    f("is-angle", function(maybeAngle) {
      checkArity(1, arguments, "is-angle", false);
      return runtime.wrap(image.isAngle(maybeAngle));
    });
    f("is-side-count", function(maybeSideCount) {
      checkArity(1, arguments, "is-side-count", false);
      return runtime.wrap(image.isSideCount(maybeSideCount));
    });
    f("is-step-count", function(maybeStepCount) {
      checkArity(1, arguments, "is-step-count", false);
      return runtime.wrap(image.isStepCount(maybeStepCount));
    });
    f("is-image", function(maybeImage) {
      checkArity(1, arguments, "is-image", false);
      runtime.confirm(maybeImage, runtime.isOpaque);
      return runtime.wrap(image.isImage(maybeImage.val));
    });
    f("image-url", function(maybeUrl) {
      checkArity(1, arguments, "image", false);
      c1("image-url", maybeUrl, annString);
      var url = maybeUrl;
      return runtime.pauseStack(function(restarter) {
        var rawImage = new Image();
        if(runtime.hasParam("imgUrlProxy")) {
          url = runtime.getParam("imgUrlProxy")(url);
        }
        rawImage.onload = function() {
          restarter.resume(makeImage(image.makeFileImage(String(url), rawImage)));
        };
        rawImage.onerror = function(e) {
          restarter.error(runtime.ffi.makeMessageException("unable to load " + url + ": " + e.message));
        };
        rawImage.src = String(url);
      });
    });
    f("images-difference", function(maybeImage1, maybeImage2) {
      checkArity(2, arguments, "image", false);
      c2("images-difference", maybeImage1, annImage, maybeImage2, annImage);
      var img1 = unwrapImage(maybeImage1);
      var img2 = unwrapImage(maybeImage2);
      return runtime.wrap(image.imageDifference(img1, img2));
    });
    f("images-equal", function(maybeImage1, maybeImage2) {
      checkArity(2, arguments, "image", false);
      c2("images-equal", maybeImage1, annImage, maybeImage2, annImage);
      var img1 = unwrapImage(maybeImage1);
      var img2 = unwrapImage(maybeImage2);
      return runtime.wrap(image.imageEquals(img1, img2));
    });
    f("text", function(maybeString, maybeSize, maybeColor) {
      checkArity(3, arguments, "image", false);
      c3("text", maybeString, runtime.String, maybeSize, annByte, maybeColor, annColor);
      var string = checkString(maybeString);
      var size = jsnums.toFixnum(maybeSize);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeTextImage(String(string), size, color,
                            "normal", "Optimer", "", "", false));
    });
    f("text-font", function(maybeString, maybeSize, maybeColor, maybeFace,
                            maybeFamily, maybeStyle, maybeWeight, maybeUnderline) {
      checkArity(8, arguments, "image", false);
      c("text-font", 
        maybeString, runtime.String,
        maybeSize, annByte,
        maybeColor, annColor,
        maybeFace, runtime.String,
        maybeFamily, annFontFamily,
        maybeStyle, annFontStyle,
        maybeWeight, annFontWeight,
        maybeUnderline, runtime.Boolean);
      var string = maybeString;
      var size = jsnums.toFixnum(maybeSize);
      var color = unwrapColor(maybeColor);
      var face = maybeFace;
      var family = unwrapFontFamily(maybeFamily);
      var style = unwrapFontStyle(maybeStyle);
      var weight = unwrapFontWeight(maybeWeight);
      var underline = maybeUnderline;
      return makeImage(image.makeTextImage(string, size, color, face, family, style, weight, underline));
    }),

    f("overlay", function(maybeImg1, maybeImg2) {
      checkArity(2, arguments, "overlay", false);
      c2("overlay", maybeImg1, annImage, maybeImg2, annImage);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, "pinhole", "pinhole", 0, 0, img2, "pinhole", "pinhole"));
    });

    f("overlay-xy", function(maybeImg1, maybeDx, maybeDy, maybeImg2) {
      checkArity(4, arguments, "overlay-xy", false);
      c("overlay-xy",
        maybeImg1, annImage,
        maybeDx, annReal,
        maybeDy, annReal,
        maybeImg2, annImage);
      var img1 = unwrapImage(maybeImg1);
      var dx = jsnums.toFixnum(maybeDx);
      var dy = jsnums.toFixnum(maybeDy);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(
        image.makeOverlayImage(img1, "left", "top", dx, dy, img2, "left", "top"));
    });

    f("overlay-align", function(maybePlaceX, maybePlaceY, maybeImg1, maybeImg2) {
      checkArity(4, arguments, "overlay-align", false);
      c("overlay-align",
        maybePlaceX, annPlaceX,
        maybePlaceY, annPlaceY,
        maybeImg1, annImage,
        maybeImg2, annImage);
      var placeX = unwrapPlaceX(maybePlaceX);
      var placeY = unwrapPlaceY(maybePlaceY);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, placeX, placeY, 0, 0, img2, placeX, placeY));
    });

    f("overlay-onto-offset", function(maybeImg1, maybePlaceX1, maybePlaceY1,
                                      maybeOffsetX, maybeOffsetY,
                                      maybeImg2, maybePlaceX2, maybePlaceY2) {
      checkArity(8, arguments, "overlay-onto-offset", false);
      c("overlay-onto-offset",
        maybeImg1, annImage,
        maybePlaceX1, annPlaceX,
        maybePlaceY1, annPlaceY,
        maybeOffsetX, runtime.Number,
        maybeOffsetY, runtime.Number,
        maybeImg2, annImage,
        maybePlaceX2, annPlaceX,
        maybePlaceY2, annPlaceY);
      var placeX1 = unwrapPlaceX(maybePlaceX1);
      var placeY1 = unwrapPlaceY(maybePlaceY1);
      var placeX2 = unwrapPlaceX(maybePlaceX2);
      var placeY2 = unwrapPlaceY(maybePlaceY2);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      var offsetX = jsnums.toFixnum(checkReal(maybeOffsetX));
      var offsetY = jsnums.toFixnum(checkReal(maybeOffsetY));
      return makeImage(image.makeOverlayImage(img1, placeX1, placeY1, offsetX, offsetY, img2, placeX2, placeY2));
    });

    f("underlay", function(maybeImg1, maybeImg2) {
      checkArity(2, arguments, "underlay", false);
      c2("underlay", maybeImg1, annImage, maybeImg2, annImage);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img2, "pinhole", "pinhole", 0, 0, img1, "pinhole", "pinhole"));
    });

    f("underlay-xy", function(maybeImg1, maybeDx, maybeDy, maybeImg2) {
      checkArity(4, arguments, "underlay-xy", false);
      c("underlay-xy",
        maybeImg1, annImage,
        maybeDx, annReal,
        maybeDy, annReal,
        maybeImg2, annImage);
      var img1 = unwrapImage(maybeImg1);
      var dx = jsnums.toFixnum(maybeDx);
      var dy = jsnums.toFixnum(maybeDy);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(
        image.makeOverlayImage(img2, "left", "top", -dx, -dy, img1, "left", "top"));
    });

    f("underlay-align", function(maybePlaceX, maybePlaceY, maybeImg1, maybeImg2) {
      checkArity(4, arguments, "underlay-align", false);
      c("underlay-align",
        maybePlaceX, annPlaceX,
        maybePlaceY, annPlaceY,
        maybeImg1, annImage,
        maybeImg2, annImage);
      var placeX = unwrapPlaceX(maybePlaceX);
      var placeY = unwrapPlaceY(maybePlaceY);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img2, placeX, placeY, 0, 0, img1, placeX, placeY));
    });

    f("beside", function(maybeImg1, maybeImg2) {
      checkArity(2, arguments, "beside", false);
      c2("beside", maybeImg1, annImage, maybeImg2, annImage);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, "right", "center", 0, 0, img2, "left", "center"));
    });

    f("beside-align", function(maybePlaceY, maybeImg1, maybeImg2) {
      checkArity(3, arguments, "beside-align", false);
      c3("beside-align", maybePlaceY, annPlaceY, maybeImg1, annImage, maybeImg2, annImage);
      var placeY = unwrapPlaceY(maybePlaceY);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, "right", placeY, 0, 0, img2, "left", placeY));
    });

    f("above", function(maybeImg1, maybeImg2) {
      checkArity(2, arguments, "above", false);
      c2("beside", maybeImg1, annImage, maybeImg2, annImage);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, "middle", "bottom", 0, 0, img2, "middle", "top"));
    });

    f("above-align", function(maybePlaceX, maybeImg1, maybeImg2) {
      checkArity(3, arguments, "above-align", false);
      c3("above-align", maybePlaceX, annPlaceX, maybeImg1, annImage, maybeImg2, annImage);
      var placeX = unwrapPlaceX(maybePlaceX);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, placeX, "bottom", 0, 0, img2, placeX, "top"));
    });

    f("empty-scene", function(maybeWidth, maybeHeight) {
      checkArity(2, arguments, "empty-scene", false);
      c2("empty-scene", maybeWidth, annNumNonNegative, maybeHeight, annNumNonNegative);
      var width = jsnums.toFixnum(maybeWidth);
      var height = jsnums.toFixnum(maybeHeight);
      return makeImage(
        image.makeSceneImage(width, height, [], true));
    });
    f("put-image", function(maybePicture, maybeX, maybeY, maybeBackground) {
      checkArity(4, arguments, "put-image", false);
      c("put-image",
        maybePicture, annImage,
        maybeX, annReal,
        maybeY, annReal,
        maybeBackground, annImageOrScene);
      var picture = unwrapImage(maybePicture);
      var x = jsnums.toFixnum(maybeX);
      var y = jsnums.toFixnum(maybeY);
      var background = unwrapImageOrScene(maybeBackground);
      if (image.isScene(background)) {
        return makeImage(background.add(picture, x, background.getHeight() - y));
      } else {
        var newScene = image.makeSceneImage(background.getWidth(), background.getHeight(), [], false);
        newScene = newScene.add(background, background.getWidth()/2, background.getHeight()/2);
        newScene = newScene.add(picture, x, background.getHeight() - y);
        return makeImage(newScene);
      }
    });
    f("place-image", function(maybePicture, maybeX, maybeY, maybeBackground) {
      checkArity(4, arguments, "place-image", false);
      c("place-image",
        maybePicture, annImage,
        maybeX, annReal,
        maybeY, annReal,
        maybeBackground, annImageOrScene);
      var picture = unwrapImage(maybePicture);
      var x = jsnums.toFixnum(maybeX);
      var y = jsnums.toFixnum(maybeY);
      var background = unwrapImageOrScene(maybeBackground);
      if (image.isScene(background)) {
        return makeImage(background.add(picture, x, y));
      } else {
        var newScene = image.makeSceneImage(background.getWidth(), background.getHeight(), [], false);
        newScene = newScene.add(background, background.getWidth()/2, background.getHeight()/2);
        newScene = newScene.add(picture, x, y);
        return makeImage(newScene);
      }
    });
    f("translate", values["place-image"].app);
    f("place-pinhole", function(maybeX, maybeY, maybeImg) {
      checkArity(3, arguments, "place-pinhole", false);
      c3("place-pinhole",
         maybeX, annReal,
         maybeY, annReal,
         maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      var x = jsnums.toFixnum(maybeX);
      var y = jsnums.toFixnum(maybeY);
      return makeImage(img.updatePinhole(x, y));
    });
    f("center-pinhole", function(maybeImg) {
      checkArity(1, arguments, "place-pinhole", false);
      c1("place-pinhole", maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      return makeImage(img.updatePinhole(img.getWidth() / 2, img.getHeight() / 2));
    });
    
    f("place-image-align", function(maybeImg, maybeX, maybeY, maybePlaceX, maybePlaceY, maybeBackground) {
      checkArity(6, arguments, "place-image-align", false);
      c("place-image-align",
        maybeImg, annImage,
        maybeX, annReal,
        maybeY, annReal,
        maybePlaceX, annPlaceX,
        maybePlaceY, annPlaceY,
        maybeBackground, annImageOrScene);
      var img = unwrapImage(maybeImg);
      var x = jsnums.toFixnum(maybeX);
      var y = jsnums.toFixnum(maybeY);
      var placeX = unwrapPlaceX(maybePlaceX);
      var placeY = unwrapPlaceY(maybePlaceY);
      var background = unwrapImageOrScene(maybeBackground);
      if      (placeX == "left"  ) { x = x + img.getWidth()/2; }
      else if (placeX == "right" ) { x = x - img.getWidth()/2; }
      if      (placeY == "top"   ) { y = y + img.getHeight()/2; }
      else if (placeY == "bottom") { y = y - img.getHeight()/2; }

      if (image.isScene(background)) {
        return makeImage(background.add(img, x, y));
      } else {
        var newScene = image.makeSceneImage(background.getWidth(),
                                            background.getHeight(),
                                            [],
                                            false);
        newScene = newScene.add(background, background.getWidth()/2, background.getHeight()/2);
        newScene = newScene.add(img, x, y);
        return makeImage(newScene);
      }
    });

    f("rotate", function(maybeAngle, maybeImg) {
      checkArity(2, arguments, "rotate", false);
      c2("rotate", maybeAngle, annReal, maybeImg, annImage);
      var angle = jsnums.toFixnum(canonicalizeAngle(maybeAngle));
      var img = unwrapImage(maybeImg);
      return makeImage(image.makeRotateImage(-angle, img));
    });

    f("scale", function(maybeFactor, maybeImg) {
      checkArity(2, arguments, "scale", false);
      c2("scale", maybeFactor, annReal, maybeImg, annImage);
      var factor = jsnums.toFixnum(maybeFactor);
      var img = unwrapImage(maybeImg);
      return makeImage(image.makeScaleImage(factor, factor, img));
    });

    f("scale-xy", function(maybeXFactor, maybeYFactor, maybeImg) {
      checkArity(3, arguments, "scale-xy", false);
      c3("scale-xy", maybeXFactor, annReal, maybeYFactor, annReal, maybeImg, annImage);
      var xFactor = jsnums.toFixnum(maybeXFactor);
      var yFactor = jsnums.toFixnum(maybeYFactor);
      var img = unwrapImage(maybeImg);
      return makeImage(image.makeScaleImage(xFactor, yFactor, img));
    });

    f("flip-horizontal", function(maybeImg) {
      checkArity(1, arguments, "flip-horizontal", false);
      c1("flip-horizontal", maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      return makeImage(image.makeFlipImage(img, "horizontal"));
    });

    f("flip-vertical", function(maybeImg) {
      checkArity(1, arguments, "flip-vertical", false);
      c1("flip-vertical", maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      return makeImage(image.makeFlipImage(img, "vertical"));
    });
    // aliases
    f("reflect-y", values["flip-horizontal"].app);
    f("reflect-x", values["flip-vertical"].app);

    f("frame", function(maybeImg) {
      checkArity(1, arguments, "frame", false);
      c1("frame", maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      return makeImage(image.makeFrameImage(img));
    });

    f("draw-pinhole", function(maybeImg) {
      checkArity(1, arguments, "draw-pinhole", false);
      c1("draw-pinhole", maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      return makeImage(image.makePinholeImage(img));
    });

    f("crop", function(maybeX, maybeY, maybeWidth, maybeHeight, maybeImg) {
      checkArity(5, arguments, "crop", false);
      c("crop",
        maybeX, annReal,
        maybeY, annReal,
        maybeWidth, annNumNonNegative,
        maybeHeight, annNumNonNegative,
        maybeImg, annImage);
      var x = jsnums.toFixnum(maybeX);
      var y = jsnums.toFixnum(maybeY);
      var width = jsnums.toFixnum(maybeWidth);
      var height = jsnums.toFixnum(maybeHeight);
      var img = unwrapImage(maybeImg);
      return makeImage(image.makeCropImage(x, y, width, height, img));
    });

    f("line", function(maybeX, maybeY, maybeC) {
      checkArity(3, arguments, "line", false);
      c3("line", maybeX, annReal, maybeY, annReal, maybeC, annColor);
      var x = jsnums.toFixnum(maybeX);
      var y = jsnums.toFixnum(maybeY);
      var color = unwrapColor(maybeC);
      return makeImage(
        image.makeLineImage(x, y, color));
    });

    f("add-line", function(maybeImg, maybeX1, maybeY1, maybeX2, maybeY2, maybeC) {
      checkArity(6, arguments, "add-line", false);
      c("add-line",
        maybeImg, annImage,
        maybeX1, annReal,
        maybeY1, annReal,
        maybeX2, annReal,
        maybeY2, annReal,
        maybeC, annColor);
      var x1 = jsnums.toFixnum(maybeX1);
      var y1 = jsnums.toFixnum(maybeY1);
      var x2 = jsnums.toFixnum(maybeX2);
      var y2 = jsnums.toFixnum(maybeY2);
      var color = unwrapColor(maybeC);
      var img   = unwrapImage(maybeImg);
      var line  = image.makeLineImage(x2 - x1, y2 - y1, color);
      var leftmost = Math.min(x1, x2);
      var topmost  = Math.min(y1, y2);
      return makeImage(image.makeOverlayImage(line, "middle", "center", -leftmost, -topmost, img, "middle", "center"));
    });

    f("scene-line", function(maybeImg, maybeX1, maybeY1, maybeX2, maybeY2, maybeC) {
      checkArity(6, arguments, "scene-line", false);
      c("scene-line",
        maybeImg, annImage,
        maybeX1, annReal,
        maybeY1, annReal,
        maybeX2, annReal,
        maybeY2, annReal,
        maybeC, annColor);
      var x1 = jsnums.toFixnum(maybeX1);
      var y1 = jsnums.toFixnum(maybeY1);
      var x2 = jsnums.toFixnum(maybeX2);
      var y2 = jsnums.toFixnum(maybeY2);
      var color = unwrapColor(maybeC);
      var img = unwrapImage(maybeImg);
      var line = image.makeLineImage(x2 - x1, y2 - y1, color);

      var newScene = image.makeSceneImage(img.getWidth(),
                                          img.getHeight(),
                                          [],
                                          true);
      newScene = newScene.add(img, img.getWidth()/2, img.getHeight()/2);
      var leftMost = Math.min(x1,x2);
      var topMost = Math.min(y1,y2);
      return makeImage(newScene.add(line, line.getWidth()/2+leftMost, line.getHeight()/2+topMost));
    });

    f("square", function(maybeSide, maybeMode, maybeColor) {
      checkArity(3, arguments, "square", false);
      c3("square", maybeSide, annNumNonNegative, maybeMode, annMode, maybeColor, annColor);
      var side = jsnums.toFixnum(maybeSide);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(image.makeSquareImage(side, mode, color));
    });

    f("rectangle", function(maybeWidth, maybeHeight, maybeMode, maybeColor) {
      checkArity(4, arguments, "rectangle", false);
      c("square",
        maybeWidth, annNumNonNegative,
        maybeHeight, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var width = jsnums.toFixnum(maybeWidth);
      var height = jsnums.toFixnum(maybeHeight);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeRectangleImage(width, height, mode, color));
    });

    f("regular-polygon", function(maybeLength, maybeCount, maybeMode, maybeColor) {
      checkArity(4, arguments, "regular-polygon", false);
      c("regular-polygon",
        maybeLength, annNumNonNegative,
        maybeCount, annSideCount,
        maybeMode, annMode,
        maybeColor, annColor);
      var length = jsnums.toFixnum(maybeLength);
      var count = jsnums.toFixnum(maybeCount);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makePolygonImage(length, count, 1, mode, color));
    });

    f("ellipse", function(maybeWidth, maybeHeight, maybeMode, maybeColor) {
      checkArity(4, arguments, "ellipse", false);
      c("ellipse",
        maybeWidth, annNumNonNegative,
        maybeHeight, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var width = jsnums.toFixnum(maybeWidth);
      var height = jsnums.toFixnum(maybeHeight);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeEllipseImage(width, height, mode, color));
    });

    f("wedge", function(maybeRadius, maybeAngle, maybeMode, maybeColor) {
      checkArity(4, arguments, "wedge", false);
      c("wedge",
        maybeRadius, annNumNonNegative,
        maybeAngle, annAngle,
        maybeMode, annMode,
        maybeColor, annColor);
      var radius = jsnums.toFixnum(maybeRadius);
      var angle = jsnums.toFixnum(maybeAngle);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeWedgeImage(radius, angle, mode, color));
    });

    f("triangle", function(maybeSide, maybeMode, maybeColor) {
      checkArity(3, arguments, "triangle", false);
      c3("triangle", maybeSide, annNumNonNegative, maybeMode, annMode, maybeColor, annColor);
      var side = jsnums.toFixnum(maybeSide);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        // Angle makes triangle point up
        image.makeTriangleImage(side, 360-60, side, mode, color));
    });

    f("triangle-sas", function(maybeSideA, maybeAngleB, maybeSideC, maybeMode, maybeColor) {
      checkArity(5, arguments, "triangle-sas", false);
      c("triangle-sas",
        maybeSideA, annNumNonNegative,
        maybeAngleB, annAngle,
        maybeSideC, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var sideA = jsnums.toFixnum(maybeSideA);
      var angleB = jsnums.toFixnum(maybeAngleB);
      var sideC = jsnums.toFixnum(maybeSideC);

      var sideB2 = cosRel(sideA, sideC, angleB);
      var sideB  = Math.sqrt(sideB2);

      if (sideB2 <= 0) {
        throwMessage("The given side, angle and side will not form a triangle: "
                     + maybeSideA + ", " + maybeAngleB + ", " + maybeSideC);
      } else {
        if (less(sideA + sideC, sideB) ||
            less(sideB + sideC, sideA) ||
            less(sideA + sideB, sideC)) {
          throwMessage("The given side, angle and side will not form a triangle: "
                       + maybeSideA + ", " + maybeAngleB + ", " + maybeSideC);
        } else {
          if (less(sideA + sideC, sideB) ||
              less(sideB + sideC, sideA) ||
              less(sideA + sideB, sideC)) {
            throwMessage("The given side, angle and side will not form a triangle: "
                         + maybeSideA + ", " + maybeAngleB + ", " + maybeSideC);
          }
        }
      }

      var angleA = Math.acos(excess(sideB, sideC, sideA) / (2 * sideB * sideC)) * (180 / Math.PI);

      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeTriangleImage(sideC, angleA, sideB, mode, color));
    });

    f("triangle-sss", function(maybeSideA, maybeSideB, maybeSideC, maybeMode, maybeColor) {
      checkArity(5, arguments, "triangle-sss", false);
      c("triangle-sss",
        maybeSideA, annNumNonNegative,
        maybeSideB, annNumNonNegative,
        maybeSideC, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var sideA = jsnums.toFixnum(maybeSideA);
      var sideB = jsnums.toFixnum(maybeSideB);
      var sideC = jsnums.toFixnum(maybeSideC);
      if (less(sideA + sideB, sideC) ||
          less(sideC + sideB, sideA) ||
          less(sideA + sideC, sideB)) {
        throwMessage("The given sides will not form a triangle: "
                     + maybeSideA + ", " + maybeSideB + ", " + maybeSideC);
      }

      var angleA = Math.acos(excess(sideB, sideC, sideA) / (2 * sideB * sideC)) * (180 / Math.PI);

      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeTriangleImage(sideC, angleA, sideB, mode, color));
    });

    f("triangle-ass", function(maybeAngleA, maybeSideB, maybeSideC, maybeMode, maybeColor) {
      checkArity(5, arguments, "triangle-ass", false);
      c("triangle-ass",
        maybeAngleA, annAngle,
        maybeSideB, annNumNonNegative,
        maybeSideC, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var angleA = jsnums.toFixnum(maybeAngleA);
      var sideB = jsnums.toFixnum(maybeSideB);
      var sideC = jsnums.toFixnum(maybeSideC);
      if (less(180, angleA)) {
        throwMessage("The given angle, side and side will not form a triangle: "
                     + maybeAngleA + ", " + maybeSideB + ", " + maybeSideC);
      }
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeTriangleImage(sideC, angleA, sideB, mode, color));
    });

    f("triangle-ssa", function(maybeSideA, maybeSideB, maybeAngleC, maybeMode, maybeColor) {
      checkArity(5, arguments, "triangle-ssa", false);
      c("triangle-ssa",
        maybeSideA, annNumNonNegative,
        maybeSideB, annNumNonNegative,
        maybeAngleC, annAngle,
        maybeMode, annMode,
        maybeColor, annColor);
      var sideA  = jsnums.toFixnum(maybeSideA);
      var sideB  = jsnums.toFixnum(maybeSideB);
      var angleC = jsnums.toFixnum(maybeAngleC);
      if (less(180, angleC)) {
        throwMessage("The given side, side and angle will not form a triangle: "
                     + sideA + ", " + sideB + ", " + angleC);
      }
      var sideC2 = cosRel(sideA, sideB, angleC);
      var sideC  = Math.sqrt(sideC2);

      if (sideC2 <= 0) {
        throwMessage("The given side, side and angle will not form a triangle: "
                     + maybeSideA + ", " + maybeSideB + ", " + maybeAngleC);
      } else {
        if (less(sideA + sideB, sideC) ||
            less(sideC + sideB, sideA) ||
            less(sideA + sideC, sideB)) {
          throwMessage("The given side, side and angle will not form a triangle: "
                       + maybeSideA + ", " + maybeSideB + ", " + maybeAngleC);
        }
      }

      var angleA = Math.acos(excess(sideB, sideC, sideA) / (2 * sideB * sideC)) * (180 / Math.PI);

      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeTriangleImage(sideC, angleA, sideB, mode, color));
    });

    f("triangle-aas", function(maybeAngleA, maybeAngleB, maybeSideC, maybeMode, maybeColor) {
      checkArity(5, arguments, "triangle-aas", false);
      c("triangle-aas",
        maybeAngleA, annAngle,
        maybeAngleB, annAngle,
        maybeSideC, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var angleA = jsnums.toFixnum(maybeAngleA);
      var angleB = jsnums.toFixnum(maybeAngleB);
      var sideC = jsnums.toFixnum(maybeSideC);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      var angleC = (180 - angleA - angleB);
      if (less(angleC, 0)) {
        throwMessage("The given angle, angle and side will not form a triangle: "
                     + maybeAngleA + ", " + maybeAngleB + ", " + maybeSideC);
      }
      var hypotenuse = sideC / (Math.sin(angleC*Math.PI/180))
      var sideB = hypotenuse * Math.sin(angleB*Math.PI/180);
      return makeImage(
        image.makeTriangleImage(sideC, angleA, sideB, mode, color));
    });

    f("triangle-asa", function(maybeAngleA, maybeSideB, maybeAngleC, maybeMode, maybeColor) {
      checkArity(5, arguments, "triangle-asa", false);
      c("triangle-asa",
        maybeAngleA, annAngle,
        maybeSideB, annNumNonNegative,
        maybeAngleC, annAngle,
        maybeMode, annMode,
        maybeColor, annColor);
      var angleA = jsnums.toFixnum(maybeAngleA);
      var sideB = jsnums.toFixnum(maybeSideB);
      var angleC = jsnums.toFixnum(maybeAngleC);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      var angleB = 180 - angleA - angleC;
      if (less(angleB, 0)) {
        throwMessage("The given angle, side and angle will not form a triangle: "
                     + maybeAngleA + ", " + maybeSideB + ", " + maybeAngleC);
      }
      var base = (sideB * Math.sin(angleA*Math.PI/180)) / (Math.sin(angleB*Math.PI/180));
      var sideC = (sideB * Math.sin(angleC*Math.PI/180)) / (Math.sin(angleB*Math.PI/180));
      return makeImage(
        image.makeTriangleImage(sideC, angleA, sideB, mode, color));
    });

    f("triangle-saa", function(maybeSideA, maybeAngleB, maybeAngleC, maybeMode, maybeColor) {
      checkArity(5, arguments, "triangle-saa", false);
      c("triangle-saa",
        maybeSideA, annNumNonNegative,
        maybeAngleB, annAngle,
        maybeAngleC, annAngle,
        maybeMode, annMode,
        maybeColor, annColor);
      var sideA = jsnums.toFixnum(maybeSideA);
      var angleB = jsnums.toFixnum(maybeAngleB);
      var angleC = jsnums.toFixnum(maybeAngleC);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      var angleA = (180 - angleC - angleB);
      var hypotenuse = sideA / (Math.sin(angleA*Math.PI/180));
      var sideC = hypotenuse * Math.sin(angleC*Math.PI/180);
      var sideB = hypotenuse * Math.sin(angleB*Math.PI/180);
      return makeImage(
        image.makeTriangleImage(sideC, angleA, sideB, mode, color));
    });

    f("right-triangle", function(maybeSide1, maybeSide2, maybeMode, maybeColor) {
      checkArity(4, arguments, "right-triangle", false);
      c("right-triangle",
        maybeSide1, annNumNonNegative,
        maybeSide2, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var side1 = jsnums.toFixnum(maybeSide1);
      var side2 = jsnums.toFixnum(maybeSide2);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        // add 180 to make the triangle point up
        image.makeTriangleImage(side1, 360 - 90, side2, mode, color));
    });

    f("isosceles-triangle", function(maybeSide, maybeAngleC, maybeMode, maybeColor) {
      checkArity(4, arguments, "isosceles-triangle", false);
      c("isosceles-triangle",
        maybeSide, annNumNonNegative,
        maybeAngleC, annAngle,
        maybeMode, annMode,
        maybeColor, annColor);
      var side = jsnums.toFixnum(maybeSide);
      var angleC = jsnums.toFixnum(maybeAngleC);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      var angleAB = (180-angleC)/2;
      var base = 2*side*Math.sin((angleC*Math.PI/180)/2);
      return makeImage(
        // add 180 to make the triangle point up
        image.makeTriangleImage(base, 360 - angleAB, side, mode, color));
    });

    f("star", function(maybeSide, maybeMode, maybeColor) {
      checkArity(3, arguments, "star", false);
      c3("star", maybeSide, annNumNonNegative, maybeMode, annMode, maybeColor, annColor);
      var side = jsnums.toFixnum(maybeSide);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makePolygonImage(side, 5, 2, mode, color));
    });
    // TODO: This was split from the variable-arity case in the original whalesong "star" function
    f("star-sized", function(maybePointCount, maybeOuter, maybeInner, maybeMode, maybeColor) {
      checkArity(5, arguments, "star-sized", false);
      c("star-sized",
        maybePointCount, annPointCount,
        maybeOuter, annNumNonNegative,
        maybeInner, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var pointCount = jsnums.toFixnum(maybePointCount);
      var outer = jsnums.toFixnum(maybeOuter);
      var inner = jsnums.toFixnum(maybeInner);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeStarImage(pointCount, inner, outer, mode, color));
    });
    // alias
    f("radial-star", values["star-sized"].app);

    f("star-polygon", function(maybeLength, maybeCount, maybeStep, maybeMode, maybeColor) {
      checkArity(5, arguments, "star-polygon", false);
      c("star-polygon",
        maybeLength, annNumNonNegative,
        maybeCount, annSideCount,
        maybeStep, annStepCount,
        maybeMode, annMode,
        maybeColor, annColor);
      var length = jsnums.toFixnum(maybeLength);
      var count = jsnums.toFixnum(maybeCount);
      var step = jsnums.toFixnum(maybeStep);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makePolygonImage(length, count, step, mode, color));
    });

    f("rhombus", function(maybeLength, maybeAngle, maybeMode, maybeColor) {
      checkArity(4, arguments, "rhombus", false);
      c("rhombus",
        maybeLength, annNumNonNegative,
        maybeAngle, annAngle,
        maybeMode, annMode,
        maybeColor, annColor);
      var length = jsnums.toFixnum(maybeLength);
      var angle = jsnums.toFixnum(maybeAngle);
      var mode = unwrapMode(maybeMode);
      var color = unwrapColor(maybeColor);
      return makeImage(
        image.makeRhombusImage(length, angle, mode, color));
    });

    f("image-to-color-list", function(maybeImage) {
      checkArity(1, arguments, "image-to-color-list", false);
      c1("image-width", maybeImage, annImage);
      var img = unwrapImage(maybeImage);
      return image.imageToColorList(img);
    });

    f("color-list-to-image", function(maybeList, maybeWidth, maybeHeight) {
      checkArity(3, arguments, "color-list-to-image", false);
      c3("color-list-to-image", maybeList, annListColor, maybeWidth, annNatural, maybeHeight, annNatural);
      var len = ffi.listLength(maybeList);
      var loc = unwrapListofColor(maybeList);
      var width = jsnums.toFixnum(maybeWidth);
      var height = jsnums.toFixnum(maybeHeight);
      if (len != width * height) {
        throwMessage("The color list does not have the right number of elements: " +
                     "expected " + (width * height) + " but got " + len);
      }
      return makeImage(image.colorListToImage(loc, width, height, width / 2, height / 2));
    });

    f("image-width", function(maybeImg) {
      checkArity(1, arguments, "image-width", false);
      c1("image-width", maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      return runtime.wrap(img.getWidth());
    });

    f("image-height", function(maybeImg) {
      checkArity(1, arguments, "image-height", false);
      c1("image-height", maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      return runtime.wrap(img.getHeight());
    });

    f("image-baseline", function(maybeImg) {
      checkArity(1, arguments, "image-baseline", false);
      c1("image-baseline", maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      return runtime.wrap(img.getBaseline());
    });

    f("name-to-color", function(maybeName) {
      checkArity(1, arguments, "name-to-color", false);
      c1("name-to-color", maybeName, runtime.String);
      var name = checkString(maybeName);
      var val = colorDb.get(String(name));
      if (val) {
        return runtime.ffi.makeSome(val);
      } else {
        return runtime.ffi.makeNone();
      }
    });
    f("color-named", function(maybeName) {
      checkArity(1, arguments, "name-to-color", false);
      c1("color-named", maybeName, runtime.String);
      var name = checkString(maybeName);
      var val = colorDb.get(String(name));
      if (val) {
        return runtime.wrap(val);
      }
      throwMessage("Unknown color name '" + String(name) + "'");
    });

    values["empty-image"] = runtime.makeOpaque(image.makeSceneImage(0, 0, [], true));
    return runtime.makeModuleReturn(values, {
        "Image": runtime.makePrimitiveAnn("Image", checkImagePred),
        "Scene": runtime.makePrimitiveAnn("Scene", checkScenePred)
      });
  }
})
