({
  requires: [
    { 'import-type': 'builtin', 'name': 'image-lib' },
  ],
  nativeRequires: [
    'pyret-base/js/js-numbers',
    'google-charts',
  ],
  provides: {
    values: {
      'pie-chart': "tany",
      'bar-chart': "tany",
      'histogram': "tany",
      'box-plot': "tany",
      'plot': "tany"
    }
  },
  theModule: function (RUNTIME, NAMESPACE, uri, IMAGELIB, jsnums , google) {
  'use strict';

  // Load google library via editor.html to avoid loading issues

  //const google = _google.google;
  const isTrue = RUNTIME.isPyretTrue;
  const get = RUNTIME.getField;
  const toFixnum = jsnums.toFixnum;
  const cases = RUNTIME.ffi.cases;

  var IMAGE = get(IMAGELIB, "internal");

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

    cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'y-min'), {
      none: function () {},
      some: function (minValue) {
        const v = toFixnum(minValue);
        vAxis.minValue = v;
        viewWindow.min = v;
      }
    });
    cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'y-max'), {
      none: function () {},
      some: function (maxValue) {
        const v = toFixnum(maxValue);
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

  function boxPlot(globalOptions, rawData) {
    var table = get(rawData, 'tab');
    const dimension = toFixnum(get(rawData, 'height'));
    const horizontal = get(rawData, 'horizontal');
    const showOutliers = get(rawData, 'show-outliers');
    const axisName = horizontal ? 'hAxis' : 'vAxis';
    const chartType = horizontal ? google.visualization.BarChart : google.visualization.ColumnChart;
    const data = new google.visualization.DataTable();

    const intervalOptions = {
      lowNonOutlier: {
        style: 'bars',
        fillOpacity: 1,
        color: '#777'
      },
      highNonOutlier: {
        style: 'bars',
        fillOpacity: 1,
        color: '#777'
      }
    };


    data.addColumn('string', 'Label');
    data.addColumn('number', 'Total');
    data.addColumn({id: 'firstQuartile', type: 'number', role: 'interval'});
    data.addColumn({id: 'median', type: 'number', role: 'interval'});
    data.addColumn({id: 'thirdQuartile', type: 'number', role: 'interval'});
    data.addColumn({id: 'highNonOutlier', type: 'number', role: 'interval'});
    data.addColumn({id: 'lowNonOutlier', type: 'number', role: 'interval'});
    data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});

    // NOTE(joe & emmanuel, Aug 2019): With the current chart library, it seems
    // like we can only get outliers to work as a variable-length row if we
    // have a single row of data. It's an explicit error to mix row lengths.
    // Since the main use case where outliers matter is for single-column
    // box-plots, this maintains existing behavior (if anyone was relying on
    // multiple series), while adding the ability to render outliers for BS:DS.
    if(table.length === 1 && showOutliers) {
      var extraCols = table[0][8].length + table[0][9].length;
      for(var i = 0; i < extraCols; i += 1) {
        data.addColumn({id: 'outlier', type: 'number', role: 'interval'});
      }
      intervalOptions['outlier'] = { 'style':'points', 'color':'grey', 'pointSize': 10, 'lineWidth': 0, 'fillOpacity': 0.3 };
    }
    else {
      // NOTE(joe & emmanuel, Aug 2019 cont.): This forces the low and high
      // whiskers to be equal to the min/max when there are multiple rows since we
      // won't be able to render the outliers, and the whiskers need to cover
      //  the whole span of data.
      table = table.map(function(row) {
        row = row.slice(0, row.length);
        // force whisker to be max/min
        row[7] = row[2];
        row[6] = row[1];
        // empty outliers
        row[9] = [];
        row[8] = [];
        return row;
      });
    }

    const rowsToAdd = table.map(row => {
      const summaryValues = row.slice(3, 8).map(n => toFixnum(n));
      let tooltip = `<p><b>${row[0]}</b></p>
            <p>minimum: <b>${row[2]}</b></p>
            <p>maximum: <b>${row[1]}</b></p>
            <p>first quartile: <b>${summaryValues[0]}</b></p>
            <p>median: <b>${summaryValues[1]}</b></p>
            <p>third quartile: <b>${summaryValues[2]}</b></p>`;
      // ONLY if we're showing outliers, add whiskers to the tooltip
      // (otherwise, the min/max ARE the bottom/top whiskers)
      if(table.length == 1 && showOutliers) {
        tooltip += 
          ` <p>bottom whisker: <b>${summaryValues[4]}</b></p>
            <p>top whisker: <b>${summaryValues[3]}</b></p>`;
      }
      return [row[0], toFixnum(dimension)]
        .concat(summaryValues)
        .concat([tooltip])
        .concat(row[9]).concat(row[8]);
    });

    data.addRows(rowsToAdd);
    const options = {
      tooltip: {isHtml: true},
      legend: {position: 'none'},
      lineWidth: 0,
      intervals: {
        barWidth: 0.25,
        boxWidth: 0.8,
        lineWidth: 2,
        style: 'boxes'
      },
      interval: intervalOptions,
      dataOpacity: 0
    };
    /* NOTE(Oak): manually set the max value to coincide with bar charts' height
     * so that the bar charts are concealed (the automatic value from Google
     * is likely to screw this up)
     */
    options[axisName] = {
      maxValue: dimension,
      viewWindow: {
        max: dimension
      },
    };
    return {
      data: data,
      options: options,
      chartType: chartType,
      onExit: defaultImageReturn,
      mutators: [axesNameMutator],
    };
  }

  function histogram(globalOptions, rawData) {
    const table = get(rawData, 'tab');
    const data = new google.visualization.DataTable();

    data.addColumn('string', 'Label');
    data.addColumn('number', '');
    
    var max, min;
    var val = null;
    var hasAtLeastTwoValues = false;
    data.addRows(table.map(row => {
      var valfix = toFixnum(row[1]);
      if(val !== null && val !== valfix) { hasAtLeastTwoValues = true; }
      if(val === null) { val = valfix; }
      if(max === undefined) { max = valfix; }
      if(min === undefined) { min = valfix; }
      if(valfix > max) { max = valfix; }
      if(valfix < min) { min = valfix; }
      return [row[0], valfix];
    }));

    // set legend to none because there's only one data set
    const options = {legend: {position: 'none'}, histogram: {}};

    cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'bin-width'), {
      none: function () {},
      some: function (binWidth) {
        // NOTE(joe, aug 2019): The chart library has a bug for histograms with
        // a single unique value (https://jsfiddle.net/L0y64fbo/2/), so thisi
        // hackaround makes it so this case can't come up.
        if(hasAtLeastTwoValues) {
          options.histogram.bucketSize = toFixnum(binWidth);
        }
      }
    });

    cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'max-num-bins'), {
      none: function () {},
      some: function (maxNumBins) {
        options.histogram.maxNumBuckets = toFixnum(maxNumBins);
      }
    });

    cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'min-num-bins'), {
      none: function () {
        if(options.histogram.bucketSize !== undefined) {
          options.histogram.minNumBuckets = Math.floor((max - min) / options.histogram.bucketSize) + 1; 
        }
      },
      some: function (minNumBins) {
        options.histogram.minNumBuckets = toFixnum(minNumBins);
      }
    });

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
    
  function geoChart(globalOptions, rawData) {
      const table = get(rawData, 'tab');
      const data = new google.visualization.GeoMap;
      return {
          data: data,
          options: {
              slices: table.map(row => ({offset: toFixnum(row[2])})),
              legend: {
                  alignment: 'end'
              }
          },
          chartType: google.visualization.GeoMap,
          onExit: defaultImageReturn,
      }
  }
    
    
  function plot(globalOptions, rawData) {
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
          let labelRow = null;
          if (row.length >= 3 && row[2] !== '') {
            labelRow = `<p>label: <b>${row[2]}</b></p>`;
          } else {
            labelRow = '';
          }
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
        // are we using custom images instead of dots?
        const hasImage = get(p, 'ps').filter(p => p[3]).length > 0;
    
        // scatters and then lines
        const seriesOptions = {};

        cases(RUNTIME.ffi.isOption, 'Option', get(p, 'color'), {
          none: function () {},
          some: function (color) {
            seriesOptions.color = convertColor(color);
          }
        });
        // If we have our own image, make the point small and transparent
        if (i < scatters.length) {
          $.extend(seriesOptions, {
            pointSize: hasImage? 1 :toFixnum(get(p, 'point-size')),
            lineWidth: 0,
            dataOpacity: hasImage? 0 : 1,
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
      onExit: (restarter, result) => {
        let svg = result.chart.container.querySelector('svg');
        let svg_xml = (new XMLSerializer()).serializeToString(svg);
        let dataURI = "data:image/svg+xml;base64," + btoa(svg_xml);
        imageReturn(
          dataURI,
          restarter,
          RUNTIME.ffi.makeRight)
      },
      mutators: [axesNameMutator, yAxisRangeMutator, xAxisRangeMutator],
      overlay: (overlay, restarter, chart, container) => {
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
        }).attr('size', inputSize).val('2');
        // dummy value so that a new window can be constructed correctly
        // when numSamplesC is not used. The value must be at least 2

        const redrawC = $('<button/>', {
          'class': 'controller',
          text: 'Redraw',
        }).click(() => {
          const newWindow = getNewWindow(xMinC, xMaxC, yMinC, yMaxC, numSamplesC);
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

        function getBoundControl(control, name) {
          control.val(prettyNumToStringDigits5(
            get(get(globalOptions, name), 'value')));
          return $('<p/>')
           .append($('<label/>', {'class': 'controller', text: name + ': '}))
           .append(control);
        }

        const xMinG = getBoundControl(xMinC, 'x-min');
        const xMaxG = getBoundControl(xMaxC, 'x-max');
        const yMinG = getBoundControl(yMinC, 'y-min');
        const yMaxG = getBoundControl(yMaxC, 'y-max');
        const redrawG = $('<p/>').append(redrawC);

        if (isTrue(get(globalOptions, 'is-show-samples'))) {
          numSamplesC.val(RUNTIME.num_to_string(get(globalOptions, 'num-samples')));
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

        // if custom images is defined, use the image at that location
        // and overlay it atop each dot
        google.visualization.events.addListener(chart, 'ready', function () {
          // HACK(Emmanuel): 
          // The only way to hijack marker events is to walk the DOM here
          // If Google changes the DOM, these lines will likely break
          const svgRoot = chart.container.querySelector('svg');
          const markers = svgRoot.children[2].children[2].children;          

          const layout = chart.getChartLayoutInterface();
          // remove any labels that have previously been drawn
          $('.__img_labels').each((idx, n) => $(n).remove());

          // for each point, (1) find the x,y location, (2) render the SVGImage,
          // (3) center it on the datapoint, (4) steal all the events
          // and (5) add it to the chart
          combined.forEach((p, i) => {
            get(p, 'ps').filter(p => p[3]).forEach((p, i) => {
              const xPos = layout.getXLocation(data.getValue(i, 0));
              const yPos = layout.getYLocation(data.getValue(i, 1));
              const imgDOM = p[3].val.toDomNode();
              p[3].val.render(imgDOM.getContext('2d'), 0, 0);
              // make an image element from the SVG namespace
              let imageElt = document.createElementNS("http://www.w3.org/2000/svg", 'image');
              imageElt.classList.add('__img_labels'); // tag for later garbage collection
              imageElt.setAttributeNS(null, 'href', imgDOM.toDataURL());
              imageElt.setAttribute('x', xPos - imgDOM.width/2);  // center the image
              imageElt.setAttribute('y', yPos - imgDOM.height/2); // center the image
              Object.assign(imageElt, markers[i]); // we should probably not steal *everything*...
              svgRoot.appendChild(imageElt);
            });
          });
        });
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
    };
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

      function draw(optMutator) {
        optMutator = optMutator ? optMutator : x => x;
        if (result != null) {
          result.chart.draw(result.data, optMutator(result.options));
        }
      }

      function setup(restarter) {
        const tmp = f(globalOptions, rawData);
        tmp.chart = new tmp.chartType(root[0]);
        const options = {
          backgroundColor: {fill: 'transparent'},
          title: get(globalOptions, 'title'),
        };

        if ('mutators' in tmp) {
          tmp.mutators.forEach(fn => fn(options, globalOptions, rawData));
        }

        tmp.options = $.extend({}, options, 'options' in tmp ? tmp.options : {});

        if ('overlay' in tmp) tmp.overlay(overlay, restarter, tmp.chart, root);

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
            getImageURI: () => result.chart.getImageURI(),
            // thunk it here b/c apparently getImageURI is going to be mutated
            // by Google
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
        'box-plot': makeFunction(boxPlot),
        'plot': makeFunction(plot),
      })
    })
  });
}
})
