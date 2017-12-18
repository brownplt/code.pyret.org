({
  requires: [
    { "import-type": "builtin", "name": "image-lib" }
  ],
  nativeRequires: [
    "pyret-base/js/js-numbers"
  ],
  provides: {
    values: {
      "circle": "tany",
      "is-image-color": "tany",
      "is-angle": "tany",
      "is-side-count": "tany",
      "is-step-count": "tany",
      "is-image": "tany",
      "bitmap-url": "tany",
      "image-url": "tany",
      "images-equal": "tany",
      "images-difference": "tany",
      "text": "tany",
      "text-font": "tany",
      "overlay": "tany",
      "overlay-xy": "tany",
      "overlay-align": "tany",
      "overlay-onto-offset": "tany",
      "underlay": "tany",
      "underlay-xy": "tany",
      "underlay-align": "tany",
      "beside": "tany",
      "beside-align": "tany",
      "above": "tany",
      "above-align": "tany",
      "empty-scene": "tany",
      "put-image": "tany",
      "place-image": "tany",
      "place-image-align": "tany",
      "translate-image": "tany",
      "rotate": "tany",
      "scale": "tany",
      "scale-xy": "tany",
      "flip-horizontal": "tany",
      "flip-vertical": "tany",
      "reflect-x": "tany",
      "reflect-y": "tany",
      "frame": "tany",
      "crop": "tany",
      "line": "tany",
      "add-line": "tany",
      "scene-line": "tany",
      "square": "tany",
      "rectangle": "tany",
      "regular-polygon": "tany",
      "ellipse": "tany",
      "triangle": "tany",
      "triangle-sas": "tany",
      "triangle-sss": "tany",
      "triangle-ass": "tany",
      "triangle-ssa": "tany",
      "triangle-aas": "tany",
      "triangle-asa": "tany",
      "triangle-saa": "tany",
      "right-triangle": "tany",
      "isosceles-triangle": "tany",
      "star": "tany",
      "star-sized": "tany",
      "radial-star": "tany",
      "star-polygon": "tany",
      "rhombus": "tany",
      "image-to-color-list": "tany",
      "color-list-to-image": "tany",
      "color-list-to-bitmap": "tany",
      "image-width": "tany",
      "image-height": "tany",
      "image-baseline": "tany",
      "name-to-color": "tany",
      "empty-image": "tany"
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

    var isFontFamily = function(x){
      return (isString(x) &&
              (x.toString().toLowerCase() == "default" ||
               x.toString().toLowerCase() == "decorative" ||
               x.toString().toLowerCase() == "roman" ||
               x.toString().toLowerCase() == "script" ||
               x.toString().toLowerCase() == "swiss" ||
               x.toString().toLowerCase() == "modern" ||
               x.toString().toLowerCase() == "symbol" ||
               x.toString().toLowerCase() == "system"))
        || (x === false);		// false is also acceptable
    };
    var isFontStyle = function(x){
      return (isString(x) &&
              (x.toString().toLowerCase() == "normal" ||
               x.toString().toLowerCase() == "italic" ||
               x.toString().toLowerCase() == "slant"))
        || (x === false);		// false is also acceptable
    };
    var isFontWeight = function(x){
      return (isString(x) &&
              (x.toString().toLowerCase() == "normal" ||
               x.toString().toLowerCase() == "bold" ||
               x.toString().toLowerCase() == "light"))
        || (x === false);		// false is also acceptable
    };
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
    var checkStringOrFalse = p(function(val) { return runtime.isString(val) || runtime.isPyretFalse; }, "String or false");

    var checkByte = p(function(val) {
      return runtime.isNumber(val)
        && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks)
        && jsnums.greaterThanOrEqual(255, val, runtime.NumberErrbacks);
    }, "Number between 0 and 255");
    var checkReal = p(function(val) {
      return runtime.isNumber(val) && jsnums.isReal(val);
    }, "Real Number");
    var checkBoolean = p(runtime.isBoolean, "Boolean");

    var annNatural = ann("Natural Number", function(val) {
      return runtime.isNumber(val) && jsnums.isInteger(val)
        && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks);
    });
    var checkNatural = p(function(val) {
      return runtime.isNumber(val) && jsnums.isInteger(val)
        && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks);
    }, "Natural Number");

    var checkPositiveInteger = p(function(val) {
      return runtime.isNumber(val) && jsnums.isInteger(val)
        && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks);
    }, "Positive Integer");

    var checkNonNegativeReal = p(function(val) {
      return runtime.isNumber(val) && jsnums.isReal(val)
        && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks);
    }, "Non-negative Real Number");


    var checkColor = p(image.isColor, "Color");

    var annColor = ann("Color", image.isColor);
    var annMode = ann("OutlineMode", image.isOutlineMode);

    var checkMode = function(m) {
      return runtime.ffi.cases(image.outlineModePred, "OutlineMode", m, {
        "mode-solid": function(_) { return "solid"; },
        "mode-outline": function(_) { return "outline"; },
        "mode-fade": function(v) { return jsnums.toFixnum(v); }
      });
    }
    var checkPlaceX = function(px) {
      return runtime.ffi.cases(image.xplacePred, "XPlace", px, {
        "x-left": function(_) { return "left"; },
        "x-middle": function(_) { return "middle"; },
        "x-right": function(_) { return "right"; }
      });
    }
    var checkPlaceY = function(py) {
      return runtime.ffi.cases(image.yplacePred, "YPlace", py, {
        "y-top": function(_) { return "top"; },
        "y-center": function(_) { return "center"; },
        "y-baseline": function(_) { return "baseline"; },
        "y-bottom": function(_) { return "bottom"; }
      });
    }
    var annPlaceX = ann("XPlace", image.isXPlace);
    var annPlaceY = ann("YPlace", image.isYPlace);

    var checkImagePred = function(val) {
      return runtime.isOpaque(val) && image.isImage(val.val);
    };
    var checkImageType = runtime.makeCheckType(checkImagePred, "Image");
    var annImage = ann("Image", checkImagePred);
    var checkImage = function(val) {
      checkImageType(val);
      return val.val;
    }
    var checkImageOrScenePred = function(val) {
      return runtime.isOpaque(val) && (image.isImage(val.val) || image.isScene(val.val));
    };
    var annImageOrScene = ann("Image", checkImageOrScenePred);
    var checkImageOrSceneType = runtime.makeCheckType(checkImageOrScenePred, "Image")
    var checkImageOrScene = function(val) {
      checkImageOrSceneType(val);
      return val.val;
    }

    var checkScenePred = function(val) {
      return runtime.isOpaque(val) && image.isScene(val.val);
    };

    var annFontFamily = ann("Font Family", isFontFamily);
    var checkFontFamily = p(isFontFamily, "Font Family");

    var annFontStyle = ann("Font Style (\"normal\", \"italic\", or \"slant\")", isFontStyle);
    var checkFontStyle = p(isFontStyle, "Font Style");

    var annFontWeight = ann("Font Weight", isFontWeight);
    var checkFontWeight = p(isFontWeight, "Font Weight");

    var annAngle = ann("Angle (a number 'x' where 0 <= x < 360)", image.isAngle);
    var checkAngle = p(image.isAngle, "Angle");

    var canonicalizeAngle = function(angle) {
      angle = checkReal(angle);
      angle = jsnums.remainder(angle, 360, runtime.NumberErrbacks);
      if (jsnums.lessThan(angle, 0, runtime.NumberErrbacks)) {
        angle = jsnums.add(angle, 360, runtime.NumberErrbacks);
      }
      return angle;
    };

    var annListColor = ann("List<Color>", function(val) {
      return runtime.ffi.isList(val);
    });
    var checkListofColor = p(function(val) {
      return ffi.makeList(ffi.toArray(val).map(checkColor));
    }, "List<Color>");


    var checkSideCount = p(image.isSideCount, "Side Count");

    var checkStepCount = p(image.isStepCount, "Step Count");

    var checkPointsCount = p(image.isPointsCount, "Points Count");

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
    var bitmapURL = function(maybeUrl) {
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
    };
    var values = {};
    function f(name, fun) {
      values[name] = runtime.makeFunction(fun, name);
    }
    f("circle", function(radius, maybeMode, maybeColor) {
      checkArity(3, arguments, "image", false);
      c3("circle", radius, annNumNonNegative, maybeMode, annMode, maybeColor, annColor);
      var color = checkColor(maybeColor);
      var mode = checkMode(maybeMode)
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
    f("bitmap-url", bitmapURL),
    f("image-url", bitmapURL),
    f("images-difference", function(maybeImage1, maybeImage2) {
      checkArity(2, arguments, "image", false);
      c2("images-difference", maybeImage1, annImage, maybeImage2, annImage);
      var img1 = checkImage(maybeImage1);
      var img2 = checkImage(maybeImage2);
      return runtime.wrap(image.imageDifference(img1, img2));
    });
    f("images-equal", function(maybeImage1, maybeImage2) {
      checkArity(2, arguments, "image", false);
      c2("images-equal", maybeImage1, annImage, maybeImage2, annImage);
      var img1 = checkImage(maybeImage1);
      var img2 = checkImage(maybeImage2);
      return runtime.wrap(image.imageEquals(img1, img2));
    });
    f("text", function(maybeString, maybeSize, maybeColor) {
      checkArity(3, arguments, "image", false);
      c3("text", maybeString, runtime.String, maybeSize, annNumNonNegative, maybeColor, annColor);
      var string = checkString(maybeString);
      var size = jsnums.toFixnum(checkPositiveInteger(maybeSize));
      var color = checkColor(maybeColor);
      return makeImage(
        image.makeTextImage(String(string), size, color,
                            "normal", "Optimer", "", "", false));
    });
    f("text-font", function(maybeString, maybeSize, maybeColor, maybeFace,
                            maybeFamily, maybeStyle, maybeWeight, maybeUnderline) {
      checkArity(8, arguments, "image", false);
      c("text", 
        maybeString, runtime.String,
        maybeSize, annNumNonNegative,
        maybeColor, annColor,
        maybeFace, runtime.String,
        maybeFamily, annFontFamily,
        maybeStyle, annFontStyle,
        maybeWeight, annFontWeight,
        maybeUnderline, runtime.Boolean);
      var string = checkString(maybeString);
      var size = jsnums.toFixnum(checkByte(maybeSize));
      var color = checkColor(maybeColor);
      var face = checkStringOrFalse(maybeFace);
      var family = checkFontFamily(maybeFamily);
      var style = checkFontStyle(maybeStyle);
      var weight = checkFontWeight(maybeWeight);
      var underline = checkBoolean(maybeUnderline);
      return makeImage(
        image.makeTextImage(String(string), size, color,
                            String(face), String(family), String(style),
                            String(weight), underline));
    }),

    f("overlay", function(maybeImg1, maybeImg2) {
      checkArity(2, arguments, "overlay", false);
      c2("overlay", maybeImg1, annImage, maybeImg2, annImage);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, "middle", "center", 0, 0, img2, "middle", "center"));
    });

    f("overlay-xy", function(maybeImg1, maybeDx, maybeDy, maybeImg2) {
      checkArity(4, arguments, "overlay-xy", false);
      c("overlay-xy",
        maybeImg1, annImage,
        maybeDx, runtime.Number,
        maybeDy, runtime.Number,
        maybeImg2, annImage);
      var img1 = checkImage(maybeImg1);
      var dx = jsnums.toFixnum(checkReal(maybeDx));
      var dy = jsnums.toFixnum(checkReal(maybeDy));
      var img2 = checkImage(maybeImg2);
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
      var placeX = checkPlaceX(maybePlaceX);
      var placeY = checkPlaceY(maybePlaceY);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
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
      var placeX1 = checkPlaceX(maybePlaceX1);
      var placeY1 = checkPlaceY(maybePlaceY1);
      var placeX2 = checkPlaceX(maybePlaceX2);
      var placeY2 = checkPlaceY(maybePlaceY2);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
      var offsetX = jsnums.toFixnum(checkReal(maybeOffsetX));
      var offsetY = jsnums.toFixnum(checkReal(maybeOffsetY));
      return makeImage(image.makeOverlayImage(img1, placeX1, placeY1, offsetX, offsetY, img2, placeX2, placeY2));
    });

    f("underlay", function(maybeImg1, maybeImg2) {
      checkArity(2, arguments, "underlay", false);
      c2("underlay", maybeImg1, annImage, maybeImg2, annImage);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img2, "middle", "center", 0, 0, img1, "middle", "center"));
    });

    f("underlay-xy", function(maybeImg1, maybeDx, maybeDy, maybeImg2) {
      checkArity(4, arguments, "underlay-xy", false);
      c("underlay-xy",
        maybeImg1, annImage,
        maybeDx, runtime.Number,
        maybeDy, runtime.Number,
        maybeImg2, annImage);
      var img1 = checkImage(maybeImg1);
      var dx = jsnums.toFixnum(checkReal(maybeDx));
      var dy = jsnums.toFixnum(checkReal(maybeDy));
      var img2 = checkImage(maybeImg2);
      return makeImage(
        image.makeOverlayImage(img2, "left", "top", -dx, -dy, img1, "left", "top"));
    });

    f("underlay-align", function(maybePlaceX, maybePlaceY, maybeImg1, maybeImg2) {
      checkArity(4, arguments, "underlay-align", false);
      c("overlay-align",
        maybePlaceX, annPlaceX,
        maybePlaceY, annPlaceY,
        maybeImg1, annImage,
        maybeImg2, annImage);
      var placeX = checkPlaceX(maybePlaceX);
      var placeY = checkPlaceY(maybePlaceY);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img2, placeX, placeY, 0, 0, img1, placeX, placeY));
    });

    f("beside", function(maybeImg1, maybeImg2) {
      checkArity(2, arguments, "beside", false);
      c2("beside", maybeImg1, annImage, maybeImg2, annImage);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, "right", "center", 0, 0, img2, "left", "center"));
    });

    f("beside-align", function(maybePlaceY, maybeImg1, maybeImg2) {
      checkArity(3, arguments, "beside-align", false);
      c3("beside-align", maybePlaceY, annPlaceY, maybeImg1, annImage, maybeImg2, annImage);
      var placeY = checkPlaceY(maybePlaceY);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, "right", placeY, 0, 0, img2, "left", placeY));
    });

    f("above", function(maybeImg1, maybeImg2) {
      checkArity(2, arguments, "above", false);
      c2("beside", maybeImg1, annImage, maybeImg2, annImage);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, "middle", "bottom", 0, 0, img2, "middle", "top"));
    });

    f("above-align", function(maybePlaceX, maybeImg1, maybeImg2) {
      checkArity(3, arguments, "above-align", false);
      c3("above-align", maybePlaceX, annPlaceX, maybeImg1, annImage, maybeImg2, annImage);
      var placeX = checkPlaceX(maybePlaceX);
      var img1 = checkImage(maybeImg1);
      var img2 = checkImage(maybeImg2);
      return makeImage(image.makeOverlayImage(img1, placeX, "bottom", 0, 0, img2, placeX, "top"));
    });

    f("empty-scene", function(maybeWidth, maybeHeight) {
      checkArity(2, arguments, "empty-scene", false);
      c2("empty-scene", maybeWidth, annNumNonNegative, maybeHeight, annNumNonNegative);
      var width = jsnums.toFixnum(checkNonNegativeReal(maybeWidth));
      var height = jsnums.toFixnum(checkNonNegativeReal(maybeHeight));
      return makeImage(
        image.makeSceneImage(width, height, [], true));
    });
    f("put-image", function(maybePicture, maybeX, maybeY, maybeBackground) {
      checkArity(4, arguments, "put-image", false);
      c("underlay-xy",
        maybePicture, annImage,
        maybeX, runtime.Number,
        maybeY, runtime.Number,
        maybeBackground, annImageOrScene);
      var picture = checkImage(maybePicture);
      var x = jsnums.toFixnum(checkReal(maybeX));
      var y = jsnums.toFixnum(checkReal(maybeY));
      var background = checkImageOrScene(maybeBackground);
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
        maybeX, runtime.Number,
        maybeY, runtime.Number,
        maybeBackground, annImageOrScene);
      var picture = checkImage(maybePicture);
      var x = jsnums.toFixnum(checkReal(maybeX));
      var y = jsnums.toFixnum(checkReal(maybeY));
      var background = checkImageOrScene(maybeBackground);
      if (image.isScene(background)) {
        return makeImage(background.add(picture, x, y));
      } else {
        var newScene = image.makeSceneImage(background.getWidth(), background.getHeight(), [], false);
        newScene = newScene.add(background, background.getWidth()/2, background.getHeight()/2);
        newScene = newScene.add(picture, x, y);
        return makeImage(newScene);
      }
    });
    values["translate"] = values["place-image"];
    f("place-image-align", function(maybeImg, maybeX, maybeY, maybePlaceX, maybePlaceY, maybeBackground) {
      checkArity(6, arguments, "place-image-align", false);
      c("place-image-align",
        maybeImg, annImage,
        maybeX, runtime.Number,
        maybeY, runtime.Number,
        maybePlaceX, annPlaceX,
        maybePlaceY, annPlaceY,
        maybeBackground, annImageOrScene);
      var img = checkImage(maybeImg);
      var x = jsnums.toFixnum(checkReal(maybeX));
      var y = jsnums.toFixnum(checkReal(maybeY));
      var placeX = checkPlaceX(maybePlaceX);
      var placeY = checkPlaceY(maybePlaceY);
      var background = checkImageOrScene(maybeBackground);
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
      c2("rotate", maybeAngle, annNumber, maybeImg, annImage);
      var angle = jsnums.toFixnum(canonicalizeAngle(maybeAngle));
      var img = checkImage(maybeImg);
      return makeImage(image.makeRotateImage(-angle, img));
    });

    f("scale", function(maybeFactor, maybeImg) {
      checkArity(2, arguments, "scale", false);
      c2("scale", maybeFactor, runtime.Number, maybeImg, annImage);
      var factor = jsnums.toFixnum(checkReal(maybeFactor));
      var img = checkImage(maybeImg);
      return makeImage(image.makeScaleImage(factor, factor, img));
    });

    f("scale-xy", function(maybeXFactor, maybeYFactor, maybeImg) {
      checkArity(3, arguments, "scale-xy", false);
      c3("scale-xy", maybeXFactor, runtime.Number, maybeYFactor, runtime.Number, maybeImg, annImage);
      var xFactor = jsnums.toFixnum(checkReal(maybeXFactor));
      var yFactor = jsnums.toFixnum(checkReal(maybeYFactor));
      var img = checkImage(maybeImg);
      return makeImage(image.makeScaleImage(xFactor, yFactor, img));
    });

    f("flip-horizontal", function(maybeImg) {
      checkArity(1, arguments, "flip-horizontal", false);
      c1("flip-horizontal", maybeImg, annImage);
      var img = checkImage(maybeImg);
      return makeImage(image.makeFlipImage(img, "horizontal"));
    });

    f("flip-vertical", function(maybeImg) {
      checkArity(1, arguments, "flip-vertical", false);
      c1("flip-horizontal", maybeImg, annImage);
      var img = checkImage(maybeImg);
      return makeImage(image.makeFlipImage(img, "vertical"));
    });

    // aliases
    f("reflect-y", function(maybeImg) {
      checkArity(1, arguments, "reflect-y", false);
      c1("reflect-y", maybeImg, annImage);
      var img = checkImage(maybeImg);
      return makeImage(image.makeFlipImage(img, "horizontal"));
    });

    f("reflect-x", function(maybeImg) {
      checkArity(1, arguments, "reflect-x", false);
      c1("reflect-x", maybeImg, annImage);
      var img = checkImage(maybeImg);
      return makeImage(image.makeFlipImage(img, "vertical"));
    });

    f("frame", function(maybeImg) {
      checkArity(1, arguments, "frame", false);
      c1("frame", maybeImg, annImage);
      var img = checkImage(maybeImg);
      return makeImage(image.makeFrameImage(img));
    });

    f("crop", function(maybeX, maybeY, maybeWidth, maybeHeight, maybeImg) {
      checkArity(5, arguments, "crop", false);
      c("crop",
        maybeX, runtime.Number,
        maybeY, runtime.Number,
        maybeWidth, annNumNonNegative,
        maybeHeight, annNumNonNegative,
        maybeImg, annImage);
      var x = jsnums.toFixnum(checkReal(maybeX));
      var y = jsnums.toFixnum(checkReal(maybeY));
      var width = jsnums.toFixnum(checkNonNegativeReal(maybeWidth));
      var height = jsnums.toFixnum(checkNonNegativeReal(maybeHeight));
      var img = checkImage(maybeImg);
      return makeImage(image.makeCropImage(x, y, width, height, img));
    });

    f("line", function(maybeX, maybeY, maybeC) {
      checkArity(3, arguments, "line", false);
      c3("line", maybeX, runtime.Number, maybeY, runtime.Number, maybeC, annColor);
      var x = jsnums.toFixnum(checkReal(maybeX));
      var y = jsnums.toFixnum(checkReal(maybeY));
      var color = checkColor(maybeC);
      return makeImage(
        image.makeLineImage(x, y, color, true));
    });

    f("add-line", function(maybeImg, maybeX1, maybeY1, maybeX2, maybeY2, maybeC) {
      checkArity(6, arguments, "add-line", false);
      c("add-line",
        maybeImg, annImage,
        maybeX1, runtime.Number,
        maybeY1, runtime.Number,
        maybeX2, runtime.Number,
        maybeY2, runtime.Number,
        maybeC, annColor);
      var x1 = jsnums.toFixnum(checkReal(maybeX1));
      var y1 = jsnums.toFixnum(checkReal(maybeY1));
      var x2 = jsnums.toFixnum(checkReal(maybeX2));
      var y2 = jsnums.toFixnum(checkReal(maybeY2));
      var color = checkColor(maybeC);
      var img   = checkImage(maybeImg);
      var line  = image.makeLineImage(x2 - x1, y2 - y1, color, true);
      var leftmost = Math.min(x1, x2);
      var topmost  = Math.min(y1, y2);
      return makeImage(image.makeOverlayImage(line, "middle", "center", -leftmost, -topmost, img, "middle", "center"));
    });

    f("scene-line", function(maybeImg, maybeX1, maybeY1, maybeX2, maybeY2, maybeC) {
      checkArity(6, arguments, "scene-line", false);
      c("scene-line",
        maybeImg, annImage,
        maybeX1, runtime.Number,
        maybeY1, runtime.Number,
        maybeX2, runtime.Number,
        maybeY2, runtime.Number,
        maybeC, annColor);
      var x1 = jsnums.toFixnum(checkReal(maybeX1));
      var y1 = jsnums.toFixnum(checkReal(maybeY1));
      var x2 = jsnums.toFixnum(checkReal(maybeX2));
      var y2 = jsnums.toFixnum(checkReal(maybeY2));
      var color = checkColor(maybeC);
      var img = checkImage(maybeImg);
      var line = image.makeLineImage(x2 - x1, y2 - y1, color, true);

      var newScene = image.makeSceneImage(img.getWidth(),
                                          img.getHeight(),
                                          [],
                                          true);
      newScene = newScene.add(img, img.getWidth()/2, img.getHeight()/2);
      // make an image containing the line
      var line = image.makeLineImage(x2 - x1, y2 - y1,
                                     c,
                                     false),
      leftMost = Math.min(x1,x2),
      topMost = Math.min(y1,y2);
      return makeImage(newScene.add(line, line.getWidth()/2+leftMost, line.getHeight()/2+topMost));
    });

    f("square", function(maybeSide, maybeMode, maybeColor) {
      checkArity(3, arguments, "square", false);
      c3("square", maybeSide, annNumNonNegative, maybeMode, annMode, maybeColor, annColor);
      var side = jsnums.toFixnum(checkNonNegativeReal(maybeSide));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
      return makeImage(image.makeSquareImage(side, mode, color));
    });

    f("rectangle", function(maybeWidth, maybeHeight, maybeMode, maybeColor) {
      checkArity(4, arguments, "rectangle", false);
      c("square",
        maybeWidth, annNumNonNegative,
        maybeHeight, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var width = jsnums.toFixnum(checkNonNegativeReal(maybeWidth));
      var height = jsnums.toFixnum(checkNonNegativeReal(maybeHeight));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
      return makeImage(
        image.makeRectangleImage(width, height, mode, color));
    });

    f("regular-polygon", function(maybeLength, maybeCount, maybeMode, maybeColor) {
      checkArity(4, arguments, "regular-polygon", false);
      c("regular-polygon",
        maybeLength, annNumNonNegative,
        maybeCount, annNatural,
        maybeMode, annMode,
        maybeColor, annColor);
      var length = jsnums.toFixnum(checkNonNegativeReal(maybeLength));
      var count = jsnums.toFixnum(checkNonNegativeReal(maybeCount));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var width = jsnums.toFixnum(checkNonNegativeReal(maybeWidth));
      var height = jsnums.toFixnum(checkNonNegativeReal(maybeHeight));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
      return makeImage(
        image.makeEllipseImage(width, height, mode, color));
    });

    f("triangle", function(maybeSide, maybeMode, maybeColor) {
      checkArity(3, arguments, "triangle", false);
      c3("triangle", maybeSide, annNumNonNegative, maybeMode, annMode, maybeColor, annColor);
      var side = jsnums.toFixnum(checkNonNegativeReal(maybeSide));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var sideA = jsnums.toFixnum(checkNonNegativeReal(maybeSideA));
      var angleB = jsnums.toFixnum(checkAngle(maybeAngleB));
      var sideC = jsnums.toFixnum(checkNonNegativeReal(maybeSideC));

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

      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var sideA = jsnums.toFixnum(checkNonNegativeReal(maybeSideA));
      var sideB = jsnums.toFixnum(checkNonNegativeReal(maybeSideB));
      var sideC = jsnums.toFixnum(checkNonNegativeReal(maybeSideC));
      if (less(sideA + sideB, sideC) ||
          less(sideC + sideB, sideA) ||
          less(sideA + sideC, sideB)) {
        throwMessage("The given sides will not form a triangle: "
                     + maybeSideA + ", " + maybeSideB + ", " + maybeSideC);
      }

      var angleA = Math.acos(excess(sideB, sideC, sideA) / (2 * sideB * sideC)) * (180 / Math.PI);

      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var angleA = jsnums.toFixnum(checkAngle(maybeAngleA));
      var sideB = jsnums.toFixnum(checkNonNegativeReal(maybeSideB));
      var sideC = jsnums.toFixnum(checkNonNegativeReal(maybeSideC));
      if (less(180, angleA)) {
        throwMessage("The given angle, side and side will not form a triangle: "
                     + maybeAngleA + ", " + maybeSideB + ", " + maybeSideC);
      }
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var sideA  = jsnums.toFixnum(checkNonNegativeReal(maybeSideA));
      var sideB  = jsnums.toFixnum(checkNonNegativeReal(maybeSideB));
      var angleC = jsnums.toFixnum(checkAngle(maybeAngleC));
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

      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var angleA = jsnums.toFixnum(checkAngle(maybeAngleA));
      var angleB = jsnums.toFixnum(checkAngle(maybeAngleB));
      var sideC = jsnums.toFixnum(checkNonNegativeReal(maybeSideC));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var angleA = jsnums.toFixnum(checkAngle(maybeAngleA));
      var sideB = jsnums.toFixnum(checkNonNegativeReal(maybeSideB));
      var angleC = jsnums.toFixnum(checkAngle(maybeAngleC));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var sideA = jsnums.toFixnum(checkNonNegativeReal(maybeSideA));
      var angleB = jsnums.toFixnum(checkAngle(maybeAngleB));
      var angleC = jsnums.toFixnum(checkAngle(maybeAngleC));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var side1 = jsnums.toFixnum(checkNonNegativeReal(maybeSide1));
      var side2 = jsnums.toFixnum(checkNonNegativeReal(maybeSide2));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var side = jsnums.toFixnum(checkNonNegativeReal(maybeSide));
      var angleC = jsnums.toFixnum(checkAngle(maybeAngleC));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
      var angleAB = (180-angleC)/2;
      var base = 2*side*Math.sin((angleC*Math.PI/180)/2);
      return makeImage(
        // add 180 to make the triangle point up
        image.makeTriangleImage(base, 360 - angleAB, side, mode, color));
    });

    f("star", function(maybeSide, maybeMode, maybeColor) {
      checkArity(3, arguments, "star", false);
      c3("star", maybeSide, annNumNonNegative, maybeMode, annMode, maybeColor, annColor);
      var side = jsnums.toFixnum(checkNonNegativeReal(maybeSide));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
      return makeImage(
        image.makePolygonImage(side, 5, 2, mode, color));
    });
    // TODO: This was split from the variable-arity case in the original whalesong "star" function
    f("star-sized", function(maybeSideCount, maybeOuter, maybeInner, maybeMode, maybeColor) {
      checkArity(5, arguments, "star-sized", false);
      c("star-sized",
        maybeSideCount, annNatural,
        maybeOuter, annNumNonNegative,
        maybeInner, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var sideCount = jsnums.toFixnum(checkSideCount(maybeSideCount));
      var outer = jsnums.toFixnum(checkNonNegativeReal(maybeOuter));
      var inner = jsnums.toFixnum(checkNonNegativeReal(maybeInner));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
      return makeImage(
        image.makeStarImage(sideCount, inner, outer, mode, color));
    });
    // TODO: Same as star-sized?
    f("radial-star", function(maybePoints, maybeOuter, maybeInner, maybeMode, maybeColor) {
      checkArity(5, arguments, "radial-star", false);
      c("radial-star",
        maybePoints, annNatural,
        maybeOuter, annNumNonNegative,
        maybeInner, annNumNonNegative,
        maybeMode, annMode,
        maybeColor, annColor);
      var points = jsnums.toFixnum(checkPointsCount(maybePoints));
      var outer = jsnums.toFixnum(checkNonNegativeReal(maybeOuter));
      var inner = jsnums.toFixnum(checkNonNegativeReal(maybeInner));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
      return makeImage(
        image.makeStarImage(points, inner, outer, mode, color));
    });

    f("star-polygon", function(maybeLength, maybeCount, maybeStep, maybeMode, maybeColor) {
      checkArity(5, arguments, "star-polygon", false);
      c("star-polygon",
        maybeLength, annNumNonNegative,
        maybeCount, annNatural,
        maybeStep, annNatural,
        maybeMode, annMode,
        maybeColor, annColor);
      var length = jsnums.toFixnum(checkNonNegativeReal(maybeLength));
      var count = jsnums.toFixnum(checkNonNegativeReal(maybeCount));
      var step = jsnums.toFixnum(checkStepCount(maybeStep));
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
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
      var length = jsnums.toFixnum(checkNonNegativeReal(maybeLength));
      var angle = jsnums.toFixnum(checkAngle(maybeAngle)); // TODO: This was originally checkNonNegativeReal, seemed like a bug
      var mode = checkMode(maybeMode);
      var color = checkColor(maybeColor);
      return makeImage(
        image.makeRhombusImage(length, angle, mode, color));
    });

    f("image-to-color-list", function(maybeImage) {
      checkArity(1, arguments, "image-to-color-list", false);
      c1("image-width", maybeImage, annImage);
      var img = checkImage(maybeImage);
      return image.imageToColorList(img);
    });

    f("color-list-to-image", function(maybeList, maybeWidth, maybeHeight, maybePinholeX, maybePinholeY) {
      checkArity(5, arguments, "color-list-to-image", false);
      c("color-list-to-image",
        maybeList, annListColor,
        maybeWidth, annNatural,
        maybeHeight, annNatural,
        maybePinholeX, annNatural,
        maybePinholeY, annNatural);
      var loc = checkListofColor(maybeList);
      var width = jsnums.toFixnum(checkNatural(maybeWidth));
      var height = jsnums.toFixnum(checkNatural(maybeHeight));
      var pinholeX = jsnums.toFixnum(checkNatural(maybePinholeX));
      var pinholeY = jsnums.toFixnum(checkNatural(maybePinholeY));
      return makeImage(image.colorListToImage(loc, width, height, pinholeX, pinholeY));
    });

    f("color-list-to-bitmap", function(maybeList, maybeWidth, maybeHeight) {
      checkArity(3, arguments, "color-list-to-bitmap", false);
      c3("color-list-to-bitmap", maybeList, annListColor, maybeWidth, annNatural, maybeHeight, annNatural);
      var loc = checkListofColor(maybeList);
      var width = checkNatural(maybeWidth);
      var height = checkNatural(maybeHeight);
      return makeImage(image.colorListToImage(loc, width, height, 0, 0));
    });

    f("image-width", function(maybeImg) {
      checkArity(1, arguments, "image-width", false);
      c1("image-width", maybeImg, annImage);
      var img = checkImage(maybeImg);
      return runtime.wrap(img.getWidth());
    });

    f("image-height", function(maybeImg) {
      checkArity(1, arguments, "image-height", false);
      c1("image-height", maybeImg, annImage);
      var img = checkImage(maybeImg);
      return runtime.wrap(img.getHeight());
    });

    f("image-baseline", function(maybeImg) {
      checkArity(1, arguments, "image-baseline", false);
      c1("image-baseline", maybeImg, annImage);
      var img = checkImage(maybeImg);
      return runtime.wrap(img.getBaseline());
    });

    f("name-to-color", function(maybeName) {
      checkArity(1, arguments, "name-to-color", false);
      c1("name-to-color", maybeName, runtime.String);
      var name = checkString(maybeName);
      return runtime.wrap(colorDb.get(String(name)) || false);
    });

    values["empty-image"] = runtime.makeOpaque(image.makeSceneImage(0, 0, [], true));
    return runtime.makeModuleReturn(values, {
        "Image": runtime.makePrimitiveAnn("Image", checkImagePred),
        "Scene": runtime.makePrimitiveAnn("Scene", checkScenePred)
      });
  }
})
