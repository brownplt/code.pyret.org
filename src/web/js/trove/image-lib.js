({
  requires: [
    { "import-type": "builtin", "name": "internal-image-shared" },
    { "import-type": "builtin", "name": "color" }
  ],
  nativeRequires: ["pyret-base/js/js-numbers", "js-md5"],
  provides: {
    aliases: { "Image": ["local", "Image"] },
    datatypes: { "Image": ["data", "Image", [], [], {}] }
  },
  theModule: function(RUNTIME, NAMESPACE, uri, imageImp, colorLib, jsnums, md5) {
    var gf = RUNTIME.getField;

    var image = gf(imageImp, "values");
    var imageTypes = gf(imageImp, "types");
    var color = gf(gf(colorLib, "values"), "color");
    var annColor = gf(colorLib, "types")["Color"]; // can't use getField here
    var rawIsColor = gf(gf(colorLib, "values"), "is-Color");
    var isNum = function(n) { return typeof n === "number"; }
    var xyPoint = gf(image, "point-xy");
    var annPoint = imageTypes["Point"];
    var rawIsPoint = gf(image, "is-Point");
    var isPoint = function(p) { return unwrap(rawIsPoint.app(p)); };
    var unwrap = RUNTIME.unwrap;

    var hasOwnProperty = {}.hasOwnProperty;


    //////////////////////////////////////////////////////////////////////
    var makeColor = function(r,g,b,a) {
      if (a === undefined) { a = 1; }
      if ([r,g,b,a].filter(isNum).length !== 4) {
        throw new Error("Internal error: non-number in makeColor argList ", [r, g, b, a]);
      }
      return color.app(
        RUNTIME.wrap(r),
        RUNTIME.wrap(g),
        RUNTIME.wrap(b),
        // alpha may be passed in as a fixnum, so we coerce to rational
        RUNTIME.wrap(jsnums.fromFixnum(a)) 
      );
    };

    function clamp(num, min, max) {
      if (num < min) { return min; }
      else if (num > max) { return max; }
      else { return num; }
    }
    var isColor = function(c) { return unwrap(rawIsColor.app(c)); };
    var colorRed = function(c) { return clamp(jsnums.toFixnum(unwrap(gf(c, "red"))), 0, 255); }
    var colorGreen = function(c) { return clamp(jsnums.toFixnum(unwrap(gf(c, "green"))), 0, 255); }
    var colorBlue = function(c) { return clamp(jsnums.toFixnum(unwrap(gf(c, "blue"))), 0, 255); }
    var colorAlpha = function(c) { return clamp(jsnums.toFixnum(unwrap(gf(c, "alpha"))), 0, 1); }

    var annFillMode = imageTypes["FillMode"];
    var annXPlace = imageTypes["XPlace"];
    var annYPlace = imageTypes["YPlace"];
    var annFontFamily = imageTypes["FontFamily"];
    var annFontStyle = imageTypes["FontStyle"];
    var annFontWeight = imageTypes["FontWeight"];
    
    // Color database
    var ColorDb = function() {
      this.colors = {};
      this.colorNames = {};
    };

    ColorDb.prototype.put = function(name, color) {
      this.colors[name] = color;
      var str = // NOTE(ben): Not flooring the numbers here, because they will all be integers anyway
          colorRed(color) + ", " +
          colorGreen(color) + ", " +
          colorBlue(color) + ", " +
          colorAlpha(color);
      if (this.colorNames[str] === undefined) {
        this.colorNames[str] = name;
      }
    };

    ColorDb.prototype.get = function(name) {
      return this.colors[name.toString().toUpperCase()];
    };

    ColorDb.prototype.colorName = function colorName(colorStr) {
      var ans = this.colorNames[colorStr];
      if (ans !== undefined) ans = ans.toLowerCase();
      return ans;
    }

    // FIXME: update toString to handle the primitive field values.

    var colorDb = new ColorDb();
    var allImageFields = RUNTIME.getFields(gf(colorLib, "values"));
    for (var i = 0; i < allImageFields.length; i++) {
      var name = allImageFields[i];
      var val = gf(gf(colorLib, "values"), name);
      name = name.toUpperCase();
      if (isColor(val)) {
        colorDb.put(name, val);
        name = name.replace(/-/g, " ");
        colorDb.put(name, val);
        name = name.replace(/ /g, "");
        colorDb.put(name, val);
      }
    }

    // clone: object -> object
    // Copies an object.  The new object should respond like the old
    // object, including to things like instanceof.

    // NOTE(joe): There are much better ways to do this.  This is from
    // whalesong/whalesong/js-assembler/runtime-src/baselib.js
    // and we're keeping it for now (March 31, 2014) to avoid changing
    // potentially fragile prototype semantics
    var clone = function (obj) {
      var property;
      var C = function () {};
      C.prototype = obj;
      var c = new C();
      for (property in obj) {
        if (hasOwnProperty.call(obj, property)) {
          if (obj[property] instanceof DOMPoint) {
            c[property] = DOMPoint.fromPoint(obj[property]);
          } else {
            c[property] = obj[property];
          }
        }
      }
      return c;
    };
    var equals = RUNTIME.equal_always;

    var imageEquals = function(left, right) {
      if (!isImage(left) || !isImage(right)) { return false; }
      return left.equals(right);
    }
    var imageDifference = function(left, right) {
      if (!isImage(left) || !isImage(right)) { return false; }
      return left.difference(right);
    }
    //////////////////////////////////////////////////////////////////////

    var heir = Object.create;

    var isAngle = function(x) {
      return jsnums.isReal(x) &&
        jsnums.greaterThanOrEqual(x, 0, RUNTIME.NumberErrbacks) &&
        jsnums.lessThan(x, 360, RUNTIME.NumberErrbacks);
    };

    // Produces true if the value is a color or a color string.
    // On the Racket side of things, this is exposed as image-color?.
    var isColorOrColorString = function(thing) {
      return (isColor(thing) ||
              ((RUNTIME.isString(thing) &&
                typeof(colorDb.get(thing)) != 'undefined')));
    };

    //////////////////////////////////////////////////////////////////////
    // colorString : hexColor Style -> rgba
    // Style can be a number (0-1), "solid", "outline" or null
    // The above value which is non-number is equivalent to a number 255
    var colorString = function(aColor, aStyle) {
      var styleAlpha = isNaN(aStyle)? 1.0 : aStyle,
          cAlpha = colorAlpha(aColor);
      // NOTE(ben): Flooring the numbers here so that it's a valid RGBA style string
      return "rgba(" +  Math.floor(colorRed(aColor))   + ", " +
                        Math.floor(colorGreen(aColor)) + ", " +
                        Math.floor(colorBlue(aColor))  + ", " +
                        styleAlpha * cAlpha + ")";
    };

    function RGBtoLAB(r, g, b){
      function RGBtoXYZ(r, g, b){
         function process(v){
           v = parseFloat(v/255);
           return (v>0.04045? Math.pow( (v+0.055)/1.055, 2.4) : v/12.92) * 100;
         }
        var var_R = process(r), var_G = process(g), var_B = process(b);
        //Observer. = 2°, Illuminant = D65
        var X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805;
        var Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722;
        var Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505;
        return [X, Y, Z];
      }

      function XYZtoLAB(x, y, z){
        var var_X = x / 95.047;           //ref_X =  95.047   Observer= 2°, Illuminant= D65
        var var_Y = y / 100.000;          //ref_Y = 100.000
        var var_Z = z / 108.883;          //ref_Z = 108.883
        function process(v){ return v>0.008856? Math.pow(v, 1/3) : (7.787*v) + (16/116); }
        var_X = process(var_X); var_Y = process(var_Y); var_Z = process(var_Z);
        var CIE_L = ( 116 * var_Y ) - 16;
        var CIE_a = 500 * ( var_X - var_Y );
        var CIE_b = 200 * ( var_Y - var_Z );
        return [CIE_L, CIE_a, CIE_b];
      }
      var xyz = RGBtoXYZ(r,g,b), lab = XYZtoLAB(xyz[0],xyz[1],xyz[2]);
      return {l: lab[0], a: lab[1], b:lab[2]};
    }
    var colorLabs = [], colorRgbs = colorDb.colors;
    for (var p in colorRgbs) {
      if (colorRgbs.hasOwnProperty(p)) {
        // NOTE(ben): Not flooring numbers here, since RGBtoLAB supports float values
        var lab = RGBtoLAB(colorRed(colorRgbs[p]),
                           colorGreen(colorRgbs[p]),
                           colorBlue(colorRgbs[p]));
        colorLabs.push({name:p, l:lab.l, a:lab.a, b:lab.b});
      }
    }

    //////////////////////////////////////////////////////////////////////
    // colorToSpokenString : hexColor Style -> String
    // Describes the color using the nearest HTML color name
    // Style can be "solid" (1.0), "outline" (1.0), a number (0-1.0) or null (1.0)
    function colorToSpokenString(aColor, aStyle){
      if(aStyle===0) return " transparent ";
      // NOTE(ben): Not flooring numbers here, since RGBtoLAB supports float values
      var lab1 = RGBtoLAB(colorRed(aColor),
                          colorGreen(aColor),
                          colorBlue(aColor));
      var distances = colorLabs.map(function(lab2){
              return {l: lab2.l, a: lab2.a, b:lab2.b, name: lab2.name,
                      d: Math.sqrt(Math.pow(lab1.l-lab2.l,2)
                                   +Math.pow(lab1.a-lab2.a,2)
                                   +Math.pow(lab1.b-lab2.b,2))}});
      var distances = distances.sort(function(a,b){return a.d<b.d? -1 : a.d>b.d? 1 : 0 ;});
      var match = distances[0].name;
      var style = isNaN(aStyle)? (aStyle === "solid"? " solid" : "n outline") : " translucent ";
      return style + " " + match.toLowerCase();
    }


    var isSideCount = function(x) {
      return jsnums.isInteger(x) && jsnums.greaterThanOrEqual(x, 3, RUNTIME.NumberErrbacks);
    };

    var isStepCount = function(x) {
      return jsnums.isInteger(x) && jsnums.greaterThanOrEqual(x, 1, RUNTIME.NumberErrbacks);
    };

    var isPointsCount = function(x) {
      return jsnums.isInteger(x) && jsnums.greaterThanOrEqual(x, 2, RUNTIME.NumberErrbacks);
    };

    // Produces true if thing is an image-like object.
    var isImage = function(thing) {
      if (typeof(thing.getHeight) !== 'function')
        return false;
      if (typeof(thing.getWidth) !== 'function')
        return false;
      if (typeof(thing.getBaseline) !== 'function')
        return false;
      if (typeof(thing.centerPinhole) !== 'function')
        return false;
      if (typeof(thing.updatePinhole) !== 'function')
        return false;
      if (typeof(thing.offsetPinhole) !== 'function')
        return false;
      if (typeof(thing.render) !== 'function')
        return false;
      return true;
    };

    var checkImagePred = function(val) {
      return RUNTIME.isOpaque(val) && isImage(val.val);
    };
    var annImage = RUNTIME.makePrimitiveAnn("Image", checkImagePred);


    const imageBBs = new WeakMap();
    // Computes the tight bounding box of the given image.
    // Stores a weak-map cache of the bounding boxes, so that if an image goes away,
    // the bounding box does too.
    function getBB(img) {
      var bb = imageBBs.get(img);
      if (bb !== undefined) { return bb; }
      bb = img.computeBB(new DOMMatrix());
      imageBBs.set(img, bb);
      return bb;
    };
    
    // given two arrays of {x,y} structs, determine their equivalence
    var verticesEqual = function(v1, v2){
        if(v1.length !== v2.length){ return false; }
        var v1_str = v1.map(function(o){return "x:"+o.x+",y:"+o.y}).join(","),
            v2_str = v2.map(function(o){return "x:"+o.x+",y:"+o.y}).join(",");
        // v1 == rot(v2) if append(v1,v1) includes v2
        return (v1_str+","+v1_str).includes(v2_str);
    };

    // given an array of (x, y) pairs, unzip them into separate arrays
    var unzipVertices = function(vertices){
        return {xs: vertices.map(function(v) { return v.x }),
                ys: vertices.map(function(v) { return v.y })};
    };
    // given an array of vertices, find the width of the shape
    var findWidth = function(vertices){
        var xs = unzipVertices(vertices).xs;
        return Math.max.apply(Math, xs) - Math.min.apply(Math, xs);
    }
    // given an array of vertices, find the height of the shape
    var findHeight = function(vertices){
        var ys = unzipVertices(vertices).ys;
        return Math.max.apply(Math, ys) - Math.min.apply(Math, ys);
    }
    // given a list of vertices and a translationX/Y, shift them
    var translateVertices = function(vertices, translation) {
      var vs = unzipVertices(vertices);
      var translateX = -Math.min.apply( Math, vs.xs );
      var translateY = -Math.min.apply( Math, vs.ys );
      if (translation) {
        translation.x = translateX;
        translation.y = translateY;
      }
      return vertices.map(function(v) {
        return {x: v.x + translateX, y: v.y + translateY };
      })
    }

    function BoundingBox(topLeft, botRight) {
      this.topLeft = DOMPoint.fromPoint(topLeft);
      this.botRight = DOMPoint.fromPoint(botRight === undefined ? topLeft : botRight);
    };
    BoundingBox.prototype.getWidth = function() {
      return Math.round(Math.abs(this.botRight.x - this.topLeft.x));
    };
    BoundingBox.prototype.getHeight = function() {
      return Math.round(Math.abs(this.botRight.y - this.topLeft.y));
    };
    BoundingBox.prototype.getCenterX = function() {
      return (this.topLeft.x + this.botRight.x) / 2;
    };
    BoundingBox.prototype.getCenterY = function() {
      return (this.topLeft.y + this.botRight.y) / 2;
    };
    // Produces a new bounding box combining this and that
    BoundingBox.prototype.union = function(that) {
      return new BoundingBox(this.topLeft, this.botRight).merge(that);
    };
    // Expands this bounding box to include the given box
    BoundingBox.prototype.merge = function(that) {
      this.addPoint(that.topLeft);
      this.addPoint(that.botRight);
      return this;
    };
    // Expands this bounding box to include the given point
    BoundingBox.prototype.addPoint = function(pt) {
      this.topLeft.x = Math.min(this.topLeft.x, pt.x),
      this.topLeft.y = Math.min(this.topLeft.y, pt.y),
      this.botRight.x = Math.max(this.botRight.x, pt.x),
      this.botRight.y = Math.max(this.botRight.y, pt.y);
      return this;
    };
    // Translates its bounding box around its middle to produce a new bounding box
    BoundingBox.prototype.center = function() {
      var halfW = this.getWidth() / 2;
      var halfH = this.getHeight() / 2;
      return new BoundingBox(new DOMPoint(this.topLeft.x - halfW, this.topLeft.y - halfH),
                             new DOMPoint(this.botRight.x - halfW, this.botRight.y - halfH));
    };
    // Transforms this bounding box by the given transformation to produce a new bounding box
    BoundingBox.prototype.transform = function(tx) {
      return new BoundingBox(this.topLeft.matrixTransform(tx))
        .addPoint(this.botRight.matrixTransform(tx))
        .addPoint(new DOMPoint(this.topLeft.x, this.botRight.y).matrixTransform(tx))
        .addPoint(new DOMPoint(this.botRight.x, this.topLeft.y).matrixTransform(tx));
    };

    
    // Base class for all images.
    var BaseImage = function() {};

    BaseImage.prototype.computeBB = function(tx) {
      var topLeft = new DOMPoint(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      var botRight = new DOMPoint(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
      if (this.vertices === undefined) {
        topLeft.x = 0;
        topLeft.y = 0;
        botRight.x = 0;
        botRight.y = 0;
        return new BoundingBox(topLeft, botRight);
      } else {
        var ans = new BoundingBox(topLeft, botRight);
        // console.log("bb", JSON.stringify(ans));
        for (let v of this.vertices) {
          // console.log("v", v.toJSON(), "tx(v)", v.matrixTransform(tx).toJSON());
          ans.addPoint(v.matrixTransform(tx));
          // console.log("bb", JSON.stringify(ans));
        }
        return ans;
      }
    };
    
    BaseImage.prototype.updatePinhole = function(x, y) {
      var aCopy = clone(this);
      aCopy.pinhole = new DOMPoint(x, y);
      return aCopy;
    };

    BaseImage.prototype.offsetPinhole = function(dx, dy) {
      var aCopy = clone(this);
      aCopy.pinhole.x += dx;
      aCopy.pinhole.y += dy;
      return aCopy;
    };

    BaseImage.prototype.centerPinhole = function() {
      var aCopy = clone(this);
      var bb = this.computeBB(new DOMMatrix())
      aCopy.pinhole = new DOMPoint(bb.getCenterX(), bb.getCenterY());
      return aCopy;
    };

    BaseImage.prototype.getHeight = function(){
      return getBB(this).getHeight();
    };

    BaseImage.prototype.getWidth = function(){
      return getBB(this).getWidth();
    };

    BaseImage.prototype.getBaseline = function(){
      return this.alphaBaseline !== undefined ? this.alphaBaseline : Math.round(this.getHeight());
    };

    BaseImage.prototype.getPinholeX = function() {
      return this.pinhole !== undefined ? this.pinhole.x : 0;
    };

    BaseImage.prototype.getPinholeY = function() {
      return this.pinhole !== undefined ? this.pinhole.y : 0;
    };

    BaseImage.prototype.getCenterX = function() {
      return getBB(this).getCenterX();
    };

    BaseImage.prototype.getCenterY = function() {
      return getBB(this).getCenterY();
    };


    // render: context: -> void
    // Render the image in its local coordinate system
    // (i.e., (0,0) maps to the origin of the context)
    // If the image isn't vertex-based, throw an error
    // Otherwise, stroke and fill the vertices.
    BaseImage.prototype.render = function(ctx) {
      if(!this.vertices){
        throw new Error('BaseImage.render is not implemented for this type!');
      }
      
      ctx.save();
      ctx.beginPath();

      // we care about the stroke because drawing to a canvas is *different* for
      // fill v. stroke! If it's outline, we can draw on the pixel boundaries and
      // stroke within them. If it's stroke, we need to draw _inside_ those 
      // boundaries, adjusting by a half-pixel towards the center.
      var isSolid = this.style.toString().toLowerCase() !== "outline";

      var vertices;
      // pixel-perfect vertices fail on Chrome, and certain versions of FF,
      // so we disable the offset for equality tests and solid images
      if(ctx.isEqualityTest || isSolid){
          vertices = this.vertices;
      } else {
          // find the midpoint of the xs and ys from vertices
          var midX = 0, midY = 0;
          for (let v of this.vertices) {
            midX += v.x;
            midY += v.y;
          }
          midX /= 2;
          midY /= 2;

          // compute 0.5px offsets to ensure that we draw on the pixel
          // and not the pixel boundary
          vertices = this.vertices.map(function(v){
              return {x: v.x + (v.x < midX ? 0.5 : -0.5),
                      y: v.y + (v.y < midY ? 0.5 : -0.5)};
          });
      }

      ctx.moveTo( vertices[0].x, vertices[0].y );
      vertices.forEach(function(v) { ctx.lineTo( v.x, v.y); });
      ctx.closePath();

      if (isSolid) {
        ctx.fillStyle = colorString(this.color, this.style);
        ctx.fill();
      } else {
        ctx.strokeStyle = colorString(this.color);
        ctx.stroke();
      }
      ctx.restore();
    };

    // makeCanvas: number number -> canvas
    // Constructs a canvas object of a particular width and height.
    var makeCanvas = function(width, height) {
      var canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.style.width  = canvas.width  + "px";
      canvas.style.height = canvas.height + "px";
      return canvas;
    };

    // Images are expected to define a render() method, which is used
    // here to draw to the canvas.
    BaseImage.prototype.toDomNode = function(params) {
      var that = this;
      var width = that.getWidth();
      var height = that.getHeight();
      var canvas = makeCanvas(width, height);
      var ctx;

      // KLUDGE: on IE, the canvas rendering functions depend on a
      // context where the canvas is attached to the DOM tree.
      // We initialize an afterAttach hook; the client's responsible
      // for calling this after the dom node is attached to the
      // document.
      var onAfterAttach = function(event) {
        // jQuery(canvas).unbind('afterAttach', onAfterAttach);
        ctx = this.getContext("2d");
        if (false) { // DEBUG: Swap this to true to see the boundaries of the canvas
          ctx.save()
          ctx.fillStyle = "rgb(220,200,192)";
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
        ctx.translate(width / 2, height / 2); // move origin to center of canvas
        var bb = getBB(that);
        // move canvas origin such that bb's center is at canvas center
        ctx.translate(- bb.getCenterX(), - bb.getCenterY()); 
        that.render(ctx);
      };
      jQuery(canvas).bind('afterAttach', onAfterAttach);

      // Canvases lose their drawn content on cloning.  data may help us to preserve it.
      jQuery(canvas).data('toRender', onAfterAttach);
      // ARIA: use "image" as default text.
      canvas.ariaText = this.ariaText || "image";
      return canvas;
    };

    BaseImage.prototype.toWrittenString = function(cache) { return "<image>"; }
    BaseImage.prototype.toDisplayedString = function(cache) { return "<image>"; }

    /* Calculates the difference between two images, and returns it
       as a Pyret Either<String, Number>

       The difference is calculated from the formula at

       http://stackoverflow.com/questions/9136524/are-there-any-javascript-libs-to-pixel-compare-images-using-html5-canvas-or-any

       values in the low double digits indicate pretty similar images, in the
       low hundreds something is clearly off.
    */
    BaseImage.prototype.difference = function(other) {
      if(Math.floor(this.getWidth())    !== Math.floor(other.getWidth())    ||
         Math.floor(this.getHeight())   !== Math.floor(other.getHeight())){
        return RUNTIME.ffi.makeLeft("different-size([" + this.getWidth() + ", " + this.getHeight() + "], [" +
                  other.getWidth() + ", " + other.getHeight() + "])");
      }

      // http://stackoverflow.com/questions/9136524/are-there-any-javascript-libs-to-pixel-compare-images-using-html5-canvas-or-any
      function rmsDiff(data1,data2){
        var squares = 0;
        for(var i = 0; i<data1.length; i++){
            squares += (data1[i]-data2[i])*(data1[i]-data2[i]);
        }
        var rms = Math.sqrt(squares / data1.length);
        return rms;
      }

      // if it's something more sophisticated, render both images to canvases
      // First check canvas dimensions, then go pixel-by-pixel
      var c1 = this.toDomNode(), c2 = other.toDomNode();
      c1.style.visibility = c2.style.visibility = "hidden";
      var w1 = Math.floor(c1.width),
          h1 = Math.floor(c1.height),
          w2 = Math.floor(c2.width),
          h2 = Math.floor(c2.height);
      if(w1 !== w2 || h1 !== h2){
        return RUNTIME.makeLeft("different-size-dom([" + c1.width + ", " + c1.height + "], [" +
                  c2.width + ", " + c2.height + "])");
      }
      var ctx1 = c1.getContext('2d'), ctx2 = c2.getContext('2d');
      var bb1 = getBB(this), bb2 = getBB(other);
      ctx1.translate(w1 / 2, h1 / 2);
      ctx1.translate(- bb1.getCenterX(), - bb1.getCenterY());
      this.render(ctx1);
      ctx2.translate(w2 / 2, h2 / 2);
      ctx2.translate(- bb2.getCenterX(), - bb2.getCenterY());
      other.render(ctx2);
      try{
        var data1 = ctx1.getImageData(0, 0, w1, h1),
        data2 = ctx2.getImageData(0, 0, w2, h2);
        var pixels1 = data1.data,
            pixels2 = data2.data;
        var diff = rmsDiff(pixels1, pixels2);
        if (diff === Math.floor(diff)) {
          return RUNTIME.ffi.makeRight(jsnums.fromFixnum(diff, RUNTIME.NumberErrbacks));
        } else {
          return RUNTIME.ffi.makeRight(jsnums.makeRoughnum(diff, RUNTIME.NumberErrbacks));
        }
      } catch(e){
        // if we violate CORS, just bail
        return RUNTIME.ffi.makeLeft("exception: " + String(e));
      }
    };

    // Best-Guess equivalence for images. If they're vertex-based we're in luck,
    // otherwise we go pixel-by-pixel. It's up to exotic image types to provide
    // more efficient ways of comparing one another
    BaseImage.prototype.equals = function(other) {
      if(this.getWidth()    !== other.getWidth()    ||
         this.getHeight()   !== other.getHeight()){ return false; }
      // if they're both vertex-based images, all we need to compare are
      // their styles, vertices and color
      if(this.vertices && other.vertices){
        return (this.style    === other.style &&
                verticesEqual(this.vertices, other.vertices) &&
                equals(this.color, other.color));
      }
      // if it's something more sophisticated, render both images to canvases
      // First check canvas dimensions, then go pixel-by-pixel
      var c1 = this.toDomNode(), c2 = other.toDomNode();
      c1.style.visibility = c2.style.visibility = "hidden";
      if(c1.width !== c2.width || c1.height !== c2.height){ return false;}
      try{
        var ctx1 = c1.getContext('2d'), ctx2 = c2.getContext('2d');
        var bb1 = getBB(this), bb2 = getBB(other);
        ctx1.isEqualityTest = true;
        ctx1.translate(c1.width / 2, c1.height / 2);
        ctx1.translate(- bb1.getCenterX(), - bb1.getCenterY());
        ctx2.isEqualityTest = true;
        ctx2.translate(c2.width / 2, c2.height / 2);
        ctx2.translate(- bb2.getCenterX(), - bb2.getCenterY());
        this.render(ctx1); other.render(ctx2);
        // create temporary canvases
        var slice1 = document.createElement('canvas').getContext('2d'),
            slice2 = document.createElement('canvas').getContext('2d');
        var tileW = Math.min(10000, c1.width); // use only the largest tiles we need for these images
        var tileH = Math.min(10000, c1.height);
        for (var y=0; y < c1.height; y += tileH){
            for (var x=0; x < c1.width; x += tileW){
                tileW = Math.min(tileW, c1.width - x); // can we use smaller tiles for what's left?
                tileH = Math.min(tileH, c1.height- y);
                slice1.canvas.width  = slice2.canvas.width  = tileW;
                slice1.canvas.height = slice2.canvas.height = tileH;
                // console.log('processing chunk from ('+x+','+y+') to ('+(x+tileW)+','+(y+tileH)+')');
                slice1.clearRect(0, 0, tileW, tileH);
                slice1.drawImage(c1, x, y, tileW, tileH, 0, 0, tileW, tileH);
                slice2.clearRect(0, 0, tileW, tileH);
                slice2.drawImage(c2, x, y, tileW, tileH, 0, 0, tileW, tileH);
                var d1 = slice1.canvas.toDataURL(),
                    d2 = slice2.canvas.toDataURL(),
                    h1 = md5(d1),  h2 = md5(d2);
                if(h1 !== h2) return false;
            }
        }
      // Slow-path can fail with CORS or image-loading problems
      } catch(e){
        console.log('Couldn\'t compare images:', e);
        return false;
      }
      // if, after all this, we're still good...then they're equal!
      return true;
    };

    // isScene: any -> boolean
    // Produces true when x is a scene.
    var isScene = function(x) {
      return ((x != undefined) && (x != null) && (x instanceof SceneImage));
    };

    //////////////////////////////////////////////////////////////////////
    // SceneImage: primitive-number primitive-number (listof image) color -> Scene
    var SceneImage = function(width, height, children, withBorder, color) {
      BaseImage.call(this);
      this.width    = width;
      this.height   = height;
      this.children = children; // arrayof [image, number, number]
      this.withBorder = withBorder;
      this.color = color;
      this.pinhole = new DOMPoint(width / 2, height / 2);
      this.ariaText = " scene that is "+width+" by "+height+". children are: ";
      this.ariaText += children.map(function(c,i){
        return "child "+(i+1)+": "+c[0].ariaText+", positioned at "+c[1]+","+c[2]+" ";
      }).join(". ");
    };
    SceneImage.prototype = heir(BaseImage.prototype);
    SceneImage.prototype.computeBB = function(tx) {
      return new BoundingBox(new DOMPoint(0, 0), new DOMPoint(this.width, this.height)).transform(tx);
    };

    // add: image primitive-number primitive-number -> Scene
    SceneImage.prototype.add = function(anImage, x, y) {
      return new SceneImage(this.width,
                            this.height,
                            this.children.concat([[anImage,
                                                   x - anImage.getCenterX(),
                                                   y - anImage.getCenterY()]]),
                            this.withBorder,
                            this.color);
    };

    // render: 2d-context -> void
    SceneImage.prototype.render = function(ctx) {
      var childImage, childX, childY;
      // create a clipping region around the boundaries of the Scene
      ctx.save();
      ctx.fillStyle = colorString(this.color);
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
      // save the context, reset the path, and clip to the path around the scene edge
      ctx.save();
      //ctx.translate(-this.width / 2, -this.height / 2); // SceneImage coordinates are at the corner
      ctx.beginPath();
      ctx.rect(0, 0, this.width, this.height);
      ctx.clip();
      // Ask every object to render itself inside the region
      this.children.forEach(function(child) { 
        // then, render the child images
        childImage = child[0];
        childX = child[1];
        childY = child[2];
        ctx.save();
        ctx.translate(childX, childY);
        childImage.render(ctx);
        ctx.restore();
      });
      // unclip
      ctx.restore();

      if (this.withBorder) {
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, this.width, this.height);
      }
    };

    SceneImage.prototype.equals = function(other) {
        return (other instanceof SceneImage     &&
                this.width    == other.width    &&
                this.height   == other.height   &&
                this.color    == other.color    &&
                this.children.length == other.children.length && 
                this.children.every(function(child1, i) {
                    var child2 = other.children[i];
                    return (child1[1] == child2[1] &&
                            child1[2] == child2[2] &&
                            child1[0].equals(child2[0]));
                }))
            || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // FileImage: string node -> Image
    var FileImage = function(src, rawImage) {
      BaseImage.call(this);
      var self = this;
      this.src = src;
      this.isLoaded = false;
      this.ariaText = " image file from "+decodeURIComponent(src).slice(16);

      // animationHack: see installHackToSupportAnimatedGifs() for details.
      this.animationHackImg = undefined;

      if (rawImage && rawImage.complete) {
        this.img = rawImage;
        this.isLoaded = true;
        self.width = self.img.width;
        self.height = self.img.height;
        self.pinhole = new DOMPoint(self.width / 2, self.height / 2);
      } else {
        // fixme: we may want to do something blocking here for
        // onload, since we don't know at this time what the file size
        // should be, nor will drawImage do the right thing until the
        // file is loaded.
        this.img = new Image();
        this.img.onload = function() {
          self.isLoaded = true;
          self.width = self.img.width;
          self.height = self.img.height;
          self.pinhole = new DOMPoint(self.width / 2, self.height / 2);
        };
        this.img.onerror = function(e) {
          self.img.onerror = "";
          self.img.src = "http://www.wescheme.org/images/broken.png";
        }
        this.img.src = src;
      }
    }
    FileImage.prototype = heir(BaseImage.prototype);
    FileImage.prototype.computeBB = function(tx) {
      return new BoundingBox(new DOMPoint(0, 0), new DOMPoint(this.width, this.height)).transform(tx);
    };

    var imageCache = {};
    FileImage.makeInstance = function(path, rawImage) {
      if (! (path in imageCache)) {
        imageCache[path] = new FileImage(path, rawImage);
      }
      return imageCache[path];
    };

    FileImage.installInstance = function(path, rawImage) {
      imageCache[path] = new FileImage(path, rawImage);
    };

    FileImage.installBrokenImage = function(path) {
      imageCache[path] = new TextImage("Unable to load " + path, 10, colorDb.get("red"),
                                       "normal", "Optimer","","",false);
    };

    FileImage.prototype.render = function(ctx) {
      this.installHackToSupportAnimatedGifs();
      ctx.drawImage(this.animationHackImg, 0, 0);
    };

    // The following is a hack that we use to allow animated gifs to show
    // as animating on the canvas.
    FileImage.prototype.installHackToSupportAnimatedGifs = function() {
      if (this.animationHackImg) { return; }
      this.animationHackImg = this.img.cloneNode(true);
      document.body.appendChild(this.animationHackImg);
      this.animationHackImg.style.position = 'absolute';
      this.animationHackImg.style.top = '-50000px';
    };

    FileImage.prototype.getWidth = function() {
      return Math.round(this.img.width);
    };

    FileImage.prototype.getHeight = function() {
      return Math.round(this.img.height);
    };

    FileImage.prototype.equals = function(other) {
        return (other instanceof FileImage) && this.src === other.src
            || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // FileVideoe: String Node -> Video
    var FileVideo = function(src, rawVideo) {
      BaseImage.call(this);
      var self = this;
      this.src = src;
      this.ariaText = " video file from "+decodeURIComponent(src).slice(16);
      if (rawVideo) {
        this.video			= rawVideo;
        this.width			= self.video.videoWidth;
        this.height			= self.video.videoHeight;
        this.video.volume	= 1;
        this.video.poster	= "http://www.wescheme.org/images/broken.png";
        this.video.autoplay	= true;
        this.video.autobuffer=true;
        this.video.loop		= true;
        this.video.play();
      } else {
        // fixme: we may want to do something blocking here for
        // onload, since we don't know at this time what the file size
        // should be, nor will drawImage do the right thing until the
        // file is loaded.
        this.video = document.createElement('video');
        this.video.src = src;
        this.video.addEventListener('canplay', function() {
          this.width			= self.video.videoWidth;
          this.height			= self.video.videoHeight;
          this.video.poster	= "http://www.wescheme.org/images/broken.png";
          this.video.autoplay	= true;
          this.video.autobuffer=true;
          this.video.loop		= true;
          this.video.play();
        });
        this.video.addEventListener('error', function(e) {
          self.video.onerror = "";
          self.video.poster = "http://www.wescheme.org/images/broken.png";
        });
      }
    }
    FileVideo.prototype = heir(BaseImage.prototype);

    var videoCache = {};
    FileVideo.makeInstance = function(path, rawVideo) {
      if (! (path in FileVideo)) {
        videoCache[path] = new FileVideo(path, rawVideo);
      }
      return videoCache[path];
    };

    FileVideo.prototype.render = function(ctx) {
      ctx.drawImage(this.video, 0, 0);
    };
    FileVideo.prototype.equals = function(other) {
      return (other instanceof FileVideo) && (this.src === other.src);
    };

    //////////////////////////////////////////////////////////////////////
    // ImageDataImage: imageData -> image
    // Given an array of pixel data, create an image
    var ImageDataImage = function(imageData) {
      BaseImage.call(this);
      this.imageData= imageData;
      this.width    = imageData.width;
      this.height   = imageData.height;
      this.pinhole  = new DOMPoint(this.width / 2, this.height / 2);
    };

    ImageDataImage.prototype = heir(BaseImage.prototype);
    ImageDataImage.prototype.computeBB = function(tx) {
      return new BoundingBox(new DOMPoint(0, 0), new DOMPoint(this.width, this.height)).transform(tx);
    };

    ImageDataImage.prototype.render = function(ctx) {
      // Simply using putImageData on ctx would ignore the current transformation matrix,
      // so it wouldn't scale or rotate images.  This temp-drawing approach solves that.
      var tempCanvas = makeCanvas(this.width, this.height);
      tempCanvas.getContext("2d").putImageData(this.imageData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0);
    };

    //////////////////////////////////////////////////////////////////////
    // OverlayImage: Image1, XPlace1, YPlace1, OffsetX, OffsetY, Image2, XPlace2, YPlace2 -> Image
    // Creates an image that overlays img1 on top of the
    // other image img2, by aligning the given (x/y)-place of img1
    // with the given (x/y)-place of img2, and offseting by the given amount
    var OverlayImage = function(img1, placeX1, placeY1, offsetX, offsetY, img2, placeX2, placeY2) {
      BaseImage.call(this);

      // To find where to place the two images relative to one another
      // start in a coordinate system with origin at centers.
      var x1 = 0, y1 = 0, x2 = 0, y2 = 0;
      var anchor1, anchor2;
      
      // compute the x1/y1 and x2/y2 offsets, to translate the target points to a common origin
      switch(placeX1.toLowerCase()) {
      case "left": x1 += img1.getWidth() / 2; anchor1 = "-left"; break;
      case "middle": x1 -= 0; anchor1 = "-middle"; break;
      case "pinhole": x1 -= img1.getPinholeX(); anchor1 = "-pinhole"; break;
      case "right": x1 -= img1.getWidth() / 2; anchor1 = "-right"; break;
      default: throw new Error("Unknown XPlace option for image 1: " + placeX1);
      }
      switch(placeY1.toLowerCase()) {
      case "top": y1 += img1.getHeight() / 2; anchor1 = "top" + anchor1; break;
      case "center": y1 -= 0; anchor1 = "center" + anchor1; break;
      case "pinhole": y1 -= img1.getPinholeY(); anchor1 = "pinhole" + anchor1; break;
      case "baseline": y1 -= img1.getBaseline() - img1.getHeight() / 2; anchor1 = "baseline" + anchor1; break;
      case "bottom": y1 -= img1.getHeight() / 2; anchor1 = "bottom" + anchor1; break;
      default: throw new Error("Unknown YPlace option for image 1: " + placeY1);
      }
      switch(placeX2.toLowerCase()) {
      case "left": x2 += img2.getWidth() / 2; anchor2 = "-left"; break;
      case "middle": x2 -= 0; anchor2 = "-middle"; break;
      case "pinhole": x2 -= img2.getPinholeX(); anchor2 = "-pinhole"; break;
      case "right": x2 -= img2.getWidth() / 2; anchor2 = "-right"; break;
      default: throw new Error("Unknown XPlace option for image 2: " + placeX2);
      }
      switch(placeY2.toLowerCase()) {
      case "top": y2 += img2.getHeight() / 2; anchor2 = "top" + anchor2; break;
      case "center": y2 -= 0; anchor2 = "center" + anchor2; break;
      case "pinhole": y2 -= img2.getPinholeY(); anchor2 = "pinhole" + anchor2; break;
      case "baseline": y2 -= img2.getBaseline() - img2.getHeight() / 2; anchor2 = "baseline" + anchor2; break;
      case "bottom": y2 -= img2.getHeight() / 2; anchor2 = "bottom" + anchor2; break;
      default: throw new Error("Unknown YPlace option for image 2: " + placeY2);
      }

      /*
      // To find where to place the two images relative to one another
      // start in a coordinate system with origin at top/left corners
      var x1 = 0, y1 = 0, x2 = 0, y2 = 0;
      var anchor1, anchor2;
      
      // compute the x1/y1 and x2/y2 offsets, relative to the top/left of img1/img2:
      switch(placeX1.toLowerCase()) {
      case "left": x1 -= 0; anchor1 = "-left"; break;
      case "middle": x1 -= img1.getWidth() / 2; anchor1 = "-middle"; break;
      case "pinhole": x1 -= img1.getPinholeX(); anchor1 = "-pinhole"; break;
      case "right": x1 -= img1.getWidth(); anchor1 = "-right"; break;
      default: throw new Error("Unknown XPlace option for image 1: " + placeX1);
      }
      switch(placeY1.toLowerCase()) {
      case "top": y1 -= 0; anchor1 = "top" + anchor1; break;
      case "center": y1 -= img1.getHeight() / 2; anchor1 = "center" + anchor1; break;
      case "pinhole": y1 -= img1.getPinholeY(); anchor1 = "pinhole" + anchor1; break;
      case "baseline": y1 -= img1.getBaseline(); anchor1 = "baseline" + anchor1; break;
      case "bottom": y1 -= img1.getHeight(); anchor1 = "bottom" + anchor1; break;
      default: throw new Error("Unknown YPlace option for image 1: " + placeY1);
      }
      switch(placeX2.toLowerCase()) {
      case "left": x2 -= 0; anchor2 = "-left"; break;
      case "middle": x2 -= img2.getWidth() / 2; anchor2 = "-middle"; break;
      case "pinhole": x2 -= img2.getPinholeX(); anchor2 = "-pinhole"; break;
      case "right": x2 -= img2.getWidth(); anchor2 = "-right"; break;
      default: throw new Error("Unknown XPlace option for image 2: " + placeX2);
      }
      switch(placeY2.toLowerCase()) {
      case "top": y2 -= 0; anchor2 = "top" + anchor2; break;
      case "center": y2 -= img2.getHeight() / 2; anchor2 = "center" + anchor2; break;
      case "pinhole": y2 -= img2.getPinholeY(); anchor2 = "pinhole" + anchor2; break;
      case "baseline": y2 -= img2.getBaseline(); anchor2 = "baseline" + anchor2; break;
      case "bottom": y2 -= img2.getHeight(); anchor2 = "bottom" + anchor2; break;
      default: throw new Error("Unknown YPlace option for image 2: " + placeY2);
      }
      */
      
      // Next, offset x2/y2 by the given offsetX/Y
      x2 += offsetX; y2 += offsetY;

      var leftX   = Math.min((-img1.getWidth() / 2) + x1, (-img2.getWidth() / 2) + x2);
      var rightX  = Math.max(( img1.getWidth() / 2) + x1, ( img2.getWidth() / 2) + x2);
      var topY    = Math.min((-img1.getHeight() / 2) + y1, (-img2.getHeight() / 2) + y2);
      var bottomY = Math.max(( img1.getHeight() / 2) + y1, ( img2.getHeight() / 2) + y2);

      var centerX = (rightX + leftX) / 2;
      var centerY = (bottomY + topY) / 2;


      x1 -= centerX; x2 -= centerX;
      y1 -= centerY; y2 -= centerY;
      
      // // Translate both offset pairs by the smaller of the half-dimensions
      // var xMax = Math.max(img1.getWidth(), img2.getWidth());
      // var yMax = Math.max(img1.getHeight(), img2.getHeight());
      // x1 += xMax; x2 += xMax;
      // y1 += yMax; y2 += yMax;

      // // Last, translate both offset pairs so that none are negative
      // var xMin = Math.min(x1, x2)
      // var yMin = Math.min(y1, y2)
      // x1 -= xMin; x2 -= xMin;
      // y1 -= yMin; y2 -= yMin;

      // store the offsets for rendering
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.img1 = img1;
      this.img2 = img2;
      this.pinhole = new DOMPoint(img1.getPinholeX() + x1, img1.getPinholeY() + y1); // TODO(Ben): +x1/y1?
      this.alphaBaseline = img1.alphaBaseline ? img1.getBaseline() + y1 : img2.getBaseline() + y2;
      // console.log("Baseline1: " + img1.alphaBaseline + ", Baseline2: " + img2.alphaBaseline + " ==> " + this.alphaBaseline);
      var shiftText = "";
      if (offsetX > 0) { shiftText += "shifted right by " + offsetX; }
      else if (offsetX < 0) { shiftText == "shifted left by " + (-offsetX); }
      if (shiftText !== "") { shiftText += ", and "; }
      if (offsetY > 0) { shiftText += "shifted up by " + offsetX; }
      else if (offsetX < 0) { shiftText += "shifted down by " + (-offsetX); }
      if (shiftText !== "") { shiftText = ", and " + shiftText; }
      this.ariaText = " an overlay: first image is " + img1.ariaText + ", second image is " + img2.ariaText + ", aligning " + anchor1 + " of first image with " + anchor2 + " of second image" + shiftText;
    };

    OverlayImage.prototype = heir(BaseImage.prototype);
    OverlayImage.prototype.computeBB = function(tx) {
      var bb1 = this.img1.computeBB(tx.translate(this.x1, this.y1));
      var bb2 = this.img2.computeBB(tx.translate(this.x2, this.y2));
      // console.log("Img1: ", this.x1, this.y1, JSON.stringify(bb1));
      // console.log("Img2: ", this.x2, this.y2, JSON.stringify(bb2));
      // console.log("Merged: ", JSON.stringify(bb1.union(bb2)));
      return bb1.merge(bb2);
    };

    OverlayImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.translate(this.x2, this.y2);
      this.img2.render(ctx);
      ctx.restore();
      ctx.save();
      ctx.translate(this.x1, this.y1);
      this.img1.render(ctx);
      ctx.restore();
    };

    OverlayImage.prototype.equals = function(other) {
      return (other instanceof OverlayImage     &&
              this.x1        === other.x1       &&
              this.y1        === other.y1       &&
              this.x2        === other.x2       &&
              this.y2        === other.y2       &&
              imageEquals(this.img1, other.img1) &&
              imageEquals(this.img2, other.img2) )
            || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // rotate: angle image -> image
    // Rotates image by angle degrees in a counter-clockwise direction.
    // TODO: special case for ellipse?
    var RotateImage = function(angle, img) {
      BaseImage.call(this);
      // optimization for trying to rotate a circle
      if((img instanceof EllipseImage) && (img.width == img.height)){
          angle = 0;
      }
      this.img        = img;
      this.angle      = Math.round(angle);
      this.pinhole    = DOMPoint.fromPoint(img.pinhole).matrixTransform(new DOMMatrix().rotate(this.angle));
      this.ariaText   = "Rotated image, "+(-1 * angle)+" degrees: "+img.ariaText;
    };

    RotateImage.prototype = heir(BaseImage.prototype);
    RotateImage.prototype.computeBB = function(tx) {
      return this.img.computeBB(tx.rotate(this.angle));
    };

    // translate the canvas using the calculated values, then rotate as needed.
    RotateImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.rotate(this.angle * Math.PI / 180);
      this.img.render(ctx);
      ctx.restore();
    };

    RotateImage.prototype.equals = function(other) {
      return (other instanceof RotateImage          &&
              this.angle     === other.angle        &&
              this.getPinholeX()  === other.getPinholeX()     &&
              this.getPinholeY()  === other.getPinholeY()     &&
              imageEquals(this.img, other.img) )
            || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // ScaleImage: factor factor image -> image
    // Scale an image
    var ScaleImage = function(xFactor, yFactor, img) {
      BaseImage.call(this);
      this.img      = img;
      this.scaleX   = xFactor;
      this.scaleY   = yFactor;
      this.pinhole  = DOMPoint.fromPoint(img.pinhole);
      this.ariaText = "Scaled Image, "+ (xFactor===yFactor? "by "+xFactor
        : "horizontally by "+xFactor+" and vertically by "+yFactor)+". "+img.ariaText;
    };

    ScaleImage.prototype = heir(BaseImage.prototype);
    ScaleImage.prototype.computeBB = function(tx) {
      return this.img.computeBB(tx.scale(this.scaleX, this.scaleY));
    };

    // scale the context, and pass it to the image's render function
    ScaleImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.scale(this.scaleX, this.scaleY);
      this.img.render(ctx);
      ctx.restore();
    };

    ScaleImage.prototype.equals = function(other) {
      return (other instanceof ScaleImage       &&
              this.scaleX   === other.scaleX  &&
              this.scaleY   === other.scaleY  &&
              this.getPinholeX()  === other.getPinholeX()     &&
              this.getPinholeY()  === other.getPinholeY()     &&
              imageEquals(this.img, other.img) )
            || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // CropImage: startX startY width height image -> image
    // Crop an image
    var CropImage = function(x, y, width, height, img) {
      BaseImage.call(this);
      this.x          = x;
      this.y          = y;
      this.width      = width;
      this.height     = height;
      this.img        = img;
      if (img.getPinholeX() >= x && img.getPinholeX() <= x + width &&
          img.getPinholeY() >= y && img.getPinholeY() <= y + height) {
        this.pinhole = new DOMPoint(img.getPinholeX() - x, img.getPinholeY() - y);
      } else {
        this.pinhole   = new DOMPoint(width / 2, height / 2);
      }
      this.ariaText = "Cropped image, from "+x+", "+y+" to "+(x+width)+", "+(y+height)+": "+img.ariaText;
    };

    CropImage.prototype = heir(BaseImage.prototype);
    CropImage.prototype.computeBB = function(tx) {
      return new BoundingBox(new DOMPoint(0, 0), new DOMPoint(this.width, this.height)).center().transform(tx);
    };

    CropImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, this.width, this.height);
      ctx.clip();
      ctx.translate(-this.x, -this.y);
      this.img.render(ctx);
      ctx.restore();
    };

    CropImage.prototype.equals = function(other) {
        return (other instanceof CropImage      &&
                this.width     === other.width  &&
                this.height    === other.height &&
                this.x         === other.x      &&
                this.y         === other.y      &&
                imageEquals(this.img, other.img) )
            || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // FrameImage: image -> image
    // Stick a frame around the image
    var FrameImage = function(img) {
      BaseImage.call(this);
      this.img        = img;
      this.pinhole    = DOMPoint.fromPoint(img.pinhole);
      this.ariaText = " Framed image: "+img.ariaText;
      this.alphaBaseline = img.alphaBaseline;
    };

    FrameImage.prototype = heir(BaseImage.prototype);
    FrameImage.prototype.computeBB = function(tx) {
      // The frame needs to be entirely contained in the resulting image
      return getBB(this.img).transform(tx);
    };

    // scale the context, and pass it to the image's render function
    FrameImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.save();
      this.img.render(ctx);
      ctx.restore();
      ctx.beginPath();
      ctx.strokeStyle = "black";
      var bb = getBB(this.img);
      // console.log(JSON.stringify(bb));
      ctx.strokeRect(bb.topLeft.x, bb.topLeft.y, bb.botRight.x - bb.topLeft.x, bb.botRight.y - bb.topLeft.y);
      ctx.closePath();
      ctx.restore();
    };

    FrameImage.prototype.equals = function(other) {
      return (other instanceof FrameImage &&
             BaseImage.prototype.equals.call(this, other) )
          || imageEquals(this.img, other.img);
    };

    //////////////////////////////////////////////////////////////////////
    // PinholeImage: image -> image
    // Draw a small mark at the pinhole of the image
    var PinholeImage = function(img) {
      BaseImage.call(this);
      this.img        = img;
      this.width      = img.width;
      this.height     = img.height;
      this.pinhole    = DOMPoint.fromPoint(img.pinhole);
      this.ariaText = " Pinhole image: "+img.ariaText;
    };

    PinholeImage.prototype = heir(BaseImage.prototype);
    PinholeImage.prototype.computeBB = function(tx) { return this.img.computeBB(tx); }

    // scale the context, and pass it to the image's render function
    PinholeImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.save();
      this.img.render(ctx);
      ctx.restore();
      ctx.beginPath();
      ctx.strokeStyle = "black"; ctx.lineWidth = 1.5;
      ctx.moveTo(this.getPinholeX() - 5, this.getPinholeY());
      ctx.lineTo(this.getPinholeX() + 5, this.getPinholeY());
      ctx.moveTo(this.getPinholeX(), this.getPinholeY() - 5);
      ctx.lineTo(this.getPinholeX(), this.getPinholeY() + 5);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = "white"; ctx.lineWidth = 0.75;
      ctx.moveTo(this.getPinholeX() - 5, this.getPinholeY());
      ctx.lineTo(this.getPinholeX() + 5, this.getPinholeY());
      ctx.moveTo(this.getPinholeX(), this.getPinholeY() - 5);
      ctx.lineTo(this.getPinholeX(), this.getPinholeY() + 5);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    };

    PinholeImage.prototype.equals = function(other) {
      return (other instanceof PinholeImage &&
             BaseImage.prototype.equals.call(this, other) )
          || imageEquals(this.img, other.img);
    };

    //////////////////////////////////////////////////////////////////////
    // FlipImage: image string -> image
    // Flip an image either horizontally or vertically
    var FlipImage = function(img, direction) {
      BaseImage.call(this);
      this.img        = img;
      this.direction  = direction;
      if (direction === "horizontal") {
        this.pinhole  = new DOMPoint(-img.getPinholeX(), img.getPinholeY());
      } else {
        this.pinhole  = new DOMPoint(img.getPinholeX(), -img.getPinholeY());
      }
      this.ariaText   = direction+"ly flipped image: " + img.ariaText;
    };

    FlipImage.prototype = heir(BaseImage.prototype);
    FlipImage.prototype.computeBB = function(tx) {
      if (this.direction === "horizontal") {
        return this.img.computeBB(tx.flipX());
      } else {
        return this.img.computeBB(tx.flipY());
      }
    };

    FlipImage.prototype.render = function(ctx) {
      // when flipping an image of dimension M across an axis,
      // we need to translate the canvas by M in the opposite direction
      ctx.save();
      if(this.direction === "horizontal"){
        ctx.scale(-1, 1);
        //ctx.translate(-(this.width), 0);
        this.img.render(ctx);
      }
      if (this.direction === "vertical"){
        ctx.scale(1, -1);
        //ctx.translate(0, -(this.height));
        this.img.render(ctx);
      }
      ctx.restore();
    };

    FlipImage.prototype.equals = function(other) {
      return (other instanceof FlipImage         &&
              this.direction === other.direction &&
              imageEquals(this.img, other.img) ) 
            || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // RectangleImage: Number Number Mode Color -> Image
    var RectangleImage = function(width, height, style, color) {
      BaseImage.call(this);
      this.width  = width;
      this.height = height;
      this.style  = style;
      this.color  = color;
      this.vertices = [new DOMPoint(-width/2,height/2),
                       new DOMPoint(-width/2,-height/2),
                       new DOMPoint(width/2,-height/2),
                       new DOMPoint(width/2,height/2)];
      this.pinhole = new DOMPoint(0, 0);
      this.ariaText = " a" + colorToSpokenString(color,style) + ((width===height)? " square of size "+width
          : " rectangle of width "+width+" and height "+height);
    };
    RectangleImage.prototype = heir(BaseImage.prototype);
    RectangleImage.prototype.computeBB = function(tx) {
      return new BoundingBox(new DOMPoint(0, 0), new DOMPoint(this.width, this.height)).center().transform(tx);
    };

    //////////////////////////////////////////////////////////////////////
    // RhombusImage: Number Number Mode Color -> Image
    var RhombusImage = function(side, angle, style, color) {
      BaseImage.call(this);
      // sin(angle/2-in-radians) * side = half of base
      // cos(angle/2-in-radians) * side = half of height
      this.width  = Math.sin(angle/2 * Math.PI / 180) * side * 2;
      this.height = Math.abs(Math.cos(angle/2 * Math.PI / 180)) * side * 2;
      this.style  = style;
      this.color  = color;
      this.vertices = [new DOMPoint(this.width/2, 0),
                       new DOMPoint(this.width,   this.height/2),
                       new DOMPoint(this.width/2, this.height),
                       new DOMPoint(0,            this.height/2)];
      this.pinhole  = new DOMPoint(this.width / 2, this.height / 2);
      this.ariaText = " a"+colorToSpokenString(color,style) + " rhombus of size "+side+" and angle "+angle;
    };
    RhombusImage.prototype = heir(BaseImage.prototype);

    //////////////////////////////////////////////////////////////////////
    // RegularPolygonImage: Number Count Step Mode Color -> Image
    //
    // See http://www.algebra.com/algebra/homework/Polygons/Inscribed-and-circumscribed-polygons.lesson
    // the polygon is inscribed in a circle, whose radius is length/2sin(pi/count)
    // another circle is inscribed in the polygon, whose radius is length/2tan(pi/count)
    // RegularPolygons are drawn to keep their bottoms flat.
    // Stars are drawn to keep the points at top.
    // (so an even-sided star would be rotated from an even-sided polygon)
    var RegularPolygonImage = function(length, count, step, style, color, flatBottom) {
      BaseImage.call(this);
      this.outerRadius = Math.round(length/(2*Math.sin(Math.PI/count)));
      var adjust = (Math.PI/2); // rotate 1/4 turn, with y pointing down
      if (flatBottom && ((count % 2) == 0)) adjust += Math.PI/count;

      // rotate around outer circle, storing x and y coordinates
      var radians = 0, vertices = [];
      var numComponents = jsnums.gcd(count, [step], RUNTIME.NumberErrbacks);
      var pointsPerComponent = count / numComponents;
      var angle = (2*Math.PI/count);
      for (var curComp = 0; curComp < numComponents; curComp++) {
        radians = curComp * angle;
        for(var i = 0; i < pointsPerComponent; i++) {
          radians = radians + (step * angle);
          vertices.push(new DOMPoint(Math.round(this.outerRadius*Math.cos(radians-adjust)),
                                     Math.round(this.outerRadius*Math.sin(radians-adjust))));
        }
      }
      this.style      = style;
      this.color      = color;
      this.vertices = vertices;
      this._vertices = [];
      for (var curComp = 0; curComp < numComponents; curComp++) {
        var component = [];
        for (var point = 0; point < pointsPerComponent; point++) {
          // grab the translated point from the vertices array
          component.push(this.vertices[(curComp * pointsPerComponent) + point]);
        }
        this._vertices.push(component);
      }
      this.pinhole = new DOMPoint(0, 0);
      for (var v = 0; v < this.vertices.length; v++) {
        this.pinhole.x += this.vertices[v].x;
        this.pinhole.y += this.vertices[v].y;
      }
      this.pinhole.x /= this.vertices.length;
      this.pinhole.y /= this.vertices.length;
      this.ariaText = " a"+colorToSpokenString(color,style) + ", "+count
                      +" sided polygon with each side of length "+length;
    };

    RegularPolygonImage.prototype = heir(BaseImage.prototype);
    RegularPolygonImage.prototype.render = function(ctx) {
      var actualVertices = this.vertices;
      for (var i = 0; i < this._vertices.length; i++) {
        this.vertices = this._vertices[i];
        BaseImage.prototype.render.call(this, ctx);
      }
      this.vertices = actualVertices;
    }

    // For point-polygon images, positive-y points *upward*, by request
    var PointPolygonImage = function(vertices, style, color) {
      BaseImage.call(this);
      var totX = 0, totY = 0;
      this.vertices = [];
      for (var v = 0; v < vertices.length; v++) {
        var x = jsnums.toFixnum(vertices[v].x);
        totX += x;
        var y = -1 * jsnums.toFixnum(vertices[v].y);
        totY += y;
        this.vertices[v] = new DOMPoint(x, y);
      }
      totX /= vertices.length;
      totY /= vertices.length;
      for (var v = 0; v < vertices.length; v++) {
        this.vertices[v].x -= totX;
        this.vertices[v].y -= totY;
      }
      
      this.style      = style;
      this.color      = color;
      this.pinhole = new DOMPoint(0, 0);
      this.ariaText = " a"+colorToSpokenString(color,style) + ", polygon with "+vertices.length+" points";
    };
    PointPolygonImage.prototype = heir(BaseImage.prototype);
    

    // We don't trust ctx.measureText, since (a) it's buggy and (b) it doesn't measure height
    // based off of https://stackoverflow.com/a/9847841/783424,
    // and originally the amazing work at http://mudcu.be/journal/2011/01/html5-typographic-metrics/#baselineCanvas
    // PENDING CANVAS V5 API: http://www.whatwg.org/specs/web-apps/current-work/#textmetrics
    // Since this relies on offsetTop, which are rounded up to the nearest integer,
    // it's only good to within +-2px.
    var ua = "", baselineFudge = 0;
    if (window.navigator && window.navigator.userAgent) {
      ua = window.navigator.userAgent;
    }
    if (ua.indexOf("Firefox") !== -1) {
      baselineFudge = 2;
    }
    var getTextDimensions = function(str, font) {
      var text = document.createElement("span");
      text.textContent = str;
      text.style.font = font;
      text.style.whiteSpace = "pre";
      text.style.margin = "0"; text.style.padding = "0";
      var block = document.createElement("div");
      block.style.display = "inline-block";
      block.style.width = 1; block.style.height = 0;
      block.style.margin = "0"; block.style.padding = "0";      
      var div = document.createElement("div");
      div.style.margin = "0"; div.style.padding = "0";
      div.append(text, block);
      var body = document.body;
      body.append(div);
      var result = {};
      try {
        block.style.verticalAlign = 'baseline';
        result.width = text.offsetWidth;
        result.ascent = block.offsetTop - text.offsetTop;

        block.style.verticalAlign = 'bottom';
        result.height = block.offsetTop - text.offsetTop;

        result.descent = result.height - result.ascent;
      } finally {
        body.removeChild(div);
      }

      return result;
    };
    //////////////////////////////////////////////////////////////////////
    // TextImage: String Number Color String String String String any/c -> Image
    var TextImage = function(str, size, color, face, family, style, weight, underline) {
      BaseImage.call(this);
      this.str        = str;
      this.size       = size;   // 18
      this.color      = color;  // red
      this.face       = face;   // Gill Sans
      this.family     = family; // 'swiss
      this.style      = (style === "slant")? "oblique" : style;  // Racket's "slant" -> CSS's "oblique"
      this.weight     = (weight=== "light")? "lighter" : weight; // Racket's "light" -> CSS's "lighter"
      this.underline  = underline;
      // NOTE: we *ignore* font-family, as it causes a number of font bugs due the browser inconsistencies
      // example: "bold italic 20px 'Times', sans-serif".
      // Default weight is "normal", face is "Arial"
      this.font = this.style !== false ? this.style + " " : "";
      this.font += this.weight !== false ? this.weight + " " : "normal ";
      this.font += this.size !== false ? this.size + "px " : "";
      this.font += '"' + (this.face !== false ? this.face : "Arial") + '" ';
      this.font += this.family !== false ? ", " + this.family : "";

      var metrics = getTextDimensions(str, this.font);
      this.width       = metrics.width;
      this.height      = metrics.height;
      // we measure coordinates from the *top* of the image, and getTextDimensions seems to be off by a bit
      this.alphaBaseline = metrics.ascent + baselineFudge;
      this.pinhole     = new DOMPoint(0, this.alphaBaseline - this.height / 2);

      this.ariaText = " the string "+str+", colored "+colorToSpokenString(color,'solid')+" of size "+ size;
    };
    TextImage.prototype = heir(BaseImage.prototype);
    TextImage.prototype.computeBB = function(tx) {
      return new BoundingBox(new DOMPoint(0, 0), new DOMPoint(this.width, this.height)).center().transform(tx);
    };

    TextImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.textAlign   = 'left';
      ctx.textBaseline= 'alphabetic'; // Note: NOT top, so that we can support accented characters
      ctx.font        = this.font;

      // if 'outline' is enabled, use strokeText. Otherwise use fillText
      ctx.fillStyle = this.outline? 'white' : colorString(this.color);
      ctx.translate(-this.width / 2, -this.height / 2);
      ctx.fillText(this.str, 0, this.alphaBaseline - 1); // handle the baseline offset here
      if(this.outline){
        ctx.strokeStyle = colorString(this.color);
        ctx.strokeText(this.str, 0, this.alphaBaseline - 1);
      }
      if(this.underline){
          ctx.beginPath();
          ctx.moveTo(0, this.size);
          // we use this.size, as it is more accurate for underlining than this.height
          ctx.lineTo(this.width, this.size);
          ctx.closePath();
          ctx.strokeStyle = colorString(this.color);
          ctx.stroke();
      }
      ctx.restore();
    };

    TextImage.prototype.getBaseline = function() {
      return this.alphaBaseline;
    };

    TextImage.prototype.equals = function(other) {
      return (other instanceof TextImage        &&
              this.str      === other.str       &&
              this.size     === other.size      &&
              this.face     === other.face      &&
              this.family   === other.family    &&
              this.style    === other.style     &&
              this.weight   === other.weight    &&
              this.font     === other.font      &&
              this.underline === other.underline &&
              equals(this.color, other.color))
            || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // StarImage: fixnum fixnum fixnum color -> image
    // Most of this code here adapted from the Canvas tutorial at:
    // http://developer.apple.com/safari/articles/makinggraphicswithcanvas.html
    var StarImage = function(points, outer, inner, style, color) {
      BaseImage.call(this);
      var maxRadius = Math.max(inner, outer);
      var vertices  = [];

      var oneDegreeAsRadian = Math.PI / 180;
      for(var pt = 0; pt < (points * 2) + 1; pt++ ) {
        var rads = ( ( 360 / (2 * points) ) * pt ) * oneDegreeAsRadian - 0.5;
        var whichRadius = ( pt % 2 === 1 ) ? outer : inner;
        vertices.push(new DOMPoint(maxRadius + ( Math.sin( rads ) * whichRadius ),
                                   maxRadius + ( Math.cos( rads ) * whichRadius )) );
      }
      // calculate width and height of the bounding box
      this.style      = style;
      this.color      = color;
      this.vertices   = vertices;
      this.pinhole  = new DOMPoint(0, 0);
      this.ariaText   = " a" + colorToSpokenString(color,style) + ", " + points +
                        "pointed star with inner radius "+inner+" and outer radius "+outer;
    };

    StarImage.prototype = heir(BaseImage.prototype);

    /////////////////////////////////////////////////////////////////////
    //TriangleImage: Number Number Number Mode Color -> Image
    // Draws a triangle with the base = sideC, and the angle between sideC
    // and sideB being angleA
    // See http://docs.racket-lang.org/teachpack/2htdpimage.html#(def._((lib._2htdp/image..rkt)._triangle))
    var TriangleImage = function(sideC, angleA, sideB, style, color) {
      BaseImage.call(this);
      var thirdX = sideB * Math.cos(angleA * Math.PI/180);
      var thirdY = sideB * Math.sin(angleA * Math.PI/180);
      var offsetX = 0 - Math.min(0, thirdX); // angleA could be obtuse

      var vertices = [];
      // if angle < 180 start at the top of the canvas, otherwise start at the bottom
      if(thirdY > 0){
        vertices.push(new DOMPoint(offsetX + 0, 0));
        vertices.push(new DOMPoint(offsetX + sideC, 0));
        vertices.push(new DOMPoint(offsetX + thirdX, thirdY));
      } else {
        vertices.push(new DOMPoint(offsetX + 0, -thirdY));
        vertices.push(new DOMPoint(offsetX + sideC, -thirdY));
        vertices.push(new DOMPoint(offsetX + thirdX, 0));
      }

      this.style = style;
      this.color = color;
      this.vertices = vertices;
      var left = Math.min(vertices[0].x, vertices[1].x, vertices[2].x);
      var right = Math.max(vertices[0].x, vertices[1].x, vertices[2].x);
      var top = Math.min(vertices[0].y, vertices[1].y, vertices[2].y);
      var bot = Math.max(vertices[0].y, vertices[1].y, vertices[2].y);
      var centerX = (left + right) / 2;
      var centerY = (top + bot) / 2;
      // pinhole is set to centroid (or barycenter): average of three corners
      this.pinhole = new DOMPoint((vertices[0].x + vertices[1].x + vertices[2].x) / 3 - centerX,
                                  (vertices[0].y + vertices[1].y + vertices[2].y) / 3 - centerY);
      for (var i = 0; i < vertices.length; i++) {
        vertices[i].x -= centerX;
        vertices[i].y -= centerY;
      }
      this.ariaText = " a"+colorToSpokenString(color,style) + " triangle whose base is of length "+sideC
          +", with an angle of " + (angleA%180) + " degrees between it and a side of length "+sideB;
    };
    TriangleImage.prototype = heir(BaseImage.prototype);

    //////////////////////////////////////////////////////////////////////
    //Ellipse : Number Number Mode Color -> Image
    var EllipseImage = function(width, height, style, color) {
      BaseImage.call(this);
      this.width = width;
      this.height = height;
      this.style = style;
      this.color = color;
      this.pinhole = new DOMPoint(0, 0);
      this.ariaText = " a"+colorToSpokenString(color,style) + ((width===height)? " circle of radius "+(width/2)
            : " ellipse of width "+width+" and height "+height);
    };

    EllipseImage.prototype = heir(BaseImage.prototype);
    EllipseImage.prototype.computeBB = function(tx) {
      // From
      // https://stackoverflow.com/questions/24746834/calculating-an-aabb-for-a-transformed-ellipse
      var rx = this.width / 2.0;
      var ry = this.height / 2.0;

      // /M11 M21 0 M41\
      // |M12 M22 0 M42| Transform matrix format
      // |0   0   1  0 |
      // \0   0   0  1/
      var xOffset = Math.sqrt((Math.pow(tx.m11, 2) * Math.pow(rx, 2))
                              + (Math.pow(tx.m21, 2) * Math.pow(ry, 2)));
      var yOffset = Math.sqrt((Math.pow(tx.m12, 2) * Math.pow(rx, 2))
                              + (Math.pow(tx.m22, 2) * Math.pow(ry, 2)));

      var centerX = tx.m41; // Transform center of
      var centerY = tx.m42; // ellipse using M
      var xMin = centerX - xOffset;
      var xMax = centerX + xOffset;

      var yMin = centerY - yOffset;
      var yMax = centerY + yOffset;

      return new BoundingBox(new DOMPoint(xMin, yMin), new DOMPoint(xMax, yMax));
    };

    EllipseImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.beginPath();

      // // if it's a solid ellipse...
      var isSolid = this.style.toString().toLowerCase() !== "outline";
      var adjust = isSolid? 0 : 0.5;

      // var width = this.width - 2*adjust, height = this.height - 2*adjust;
      // var aX = adjust, aY = adjust;
      ctx.ellipse(0, 0, this.width / 2 - adjust, this.height / 2 - adjust, 0, 0, Math.PI * 2.0);

      // // Most of this code is taken from:
      // // http://webreflection.blogspot.com/2009/01/ellipse-and-circle-for-canvas-2d.html
      // var hB = (width  / 2) * 0.5522848,
      //     vB = (height / 2) * 0.5522848,
      //     eX = aX + width,
      //     eY = aY + height,
      //     mX = aX + width  / 2,
      //     mY = aY + height / 2;
      // ctx.moveTo(aX, mY);
      // ctx.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
      // ctx.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
      // ctx.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
      // ctx.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);

      // ctx.save();
      // // // ...account for the 1px border width
      // ctx.scale(this.width / 2 - adjust, this.height / 2 - adjust);
      // ctx.arc(0, 0, 1, 0, 2 * Math.PI);
      ctx.closePath();
      // ctx.restore();
      if (!isSolid) {
        ctx.strokeStyle = colorString(this.color);
        ctx.stroke();
      } else {
        ctx.fillStyle = colorString(this.color, this.style);
        ctx.fill();
      }

      ctx.restore();
    };

    EllipseImage.prototype.equals = function(other) {
      return ((other instanceof EllipseImage) &&
             this.width    === other.width &&
             this.height   === other.height &&
             this.style    === other.style &&
             equals(this.color, other.color))
      || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    //Wedge : Number Number Number Mode Color -> Image
    var WedgeImage = function(radius, angle, style, color) {
      BaseImage.call(this);
      this.radius = radius;
      this.angle = (angle % 360.0);
      this.style = style;
      this.color = color;
      this.pinhole = new DOMPoint(0, 0);
      this.offsetX = 0;
      this.offsetY = 0;
      this.pinhole.x = 0;
      this.pinhole.y = 0;
      this.ariaText = " a"+colorToSpokenString(color,style) + " wedge of angle "+angle;
    };

    WedgeImage.prototype = heir(BaseImage.prototype);
    WedgeImage.prototype.computeBB = function(tx) {
      var pt = new DOMPoint(this.radius, 0);
      var bb = new BoundingBox(new DOMPoint(0, 0).matrixTransform(tx));
      // when the tx is rotated, we can't just assume that the "obvious" extremeties at 90n degrees
      // are actually extremal: suppose the wedge is 30deg and the rotation is 75deg.  Then the
      // rotated start and end points of the wedge straddle 90 degrees, which is the actual y maximum.
      for (var i = 0; i < this.angle; i += 5) {
        bb.addPoint(pt.matrixTransform(tx.rotate(-i)));
      }
      bb.addPoint(pt.matrixTransform(tx.rotate(-this.angle)));
      // console.log("Final wedge bb", JSON.stringify(bb));
      return bb;
    };
    
    WedgeImage.prototype.render = function(ctx) {
      ctx.save();
      ctx.beginPath();

      // if it's a solid wedge...
      var isSolid = this.style.toString().toLowerCase() !== "outline";
      var adjust = isSolid? 0 : 0.5;
      // ...account for the 1px border width
      var aX = adjust, aY = adjust;

      //ctx.moveTo(aX + this.getPinholeX() - adjust, aY + this.getPinholeY() - adjust);
      ctx.save();
      ctx.scale(this.radius - adjust, this.radius - adjust)
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 1, 0, -this.angle * (Math.PI / 180), true);
      ctx.restore();
      ctx.closePath();
      if (this.style.toString().toLowerCase() === "outline") {
        ctx.strokeStyle = colorString(this.color);
        ctx.stroke();
      } else {
        ctx.fillStyle = colorString(this.color, this.style);
        ctx.fill();
      }

      ctx.restore();
    };

    WedgeImage.prototype.equals = function(other) {
      return ((other instanceof WedgeImage) &&
             this.radius  === other.radius &&
             this.angle   === other.angle &&
             this.style   === other.style &&
             equals(this.color, other.color))
      || BaseImage.prototype.equals.call(this, other);
    };

    //////////////////////////////////////////////////////////////////////
    // Line: Number Number Color -> Image
    var LineImage = function(x, y, color) {
      BaseImage.call(this);
      var vertices;
      if (x >= 0) {
        if (y >= 0) { vertices = [new DOMPoint(0, 0), new DOMPoint(x, y)]; }
        else        { vertices = [new DOMPoint(0, -y), new DOMPoint(x, 0)]; }
      } else {
        if (y >= 0) { vertices = [new DOMPoint(-x, 0), new DOMPoint(0, y)]; }
        else        { vertices = [new DOMPoint(-x, -y), new DOMPoint(0, 0)]; }
      }

      this.style  = "outline"; // all vertex-based images must have a style
      this.color  = color;
      this.vertices = vertices;
      this.pinhole = new DOMPoint(Math.abs(x) / 2, Math.abs(y) / 2);
      this.ariaText = " a" + colorToSpokenString(color,'solid') + " line of width "+x+" and height "+y;
      
    };

    LineImage.prototype = heir(BaseImage.prototype);

    var colorAtPosition = function(img, x, y) {
      var width = img.getWidth(),
      height = img.getHeight(),
      canvas = makeCanvas(width, height),
      ctx = canvas.getContext("2d"),
      r, g, b, a;
      img.render(ctx);
      imageData = ctx.getImageData(0, 0, width, height);
      data = imageData.data,
      index = (y * width + x) * 4;

      r = data[index]
      g = data[index + 1];
      b = data[index + 2];
      a = data[index + 3] / 255;

      return makeColor(r, g, b, a);
    }

    var imageToColorList = function(img) {
      var width = img.getWidth(),
      height = img.getHeight(),
      canvas = makeCanvas(width, height),
      ctx = canvas.getContext("2d"),
      imageData,
      data,
      i,
      r, g, b, a;
      img.render(ctx);
      imageData = ctx.getImageData(0, 0, width, height);
      data = imageData.data;
      var colors = [];
      for (i = 0 ; i < data.length; i += 4) {
        r = data[i];
        g = data[i+1];
        b = data[i+2];
        a = data[i+3] / 255;
        colors.push(makeColor(r, g, b, a));
      }
      return RUNTIME.ffi.makeList(colors);
    }

    var colorListToImage = function(listOfColors,
                                    width,
                                    height,
                                    pinholeX,
                                    pinholeY) {
      var canvas = makeCanvas(jsnums.toFixnum(width),
                              jsnums.toFixnum(height)),
      ctx = canvas.getContext("2d"),
      imageData = ctx.createImageData(jsnums.toFixnum(width),
                                      jsnums.toFixnum(height)),
      aColor,
      data = imageData.data,
      jsLOC = RUNTIME.ffi.toArray(listOfColors);
      for(var i = 0; i < jsLOC.length * 4; i += 4) {
        aColor = jsLOC[i / 4];
        // NOTE(ben): Flooring colors here to make this a proper RGBA image
        data[i] = Math.floor(colorRed(aColor));
        data[i+1] = Math.floor(colorGreen(aColor));
        data[i+2] = Math.floor(colorBlue(aColor));
        data[i+3] = colorAlpha(aColor) * 255;
      }

      var ans = makeImageDataImage(imageData);
      ans.pinholeX = pinholeX;
      ans.pinholeY = pinholeY;
      return ans;
    };

    var makeSceneImage = function(width, height, children, withBorder, color) {
      return new SceneImage(width, height, children, withBorder, color);
    };
    var makeCircleImage = function(radius, style, color) {
      return new EllipseImage(2*radius, 2*radius, style, color);
    };
    var makeStarImage = function(points, outer, inner, style, color) {
      return new StarImage(points, outer, inner, style, color);
    };
    var makeRectangleImage = function(width, height, style, color) {
      return new RectangleImage(width, height, style, color);
    };
    var makeRhombusImage = function(side, angle, style, color) {
      return new RhombusImage(side, angle, style, color);
    };
    var makeRegularPolygonImage = function(length, count, step, style, color, flatBottom) {
      return new RegularPolygonImage(length, count, step, style, color, flatBottom);
    };
    var makePointPolygonImage = function(length, count, step, style, color, flatBottom) {
      return new PointPolygonImage(length, count, step, style, color, flatBottom);
    };
    var makeSquareImage = function(length, style, color) {
      return new RectangleImage(length, length, style, color);
    };
    var makeTriangleImage = function(sideA, angleC, sideB, style, color) {
      return new TriangleImage(sideA, angleC, sideB, style, color);
    };
    var makeEllipseImage = function(width, height, style, color) {
      return new EllipseImage(width, height, style, color);
    };
    var makeWedgeImage = function(radius, angle, style, color) {
      return new WedgeImage(radius, angle, style, color);
    };
    var makeLineImage = function(x, y, color) {
      return new LineImage(x, y, color);
    };
    var makeOverlayImage = function(img1, x1, y1, offsetX, offsetY, img2, x2, y2) {
      return new OverlayImage(img1, x1, y1, offsetX, offsetY, img2, x2, y2);
    };
    var makeRotateImage = function(angle, img) {
      return new RotateImage(angle, img);
    };
    var makeScaleImage = function(xFactor, yFactor, img) {
      return new ScaleImage(xFactor, yFactor, img);
    };
    var makeCropImage = function(x, y, width, height, img) {
      return new CropImage(x, y, width, height, img);
    };
    var makeFrameImage = function(img) {
      return new FrameImage(img);
    };
    var makePinholeImage = function(img) {
      return new PinholeImage(img);
    }
    var makeFlipImage = function(img, direction) {
      return new FlipImage(img, direction);
    };
    var makeTextImage = function(str, size, color, face, family, style, weight, underline) {
      return new TextImage(str, size, color, face, family, style, weight, underline);
    };
    var makeImageDataImage = function(imageData) {
      return new ImageDataImage(imageData);
    };
    var makeFileImage = function(path, rawImage) {
      return FileImage.makeInstance(path, rawImage);
    };
    var makeFileVideo = function(path, rawVideo) {
      return FileVideo.makeInstance(path, rawVideo);
    };

    var isSceneImage = function(x) { return x instanceof SceneImage; };
    var isCircleImage = function(x) { return x instanceof EllipseImage &&
                                      x.width === x.height; };
    var isStarImage	= function(x) { return x instanceof StarImage; };
    var isRectangleImage=function(x) { return x instanceof RectangleImage; };
    var isRegularPolygonImage = function(x) { return x instanceof RegularPolygonImage; };
    var isPointPolygonImage = function(x) { return x instanceof PointPolygonImage; };
    var isRhombusImage = function(x) { return x instanceof RhombusImage; };
    var isSquareImage	= function(x) { return x instanceof SquareImage; };
    var isTriangleImage= function(x) { return x instanceof TriangleImage; };
    var isWedgeImage = function(x) { return x instanceof WedgeImage; };
    var isEllipseImage = function(x) { return x instanceof EllipseImage; };
    var isLineImage	= function(x) { return x instanceof LineImage; };
    var isOverlayImage = function(x) { return x instanceof OverlayImage; };
    var isRotateImage	= function(x) { return x instanceof RotateImage; };
    var isScaleImage	= function(x) { return x instanceof ScaleImage; };
    var isCropImage	= function(x) { return x instanceof CropImage; };
    var isFrameImage	= function(x) { return x instanceof FrameImage; };
    var isPinholeImage	= function(x) { return x instanceof PinholeImage; };
    var isFlipImage	= function(x) { return x instanceof FlipImage; };
    var isTextImage	= function(x) { return x instanceof TextImage; };
    var isFileImage	= function(x) { return x instanceof FileImage; };
    var isFileVideo	= function(x) { return x instanceof FileVideo; };

    ///////////////////////////////////////////////////////////////
    // Exports

    // These functions are available for direct access without the typechecks
    // of the Racket-exposed functions.
    return RUNTIME.makeModuleReturn({}, {
        Image: annImage
      },
      {
        Image: annImage,
        makeCanvas: makeCanvas,

        BaseImage: BaseImage,
        SceneImage: SceneImage,
        FileImage: FileImage,
        VideoImage: FileVideo,
        OverlayImage: OverlayImage,
        RotateImage: RotateImage,
        ScaleImage: ScaleImage,
        CropImage: CropImage,
        FrameImage: FrameImage,
        PinholeImage: PinholeImage,
        FlipImage: FlipImage,
        RectangleImage: RectangleImage,
        RhombusImage: RhombusImage,
        ImageDataImage: ImageDataImage,
        RegularPolygonImage: RegularPolygonImage,
        TextImage: TextImage,
        StarImage: StarImage,
        TriangleImage: TriangleImage,
        EllipseImage: EllipseImage,
        WedgeImage: WedgeImage,
        LineImage: LineImage,
        StarImage: StarImage,

        imageEquals: imageEquals,
        imageDifference: imageDifference,

        colorDb: colorDb,

        makeSceneImage: makeSceneImage,
        makeCircleImage: makeCircleImage,
        makeStarImage: makeStarImage,
        makeRectangleImage: makeRectangleImage,
        makeRhombusImage: makeRhombusImage,
        makeRegularPolygonImage: makeRegularPolygonImage,
        makePointPolygonImage: makePointPolygonImage,
        makeSquareImage: makeSquareImage,
        makeTriangleImage: makeTriangleImage,
        makeEllipseImage: makeEllipseImage,
        makeWedgeImage: makeWedgeImage,
        makeLineImage: makeLineImage,
        makeOverlayImage: makeOverlayImage,
        makeRotateImage: makeRotateImage,
        makeScaleImage: makeScaleImage,
        makeCropImage: makeCropImage,
        makeFrameImage: makeFrameImage,
        makePinholeImage: makePinholeImage,
        makeFlipImage: makeFlipImage,
        makeTextImage: makeTextImage,
        makeImageDataImage: makeImageDataImage,
        makeFileImage: makeFileImage,
        makeVideoImage: makeFileVideo,

        colorAtPosition: colorAtPosition,
        imageToColorList: imageToColorList,
        colorListToImage: colorListToImage,


        isImage: isImage,
        isScene: isScene,
        annPoint: annPoint,
        annFillMode: annFillMode,
        annXPlace: annXPlace,
        annYPlace: annYPlace,
        annFontFamily: annFontFamily,
        annFontStyle: annFontStyle,
        annFontWeight: annFontWeight,
        isColorOrColorString: isColorOrColorString,
        isAngle: isAngle,
        isSideCount: isSideCount,
        isStepCount: isStepCount,
        isPointsCount: isPointsCount,
        isPoint: isPoint,

        isSceneImage: isSceneImage,
        isCircleImage: isCircleImage,
        isStarImage: isStarImage,
        isRectangleImage: isRectangleImage,
        isRegularPolygonImage: isRegularPolygonImage,
        isRhombusImage: isRhombusImage,
        isSquareImage: isSquareImage,
        isTriangleImage: isTriangleImage,
        isEllipseImage: isEllipseImage,
        isLineImage: isLineImage,
        isOverlayImage: isOverlayImage,
        isRotateImage: isRotateImage,
        isScaleImage: isScaleImage,
        isCropImage: isCropImage,
        isFrameImage: isFrameImage,
        isPinholeImage: isPinholeImage,
        isFlipImage: isFlipImage,
        isTextImage: isTextImage,
        isFileImage: isFileImage,
        isFileVideo: isFileVideo,

        makeColor: makeColor,
        isColor: isColor,
        annColor: annColor,
        colorRed: colorRed,
        colorGreen: colorGreen,
        colorBlue: colorBlue,
        colorAlpha: colorAlpha,
        colorString: colorString,
      }
    );
    return RUNTIME.makeJSModuleReturn();
  }
})
