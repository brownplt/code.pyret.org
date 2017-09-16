({
  requires: [
    { 'import-type': 'builtin', 'name': 'image-lib' },
  ],
  nativeRequires: [
    'pyret-base/js/js-numbers',
    'google-charts',
  ],
  provides: {},
  theModule: function (RUNTIME, NAMESPACE, uri, IMAGE, jsnums , google) {
  'use strict';

  // Load google library via editor.html to avoid loading issues

  //const google = _google.google;
  const isTrue = RUNTIME.isPyretTrue;
  const get = RUNTIME.getField;
  const toFixnum = jsnums.toFixnum;
  const cases = RUNTIME.ffi.cases;

  google.charts.load('current', {'packages' : ['corechart']});

  //////////////////////////////////////////////////////////////////////////////

  function getPrettyNumToStringDigits(d) {
    // this accepts Pyret num
    return n =>
      jsnums.toStringDigits(n, d, RUNTIME.NumberErrbacks).replace(/\.?0*$/, '');
  }

  const prettyNumToStringDigits5 = getPrettyNumToStringDigits(5);

  function convertColor(v) {
    function p(pred, name) {
        return val => {
            RUNTIME.makeCheckType(pred, name)(val);
            return val;
        };
    }

    const colorDb = IMAGE.colorDb;
    const _checkColor = p(IMAGE.isColorOrColorString, 'Color');

    function checkColor(val) {
        let aColor = _checkColor(val);
        if (colorDb.get(aColor)) {
            aColor = colorDb.get(aColor);
        }
        return aColor;
    }

    function rgb2hex(rgb){
      // From http://jsfiddle.net/Mottie/xcqpF/1/light/
      rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
      return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }
    return rgb2hex(IMAGE.colorString(checkColor(v)));
  }

  //////////////////////////////////////////////////////////////////////////////

  function getNewWindow(xMinC, xMaxC, yMinC, yMaxC, numSamplesC) {
    return cases(RUNTIME.ffi.isOption, 'Option',
                 RUNTIME.string_to_number(xMinC.val()), {
      none: function () {
        xMinC.addClass('error-bg');
        xMinC.removeClass('ok-bg');
        return null;
      },
      some: function (xMinVal) {
        xMinC.removeClass('error-bg');
        xMinC.addClass('ok-bg');
        return cases(RUNTIME.ffi.isOption, 'Option',
                     RUNTIME.string_to_number(xMaxC.val()), {
          none: function () {
            xMaxC.addClass('error-bg');
            xMaxC.removeClass('ok-bg');
            return null;
          },
          some: function (xMaxVal) {
            xMaxC.removeClass('error-bg');
            xMaxC.addClass('ok-bg');

            if (jsnums.greaterThanOrEqual(xMinVal, xMaxVal,
                                          RUNTIME.NumberErrbacks)) {
              xMinC.addClass('error-bg');
              xMaxC.addClass('error-bg');
              xMinC.removeClass('ok-bg');
              xMaxC.removeClass('ok-bg');
              return null;
            }

            return cases(RUNTIME.ffi.isOption, 'Option',
                         RUNTIME.string_to_number(yMinC.val()), {
              none: function () {
                yMinC.addClass('error-bg');
                yMinC.removeClass('ok-bg');
                return null;
              },
              some: function (yMinVal) {
                yMinC.removeClass('error-bg');
                yMinC.addClass('ok-bg');

                return cases(RUNTIME.ffi.isOption, 'Option',
                             RUNTIME.string_to_number(yMaxC.val()), {
                  none: function () {
                    yMaxC.addClass('error-bg');
                    yMaxC.removeClass('ok-bg');
                    return null;
                  },
                  some: function (yMaxVal) {
                    yMaxC.removeClass('error-bg');
                    yMaxC.addClass('ok-bg');

                    if (jsnums.greaterThanOrEqual(xMinVal, xMaxVal,
                                                  RUNTIME.NumberErrbacks)) {
                      yMinC.addClass('error-bg');
                      yMaxC.addClass('error-bg');
                      yMinC.removeClass('ok-bg');
                      yMaxC.removeClass('ok-bg');
                      return null;
                    }

                    return cases(RUNTIME.ffi.isOption, 'Option',
                                 RUNTIME.string_to_number(numSamplesC.val()), {
                      none: function () {
                        numSamplesC.addClass('error-bg');
                        numSamplesC.removeClass('ok-bg');
                        return null;
                      },
                      some: function (numSamplesVal) {
                        numSamplesC.removeClass('error-bg');
                        numSamplesC.addClass('ok-bg');

                        if (!isTrue(RUNTIME.num_is_integer(numSamplesVal)) ||
                            jsnums.lessThanOrEqual(numSamplesVal, 1,
                                                   RUNTIME.NumberErrbacks)) {
                          numSamplesC.addClass('error-bg');
                          numSamplesC.removeClass('ok-bg');
                          return null;
                        }

                        return {
                          'x-min': RUNTIME.ffi.makeSome(xMinVal),
                          'x-max': RUNTIME.ffi.makeSome(xMaxVal),
                          'y-min': RUNTIME.ffi.makeSome(yMinVal),
                          'y-max': RUNTIME.ffi.makeSome(yMaxVal),
                          'num-samples': numSamplesVal
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
  }

  //////////////////////////////////////////////////////////////////////////////

  function axesNameMutator(options, globalOptions, _) {
    const hAxis = ('hAxis' in options) ? options.hAxis : {};
    const vAxis = ('vAxis' in options) ? options.vAxis : {};
    hAxis.title = get(globalOptions, 'x-axis');
    vAxis.title = get(globalOptions, 'y-axis');
    $.extend(options, {hAxis: hAxis, vAxis: vAxis});
  }

  function yAxisRangeMutator(options, globalOptions, _) {
    const vAxis = ('vAxis' in options) ? options.vAxis : {};
    const viewWindow = ('viewWindow' in vAxis) ? vAxis.viewWindow : {};

    const minValue = get(globalOptions, 'y-min');
    const maxValue = get(globalOptions, 'y-max');

    cases(RUNTIME.ffi.isOption, 'Option', minValue, {
      none: function () {},
      some: function (realMinValue) {
        const v = toFixnum(realMinValue)
        vAxis.minValue = v;
        viewWindow.min = v;
      }
    });
    cases(RUNTIME.ffi.isOption, 'Option', maxValue, {
      none: function () {},
      some: function (realMaxValue) {
        const v = toFixnum(realMaxValue)
        vAxis.maxValue = v;
        viewWindow.max = v;
      }
    });
    vAxis.viewWindow = viewWindow;
    $.extend(options, {vAxis: vAxis});
  }

  function xAxisRangeMutator(options, globalOptions, _) {
    const hAxis = ('hAxis' in options) ? options.hAxis : {};
    const viewWindow = ('viewWindow' in hAxis) ? hAxis.viewWindow : {};

    const minValue = get(globalOptions, 'x-min');
    const maxValue = get(globalOptions, 'x-max');

    cases(RUNTIME.ffi.isOption, 'Option', minValue, {
      none: function () {},
      some: function (realMinValue) {
        hAxis.minValue = toFixnum(realMinValue);
        viewWindow.min = toFixnum(realMinValue);
      }
    });
    cases(RUNTIME.ffi.isOption, 'Option', maxValue, {
      none: function () {},
      some: function (realMaxValue) {
        hAxis.maxValue = toFixnum(realMaxValue);
        viewWindow.max = toFixnum(realMaxValue);
      }
    });

    hAxis.viewWindow = viewWindow;
    $.extend(options, {hAxis: hAxis});
  }

  //////////////////////////////////////////////////////////////////////////////

  function pieChart(globalOptions, rawData) {
    const table = get(rawData, 'tab');
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Label');
    data.addColumn('number', 'Value');
    data.addRows(table.map(row => [row[0], toFixnum(row[1])]));
    return {
      data: data,
      options: {
        slices: table.map(row => ({offset: toFixnum(row[2])})),
        legend: {
          alignment: 'end'
        }
      },
      chartType: google.visualization.PieChart,
      onExit: defaultImageReturn,
    };
  }

  function barChart(globalOptions, rawData) {
    const table = get(rawData, 'tab');
    const legends = get(rawData, 'legends');
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Label');
    legends.forEach(legend => data.addColumn('number', legend));
    data.addRows(table.map(row => [row[0]].concat(row[1].map(n => toFixnum(n)))));
    return {
      data: data,
      options: {
        legend: {
          position: isTrue(get(rawData, 'has-legend')) ? 'right' : 'none'
        }
      },
      chartType: google.visualization.ColumnChart,
      onExit: defaultImageReturn,
      mutators: [axesNameMutator, yAxisRangeMutator],
    };
  }

  function histogram(globalOptions, rawData) {
    const table = get(rawData, 'tab');
    const data = new google.visualization.DataTable();

    data.addColumn('string', 'Label');
    data.addColumn('number', get(rawData, 'value-name'));
    data.addRows(table.map(row => [row[0], toFixnum(row[1])]));

    // set legend to none because there's only one data set
    const options = {legend: {position: 'none'}, histogram: {}};

    const binWidth = get(rawData, 'bin-width');
    if (binWidth !== 0) {
      options.histogram.bucketSize = toFixnum(binWidth);
    }
    const maxNumBins = get(rawData, 'max-num-bins');
    if (maxNumBins !== 0) {
      options.histogram.maxNumBuckets = toFixnum(maxNumBins);
    }
    const minNumBins = get(rawData, 'min-num-bins');
    if (minNumBins !== 0) {
      options.histogram.minNumBuckets = toFixnum(minNumBins);
    }

    /*
    The main reason to use `x-min`, `x-max` is so that students can compare
    different histogram agaisnt each other. Setting `x-min`, `x-max` on `hAxis`
    is more accurate than setting it to `histogram`

    const xMin = toFixnum(get(globalOptions, 'x-min'));
    const xMax = toFixnum(get(globalOptions, 'x-max'));
    if (xMin < xMax) {
      options.histogram.minValue = xMin;
      options.histogram.maxValue = xMax;
    }
    */

    return {
      data: data,
      options: options,
      chartType: google.visualization.Histogram,
      onExit: defaultImageReturn,
      mutators: [axesNameMutator, yAxisRangeMutator, xAxisRangeMutator],
    };
  }

  function plotMulti(globalOptions, rawData) {
    const scatters = get(rawData, 'scatters');
    const lines = get(rawData, 'lines');
    const data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    const combined = scatters.concat(lines);
    const legends = [];
    let cnt = 1;
    combined.forEach(p => {
      let legend = get(p, 'legend');
      if (legend === '') {
        legend = `Plot ${cnt}`;
        cnt++;
      }
      legends.push(legend);
      data.addColumn('number', legend);
      data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
    });

    combined.forEach((p, i) => {
      /*
      x | n n n | y | n n n n n n n n n n n n
            i         combined.length - i - 1
      */
      const prefix = new Array(2 * i).fill(null);
      const suffix = new Array(2 * (combined.length - i - 1)).fill(null);
      const rowTemplate = [0].concat(prefix).concat([null, null]).concat(suffix);
      data.addRows(get(p, 'ps').map(row => {
        const currentRow = rowTemplate.slice();
        if (row.length != 0) {
          currentRow[0] = toFixnum(row[0]);
          currentRow[2*i + 1] = toFixnum(row[1]);
          const labelRow = (row[2] !== '') ? `<p>label: <b>${row[2]}</b></p>` : '';
          currentRow[2*i + 2] = `<p>${legends[i]}</p>
<p>x: <b>${currentRow[0]}</b></p>
<p>y: <b>${currentRow[2*i + 1]}</b></p>
${labelRow}`;
        }
        return currentRow;
      }));
    });

    const options = {
      tooltip: {isHtml: true},
      series: combined.map((p, i) => {
        // scatters and then lines
        const seriesOptions = {color: convertColor(get(p, 'color'))};
        if (i < scatters.length) {
          $.extend(seriesOptions, {
            pointSize: toFixnum(get(p, 'point-size')),
            lineWidth: 0,
          });
        }
        return seriesOptions;
      }),
      legend: {position: 'bottom',},
      crosshair: {trigger: 'selection'}
    };

    if (isTrue(get(globalOptions, 'interact'))) {
      $.extend(options, {
        chartArea: {
          left: '12%',
          width: '56%',
        }
      });
    }

    return {
      data: data,
      options: options,
      chartType: google.visualization.LineChart,
      onExit: (restarter, result) =>
        imageReturn(
          result.chart.getImageURI(),
          restarter,
          RUNTIME.ffi.makeRight),
      mutators: [axesNameMutator, yAxisRangeMutator, xAxisRangeMutator],
      overlay: (overlay, restarter) => {
        overlay.css({
          width: '30%',
          position: 'absolute',
          right: '0px',
          top: '50%',
          transform: 'translateY(-50%)',
        });

        const controller = $('<div/>');

        overlay.append(controller);

        const inputSize = 16;

        const xMinC = $('<input/>', {
          'class': 'controller',
          type: 'text',
          placeholder: 'x-min',
        }).attr('size', inputSize);
        const xMaxC = $('<input/>', {
          'class': 'controller',
          type: 'text',
          placeholder: 'x-max',
        }).attr('size', inputSize);
        const yMinC = $('<input/>', {
          'class': 'controller',
          type: 'text',
          placeholder: 'y-min',
        }).attr('size', inputSize);
        const yMaxC = $('<input/>', {
          'class': 'controller',
          type: 'text',
          placeholder: 'y-max',
        }).attr('size', inputSize);
        const numSamplesC = $('<input/>', {
          'class': 'controller',
          type: 'text',
          placeholder: '#samples',
        }).attr('size', inputSize);
        const redrawC = $('<button/>', {
          'class': 'controller',
          text: 'Redraw',
        }).click(() => {
          const newWindow = getNewWindow(
            xMinC, xMaxC, yMinC, yMaxC, numSamplesC
          );
          if (newWindow === null) return;
          const toRet = RUNTIME.ffi.makeLeft(
            RUNTIME.extendObj(
              RUNTIME.makeSrcloc('dummy location'),
              globalOptions,
              newWindow
            )
          );
          RUNTIME.getParam('remove-chart-port')();
          restarter.resume(toRet);
        });

        xMinC.val(prettyNumToStringDigits5(get(get(globalOptions, 'x-min'), 'value')));
        xMaxC.val(prettyNumToStringDigits5(get(get(globalOptions, 'x-max'), 'value')));
        yMinC.val(prettyNumToStringDigits5(get(get(globalOptions, 'y-min'), 'value')));
        yMaxC.val(prettyNumToStringDigits5(get(get(globalOptions, 'y-max'), 'value')));
        numSamplesC.val(RUNTIME.num_to_string(get(globalOptions, 'num-samples')));

        const xMinG = $('<p/>')
          .append($('<label/>', {'class': 'controller', text: 'x-min: '}))
          .append(xMinC);
        const xMaxG = $('<p/>')
          .append($('<label/>', {'class': 'controller', text: 'x-max: '}))
          .append(xMaxC);
        const yMinG = $('<p/>')
          .append($('<label/>', {'class': 'controller', text: 'y-min: '}))
          .append(yMinC);
        const yMaxG = $('<p/>')
          .append($('<label/>', {'class': 'controller', text: 'y-max: '}))
          .append(yMaxC);
        const redrawG = $('<p/>')
          .append(redrawC);

        if (isTrue(get(globalOptions, 'is-show-samples'))) {
          const numSamplesG = $('<p/>')
            .append($('<label/>', {'class': 'controller', text: '#samples: '}))
            .append(numSamplesC);
          controller
            .append(xMinG)
            .append(xMaxG)
            .append(yMinG)
            .append(yMaxG)
            .append(numSamplesG)
            .append(redrawG);
        } else {
          controller
            .append(xMinG)
            .append(xMaxG)
            .append(yMinG)
            .append(yMaxG)
            .append(redrawG);
        }
      },
    };
  }

  //////////////////////////////////////////////////////////////////////////////


  function onExitRetry(resultGetter, restarter) {
    const result = resultGetter();
    if (result !== null) {
      result.onExit(restarter, result);
    } else {
      setTimeout(onExitRetry, 100, resultGetter, restarter);
    }
  }


  function imageReturn(url, restarter, hook) {
    const rawImage = new Image();
    rawImage.onload = () => {
      restarter.resume(
        hook(
          RUNTIME.makeOpaque(
            IMAGE.makeFileImage(url, rawImage),
            IMAGE.imageEquals
          )
        )
      );
    };
    rawImage.onerror = e => {
      restarter.error(
        RUNTIME.ffi.makeMessageException(
          'unable to load the image: ' + e.message));
    }
    rawImage.src = url;
  }

  function defaultImageReturn(restarter, result) {
    /*
    We in fact should put imageReturn(...) inside

    google.visualization.events.addListener(result.chart, 'ready', () => {
      ...
    });

    However, somehow this event is never triggered, so we will just call
    it here to guarantee that it will return.
    */
    imageReturn(result.chart.getImageURI(), restarter, x => x);
  }

  function makeFunction(f) {
    return RUNTIME.makeFunction((globalOptions, rawData) => {
      const root = $('<div/>');
      const overlay = $('<div/>', {style: 'position: absolute'});
      const isInteractive = isTrue(get(globalOptions, 'interact'));

      let result = null;

      function draw() {
        if (result != null) {
          const newOptions = $.extend({}, {
            title: get(globalOptions, 'title')
          }, result.options);
          result.chart.draw(result.data, newOptions);
        }
      }

      function setup(restarter) {
        const tmp = f(globalOptions, rawData);
        tmp.chart = new tmp.chartType(root[0]);
        const options = {backgroundColor: {fill: 'transparent'}};

        if ('mutators' in tmp) {
          tmp.mutators.forEach(fn => fn(options, globalOptions, rawData));
        }

        tmp.options =
          $.extend({}, options, 'options' in tmp ? tmp.options : {});

        if ('overlay' in tmp) tmp.overlay(overlay, restarter);

        // only mutate result when everything is setup
        result = tmp;
        // this draw will have a wrong width / height, but do it for now so
        // that overlay works
        draw();
        // must append the overlay _after_ drawing to make the overlay appear
        // correctly
        root.append(overlay);
      }

      return RUNTIME.pauseStack(restarter => {
        google.charts.setOnLoadCallback(() => {
          setup(restarter);
          RUNTIME.getParam('chart-port')({
            root: root[0],
            onExit: () => onExitRetry(() => result, restarter),
            draw: draw,
            windowOptions: {
              width: toFixnum(get(globalOptions, 'width')),
              height: toFixnum(get(globalOptions, 'height'))
            },
            isInteractive: isInteractive,
          });
        });
      });
    });
  }

  return RUNTIME.makeObject({
    'provide-plus-types': RUNTIME.makeObject({
      types: RUNTIME.makeObject({}),
      values: RUNTIME.makeObject({
        'pie-chart': makeFunction(pieChart),
        'bar-chart': makeFunction(barChart),
        'histogram': makeFunction(histogram),
        'plot-multi': makeFunction(plotMulti),
      })
    })
  });
}
})
