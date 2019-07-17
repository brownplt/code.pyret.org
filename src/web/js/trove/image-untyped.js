({
  requires: [
    { "import-type": "builtin", "name": "image-lib" },
    { "import-type": "builtin", "name": "make-image" }
  ],
  nativeRequires: [
    "pyret-base/js/js-numbers",
  ],
  provides: {
    values: {
      "circle": "tany",
      "is-image-color": "tany",
      "is-mode": "tany",
      "is-x-place": "tany",
      "is-y-place": "tany",
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
      "underlay": "tany",
      "underlay-xy": "tany",
      "underlay-align": "tany",
      "beside": "tany",
      "beside-align": "tany",
      "above": "tany",
      "above-align": "tany",
      "empty-scene": "tany",
      "empty-color-scene": "tany",
      "put-image": "tany",
      "translate": "tany",
      "place-image": "tany",
      "place-image-align": "tany",
      "place-pinhole": "tany",
      "center-pinhole": "tany",
      "rotate": "tany",
      "scale": "tany",
      "scale-xy": "tany",
      "flip-horizontal": "tany",
      "flip-vertical": "tany",
      "frame": "tany",
      "draw-pinhole": "tany",
      "crop": "tany",
      "line": "tany",
      "add-line": "tany",
      "scene-line": "tany",
      "square": "tany",
      "rectangle": "tany",
      "regular-polygon": "tany",
      "point-polygon": "tany",
      "ellipse": "tany",
      "wedge": "tany",
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
      "color-at-position": "tany",
      "color-list-to-bitmap": "tany",
      "image-width": "tany",
      "image-height": "tany",
      "image-baseline": "tany",
      "image-pinhole-x": "tany",
      "image-pinhole-y": "tany",
      "name-to-color": "tany",
      "empty-image": "tany"
    },
    aliases: {
      "Image": ["local", "Image"]
    },
    datatypes: { "Image": ["data", "Image", [], [], {}] }
  },
  theModule: function(runtime, namespace, uri, image, makeImage, jsnums) {
    var colorDb = image.colorDb;
    var ffi = runtime.ffi;

    var isString = runtime.isString;

    var ann = function(name, pred) {
      return runtime.makePrimitiveAnn(name, pred);
    };

    var identity = function(x) { return x; };

    var isPlaceX = function(x) {
      return (isString(x) &&
              (x.toString().toLowerCase() == "left"  ||
               x.toString().toLowerCase() == "right" ||
               x.toString().toLowerCase() == "center" ||
               x.toString().toLowerCase() == "pinhole" ||
               x.toString().toLowerCase() == "middle"));
    };
    var isPlaceY = function(x) {
      return (isString(x) &&
              (x.toString().toLowerCase() == "top"	  ||
               x.toString().toLowerCase() == "bottom"   ||
               x.toString().toLowerCase() == "baseline" ||
               x.toString().toLowerCase() == "center"   ||
               x.toString().toLowerCase() == "pinhole"  ||
               x.toString().toLowerCase() == "middle"));
    };

    var checkImagePred = function(val) {
      return runtime.isOpaque(val) && image.isImage(val.val);
    };
    var checkScenePred = function(val) {
      return runtime.isOpaque(val) && image.isScene(val.val);
    };

    var unwrapPoint2D = function(val) {
      var gf = runtime.getField;
      return { x: gf(val, "x"), y: gf(val, "y") };
    };

    const ANNOTS = {
      annString: runtime.String,
      annNumber: runtime.Number,
      annPositive: runtime.NumPositive,
      annNumNonNegative: runtime.NumNonNegative,
      annByte: ann("Number between 0 and 255", function(val) {
        return runtime.isNumber(val)
          && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks)
          && jsnums.greaterThanOrEqual(255, val, runtime.NumberErrbacks);
      }),
      annReal: ann("Real Number", function(val) {
        return runtime.isNumber(val) && jsnums.isReal(val);
      }),
      annNatural: ann("Natural Number", function(val) {
        return runtime.isNumber(val) && jsnums.isInteger(val)
          && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks);
      }),
      annPositiveInteger: ann("Positive Integer", function(val) {
        return runtime.isNumber(val) && jsnums.isInteger(val)
          && jsnums.greaterThanOrEqual(val, 0, runtime.NumberErrbacks);
      }),
      unwrapColor: function(val) {
        var aColor = val;
        if (colorDb.get(aColor)) {
          aColor = colorDb.get(aColor);
        }
        return aColor;
      },
      annColor: ann("Color", image.isColorOrColorString),
      annPoint2D: image.annPoint,
      annMode: ann("Mode (\"outline\" or \"solid\")", function(x) {
        return (isString(x) &&
                (x.toString().toLowerCase() == "solid" ||
                 x.toString().toLowerCase() == "outline")) ||
          ((jsnums.isReal(x)) &&
           (jsnums.greaterThanOrEqual(x, 0, runtime.NumberErrbacks) &&
            jsnums.lessThanOrEqual(x, 1, runtime.NumberErrbacks)));
      }),
      unwrapMode: function(val) {
        if (typeof val === "string")
          return val;
        else
          return jsnums.toFixnum(val);
      },
      annFontFamily: ann("Font Family", function(x){
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
      }),
      unwrapFontFamily: identity,
      annFontStyle: ann("Font Style (\"normal\", \"italic\", or \"slant\")", function(x){
        return (isString(x) &&
                (x.toString().toLowerCase() == "normal" ||
                 x.toString().toLowerCase() == "italic" ||
                 x.toString().toLowerCase() == "slant"))
          || (x === false);		// false is also acceptable
      }),
      unwrapFontStyle: identity,
      annFontWeight: ann("Font Weight", function(x){
        return (isString(x) &&
                (x.toString().toLowerCase() == "normal" ||
                 x.toString().toLowerCase() == "bold" ||
                 x.toString().toLowerCase() == "light"))
          || (x === false);		// false is also acceptable
      }),
      unwrapFontWeight: identity,
      annPlaceX: ann("X Place (\"left\", \"middle\", \"center\", \"pinhole\", or \"right\")", isPlaceX),
      unwrapPlaceX: function(val) {
        if (val.toString().toLowerCase() == "center") return "middle";
        return val;
      },
      annPlaceY: ann("Y Place (\"top\", \"bottom\", \"center\", \"pinhole\", \"baseline\", or \"middle\")", isPlaceY),
      unwrapPlaceY: function(val) {
        if (val.toString().toLowerCase() == "middle") return "center";
        return val;
      },
      annImage: ann("Image", checkImagePred),
      unwrapImage: function(val) {
        return val.val;
      },
      annImageOrScene: ann("Image", function(val) {
        return runtime.isOpaque(val) && (image.isImage(val.val) || image.isScene(val.val));
      }),
      unwrapImageOrScene: function(val) {
        return val.val;
      },
      annAngle: ann("Angle (a number 'x' where 0 <= x < 360)", image.isAngle),
      annListColor: ann("List<Color>", function(val) {
        return runtime.ffi.isList(val);
      }),
      unwrapListofColor: function(val) {
        return ffi.makeList(ffi.toArray(val).map(unwrapColor));
      },
      annListPoint2D: ann("List<Point>", function(val) {
        return runtime.ffi.isList(val);
      }),
      unwrapListofPoint2D: function(val) {
        return ffi.toArray(val).map(unwrapPoint2D);
      },
      annSideCount: ann("Side Count", image.isSideCount),
      annStepCount: ann("Step Count", image.isStepCount),
      annPointCount: ann("Points Count", image.isPointsCount)
    };


    var values = makeImage.makeImageLib("image-untyped", ANNOTS);
    function f(name, fun) {
      values[name] = runtime.makeFunction(fun, name);
    }


    f("is-image-color", function(maybeColor) {
      checkArity(1, arguments, "image", false);
      return runtime.wrap(image.isColorOrColorString(maybeColor));
    });
    f("is-mode", function(maybeMode) {
      checkArity(1, arguments, "is-mode", false);
      return runtime.wrap(isMode(maybeMode));
    });
    f("is-x-place", function(maybeXPlace) {
      checkArity(1, arguments, "is-x-place", false);
      return runtime.wrap(isPlaceX(maybeXPlace));
    });
    f("is-y-place", function(maybeYPlace) {
      checkArity(1, arguments, "is-y-place", false);
      return runtime.wrap(isPlaceY(maybeYPlace));
    });


    f("color-list-to-image", function(maybeList, maybeWidth, maybeHeight, maybePinholeX, maybePinholeY) {
      checkArity(5, arguments, "color-list-to-image", false);
      c("color-list-to-image",
        maybeList, annListColor,
        maybeWidth, annNatural,
        maybeHeight, annNatural,
        maybePinholeX, annNatural,
        maybePinholeY, annNatural);
      var len = ffi.listLength(maybeList);
      var loc = unwrapListofColor(maybeList);
      var width = jsnums.toFixnum(maybeWidth);
      var height = jsnums.toFixnum(maybeHeight);
      if (len != width * height) {
        throwMessage("The color list does not have the right number of elements: " +
                     "expected " + (width * height) + " but got " + len);
      }
      var pinholeX = jsnums.toFixnum(maybePinholeX);
      var pinholeY = jsnums.toFixnum(maybePinholeY);
      return makeImage(image.colorListToImage(loc, width, height, pinholeX, pinholeY));
    });

    f("color-list-to-bitmap", function(maybeList, maybeWidth, maybeHeight) {
      checkArity(3, arguments, "color-list-to-bitmap", false);
      c3("color-list-to-bitmap", maybeList, annListColor, maybeWidth, annNatural, maybeHeight, annNatural);
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

    f("name-to-color", function(maybeName) {
      checkArity(1, arguments, "name-to-color", false);
      c1("name-to-color", maybeName, runtime.String);
      var name = maybeName;
      return runtime.wrap(colorDb.get(String(name)) || false);
    });
    
    return runtime.makeModuleReturn(values, {
        "Image": runtime.makePrimitiveAnn("Image", checkImagePred),
        "Scene": runtime.makePrimitiveAnn("Scene", checkScenePred)
      });
  }
})
