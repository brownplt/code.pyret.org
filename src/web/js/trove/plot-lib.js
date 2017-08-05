({
  requires: [
    { 'import-type': 'builtin', 'name': 'd3-lib' },
  ],
  nativeRequires: [
    'pyret-base/js/js-numbers',
    'd3',
    'd3-tip'
  ],
  provides: {},
  theModule: function (RUNTIME, NAMESPACE, uri, CLIB, jsnums, d3, D3TIP) {
  'use strict';
  var gf = RUNTIME.getField,
      cases = RUNTIME.ffi.cases;
  var libNum =       CLIB.libNum,
      libData =      CLIB.libData,
      libJS =        CLIB.libJS,
      getDimension = CLIB.d3common.getDimension,
      svgTranslate = CLIB.d3common.svgTranslate,
      createDiv =    CLIB.d3common.createDiv,
      createCanvas = CLIB.d3common.createCanvas,
      callBigBang =  CLIB.d3common.callBigBang,
      stylizeTip =   CLIB.d3common.stylizeTip,
      imageReturn =  CLIB.imageReturn;
  var d3tip = D3TIP(d3);

  function appendAxisLabel(canvas, windowOptions, width, height, posX, posY) {
    const axisLabel = canvas.append('g')
      .attr('class', 'axis label');

    axisLabel.append('text')
      .attr('x', posY * (width - 1))
      .attr('y', -10)
      .html(libJS.htmlspecialchars(RUNTIME.getField(windowOptions, 'y-axis')))
      .style('text-anchor', posY < 0.5 ? 'start' : 'end');

    axisLabel.append('g')
      .attr('transform', svgTranslate(width + 10, posX * (height - 1)))
      .append('text')
      .attr("transform", "rotate(90)")
      .html(libJS.htmlspecialchars(RUNTIME.getField(windowOptions, 'x-axis')))
      .style('text-anchor', posX < 0.5 ? 'start' : 'end');
  }

  function appendAxis(
    xMin, xMax, yMin, yMax, width, height, windowOptions, canvas, axisFixed
  ) {
    /*
     * Appends axes to canvas
     *
     * @param {jsnums} xMin
     * @param {jsnums} xMax
     * @param {jsnums} yMin
     * @param {jsnums} yMax
     * @param {fixnum} width
     * @param {fixnum} height
     * @param {d3 selection} canvas
     */

    function getAxisConf(aMin, aMax) {
      const conf = {},
            scaler = libNum.scaler(aMin, aMax, 0, 1, false),
            pos = jsnums.toFixnum(scaler(0), RUNTIME.NumberErrbacks);

      if (0 <= pos && pos <= 1) {
        conf.bold = true;
        conf.pos = pos;
      } else if (pos > 1) {
        conf.bold = false;
        conf.pos = 1;
      } else if (pos < 0) {
        conf.bold = false;
        conf.pos = 0;
      }
      return conf;
    }

    const xAxisConf = getAxisConf(yMin, yMax),
        yAxisConf = getAxisConf(xMin, xMax);
    xAxisConf.pos = 1 - xAxisConf.pos;

    const tickNum = 11;

    const xAxisScaler = d3.scale.linear()
           .domain([0, tickNum - 1]).range([0, width - 1]),
          yAxisScaler = d3.scale.linear()
           .domain([0, tickNum - 1]).range([height - 1, 0]);

    const allValues = d3.range(0, tickNum);

    const xAxisDisplayScaler = libNum.scaler(0, tickNum - 1, xMin, xMax),
          yAxisDisplayScaler = libNum.scaler(0, tickNum - 1, yMin, yMax);

    const prettyNumToStringDigitsForAxis = libNum.getPrettyNumToStringDigits(5);

    let xAxisOrientation = 'bottom';

    if (xAxisConf.pos > 0.8 && !axisFixed) {
      xAxisOrientation = 'top';
    }

    const xAxis = d3.svg.axis().scale(xAxisScaler)
        .orient(xAxisOrientation)
        .tickValues(allValues).tickFormat(
          function (d, i) {
            return prettyNumToStringDigitsForAxis(xAxisDisplayScaler(i));
          });

    canvas.append('g')
      .attr('class', 'x axis')
      .attr('transform', svgTranslate(0, xAxisConf.pos * (height - 1)))
      .call(xAxis);

    const yAxis = d3.svg.axis().scale(yAxisScaler)
        .orient((yAxisConf.pos > 0.8) ? 'left' : 'right')
        .tickValues(allValues).tickFormat(
          function (d, i) {
            return prettyNumToStringDigitsForAxis(yAxisDisplayScaler(i));
          });

    canvas.append('g')
      .attr('class', 'y axis')
      .attr('transform', svgTranslate(yAxisConf.pos * (width - 1), 0))
      .call(yAxis);

    appendAxisLabel(canvas, windowOptions, width, height, xAxisConf.pos, yAxisConf.pos);

    canvas.selectAll('.x.axis path').style({
      stroke: 'black',
      'stroke-width': xAxisConf.bold ? 2 : 0,
      fill: 'none'
    });
    canvas.selectAll('.y.axis path').style({
      stroke: 'black',
      'stroke-width': yAxisConf.bold ? 2 : 0,
      fill: 'none'
    });

    canvas.selectAll('g.y.axis g.tick line')
      .attr('x1', -yAxisConf.pos * (width - 1))
      .attr('x2', (1 - yAxisConf.pos) * (width - 1));
    canvas.selectAll('g.x.axis g.tick line')
      .attr('y1', -xAxisConf.pos * (height - 1))
      .attr('y2', (1 - xAxisConf.pos) * (height - 1));

    canvas.selectAll('.axis').style({'shape-rendering': 'crispEdges'});
    canvas.selectAll('.axis text').style({'font-size': '10px'});
    canvas.selectAll('.axis line').style({
      stroke: 'lightgray',
      opacity: 0.6
    });
  }

  function genericPlot(restarter, windowOptions, scatterPlots, linePlots) {
    var xMin = gf(windowOptions, 'x-min'),
        xMax = gf(windowOptions, 'x-max'),
        yMin = gf(windowOptions, 'y-min'),
        yMax = gf(windowOptions, 'y-max');

    function resizer(restarter, windowOptions) {
      genericPlot(restarter, windowOptions, scatterPlots, linePlots);
    }

    var dimension = getDimension({
      minWindowWidth: 650,
      minWindowHeight: 430,
      outerMarginRight: 300,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 50,
      marginBottom: 10,
      mode: 'top-left',
    }, windowOptions),
        width = dimension.width,
        height = dimension.height,
        detached = createDiv(),
        canvas = createCanvas(detached, dimension),
        panel = detached.append('div').style({
          top: '20px',
          left: width + dimension.marginLeft + dimension.marginRight + 10 + 'px',
        }),
        controller = panel.append('div').style({
          top: '60px',
        }),
        coordDisplay = panel.append('div').style({
          top: '0px',
          left: '0px',
          'font-size': '12px',
          width: '250px'
        }),
        rectangleElement = canvas
          .append('rect')
          .attr('class', 'selection')
          .style({
            stroke            : 'gray',
            'stroke-width'    : '1px',
            'stroke-dasharray': '4px',
            'stroke-opacity'  : '0.5',
            fill              : 'gray',
            opacity           : '0.3',
          });

    controller.append('div').style({
      top: '180px',
      left: '50px',
      'font-size': '18px',
      width: '200px'
    }).text('Number of Samples:');

    controller = $(controller.node());

    var xMinC = $('<input/>', {
      type: 'text',
      placeholder: 'x-min',
      style: 'left: 0px; top: 70px',
    }).attr('size', '8');
    var xMaxC = $('<input/>', {
      type: 'text',
      placeholder: 'x-max',
      style: 'left: 180px; top: 70px',
    }).attr('size', '8');
    var yMinC = $('<input/>', {
      type: 'text',
      placeholder: 'y-min',
      style: 'left: 90px; top: 140px',
    }).attr('size', '8');
    var yMaxC = $('<input/>', {
      type: 'text',
      placeholder: 'y-max',
      style: 'left: 90px; top: 0px',
    }).attr('size', '8');
    var numSamplesC = $('<input/>', {
      type: 'text',
      placeholder: 'num-samples',
      style: 'left: 90px; top: 210px',
    }).attr('size', '8');

    controller
      .append(xMinC)
      .append(xMaxC)
      .append(yMinC)
      .append(yMaxC)
      .append(numSamplesC);

    var prettyNumToStringDigits20 = libNum.getPrettyNumToStringDigits(20);
    var prettyNumToStringDigits9 = libNum.getPrettyNumToStringDigits(9);

    function setDefault() {
      xMinC.val(prettyNumToStringDigits20(xMin));
      xMaxC.val(prettyNumToStringDigits20(xMax));
      yMinC.val(prettyNumToStringDigits20(yMin));
      yMaxC.val(prettyNumToStringDigits20(yMax));
    }

    numSamplesC.val(RUNTIME.num_to_string(gf(windowOptions, 'num-samples')));

    setDefault();

    function getNewWindow() {
      var ret = cases(RUNTIME.ffi.isOption, 'Option', RUNTIME.string_to_number(xMinC.val()), {
        none: function () {
          xMinC.addClass('error-bg');
          xMinC.removeClass('ok-bg');
          return null;
        },
        some: function (xMin_val) {
          xMinC.removeClass('error-bg');
          xMinC.addClass('ok-bg');
          return cases(RUNTIME.ffi.isOption, 'Option', RUNTIME.string_to_number(xMaxC.val()), {
            none: function () {
              xMaxC.addClass('error-bg');
              xMaxC.removeClass('ok-bg');
              return null;
            },
            some: function (xMax_val) {
              xMaxC.removeClass('error-bg');
              xMaxC.addClass('ok-bg');

              if (jsnums.greaterThanOrEqual(xMin_val, xMax_val, RUNTIME.NumberErrbacks)) {
                xMinC.addClass('error-bg');
                xMaxC.addClass('error-bg');
                xMinC.removeClass('ok-bg');
                xMaxC.removeClass('ok-bg');
                return null;
              }

              return cases(RUNTIME.ffi.isOption, 'Option', RUNTIME.string_to_number(yMinC.val()), {
                none: function () {
                  yMinC.addClass('error-bg');
                  yMinC.removeClass('ok-bg');
                  return null;
                },
                some: function (yMin_val) {
                  yMinC.removeClass('error-bg');
                  yMinC.addClass('ok-bg');

                  return cases(RUNTIME.ffi.isOption, 'Option', RUNTIME.string_to_number(yMaxC.val()), {
                    none: function () {
                      yMaxC.addClass('error-bg');
                      yMaxC.removeClass('ok-bg');
                      return null;
                    },
                    some: function (yMax_val) {
                      yMaxC.removeClass('error-bg');
                      yMaxC.addClass('ok-bg');

                      if (jsnums.greaterThanOrEqual(xMin_val, xMax_val, RUNTIME.NumberErrbacks)) {
                        yMinC.addClass('error-bg');
                        yMaxC.addClass('error-bg');
                        yMinC.removeClass('ok-bg');
                        yMaxC.removeClass('ok-bg');
                        return null;
                      }

                      return cases(RUNTIME.ffi.isOption, 'Option', RUNTIME.string_to_number(numSamplesC.val()), {
                        none: function () {
                          numSamplesC.addClass('error-bg');
                          numSamplesC.removeClass('ok-bg');
                          return null;
                        },
                        some: function (numSamples_val) {
                          numSamplesC.removeClass('error-bg');
                          numSamplesC.addClass('ok-bg');

                          if (RUNTIME.isPyretFalse(RUNTIME.num_is_integer(numSamples_val)) ||
                              jsnums.lessThanOrEqual(numSamples_val, 1, RUNTIME.NumberErrbacks)) {
                            numSamplesC.addClass('error-bg');
                            numSamplesC.removeClass('ok-bg');
                            return null;
                          }

                          return {
                            'x-min': xMin_val,
                            'x-max': xMax_val,
                            'y-min': yMin_val,
                            'y-max': yMax_val,
                            'num-samples': numSamples_val
                          };
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });

      detached.selectAll('.error-bg').style({'background-color': '#FF9494'});
      detached.selectAll('.ok-bg').style({'background-color': '#FFFFFF'});
      return ret;
    }

    controller.append($('<button/>', {
      text: '⇦',
      style: 'left: 100px; top: 70px',
    }).addClass('xMinGo d3btn').click(function () {
      if (rectangleElement.attr('style').indexOf('visible') >= 0) {
        rectangleElement.style({visibility: 'hidden'});
      }
      var newWindow = getNewWindow();
      if (newWindow === null) { return; }
      var xMin_val = newWindow['x-min'];
      var xMax_val = newWindow['x-max'];
      var move = jsnums.divide(jsnums.subtract(xMax_val, xMin_val, RUNTIME.NumberErrbacks), 10, RUNTIME.NumberErrbacks);
      xMinC.val(prettyNumToStringDigits20(jsnums.subtract(xMin_val, move, RUNTIME.NumberErrbacks)));
      xMaxC.val(prettyNumToStringDigits20(jsnums.subtract(xMax_val, move, RUNTIME.NumberErrbacks)));
    }));
    controller.append($('<button/>', {
      text: '⇨',
      style: 'left: 140px; top: 70px',
    }).addClass('xMaxGo d3btn').click(function () {
      if (rectangleElement.attr('style').indexOf('visible') >= 0) {
        rectangleElement.style({visibility: 'hidden'});
      }
      var newWindow = getNewWindow();
      if (newWindow === null) { return; }
      var xMin_val = newWindow['x-min'];
      var xMax_val = newWindow['x-max'];
      var move = jsnums.divide(jsnums.subtract(xMax_val, xMin_val), 10);
      xMinC.val(prettyNumToStringDigits20(jsnums.add(xMin_val, move, RUNTIME.NumberErrbacks)));
      xMaxC.val(prettyNumToStringDigits20(jsnums.add(xMax_val, move, RUNTIME.NumberErrbacks)));
    }));
    controller.append($('<button/>', {
      text: '⇩',
      style: 'left: 120px; top: 105px',
    }).addClass('yMinGo d3btn').click(function () {
      if (rectangleElement.attr('style').indexOf('visible') >= 0) {
        rectangleElement.style({visibility: 'hidden'});
      }
      var newWindow = getNewWindow();
      if (newWindow === null) { return; }
      var yMin_val = newWindow['y-min'];
      var yMax_val = newWindow['y-max'];
      var move = jsnums.divide(jsnums.subtract(yMax_val, yMin_val), 10);
      yMinC.val(prettyNumToStringDigits20(jsnums.subtract(yMin_val, move, RUNTIME.NumberErrbacks)));
      yMaxC.val(prettyNumToStringDigits20(jsnums.subtract(yMax_val, move, RUNTIME.NumberErrbacks)));
    }));
    controller.append($('<button/>', {
      text: '⇧',
      style: 'left: 120px; top: 35px',
    }).addClass('yMaxGo d3btn').click(function () {
      if (rectangleElement.attr('style').indexOf('visible') >= 0) {
        rectangleElement.style({visibility: 'hidden'});
      }
      var newWindow = getNewWindow();
      if (newWindow === null) { return; }
      var yMin_val = newWindow['y-min'];
      var yMax_val = newWindow['y-max'];
      var move = jsnums.divide(jsnums.subtract(yMax_val, yMin_val), 10);
      yMinC.val(prettyNumToStringDigits20(jsnums.add(yMin_val, move, RUNTIME.NumberErrbacks)));
      yMaxC.val(prettyNumToStringDigits20(jsnums.add(yMax_val, move, RUNTIME.NumberErrbacks)));
    }));

    var redraw = $('<button/>', {
      text: 'Redraw', style: 'left: 95px; top: 260px'
    });

    controller.append(redraw);

    $(panel.node())
      .css('position', 'absolute')
      .children()
      .css('position', 'absolute')
      .children()
      .css('position', 'absolute');

    appendAxis(xMin, xMax, yMin, yMax, width, height, windowOptions, canvas, false);

    var xToPixel = libNum.scaler(xMin, xMax, 0, width - 1, true),
        yToPixel = libNum.scaler(yMin, yMax, height - 1, 0, true),
        pixelToX = libNum.scaler(0, width - 1, xMin, xMax, false),
        pixelToY = libNum.scaler(height - 1, 0, yMin, yMax, false);

    // from http://jsfiddle.net/dirtyd77/4Qm6A/7/

    var rectData, isDown = false;

    function updateRect() {
      rectangleElement.attr({
        x: rectData[1].x - rectData[0].x > 0 ? rectData[0].x :  rectData[1].x,
        y: rectData[1].y - rectData[0].y > 0 ? rectData[0].y :  rectData[1].y,
        width: Math.abs(rectData[1].x - rectData[0].x),
        height: Math.abs(rectData[1].y - rectData[0].y)
      });
    }

    canvas
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'overlay')
      .on('click', function () {
        if (!d3.event.shiftKey) { return; }

        var coord = d3.mouse(this);
        var cx = pixelToX(coord[0]);
        var radiusX = jsnums.subtract(xMax, xMin);
        var cy = pixelToY(coord[1]);
        var radiusY = jsnums.subtract(yMax, yMin);

        xMinC.val(prettyNumToStringDigits20(jsnums.subtract(cx, radiusX, RUNTIME.NumberErrbacks)));
        xMaxC.val(prettyNumToStringDigits20(jsnums.add(cx, radiusX, RUNTIME.NumberErrbacks)));
        yMinC.val(prettyNumToStringDigits20(jsnums.subtract(cy, radiusY, RUNTIME.NumberErrbacks)));
        yMaxC.val(prettyNumToStringDigits20(jsnums.add(cy, radiusY, RUNTIME.NumberErrbacks)));

      })
      .on('mousedown', function () {
        if (isDown) { return; }
        if (d3.event.shiftKey) { return; }

        // prevent bad dragging; disable to make canvas focusable
        // d3.event.preventDefault();

        var m1 = d3.mouse(this);
        rectData = [ { x: m1[0], y: m1[1] }, { x: m1[0], y: m1[1] } ];
        updateRect();
        rectangleElement.style({visibility: 'visible'});
        isDown = true;
      })
      .on('mousemove', function (){

        var coord = d3.mouse(this);
        var vX = pixelToX(coord[0]);
        var vY = pixelToY(coord[1]);

        coordDisplay.html('x: ' + prettyNumToStringDigits20(vX) + '<br/><br/>' +
                          'y: ' + prettyNumToStringDigits20(vY));

        if (isDown) {
          rectData[1] = { x: coord[0], y: coord[1] };
          updateRect();
        }
      })
      .on('mouseup', function () {
        if (rectData[0].x == rectData[1].x &&
            rectData[0].y == rectData[1].y &&
            rectangleElement.attr('style').indexOf('visible') >= 0) {
          setDefault();
          rectangleElement.style({visibility: 'hidden'});
        } else {
          xMinC.val(prettyNumToStringDigits20(pixelToX(Math.min(rectData[0].x, rectData[1].x))));
          xMaxC.val(prettyNumToStringDigits20(pixelToX(Math.max(rectData[0].x, rectData[1].x))));
          yMinC.val(prettyNumToStringDigits20(pixelToY(Math.max(rectData[0].y, rectData[1].y))));
          yMaxC.val(prettyNumToStringDigits20(pixelToY(Math.min(rectData[0].y, rectData[1].y))));
        }
        isDown = false;
      });

    function plotLine(plot) {
      /*
       * Graph a line
       *
       * Part of this function is adapted from
       * http://jsfiddle.net/christopheviau/Hwpe3/
       */
      var options = plot.options;
      var points = plot.line;

      var line = d3.svg.line()
        .x(function (d) { return xToPixel(d[0]); })
        .y(function (d) { return yToPixel(d[1]); });

      canvas
        .append('path')
        .attr('d', line(points))
        .style({'stroke': options.color, 'stroke-width': 1, 'fill': 'none'});
    }

    function plotPoints(points) {
      /*
       * Plot data points (scatter plot)
       *
       * Part of this function is adapted from
       * http://alignedleft.com/tutorials/d3/making-a-scatterplot
       */
      var tip = d3tip(detached)
          .attr('class', 'd3-tip')
          .direction('e')
          .offset([0, 20])
          .html(function (d) {
            var x = prettyNumToStringDigits9(d[0]);
            var y = prettyNumToStringDigits9(d[1]);
            return 'x: ' + x.toString() + '<br />' +
                   'y: ' + y.toString() + '<br />';
          });

      canvas.call(tip);

      canvas
        .selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr('cx', function (d) { return xToPixel(d[0]); })
        .attr('cy', function (d) { return yToPixel(d[1]); })
        .attr('r', function (d) { return d[2].size; })
        .style('fill', function (d) { return d[2].color; })
        .style('opacity', function (d) { return d[2].opacity; })
        .on('mouseover', function (d) {
          if (d[2].tip) {
            tip.show.apply(this, arguments);
          }
        })
        .on('mouseout', function (d) {
          if (d[2].tip) {
            tip.hide.apply(this, arguments);
          }
        });
    }

    plotPoints(scatterPlots);
    linePlots.forEach(plotLine);

    stylizeTip(detached);
    return callBigBang(
      detached,
      restarter,
      resizer,
      windowOptions,
      dimension,
      function (restarter) {
        imageReturn(detached, restarter, function (image) {
          return RUNTIME.ffi.makeRight(image);
        });
      },
      function (restarter) {
        redraw.click(function () {
          var newWindow = getNewWindow();
          if (newWindow === null) { return; }
          var toRet = RUNTIME.ffi.makeLeft(
            RUNTIME.extendObj(
              RUNTIME.makeSrcloc("dummy location"),
              windowOptions,
              newWindow
            )
          );
          RUNTIME.getParam('remove-d3-port')();
          restarter.resume(toRet);
        });
      }
    );
  }

  function plotMulti(restarter, windowOptions, lstOfScatterPlots, lstOfLinePlots) {
    var xMin = gf(windowOptions, 'x-min');
    var xMax = gf(windowOptions, 'x-max');
    var yMin = gf(windowOptions, 'y-min');
    var yMax = gf(windowOptions, 'y-max');

    function inBound(p) {
      return jsnums.lessThanOrEqual(xMin, p[0], RUNTIME.NumberErrbacks) &&
             jsnums.lessThanOrEqual(p[0], xMax, RUNTIME.NumberErrbacks) &&
             jsnums.lessThanOrEqual(yMin, p[1], RUNTIME.NumberErrbacks) &&
             jsnums.lessThanOrEqual(p[1], yMax, RUNTIME.NumberErrbacks);
    }

    function dist(a, b) {
      return jsnums.add(
        jsnums.sqr(jsnums.subtract(a[0], b[0], RUNTIME.NumberErrbacks)),
        jsnums.sqr(jsnums.subtract(a[1], b[1], RUNTIME.NumberErrbacks)), RUNTIME.NumberErrbacks);
    }

    function nearest(candidates, origin) {
      var ans = null;
      var optimal = null;
      candidates.forEach(function (candidate) {
        var distance = dist(candidate, origin);
        if (optimal === null || jsnums.lessThan(distance, optimal, RUNTIME.NumberErrbacks)) {
          optimal = distance;
          ans = candidate;
        }
      });
      return ans;
    }

    function equal(a, b) {
      return jsnums.lessThanOrEqual(a, b, RUNTIME.NumberErrbacks) && jsnums.lessThanOrEqual(b, a, RUNTIME.NumberErrbacks);
    }

    function findPointOnEdge(near, far) {
      /*
      Find a Posn on the border and on the line between `near` and `far`. If there are many,
      pick the one closest to `near`.

      Precondition: at least one of `near` or `far` is not in the border.
      */

      var pxMax = RUNTIME.num_min(RUNTIME.num_max(near[0], far[0]), xMax);
      var pxMin = RUNTIME.num_max(RUNTIME.num_min(near[0], far[0]), xMin);
      var pyMax = RUNTIME.num_min(RUNTIME.num_max(near[1], far[1]), yMax);
      var pyMin = RUNTIME.num_max(RUNTIME.num_min(near[1], far[1]), yMin);

      var candidates = [];
      if (equal(near[0], far[0])) {
        candidates = [
          [near[0], yMin],
          [near[0], yMax]
        ];
      } else {
        /*
        y = m * x + c           [3]
        y2 = m * x2 + c         [3.1]
        y - y2 = m * (x - x2)   [5]   [by 3 - 3.1]
        m = (y - y2) / (x - x2) [1]   [rewrite 5]
        c = y - m * x           [2]   [rewrite 3]
        x = (y - c) / m         [4]   [rewrite 3]
        */

        var m = jsnums.divide(jsnums.subtract(near[1], far[1], RUNTIME.NumberErrbacks), jsnums.subtract(near[0], far[0], RUNTIME.NumberErrbacks));
        var c = jsnums.subtract(near[1], jsnums.multiply(m, near[0], RUNTIME.NumberErrbacks), RUNTIME.NumberErrbacks);

        var f = function (x) {
          return jsnums.add(jsnums.multiply(m, x, RUNTIME.NumberErrbacks), c, RUNTIME.NumberErrbacks);
        };

        var g = function (y) {
          return jsnums.divide(jsnums.subtract(y, c, RUNTIME.NumberErrbacks), m, RUNTIME.NumberErrbacks);
        };

        candidates = [
          [xMin, f(xMin)],
          [xMax, f(xMax)]
        ];

        if (!equal(m, 0)) {
          candidates = candidates.concat([
            [g(yMin), yMin],
            [g(yMax), yMax]
          ]);
        }
      }

      return nearest(candidates.filter(function (p) {
        return jsnums.lessThanOrEqual(pxMin, p[0], RUNTIME.NumberErrbacks) &&
               jsnums.lessThanOrEqual(p[0], pxMax, RUNTIME.NumberErrbacks) &&
               jsnums.lessThanOrEqual(pyMin, p[1], RUNTIME.NumberErrbacks) &&
               jsnums.lessThanOrEqual(p[1], pyMax, RUNTIME.NumberErrbacks);
      }), near);
    }

    function pointEqual(x, y) {
      return equal(x[0], y[0]) && equal(x[1], y[1]);
    }

    function toJSOptions(options) {
      return {
        color:   CLIB.libColor.convertColor(gf(options, 'color')),
        size:    jsnums.toFixnum(gf(options, 'size'), RUNTIME.NumberErrbacks),
        opacity: jsnums.toFixnum(gf(options, 'opacity'), RUNTIME.NumberErrbacks),
        tip:     RUNTIME.isPyretTrue(gf(options, 'tip')),
      };
    }

    var scatterPoints = [];
    RUNTIME.ffi.toArray(lstOfScatterPlots).forEach(function (scatterPlot) {
      var points = gf(scatterPlot, 'points');
      var options = toJSOptions(gf(scatterPlot, 'options'));
      points.forEach(function (point) {
        if (inBound(point)) {
          scatterPoints.push(point.concat([options]));
        }
      });
    });

    var linePlots = [];

    RUNTIME.ffi.toArray(lstOfLinePlots).forEach(function (linePlot) {
      var i;
      var points = gf(linePlot, 'points');
      var options = toJSOptions(gf(linePlot, 'options'));

      // To have a line, we need at least two points. If there are less than
      // two points, let's just do nothing
      if (points.length <= 1) {
        return;
      }

      var segments = [];
      for (i = 0; i < points.length - 1; i++) {
        var start = points[i];
        var stop = points[i + 1];

        if (inBound(start)) {
          if (inBound(stop)) {
            segments.push([start, stop]);
          } else {
            segments.push([start, findPointOnEdge(start, stop)]);
          }
        } else {
          if (inBound(stop)) {
            segments.push([findPointOnEdge(start, stop), stop]);
          } else {
            var result = findPointOnEdge(start, stop);
            if (result !== null) {
              var result2 = findPointOnEdge(stop, start);
              segments.push([result, result2]);
            }
          }
        }
      }

      // If there is no visible segment, do nothing
      if (segments.length === 0) {
        return;
      }

      var combined = [segments[0]];
      for (i = 1; i < segments.length; i++) {
        var currentSegment = segments[i];
        var lastSegment = combined[combined.length - 1];
        var lastPoint = lastSegment[lastSegment.length - 1];
        if (pointEqual(lastPoint, currentSegment[0])) {
          lastSegment.push(currentSegment[1]);
        } else {
          combined.push(currentSegment);
        }
      }

      combined.forEach(function (segment) {
        linePlots.push({
          line: segment,
          options: options
        });
      });
    });

    return genericPlot(restarter, windowOptions, scatterPoints, linePlots);
  }

  function histogram(restarter, windowOptions, tab, n) {
    /*
     * Plot a histogram
     *
     * Part of this function is adapted from
     * http://www.frankcleary.com/making-an-interactive-histogram-in-d3-js/
     */

    function resizer(restarter, windowOptions) {
      histogram(restarter, windowOptions, tab, n);
    }

    var data = tab.map(function (row){ return row[0]; });
    var xMin = data.reduce(libNum.numMin);
    var xMax = data.reduce(libNum.numMax);
    var dataScaler = libNum.scaler(xMin, xMax, 0, 1, true);

    var histogramData = d3.layout.histogram()
        .bins(n).value(dataScaler)(data);

    var yMax = d3.max(histogramData, function (d) { return d.y; });

    var dimension = getDimension({
      minWindowWidth: 480,
      minWindowHeight: 430,
      marginLeft: 80,
      marginRight: 80,
      marginTop: 55,
      marginBottom: 20,
      mode: 'top-left',
    }, windowOptions),
        width = dimension.width,
        height = dimension.height,
        detached = createDiv(),
        canvas = createCanvas(detached, dimension);

    appendAxis(xMin, xMax, 0, yMax, width, height, windowOptions, canvas, true);

    canvas
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'overlay');

    var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, d3.max(histogramData, function (d) { return d.y; })])
        .range([height, 0]);

    var prettyNumToStringDigits7 = libNum.getPrettyNumToStringDigits(7);

    var tip = d3tip(detached)
        .attr('class', 'd3-tip')
        .direction('e')
        .offset([0, 20])
        .html(function (d) {
          var maxVal = prettyNumToStringDigits7(d.reduce(libNum.numMax), 6);
          var minVal = prettyNumToStringDigits7(d.reduce(libNum.numMin), 6);
          return 'min: ' + minVal.toString() + '<br />' +
                 'max: ' + maxVal.toString() + '<br />' +
                 'freq: ' + d.y;
        });

    canvas.call(tip);

    var bar = canvas.selectAll('.bar')
        .data(histogramData)
        .enter().append('g')
        .attr('class', 'bar')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    bar.append('rect')
      .attr('x', function (d) { return x(d.x); })
      .attr('y', function (d) { return y(d.y); })
      .attr('width', x(histogramData[0].dx) - 1)
      .attr('height', function (d) { return height - y(d.y); });

    canvas.selectAll('.bar rect')
      .style({
        'fill': 'steelblue',
        'fill-opacity': '0.8',
        'shape-rendering': 'crispEdges'
      })
      .on('mouseover', function () {
        d3.select(this).style('fill', 'black');
      })
      .on('mouseout', function () {
        d3.select(this).style('fill', 'steelblue');
      });


    stylizeTip(detached);
    return callBigBang(detached, restarter, resizer, windowOptions, dimension, null, null);
  }

  function pieChart(restarter, windowOptions, tab) {
    /*
     * Pie Chart
     *
     * Part of this function is adapted from:
     * http://bl.ocks.org/mbostock/3887235
     *
     * row[0] => label, row[1] => value
     */

    function resizer(restarter, windowOptions) {
      pieChart(restarter, windowOptions, tab);
    }

    var sum = tab.map(function (row) { return row[1]; })
      .reduce(function (a, b) {
        return jsnums.add(a, b, RUNTIME.NumberErrbacks);
      });
    var valueScaler = libNum.scaler(0, sum, 0, 100, true);


    var dimension = getDimension({
      minWindowWidth: 700,
      minWindowHeight: 550,
      outerMarginLeft: 10,
      outerMarginRight: 10,
      marginLeft: 120,
      marginRight: 120,
      marginTop: 90,
      marginBottom: 40,
      mode: 'center',
    }, windowOptions),
        width = dimension.width,
        height = dimension.height,
        detached = createDiv(),
        canvas = createCanvas(detached, dimension);

    var maxRadius = Math.min(width, height) / 2;
    var maxRadiusValue = tab.map(function (row) { return row[2]; })
      .reduce(libNum.numMax);
    var radiusScaler = libNum.scaler(0, maxRadiusValue, 0, maxRadius, true);
    var color = d3.scale.category20();
    var arc = d3.svg.arc()
        .outerRadius(function (row) { return radiusScaler(row.data[2]); })
        .innerRadius(0);
    var pie = d3.layout.pie()
        .sort(null)
        .value(function (row) { return valueScaler(row[1]); });

    var prettyNumToStringDigits9 = libNum.getPrettyNumToStringDigits(9);
    var tip = d3tip(detached)
        .attr('class', 'd3-tip')
        .direction('e')
        .offset([0, 20])
        .html(function (d) {
          return 'value: <br />' + prettyNumToStringDigits9(d.data[1]) + '<br />' +
                 'percent: <br />' + prettyNumToStringDigits9(valueScaler(d.data[1])) + '%';
        });

    canvas.call(tip);

    var g = canvas.selectAll('.arc')
        .data(pie(tab))
        .enter().append('g')
        .attr('class', 'arc');

    g.append('path').attr('class', 'path').attr('d', arc);

    const arc2 = d3.svg.arc();

    g.append('path').attr('class', 'transparent').attr('d', arc);

    g.append('text')
      .attr('transform', function (d) {
        const r = radiusScaler(d.data[2]);
        d.outerRadius = r + 15;
        d.innerRadius = r + 10;
        return svgTranslate(arc2.centroid(d));
      })
      .attr('dy', '.35em')
      .style('text-anchor', function(d) {
        const placement = arc2.centroid(d)[0];
        if (-10 <= placement && placement <= 10) {
          return 'middle';
        }
        return (placement >= 0) ? 'start' : 'end';
      })
      .text(function (d) { return d.data[0]; });

    canvas.selectAll('.arc path')
      .style({
        fill: function (d, i) { return color(i); }
      })
      .on('mouseover', function (e) {
        d3.select(this.parentNode)
          .selectAll('.path')
          .style('opacity', '0.4');
        tip.show(e);
      })
      .on('mouseout', function (e) {
        d3.select(this.parentNode)
          .selectAll('.path')
          .style('opacity', '0.9');
        tip.hide(e);
      });
    canvas.selectAll('.transparent').style('opacity', '0');
    canvas.selectAll('text').style({'font-size': '15px'});

    stylizeTip(detached);
    return callBigBang(detached, restarter, resizer, windowOptions, dimension, null, null);
  }

  function barChart(restarter, windowOptions, table, legend, showLegend) {
    /*
     * Bar Chart
     *
     * Part of this function is adapted from:
     * https://bl.ocks.org/mbostock/3887051
     */

    function resizer(restarter, windowOptions) {
      barChart(restarter, windowOptions, table, legend, showLegend);
    }

    const dimension = getDimension({
      minWindowWidth: 505,
      minWindowHeight: 430,
      marginLeft: 100,
      marginRight: 100,
      marginTop: 45,
      marginBottom: 65,
      mode: 'top-left',
    }, windowOptions),
        width = dimension.width,
        height = dimension.height,
        detached = createDiv(),
        canvas = createCanvas(detached, dimension);

    const x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.1);

    const x1 = d3.scale.ordinal();

    const y = d3.scale.linear()
        .domain([0, 1])
        .range([height, 0]);

    const color = d3.scale.category20();

    let xAxis = d3.svg.axis()
        .scale(x0)
        .orient('bottom');

    let legendData = RUNTIME.ffi.toArray(legend);

    let yMax = 0;
    let data = table.map(function (row) {
      return {
        label: row[0],
        data: RUNTIME.ffi.toArray(row[1]).map(function (value, i) {
          yMax = libNum.numMax(yMax, value);
          return {name: legendData[i], value: value};
        })
      };
    });
    if (yMax === 0) {
      yMax = 10;
    }

    const yAxisScaler = libNum.scaler(0, yMax, 0, 1, true);
    const yAxisDisplayScaler = libNum.scaler(0, 1, 0, yMax);

    data = data.map(function (row) {
      return {
        label: row.label,
        data: row.data.map(function (value) {
          return {name: value.name, value: yAxisScaler(value.value)};
        })
      };
    });

    const prettyNumToStringDigitsForAxis = libNum.getPrettyNumToStringDigits(5);

    const yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickFormat(function (d) {
          return prettyNumToStringDigitsForAxis(yAxisDisplayScaler(jsnums.fromFixnum(d, RUNTIME.NumberErrbacks)));
        });

    x0.domain(data.map(function (d) { return d.label; }));
    x1.domain(legendData).rangeRoundBands([0, x0.rangeBand()]);

    appendAxisLabel(canvas, windowOptions, width, height, 1, 0);

    canvas.append('g')
        .attr('class', 'x axis')
        .attr('transform', svgTranslate(0, height))
        .call(xAxis)
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.4em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-25)");

    canvas.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end');

    canvas.selectAll('.x.axis path').style({
      stroke: 'black',
      'stroke-width': 2,
      fill: 'none'
    });
    canvas.selectAll('.y.axis path').style({
      stroke: 'black',
      'stroke-width': 2,
      fill: 'none'
    });

    canvas.selectAll('.axis').style({'shape-rendering': 'crispEdges'});
    canvas.selectAll('.axis text').style({'font-size': '10px'});

    const bar = canvas.selectAll('.bar')
        .data(data)
      .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', function (d) {
          return svgTranslate(x0(d.label), 0);
        });

    bar.selectAll('rect')
        .data(function (d) { return d.data; })
      .enter().append('rect')
        .attr('width', x1.rangeBand())
        .attr('x', function (d) { return x1(d.name); })
        .attr('y', function (d) { return y(d.value); })
        .attr('height', function (d) { return height - y(d.value); })
        .style('fill', function (d) { return color(d.name); });

    if (RUNTIME.isPyretTrue(showLegend)) {
      const legendSvg = canvas.selectAll('.legend')
        .data(legendData.slice().reverse())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
          return svgTranslate(0, i * 20);
        });

      legendSvg
        .append('rect')
        .attr('x', width - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

      legendSvg
        .append('text')
        .attr('x', width - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style({
          'text-anchor': 'end',
          'font-size': '10px'
        })
        .text(function (d) { return d; });
    }

    return callBigBang(detached, restarter, resizer, windowOptions, dimension, null, null);
  }

  function dotChart(restarter, windowOptions, table) {
    /*
     * Dot Chart
     */

    function resizer(restarter, windowOptions) {
      dotChart(restarter, windowOptions, table);
    }

    var dimension = getDimension({
      minWindowWidth: 505,
      minWindowHeight: 430,
      marginLeft: 120,
      marginRight: 30,
      marginTop: 25,
      marginBottom: 45,
      mode: 'top-left',
    }, windowOptions),
        width = dimension.width,
        height = dimension.height,
        detached = createDiv(),
        canvas = createCanvas(detached, dimension);

    const yMax = 40;
    const data = table.map(function(row) {
      return { label: row[0], value: jsnums.toFixnum(row[1]) };
    })

    var x0 = d3.scale.ordinal()
      .domain(data.map(function (d) { return d.label; }))
      .rangeRoundBands([0, width], 0.1);
    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient('bottom');
    var y = d3.scale.linear()
        .domain([0, yMax])
        .range([height, 0]);
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    canvas.append('g')
        .attr('class', 'x axis')
        .attr('transform', svgTranslate(0, height))
        .call(xAxis);

    canvas.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end');

    canvas.selectAll('.x.axis path').style({
      stroke: 'black',
      'stroke-width': 2,
      fill: 'none'
    });
    canvas.selectAll('.y.axis path').style({
      stroke: 'black',
      'stroke-width': 2,
      fill: 'none'
    });

    canvas.selectAll('.axis').style({'shape-rendering': 'crispEdges'});
    canvas.selectAll('.axis text').style({'font-size': '10px'});

    const dataCircle = libData.flatten(
      data.map(function (row) {
        const upper = Math.ceil(row.value);
        return d3.range(upper).map(function(y) {
          return { label: row.label, y: y + 1 };
        })
      }));

    const offset = y(yMax - 1) / 2;
    const radius = height / yMax / 2 / 1.2;

    canvas.append("defs").selectAll("clipPath")
        .data(data)
      .enter()
      .append("clipPath")
      .attr("id", function(d) { return "bar-" + d.label; })
      .append("rect")
      .attr("x", function(d) { return x0(d.label) - radius + x0.rangeBand() / 2; })
      .attr("y", function(d) {
        const fraction = d.value - Math.floor(d.value);
        return y(Math.ceil(d.value)) + offset + radius - 2*radius*(fraction == 0 ? 1 : fraction);
      })
      .attr("height", function(d) { return height - y(d.value); })
      .attr("width", 2 * radius);

    canvas.append("g").selectAll("circle")
        .data(dataCircle)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return x0(d.label) + x0.rangeBand() / 2; })
      .attr("cy", function(d) { return y(d.y) + offset; })
      .attr("r", radius)
      .style("stroke", "steelblue")
      .style("fill", "none");

    canvas.append("g").selectAll("circle")
        .data(dataCircle)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return x0(d.label) + x0.rangeBand() / 2; })
      .attr("cy", function(d) { return y(d.y) + offset; })
      .attr("clip-path", function(d) { return "url(#bar-" + d.label + ")"; })
      .attr("r", radius)
      .style("fill", "steelblue");

    return callBigBang(detached, restarter, resizer, windowOptions, dimension, null, null);
  }

  function boxChart(restarter, windowOptions, table) {
    /*
     * Box Chart
     */

    function resizer(restarter, windowOptions) {
      boxChart(restarter, windowOptions, table);
    }

    var dimension = getDimension({
      minWindowWidth: 505,
      minWindowHeight: 430,
      marginLeft: 120,
      marginRight: 30,
      marginTop: 25,
      marginBottom: 45,
      mode: 'top-left',
    }, windowOptions),
        width = dimension.width,
        height = dimension.height,
        detached = createDiv(),
        canvas = createCanvas(detached, dimension);


    var y = d3.scale.linear()
        .domain([0, 1])
        .range([height, 0]);
    var color = d3.scale.category20();
    var yMax = 0;
    var data = table.map(function (row) {
      return {
        label: row[0],
        data: RUNTIME.ffi.toArray(row[1]).map(function (value) {
          yMax = libNum.numMax(yMax, value);
          return value;
        })
      };
    });

    var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient('bottom');

    var yAxisScaler = libNum.scaler(0, yMax, 0, 1, true);
    var yAxisDisplayScaler = libNum.scaler(0, 1, 0, yMax);

    data = data.map(function (row) {
      return {
        label: row.label,
        data: row.data.map(yAxisScaler)
      };
    });

    var prettyNumToStringDigitsForAxis = libNum.getPrettyNumToStringDigits(5);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickFormat(function (d) {
          return prettyNumToStringDigitsForAxis(yAxisDisplayScaler(jsnums.fromFixnum(d, RUNTIME.NumberErrbacks)));
        });

    x0.domain(data.map(function (d) { return d.label; }));

    canvas.append('g')
        .attr('class', 'x axis')
        .attr('transform', svgTranslate(0, height))
        .call(xAxis);

    canvas.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end');

    canvas.selectAll('.x.axis path').style({
      stroke: 'black',
      'stroke-width': 2,
      fill: 'none'
    });
    canvas.selectAll('.y.axis path').style({
      stroke: 'black',
      'stroke-width': 2,
      fill: 'none'
    });

    canvas.selectAll('.axis').style({'shape-rendering': 'crispEdges'});
    canvas.selectAll('.axis text').style({'font-size': '10px'});
    canvas.selectAll('rect')
        .data(data.map(function(row) { return row.data; }))
      .enter().append('rect')
        .attr('width', x0.rangeBand())
        .attr('x', function (d) { return x0(d.name); })
        .attr('y', function (d) { return y(d.value); })
        .attr('height', function (d) { return height - y(d.value); })
        .style('fill', function (d) { return color(d.name); });

    return callBigBang(detached, restarter, resizer, windowOptions, dimension, null, null);
  }

  function makeFunction(f) {
    return RUNTIME.makeFunction(function() {
      const arr = new Array(arguments.length + 1);
      for (let i = 0; i < arguments.length; i++) {
        arr[i + 1] = arguments[i];
      }
      arr[0] = RUNTIME.nothing;
      return f.apply(null, arr);
    });
  }

  return RUNTIME.makeObject({
    'provide-plus-types': RUNTIME.makeObject({
      types: RUNTIME.makeObject({
      }),
      values: RUNTIME.makeObject({
        histogram: makeFunction(histogram),
        'pie-chart': makeFunction(pieChart),
        'plot-multi': makeFunction(plotMulti),
        'bar-chart': makeFunction(barChart),
        'dot-chart': makeFunction(dotChart),
        'box-chart': makeFunction(boxChart),
      })
    })
  });
}
})
