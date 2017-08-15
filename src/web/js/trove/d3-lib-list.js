({
  requires: [
    { 'import-type': 'builtin', 'name': 'image-lib' },
  ],
  nativeRequires: [
    'pyret-base/js/js-numbers',
    'd3'
  ],
  provides: {},
  theModule: function (RUNTIME, NAMESPACE, uri, IMAGE, jsnums, d3) {
  'use strict';

  function assert(val, msg) {
    if (!val) { throw new Error('Assertion failed: ' + (msg || '')); }
  }

  ////////////////////////////////////////////////////////////////////////////
  // libNum
  ////////////////////////////////////////////////////////////////////////////

  function scaler(oldX, oldY, newX, newY, toFixnum) {
    /*
     * Produces a scaler function to convert a value in
     * an interval to another value in a new interval
     *
     * @param {jsnums} oldX
     * @param {jsnums} oldY
     * @param {jsnums} newX
     * @param {jsnums} newY
     * @param {boolean} toFixnum: if true, the result is converted to fixnum
     * @return {jsnums -> jsnums}
     */
    return function (k) {
      var oldDiff = jsnums.subtract(k, oldX, RUNTIME.NumberErrbacks);
      var oldRange = jsnums.subtract(oldY, oldX, RUNTIME.NumberErrbacks);
      var portion = jsnums.divide(oldDiff, oldRange, RUNTIME.NumberErrbacks);
      var newRange = jsnums.subtract(newY, newX, RUNTIME.NumberErrbacks);
      var newPortion = jsnums.multiply(portion, newRange, RUNTIME.NumberErrbacks);
      var result = jsnums.add(newPortion, newX, RUNTIME.NumberErrbacks);
      return toFixnum ? jsnums.toFixnum(result, RUNTIME.NumberErrbacks) : result;
    };
  }

  function random(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function getPrettyNumToStringDigits(digits) {
    return function (num) {
      return jsnums.toStringDigits(num, digits, RUNTIME.NumberErrbacks).replace(/\.?0*$/, '');
    };
  }

  function between(b, a, c) {
    return (jsnums.lessThanOrEqual(a, b, RUNTIME.NumberErrbacks) && jsnums.lessThanOrEqual(b, c, RUNTIME.NumberErrbacks)) ||
           (jsnums.lessThanOrEqual(c, b, RUNTIME.NumberErrbacks) && jsnums.lessThanOrEqual(b, a, RUNTIME.NumberErrbacks));
  }

  function numMin(a, b) { /* ignore the rest */
    // this ignores other arguments, making reducing on numMin possible
    return RUNTIME.num_min(a, b);
  }

  function numMax(a, b) { /* ignore the rest */
    // this ignores other arguments, making reducing on numMin possible
    return RUNTIME.num_max(a, b);
  }

  var libNum = {
    scaler: scaler,
    between: between,
    getPrettyNumToStringDigits: getPrettyNumToStringDigits,
    numMin: numMin,
    numMax: numMax,
    random: random,
  };

  ////////////////////////////////////////////////////////////////////////////
  // libJS
  ////////////////////////////////////////////////////////////////////////////

  function drawImage(opts) {
      /*
       * Writes an image into a canvas taking into
       * account the backing store pixel ratio and
       * the device pixel ratio.
       *
       * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
       *
       * @author Paul Lewis
       * @param {Object} opts The params for drawing an image to the canvas
       */
      if (!opts.canvas) {
          throw('A canvas is required');
      }
      if (!opts.image) {
          throw('Image is required');
      }

      // get the canvas and context
      var canvas = opts.canvas,
          context = canvas.getContext('2d'),
          image = opts.image,

          // now default all the dimension info
          srcx = opts.srcx || 0,
          srcy = opts.srcy || 0,
          srcw = opts.srcw || image.naturalWidth,
          srch = opts.srch || image.naturalHeight,
          desx = opts.desx || srcx,
          desy = opts.desy || srcy,
          desw = opts.desw || srcw,
          desh = opts.desh || srch,
          auto = opts.auto,

          // finally query the various pixel ratios
          devicePixelRatio = window.devicePixelRatio || 1,
          backingStoreRatio = context.webkitBackingStorePixelRatio ||
              context.mozBackingStorePixelRatio ||
              context.msBackingStorePixelRatio ||
              context.oBackingStorePixelRatio ||
              context.backingStorePixelRatio || 1,

          ratio = devicePixelRatio / backingStoreRatio;

      // ensure we have a value set for auto.
      // If auto is set to false then we
      // will simply not upscale the canvas
      // and the default behaviour will be maintained
      if (typeof auto === 'undefined') {
          auto = true;
      }

      // upscale the canvas if the two ratios don't match
      if (auto && devicePixelRatio !== backingStoreRatio) {

          var oldWidth = canvas.width;
          var oldHeight = canvas.height;

          canvas.width = oldWidth * ratio;
          canvas.height = oldHeight * ratio;

          canvas.style.width = oldWidth + 'px';
          canvas.style.height = oldHeight + 'px';

          // now scale the context to counter
          // the fact that we've manually scaled
          // our canvas element
          context.scale(ratio, ratio);

      }

      context.drawImage(image, srcx, srcy, srcw, srch, desx, desy, desw, desh);
      return canvas;
  }

  function getBoundingClientRect(elem) {
    /*
     * Find the bounding box of elem
     *
     * @param {element} elem
     * @return {object}
     */
    var div = d3.select('body').append('div');
    div.node().appendChild(elem.cloneNode(true));
    var bbox = div.node().firstChild.getBoundingClientRect();
    div.remove();
    return bbox;
  }

  function getBBox(svg) {
    /*
     * Find the bounding box of svg elem
     *
     * @param {element} svg
     * @return {object}
     */
    var div = d3.select('body').append('div');
    div.node().appendChild(svg.cloneNode(true));
    var bbox = div.node().firstChild.getBBox();
    div.remove();
    return bbox;
  }

  function htmlspecialchars(text) {
    var div = document.createElement('div');
    var textNode = document.createTextNode(text);
    div.appendChild(textNode);
    return div.innerHTML;
  }

  var libJS = {
    'getBBox': getBBox,
    'getBoundingClientRect': getBoundingClientRect,
    'htmlspecialchars': htmlspecialchars
  };

  ////////////////////////////////////////////////////////////////////////////
  // libData
  ////////////////////////////////////////////////////////////////////////////

  function lastElement(arr) {
    /*
     * Produces the last element of arr
     *
     * @param {array} arr
     * @return {Any}
     */
    return arr[arr.length - 1];
  }

  function flatten(lst) {
    /*
     * Flatten the list
     *
     * @param {array} lst
     * @return {array}
     */
    return [].concat.apply([], lst);
  }

  function fill(n, v) {
    var i, ret = [];
    for (i = 0; i < n; i++) {
        ret.push(v);
    }
    return ret;
  }

  function range(st, ed) {
    var i, ret = [];
    for (i = st; i < ed; i++) {
        ret.push(i);
    }
    return ret;
  }

  function shuffle(o){
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    for (var j, x, i = o.length; i;
        j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  var libData = {
    lastElement: lastElement,
    flatten: flatten,
    fill: fill,
    range: range,
    shuffle: shuffle
  };

  ////////////////////////////////////////////////////////////////////////////
  // libColor
  ////////////////////////////////////////////////////////////////////////////

  function getContrast(r, g, b){
    /*
     * http://24ways.org/2010/calculating-color-contrast/
     */
    return ((((r*299)+(g*587)+(b*114))/1000) >= 128) ? 'black' : 'white';
  }

  function convertColor(v) {

      function p(pred, name) {
          return function (val) {
              RUNTIME.makeCheckType(pred, name)(val);
              return val;
          };
      }

      var colorDb = IMAGE.colorDb,
          _checkColor = p(IMAGE.isColorOrColorString, 'Color');

      function checkColor(val) {
          var aColor = _checkColor(val);
          if (colorDb.get(aColor)) {
              aColor = colorDb.get(aColor);
          }
          return aColor;
      }

      return IMAGE.colorString(checkColor(v));
  }

  function changeColor(r, g, b, d) {
      r += d;
      b += d;
      g += d;

      if (r > 255) r = 255;
      else if (r < 0) r = 0;

      if (b > 255) b = 255;
      else if (b < 0) b = 0;

      if (g > 255) g = 255;
      else if (g < 0) g = 0;

      return 'rgba(' + r + ',' + g + ',' + b + ',255)';
  }

  var libColor = {
      'getContrast': getContrast,
      'convertColor': convertColor,
      'changeColor': changeColor
  };

  ////////////////////////////////////////////////////////////////////////////
  // d3common
  ////////////////////////////////////////////////////////////////////////////

  function getDimension(obj, windowOptions) {
    var xscale = RUNTIME.getField(windowOptions, '_extend-x');
    var yscale = RUNTIME.getField(windowOptions, '_extend-y');

    if (!('maxWindowWidth' in obj)) {
      obj.maxWindowWidth = 1250;
    }
    if (!('maxWindowHeight' in obj)) {
      obj.maxWindowHeight = 620;
    }

    if (!('outerMarginLeft' in obj)) {
      obj.outerMarginLeft = 0;
    }
    if (!('outerMarginRight' in obj)) {
      obj.outerMarginRight = 0;
    }
    if (!('outerMarginTop' in obj)) {
      obj.outerMarginTop = 0;
    }
    if (!('outerMarginBottom' in obj)) {
      obj.outerMarginBottom = 0;
    }

    obj.windowWidth = scaler(0, 1, obj.minWindowWidth, obj.maxWindowWidth, true)(xscale);
    obj.windowHeight = scaler(0, 1, obj.minWindowHeight, obj.maxWindowHeight, true)(yscale);

    obj.svgWidth = obj.windowWidth - obj.outerMarginLeft - obj.outerMarginRight;
    obj.svgHeight = obj.windowHeight - obj.outerMarginTop - obj.outerMarginBottom - 60; // title bar

    obj.width = Math.floor(obj.svgWidth - obj.marginLeft - obj.marginRight);
    obj.height = Math.floor(obj.svgHeight - obj.marginTop - obj.marginBottom);
    return obj;
  }

  function svgTranslate(x, y) {
      if (y === undefined) {
          return 'translate(' + x.toString() + ')';
      }
      return 'translate(' + x.toString() + ',' + y.toString() + ')';
  }

  function createDiv() {
      /*
       * Creates a blank div
       *
       * @return {d3 selection}
       */
      return d3.select(document.createElement('div'))
          .attr('class', 'maind3');
  }

  function createCanvas(detached, dimension) {
    /*
     * Creates a canvas
     */
    var divSvg = detached
      .append('div')
      .attr('class', 'divsvg')
      .style({
        left: dimension.outerMarginLeft + 'px',
        top: dimension.outerMarginTop + 'px',
        position: 'absolute'
      }),
        canvas = divSvg
      .append('svg')
      .attr('width', dimension.svgWidth)
      .attr('height', dimension.svgHeight)
      .append('g')
      .attr('class', 'maing')
      .append('g');


    var transformation = null;
    switch (dimension.mode) {
      case 'top-left':
        transformation =
          svgTranslate(dimension.marginLeft, dimension.marginTop);
        break;
      case 'center':
        transformation =
          svgTranslate(
            dimension.marginLeft + (dimension.width / 2),
            dimension.marginTop + (dimension.height / 2)
          );
        break;
      default:
        throw 'mode "' + dimension.mode  + '" not implemented';
    }
    return canvas.attr('transform', transformation);
  }

  /*

    NOTE(joe): The idea comes from https://stackoverflow.com/a/33227005/2718315

    A previous strategy using base64 encoding didn't work with unicode characters

  */
  function getImageAsURL(detached) {
    detached.select('svg')
      .attr('version', 1.1)
      .attr('xmlns', 'http://www.w3.org/2000/svg');
    var svgString = new XMLSerializer().serializeToString(detached.node().firstChild.firstChild);
    return 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgString);
  }

  function onSave(detached) {
    var svgData = detached.append('div').style('display', 'none');
    var imgsrc = getImageAsURL(detached);
    var svg = detached.select('svg');
    var canvas = detached.append('canvas')
      .style('display', 'none')
      .attr('width', svg.attr('width'))
      .attr('height', svg.attr('height'));
    svgData.html('<img src="' + imgsrc + '">');

    var image = new Image;
    image.src = imgsrc;
    image.onload = function () {
      var opts = {
        canvas: canvas.node(),
        image: image
      };
      var a = document.createElement('a');
      a.download = 'sample.png';
      a.href = drawImage(opts).toDataURL('image/png');
      a.click();

      // somehow the image's size was doubled everytime we click
      // the button, so remove all data to prevent this
      // to happen
      svgData.remove();
      canvas.remove();
    };
  }

  function callBigBang(detached, restarter, resizer, windowOptions, dimension, retValFunc, extra) {
    detached.select('.maing')
      .append('text')
      .attr('x', (dimension.marginLeft + dimension.width + dimension.marginRight) / 2)
      .attr('y', 5 * dimension.marginTop / 11)
      .html(libJS.htmlspecialchars(RUNTIME.getField(windowOptions, '_title')))
      .style({
        position: 'absolute',
        'font-size': '10pt',
        'text-anchor': 'middle',
        'font-weight': 'bold'
      });

    detached.selectAll('.overlay').style({
      fill: 'none',
      'pointer-events': 'all',
    });

    if (retValFunc === null) {
      retValFunc = function (restarter) {
        imageReturn(detached, restarter, function (x) { return x; });
      };
    }

    if (RUNTIME.isPyretFalse(RUNTIME.getField(windowOptions, '_interact'))) {
      return RUNTIME.pauseStack(retValFunc);
    }


    var xscaler = libNum.scaler(
      dimension.minWindowWidth, dimension.maxWindowWidth, 0, 1
    );

    var yscaler = libNum.scaler(
      dimension.minWindowHeight, dimension.maxWindowHeight, 0, 1
    );

    var pauseStack;

    if (RUNTIME.isNothing(restarter)) {
      pauseStack = RUNTIME.pauseStack;
    } else {
      pauseStack = function (cb) { cb(restarter); };
    }

    return pauseStack(function (restarter) {
      if (extra !== null) {
        extra(restarter);
      }
      // detached.selectAll('.d3btn').style({
      //   'margin-right': '5px'
      // });
      RUNTIME.getParam('d3-port')(
        detached.node(),
        function (baseOption) {
          baseOption.width = dimension.windowWidth;
          baseOption.height = dimension.windowHeight;
          baseOption.minWidth = dimension.minWindowWidth;
          baseOption.maxWidth = dimension.maxWindowWidth;
          baseOption.minHeight = dimension.minWindowHeight - 11;
          baseOption.maxHeight = dimension.maxWindowHeight - 11;
          return baseOption;
        },
        function (){ retValFunc(restarter); },
        [
          {
            click: function () {
              var width = jsnums.fromFixnum($('.maind3').parent().parent().width());
              var height = jsnums.fromFixnum($('.maind3').parent().parent().height() + 11);
              RUNTIME.getParam('remove-d3-port')();
              resizer(
                restarter,
                RUNTIME.extendObj(
                  RUNTIME.makeSrcloc("dummy location"),
                  windowOptions,
                  {
                    '_extend-x': xscaler(width),
                    '_extend-y': yscaler(height),
                  }
                )
              );
            },
            icon: 'ui-icon-arrowthick-2-se-nw'
          },
          {
            click: function (){ onSave(detached); },
            icon: 'ui-icon-disk'
          }
        ]
      );
    });
  }

  function stylizeTip(detached) {
      /*
       * Add styles for tooltip
       *
       * @param {d3 selection} detached
       */
      detached.selectAll('.d3-tip')
          .style({
              'background': 'rgba(0, 0, 0, 0.8)',
              'line-height': '1.5',
              'font-weight': 'bold',
              'font-size': '8pt',
              'color': '#fff',
              'padding': '10px',
              'border-radius': '2px'
          });
  }

  var d3common = {
      getDimension: getDimension,
      svgTranslate: svgTranslate,
      createDiv: createDiv,
      createCanvas: createCanvas,
      callBigBang: callBigBang,
      stylizeTip: stylizeTip
  };

  function imageReturn(detached, restarter, hook) {
    var url = getImageAsURL(detached);
    var rawImage = new Image();
    rawImage.onload = function () {
      restarter.resume(
        hook(
          RUNTIME.makeOpaque(
            IMAGE.makeFileImage(url, rawImage),
            IMAGE.imageEquals
          )
        )
      );
    };
    rawImage.onerror = function (e) {
      restarter.error(RUNTIME.ffi.makeMessageException("unable to load the image: " + e.message));
    };
    rawImage.src = url;
  }

  return RUNTIME.makeJSModuleReturn({
    libData: libData,
    libNum: libNum,
    libJS: libJS,
    libColor: libColor,
    d3common: d3common,
    assert: assert,
    imageReturn: imageReturn,
  });

  }
})
