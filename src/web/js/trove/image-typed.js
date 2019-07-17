({
  requires: [
    { "import-type": "builtin", "name": "image-lib" },
    { "import-type": "builtin", "name": "make-image" }
  ],
  nativeRequires: [
    "pyret-base/js/js-numbers",
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
      "Point": { tag: "name",
                 origin: { "import-type": "uri", uri: "builtin://image-structs" },
                 name: "Point" },
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
      "LoI": ["tyapp", { tag: "name",
                         origin: { "import-type": "uri", uri: "builtin://lists" },
                         name: "List" },
              [["local", "Image" ]]],
      "LoP": ["tyapp", { tag: "name",
                         origin: { "import-type": "uri", uri: "builtin://lists" },
                         name: "List" },
              [{ tag: "name",
                 origin: { "import-type": "uri", uri: "builtin://image-structs" },
                 name: "Point" }]],
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
      "overlay-list": ["arrow", ["LoI"], "Image"],
      "overlay-xy": ["arrow", ["Image", "Number", "Number", "Image"], "Image"],
      "overlay-align": ["arrow", ["XPlace", "YPlace", "Image", "Image"], "Image"],
      "overlay-align-list": ["arrow", ["XPlace", "YPlace", "LoI"], "Image"],
      "overlay-onto-offset": ["arrow",
                              ["Image", "XPlace", "YPlace", "Number", "Number", "Image", "XPlace", "YPlace"],
                              "Image"],
      "underlay": ["arrow", ["Image", "Image"], "Image"],
      "underlay-list": ["arrow", ["LoI"], "Image"],
      "underlay-xy": ["arrow", ["Image", "Number", "Number","Image"], "Image"],
      "underlay-align": ["arrow", ["XPlace", "YPlace", "Image", "Image"], "Image"],
      "underlay-align-list": ["arrow", ["XPlace", "YPlace", "LoI"], "Image"],
      "beside": ["arrow", ["Image", "Image"], "Image"],
      "beside-list": ["arrow", ["LoI"], "Image"],
      "beside-align": ["arrow", ["YPlace", "Image", "Image"], "Image"],
      "beside-align-list": ["arrow", ["YPlace", "LoI"], "Image"],
      "above": ["arrow", ["Image", "Image"], "Image"],
      "above-list": ["arrow", ["LoI"], "Image"],
      "above-align": ["arrow", ["XPlace", "Image", "Image"], "Image"],
      "above-align-list": ["arrow", ["XPlace", "LoI"], "Image"],
      "below": ["arrow", ["Image", "Image"], "Image"],
      "below-list": ["arrow", ["LoI"], "Image"],
      "below-align": ["arrow", ["XPlace", "Image", "Image"], "Image"],
      "below-align-list": ["arrow", ["XPlace", "LoI"], "Image"],
      "empty-scene": ["arrow", ["Number", "Number"], "Image"],
      "empty-color-scene": ["arrow", ["Number", "Number", "Color"], "Image"],
      "put-image": ["arrow", ["Image", "Number", "Number", "Image"], "Image"],
      "translate": ["arrow", ["Image", "Number", "Number", "Image"], "Image"],
      "place-image": ["arrow", ["Image", "Number", "Number", "Image"], "Image"],
      "place-image-align": ["arrow", ["Image", "Number", "Number", "XPlace", "YPlace", "Image"], "Image"],
      "move-pinhole": ["arrow", ["Number", "Number", "Image"], "Image"],
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
      "point-polygon": ["arrow", ["LoP", "FillMode", "Color"], "Image"],
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
      "color-at-position": ["arrow", ["Image", "Number", "Number"], "Color"],
      "image-width": ["arrow", ["Image"], "Number"],
      "image-height": ["arrow", ["Image"], "Number"],
      "image-baseline": ["arrow", ["Image"], "Number"],
      "image-pinhole-x": ["arrow", ["Image"], "Number"],
      "image-pinhole-y": ["arrow", ["Image"], "Number"],
      "name-to-color": ["arrow", ["String"], "OptColor"],
      "color-named": ["arrow", ["String"], "Color"],
      "empty-image": "Image"
    },
    aliases: {
      "Image": ["local", "Image"]
    },
    datatypes: { "Image": ["data", "Image", [], [], {}] }
  },
  theModule: function(runtime, namespace, uri, image, makeImage, jsnums) {
    var colorDb = image.colorDb;
    var ffi = runtime.ffi;

    const c = function(name, ...argsAndAnns) {
      runtime.checkArgsInternalInline(moduleName, name, ...argsAndAnns);
    };
    const c1 = function(name, arg, ann) {
      runtime.checkArgsInternal1(moduleName, name, arg, ann);
    };
    const c2 = function(name, arg1, ann1, arg2, ann2) {
      runtime.checkArgsInternal2(moduleName, name, arg1, ann1, arg2, ann2);
    };
    const c3 = function(name, arg1, ann1, arg2, ann2, arg3, ann3) {
      runtime.checkArgsInternal3(moduleName, name, arg1, ann1, arg2, ann2, arg3, ann3);
    };

    var ann = function(name, pred) {
      return runtime.makePrimitiveAnn(name, pred);
    };

    var identity = function(x) { return x; };
    var pyAlwaysTrue = runtime.makeFunction(function(_) { return true; }, "No-op");

    var checkImagePred = function(val) {
      return runtime.isOpaque(val) && image.isImage(val.val);
    };
    var checkScenePred = function(val) {
      return runtime.isOpaque(val) && image.isScene(val.val);
    };

    var annListImage = ann("List<Image>", function(val) {
      if (!runtime.ffi.isList(val)) return false;
      var cur = val;
      var gf = runtime.getField;
      while (runtime.unwrap(ffi.isLink(cur))) {
        var f = gf(cur, "first");
        if (!checkImagePred(f)) return false;
        cur = gf(cur, "rest");
      }
      return true;
    });
    var unwrapListofImage = identity;

    var unwrapPoint2D = function(val) {
      var gf = runtime.getField;
      return { x: gf(val, "x"), y: gf(val, "y") };
    };
    
    // [Image int Image -> Image] [Listof PyretImage] Image -> Image
    var imageListFoldIndex = function(func, lst, base) {
      var cur = lst;
      var ans = base;
      var gf = runtime.getField;
      var index = 0;
      while (runtime.unwrap(ffi.isLink(cur))) {
        var f = gf(cur, "first");
        ans = func(ans, index++, unwrapImage(f));
        cur = gf(cur, "rest");
      }
      return ans;
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
      unwrapColor: identity,
      annColor: image.annColor,
      annPoint: image.annPoint,
      annMode: image.annFillMode,
      unwrapMode: function(m) {
        return runtime.ffi.cases(pyAlwaysTrue, "FillMode", m, {
          "mode-solid":   function(_) { return "solid"; },
          "mode-outline": function(_) { return "outline"; },
          "mode-fade":    function(v) { return jsnums.toFixnum(v); },
        });
      },
      annFontFamily: image.annFontFamily,
      unwrapFontFamily: function(ff) {
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
      },   
      annFontStyle: image.annFontStyle,
      unwrapFontStyle: function(fs) {
        return runtime.ffi.cases(pyAlwaysTrue, "FontStyle", fs, {
          "fs-normal": function(_) { return "normal"; },
          "fs-italic": function(_) { return "italic"; },
          "fs-slant":  function(_) { return "slant"; },
        });
      },
      annFontWeight: image.annFontWeight,
      unwrapFontWeight: function(fw){
        return runtime.ffi.cases(pyAlwaysTrue, "FontWeight", fw, {
          "fw-normal": function(_) { return "normal"; },
          "fw-bold": function(_) { return "bold"; },
          "fw-light": function(_) { return "light"; },
        });
      },
      annPlaceX: image.annXPlace,
      unwrapPlaceX: function(px) {
        return runtime.ffi.cases(pyAlwaysTrue, "XPlace", px, {
          "x-left": function(_) { return "left"; },
          "x-middle": function(_) { return "middle"; },
          "x-pinhole": function(_) { return "pinhole"; },
          "x-right": function(_) { return "right"; }
        });
      },
      annPlaceY: image.annYPlace,
      unwrapPlaceY: function(py) {
        return runtime.ffi.cases(pyAlwaysTrue, "YPlace", py, {
          "y-top": function(_) { return "top"; },
          "y-center": function(_) { return "center"; },
          "y-pinhole": function(_) { return "pinhole"; },
          "y-baseline": function(_) { return "baseline"; },
          "y-bottom": function(_) { return "bottom"; }
        });
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
        if (!runtime.ffi.isList(val)) return false;
        var cur = val;
        var gf = runtime.getField;
        while (runtime.unwrap(ffi.isLink(cur))) {
          var f = gf(cur, "first");
          if (!image.isColor(f)) return false;
          cur = gf(cur, "rest");
        }
        return true;
      }),
      unwrapListofColor: identity,
      annListPoint2D: ann("List<Point>", function(val) {
        if (!runtime.ffi.isList(val)) return false;
        var cur = val;
        var gf = runtime.getField;
        var count = 0;
        while (runtime.unwrap(ffi.isLink(cur))) {
          var f = gf(cur, "first");
          if (!image.isPoint(f)) return false;
          cur = gf(cur, "rest");
          count++;
        }
        return true;
      }),
      unwrapListofPoint2D: function(val) {
        return ffi.toArray(val).map(unwrapPoint2D);
      },
      annSideCount: ann("Side Count", image.isSideCount),
      annStepCount: ann("Step Count", image.isStepCount),
      annPointCount: ann("Points Count", image.isPointsCount)
    };


    var values = makeImage.makeImageLib("image-typed", ANNOTS);
    function f(name, fun) {
      values[name] = runtime.makeFunction(fun, name);
    }


    f("overlay-list", function(maybeImgs) {
      checkArity(1, arguments, "overlay-list", false);
      c1("overlay-list", maybeImgs, annListImage);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(acc, "pinhole", "pinhole", 0, 0, img, "pinhole", "pinhole"); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });


    f("overlay-align-list", function(maybePlaceX, maybePlaceY, maybeImgs) {
      checkArity(3, arguments, "overlay-align-list", false);
      c3("overlay-align-list", maybePlaceX, annPlaceX, maybePlaceY, annPlaceY, maybeImgs, annListImage);
      var placeX = unwrapPlaceX(maybePlaceX);
      var placeY = unwrapPlaceY(maybePlaceY);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(acc, placeX, placeY, 0, 0, img, placeX, placeY); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });

    f("overlay-onto-offset", function(maybeImg1, maybePlaceX1, maybePlaceY1,
                                      maybeOffsetX, maybeOffsetY,
                                      maybeImg2, maybePlaceX2, maybePlaceY2) {
      checkArity(8, arguments, "overlay-onto-offset", false);
      c("overlay-onto-offset",
        maybeImg1, annImage,
        maybePlaceX1, annPlaceX,
        maybePlaceY1, annPlaceY,
        maybeOffsetX, annReal,
        maybeOffsetY, annReal,
        maybeImg2, annImage,
        maybePlaceX2, annPlaceX,
        maybePlaceY2, annPlaceY);
      var placeX1 = unwrapPlaceX(maybePlaceX1);
      var placeY1 = unwrapPlaceY(maybePlaceY1);
      var placeX2 = unwrapPlaceX(maybePlaceX2);
      var placeY2 = unwrapPlaceY(maybePlaceY2);
      var img1 = unwrapImage(maybeImg1);
      var img2 = unwrapImage(maybeImg2);
      var offsetX = jsnums.toFixnum(maybeOffsetX);
      var offsetY = jsnums.toFixnum(maybeOffsetY);
      return makeImage(image.makeOverlayImage(img1, placeX1, placeY1, offsetX, offsetY, img2, placeX2, placeY2));
    });

    f("underlay-list", function(maybeImgs) {
      checkArity(1, arguments, "underlay-list", false);
      c1("underlay-list", maybeImgs, annListImage);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(img, "pinhole", "pinhole", 0, 0, acc, "pinhole", "pinhole"); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });

    f("underlay-align-list", function(maybePlaceX, maybePlaceY, maybeImgs) {
      checkArity(3, arguments, "underlay-align-list", false);
      c3("underlay-align-list", maybePlaceX, annPlaceX, maybePlaceY, annPlaceY, maybeImgs, annListImage);
      var placeX = unwrapPlaceX(maybePlaceX);
      var placeY = unwrapPlaceY(maybePlaceY);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(img, placeX, placeY, 0, 0, acc, placeX, placeY); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });

    f("beside-list", function(maybeImgs) {
      checkArity(1, arguments, "beside-list", false);
      c1("beside-list", maybeImgs, annListImage);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(acc, "right", "center", 0, 0, img, "left", "center"); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });

    f("beside-align-list", function(maybePlaceY, maybeImgs) {
      checkArity(2, arguments, "beside-align-list", false);
      c2("beside-align-list", maybePlaceY, annPlaceY, maybeImgs, annListImage);
      var placeY = unwrapPlaceY(maybePlaceY);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(acc, "right", placeY, 0, 0, img, "left", placeY); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });

    f("above-list", function(maybeImgs) {
      checkArity(1, arguments, "above-list", false);
      c1("above-list", maybeImgs, annListImage);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(acc, "middle", "bottom", 0, 0, img, "middle", "top"); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });

    f("above-align-list", function(maybePlaceX, maybeImgs) {
      checkArity(2, arguments, "above-align-list", false);
      c2("above-list", maybePlaceX, annPlaceX, maybeImgs, annListImage);
      var placeX = unwrapPlaceX(maybePlaceX);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(acc, placeX, "bottom", 0, 0, img, placeX, "top"); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });
    
    f("below-list", function(maybeImgs) {
      checkArity(1, arguments, "below-list", false);
      c1("below-list", maybeImgs, annListImage);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(img, "middle", "bottom", 0, 0, acc, "middle", "top"); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });

    f("below-align-list", function(maybePlaceX, maybeImgs) {
      checkArity(2, arguments, "below-align-list", false);
      c2("below-list", maybePlaceX, annPlaceX, maybeImgs, annListImage);
      var placeX = unwrapPlaceX(maybePlaceX);
      var imgs = unwrapListofImage(maybeImgs);
      return makeImage(imageListFoldIndex(function(acc, idx, img) {
        if (idx == 0) { return img; }
        else { return image.makeOverlayImage(img, placeX, "bottom", 0, 0, acc, placeX, "top"); }
      }, imgs, image.makeSceneImage(0, 0, [], false, colorDb.get("transparent"))));
    });

    f("move-pinhole", function(maybeDx, maybeDy, maybeImg) {
      checkArity(3, arguments, "move-pinhole", false);
      c3("move-pinhole",
         maybeDx, annReal,
         maybeDy, annReal,
         maybeImg, annImage);
      var img = unwrapImage(maybeImg);
      var dx = jsnums.toFixnum(maybeDx);
      var dy = jsnums.toFixnum(maybeDy);
      return makeImage(img.offsetPinhole(dx, dy));
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

    f("name-to-color", function(maybeName) {
      checkArity(1, arguments, "name-to-color", false);
      c1("name-to-color", maybeName, runtime.String);
      var name = maybeName;
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
      var name = maybeName;
      var val = colorDb.get(String(name));
      if (val) {
        return runtime.wrap(val);
      }
      throwMessage("Unknown color name '" + String(name) + "'");
    });

    return runtime.makeModuleReturn(values, {
        "Image": runtime.makePrimitiveAnn("Image", checkImagePred),
        "Scene": runtime.makePrimitiveAnn("Scene", checkScenePred)
      });
  }
})
