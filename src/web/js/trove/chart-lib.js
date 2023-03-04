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
      'multi-bar-chart': "tany",
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

  const ann = function(name, pred) {
    return RUNTIME.makePrimitiveAnn(name, pred);
  };

  var checkListWith = function(checker) {
    return function(val) {
      if (!RUNTIME.ffi.isList(val)) return false;
      var cur = val;
      var gf = RUNTIME.getField;
      while (RUNTIME.unwrap(RUNTIME.ffi.isLink(cur))) {
        var f = gf(cur, "first");
        if (!checker(f)) {
          return false;
        }
        cur = gf(cur, "rest");
      }
      return true;
    }
  }

  var checkOptionWith = function(checker) {
    return function(val) {
      if (!(RUNTIME.ffi.isNone(val) || RUNTIME.ffi.isSome(val))) return false;
      var gf = RUNTIME.getField;
      if (RUNTIME.unwrap(RUNTIME.ffi.isSome(val))) {
        var f = gf(val, "value");
        if (!checker(f)) {
          return false;
        }
      }
      return true;
    }
  }
  
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

  function convertPointer(p) {
    return {v: toFixnum(get(p, 'value')) , f: get(p, 'label')}
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

  /**
   * Adds multiple columns with the given properties and values after data
   * columns
   * 
   * For example, if given:
   * colProperties:
   *   {type: 'string', role: 'style'}
   * colValues:
   *   [
   *     [['red', 'black'], ['white', 'blue'], ['green', 'purple']],
   *     []
   *   ]
   * addNSpecialColumns will add 2 style columns after the first data column
   * and no columns after the second data column.
   * 
   * The number of columns added after a particular data column do not have to
   * agree. It is possible to add one special value on one row and two
   * special values on another row.
   * 
   * https://jsfiddle.net/eyanje/u83kaf92/
   * 
   * @param {DataTable} table a table to expand
   * @param {object} colProperties an object specifying column properties
   * @param {Array<Array<*>>>} colValues rows of groups of values to insert
   */
  function addNSpecialColumns(table, colProperties, colValues) {
    let dataColNums = [];
    let nDataCols;
    let groupWidths;
    for (let i = 1; i < table.getNumberOfColumns(); i++) {
      const role = table.getColumnRole(i);
      if (role === '' || role === 'data') {
        dataColNums.push(i);
      }
    }
    nDataCols = dataColNums.length;
    // Check column count
    // Should never run -- Pyret checks all column counts properly
    // This should be somewhat caught in the try-catch around setup(restarter),
    // unless it's been moved
    colValues.forEach((row, rowN) => {
      if (row.length !== nDataCols) {
        throw new Error(`Incorrect column count in row ${rowN}.`
          + ` Expected ${nDataCols}, given ${row.length}.`);
      }
    });
    // Tally columns needed for each group
    groupWidths = dataColNums.map(() => 0);
    colValues.forEach(row => {
      row.forEach((group, groupN) => {
        groupWidths[groupN] = Math.max(group.length, groupWidths[groupN]);
      });
    });
    // Add columns in reverse order
    for (let groupIndex = nDataCols - 1; groupIndex >= 0; groupIndex--) {
      for (let i = 0; i < groupWidths[groupIndex]; i++) {
        table.insertColumn(dataColNums[groupIndex] + 1, colProperties);
      }
    }
    // Adjust dataColNums to match expanded table
    let sum = 0;
    dataColNums.forEach((dataColNum, i) => {
        dataColNums[i] += sum;
      sum += groupWidths[i];
    });
    // Add columns in reverse order to avoid extra calculations
    colValues.forEach((row, rowN) => {
        row.forEach((group, groupN) => {
          group.forEach((val, i) => {
          table.setValue(rowN, dataColNums[groupN] + i + 1, val);
        });
      })
    });
  }

  /**
   * Adds columns with the given properties and values after data columns
   * 
   * For example, you may use this function to add columns with properties
   * {type: 'string', role: 'style'} and values
   * [['red', 'black'] ['white', 'blue'], ['green', 'purple']], to add
   * two style columns to a table with 3 rows and 2 columns.
   * 
   * @param {DataTable} table a table to expand
   * @param {object} colProperties an object specifying column properties
   * @param {Array<Array<*>>>} colValues rows of values to insert
   */
  function addSpecialColumns(table, colProperties, colValues) {
    addNSpecialColumns(table, colProperties,
      colValues.map(r => r.map(c => [c])));
  }

  function addAnnotations(table, rawData) {
    const rawAnnotations = get(rawData, 'annotations').map(row =>
      row.map(col =>
        cases(RUNTIME.ffi.isOption, 'Option', col, {
          none: function () {},
          some: function (annotation) { return annotation; }
        })
      )
    );
    const colProperties = { type: 'string', role: 'annotation' };
    addSpecialColumns(table, colProperties, rawAnnotations);
  }

  function addIntervals(table, rawData) {
    const colProperties = {type: 'number', role: 'interval'};
    addNSpecialColumns(table, colProperties, get(rawData, 'intervals'));
  }

  function selectMultipleMutator(options, globalOptions, _) {
    const multiple = get(globalOptions, 'multiple');
    if (multiple) {
      $.extend(options, {selectionMode: 'multiple'});
    } else {
      $.extend(options, {selectionMode: 'single'});
    }
  }

  function backgroundMutator(options, globalOptions, _) {
    const backgroundColor = cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'backgroundColor'), {
      none: function () {
        return 'transparent';
      },
      some: function (color) {
        return convertColor(color);
      }
    });
    const borderColor = cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'borderColor'), {
      none: function () {
        return '#666';
      },
      some: function (color) {
        return convertColor(color);
      }
    });
    const borderSize = toFixnum(get(globalOptions, 'borderSize'))
    $.extend(options, {
      backgroundColor: {
        fill: backgroundColor,
        strokeWidth: borderSize,
        stroke: borderColor,
      }
    });
  }
  function axesNameMutator(options, globalOptions, _) {
    const hAxis = ('hAxis' in options) ? options.hAxis : {};
    const vAxis = ('vAxis' in options) ? options.vAxis : {};
    hAxis.title = get(globalOptions, 'x-axis');
    vAxis.title = get(globalOptions, 'y-axis');
    $.extend(options, {hAxis: hAxis, vAxis: vAxis});
  }

  function gridlinesMutator(options, globalOptions, _) {
    const hAxis = ('hAxis' in options) ? options.hAxis : {};
    const vAxis = ('vAxis' in options) ? options.vAxis : {};

    const gridlineColor = cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'gridlineColor'), {
      none: function () {
        return '#aaa';
      },
      some: function (color) {
        return convertColor(color);
      }
    });

    const minorGridlineColor = cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'minorGridlineColor'), {
      none: function () {
        return '#ddd';
      },
      some: function (color) {
        return convertColor(color);
      }
    });

    const minorGridlineMinspacing = toFixnum(get(globalOptions, 'minorGridlineMinspacing'))

    hAxis.gridlines = {color: gridlineColor};
    vAxis.gridlines = {color: gridlineColor};

    cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'gridlineMinspacing'), {
      none: function () {
        hAxis.gridlines.count = 5;
      },
      some: function (minspacing) {
        hAxis.gridlines.minSpacing = toFixnum(minspacing);
      }
    });


    if (get(globalOptions, 'show-minor-grid-lines')) {
      hAxis.minorGridlines = {color: minorGridlineColor, minSpacing: minorGridlineMinspacing};
      vAxis.minorGridlines = {color: minorGridlineColor, minSpacing: minorGridlineMinspacing};
    } else {
      hAxis.minorGridlines = {count: 0};
      vAxis.minorGridlines = {count: 0};
    }
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

  // Default Google Chart Colors for sequential series (Like Multi Bar Charts and Pie Charts) from 
  // http://there4.io/2012/05/02/google-chart-color-list/

  const default_colors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
                            '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E',
                            '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC',
                            '#E67300', '#8B0707', '#329262', '#5574A6', '#3B3EAC']

  function pieChart(globalOptions, rawData) {
    const table = get(rawData, 'tab');
    const default_colors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
                            '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E',
                            '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC',
                            '#E67300', '#8B0707', '#329262', '#5574A6', '#3B3EAC']
    var colors_list = get_colors_list(rawData);

    if (colors_list.length < default_colors.length) {
      default_colors.splice(0, colors_list.length, ...colors_list);
      colors_list = default_colors;
      colors_list = colors_list.slice(0, table.length);
    }
    const new_colors_list = table.map(row => colors_list[row[3]])
    colors_list = new_colors_list
    
    const threeD = get(rawData, 'threeD');
    const piehole = toFixnum(get(rawData, 'piehole'));
    const startingAngle = toFixnum(get(rawData, 'startingAngle'));
    const collapseThreshold = toFixnum(get(rawData, 'collapseThreshold'));

    // ASSERT: if we're using custom images, the third column will be an object
    const hasImage = typeof table[0][3] == 'object';

    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Label');
    data.addColumn('number', 'Value');
    data.addRows(table.map(row => [row[0], toFixnum(row[1])]));
    return {
      data: data,
      options: {
        slices: table.map((row, i) => ({
          color: hasImage? "transparent" : colors_list[i], 
          offset: toFixnum(row[2])
        })),
        legend: {
          alignment: 'end'
        },
        is3D: threeD,
        pieHole: piehole,
        pieStartAngle: startingAngle,
        sliceVisibilityThreshold: collapseThreshold,
      },
      chartType: google.visualization.PieChart,
      onExit: defaultImageReturn,
      mutators: [backgroundMutator],
      overlay: (overlay, restarter, chart, container) => {
        // If we don't have images, our work is done!
        if(!hasImage) { return; }
        
        // if custom images are defined, use the image at that location
        // and overlay it atop each dot
        google.visualization.events.addListener(chart, 'ready', function () {
          // HACK(Emmanuel): 
          // The only way to hijack marker events is to walk the DOM here
          // If Google changes the DOM, these lines will likely break
          const svgRoot = chart.container.querySelector('svg');
          const slices = [...svgRoot.children].slice(2, -1);
          const defs = svgRoot.children[0];

          // remove any labels that have previously been drawn
          $('.__img_labels').each((idx, n) => $(n).remove());

          // Render each slice above the old ones, using the image as a pattern
          table.forEach((row, i) => {

            // render the image to an img tag
            const imgDOM = row[3].val.toDomNode();
            row[3].val.render(imgDOM.getContext('2d'), 0, 0);
            
            // make an SVGimage element from the img tag, and make it the size of the slice
            const sliceBox = slices[i].getBoundingClientRect();
            const imageElt = document.createElementNS("http://www.w3.org/2000/svg", 'image');
            imageElt.classList.add('__img_labels'); // tag for later garbage collection
            imageElt.setAttributeNS(null, 'href', imgDOM.toDataURL());
            imageElt.setAttribute('width',  Math.max(sliceBox.width, sliceBox.height));

            // create a pattern from that image
            const patternElt = document.createElementNS("http://www.w3.org/2000/svg", 'pattern');
            patternElt.setAttribute(  'x',    0);
            patternElt.setAttribute(  'y',    0);
            patternElt.setAttribute('width',  1);
            patternElt.setAttribute('height', 1);
            patternElt.setAttribute( 'id',   'pic'+i);

            // make a new slice, copy elements from the old slice, and fill with the pattern
            const newSlice = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            Object.assign(newSlice, slices[i]); // we should probably not steal *everything*...
            newSlice.setAttribute(  'd',       slices[i].firstChild.getAttribute('d'));
            newSlice.setAttribute( 'fill',         'url(#pic'+i+')');

            // add the image to the pattern, the pattern to the defs, and the slice to the root
            patternElt.appendChild(imageElt);
            defs.append(patternElt);
            const group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            group.appendChild(newSlice);
            svgRoot.appendChild(group);
          });
        });
      }
    }
  }

  //////////// Bar Chart Getter Functions /////////////////

  function get_colors_list(rawData) {
    // Sets up the color list [Each Bar Colored Individually]
    return cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'colors'), {
        none: function () {
          return [];
        },
        some: function (colors) {
          return colors.map(convertColor);
        }
    });
  }

  function get_default_color(rawData) { 
    // Sets up the default color [Default Bar Color if not specified in color_list]
    return cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'color'), {
        none: function () {
          return "";
        },
        some: function (color) {
          return convertColor(color);
        }
    });
  }

  function get_pointers_list(rawData) {
    // Sets up the pointers list [Coloring each group memeber/stack]
    return cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'pointers'), {
        none: function () {
          return [];
        },
        some: function (pointers) {
          return pointers.map(convertPointer);
        }
    });
  }

  function get_pointer_color(rawData) { 
    // Sets up the pointer color
    return cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'pointer-color'), {
        none: function () {
          return 'black';
        },
        some: function (color) {
          return convertColor(color);
        }
    });
  }

  function get_axis(rawData) {
    // Sets up the calculated axis properties/data
    return cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'axisdata'), {
        none: function () {
          return undefined;
        },
        some: function (axisdata) {
          return {
            top : toFixnum(get(axisdata, 'axisTop')), 
            bottom : toFixnum(get(axisdata, 'axisBottom')),
            ticks : get(axisdata, 'ticks').map(convertPointer)
          };
        }
    });
  }

  function get_interval_color(rawData) { 
    // Sets up the default interval color
    return cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'default-interval-color'), {
        none: function () {
          return 'black';
        },
        some: function (color) {
          return convertColor(color);
        }
    });
  }

  /////////////////////////////////////////////////////////
  function barChart(globalOptions, rawData) {
    // Variables and constants 
    const table = get(rawData, 'tab');
    const horizontal = get(rawData, 'horizontal');
    const axisloc = horizontal ? 'hAxes' : 'vAxes';
    const data = new google.visualization.DataTable();
    const colors_list = get_colors_list(rawData);
    const default_color = get_default_color(rawData);
    const pointers_list = get_pointers_list(rawData);
    const pointer_color = get_pointer_color(rawData);
    const axis = get_axis(rawData);
    const interval_color = get_interval_color(rawData); 
    const colors_list_length = colors_list.length;

    // Initializes the Columns of the data 
    data.addColumn('string', 'Label');
    data.addColumn('number', 'Values');
    data.addColumn({type: 'string', role: 'style'});

    // ASSERT: if we're using custom images, there will be a 4th column
    const hasImage = table[0].length == 4;

    // Adds each row of bar data and bar_color data
    table.forEach(function (row) {
      let bar_color = row[2] !== undefined ? colors_list[row[2]] : default_color;
      data.addRow([row[0], toFixnum(row[1]), bar_color]);
    });
    addAnnotations(data, rawData);
    addIntervals(data, rawData);

    let options = {
        legend: {
          position: 'none'
        }, 
        intervals: {
          color : interval_color, 
        },
        series : { 
          0 : { dataOpacity : hasImage? 0 : 1.0 } 
        }
      };
 
    options[axisloc] = { 
      0: { 
        viewWindow: { max: axis.top, min: axis.bottom }, 
        ticks: axis.ticks
      }
    };
    
     /* NOTE(John & Edward, Dec 2020): 
       Our goal for the part below was to add pointers (Specific Named Ticks) on another VAxis. 
       The Current Chart library necessitates that we assign at least one stack/bar to the 
       second axis in order for it to show up, and we have to fix the min/max of each axis 
       manually to make sure that both are consistent with each other rather than being relative 
       to the data. There is also a problem: When the pointers are too close to each other, one or 
       both of them disappear!
    */
    if (pointers_list.length > 0) {

      // Add and Attach Empty Data Stack/bar to 2nd axis + Color it
      data.addColumn('number', 'Pointers');
      options['series'] = { 1: { color: pointer_color, targetAxisIndex: 1 } };

      // Update Options to include the new axis ticks consistent with the first axis
      options[axisloc][1] = { 
        viewWindow: { 
          max: axis.top, 
          min: axis.bottom
        },
        gridlines: { color: pointer_color },
        ticks: pointers_list, 
        textStyle: { color: pointer_color }
      };
    }

    return {
      data: data,
      options: options,
      chartType: horizontal ? google.visualization.BarChart : google.visualization.ColumnChart,
      onExit: defaultImageReturn,
      mutators: [backgroundMutator, axesNameMutator, yAxisRangeMutator],
      overlay: (overlay, restarter, chart, container) => {
        if(!hasImage) return;

        // if custom images are defined, use the image at that location
        // and overlay it atop each dot
        google.visualization.events.addListener(chart, 'ready', function () {
          // HACK(Emmanuel): 
          // If Google changes the DOM for charts, these lines will likely break
          const svgRoot = chart.container.querySelector('svg');
          const rects = svgRoot.children[1].children[1].children[1].children;
          $('.__img_labels').each((idx, n) => $(n).remove());

          // Render each rect above the old ones, using the image as a pattern
          table.forEach(function (row, i) {
            const rect = rects[i];
            // make an image element for the img, from the SVG namespace
            const imgDOM = row[2].val.toDomNode();
            row[2].val.render(imgDOM.getContext('2d'), 0, 0);
            let imageElt = document.createElementNS("http://www.w3.org/2000/svg", 'image');
            imageElt.classList.add('__img_labels'); // tag for later garbage collection
            imageElt.setAttributeNS(null, 'href', imgDOM.toDataURL());
            // position it using the position of the corresponding rect
            imageElt.setAttribute('preserveAspectRatio', 'none');
            imageElt.setAttribute('x', rects[i].getAttribute('x'));
            imageElt.setAttribute('y', rects[i].getAttribute('y'));
            imageElt.setAttribute('width', rects[i].getAttribute('width'));
            imageElt.setAttribute('height', rects[i].getAttribute('height'));
            Object.assign(imageElt, rects[i]); // we should probably not steal *everything*...
            svgRoot.appendChild(imageElt);
          });
        });
      }
    };
  }

  function multiBarChart(globalOptions, rawData) {
    // Variables and Constants
    const table = get(rawData, 'tab');
    const legends = get(rawData, 'legends');
    const horizontal = get(rawData, 'horizontal');
    const axisloc = horizontal ? 'hAxes' : 'vAxes';
    const data = new google.visualization.DataTable();
    const pointers_list = get_pointers_list(rawData);
    const pointer_color = get_pointer_color(rawData);
    const axis = get_axis(rawData);
    const interval_color = get_interval_color(rawData); 
    var colors_list = get_colors_list(rawData);
    if (colors_list.length < default_colors.length) {
      default_colors.splice(0, colors_list.length, ...colors_list);
      colors_list = default_colors;
      colors_list = colors_list.slice(0, legends.length);
    }

    // Initializes the Columns of the data 
    data.addColumn('string', 'Label');
    legends.forEach(legend => data.addColumn('number', legend));

    // Adds each row of bar data
    data.addRows(table.map(row => [row[0]].concat(row[1].map(n => toFixnum(n)))));
    addAnnotations(data, rawData);
    addIntervals(data, rawData);

    let options = {
      isStacked: get(rawData, 'is-stacked'),
      series: colors_list.map(c => ({color: c, targetAxisIndex: 0})),
      legend: {
        position: horizontal ? 'right' : 'top', 
        maxLines: data.getNumberOfColumns() - 1
      }, 
      intervals: { 
        color : interval_color, 
      }
    };

    
    options[axisloc] = { 
      0: { 
        viewWindow: { max: axis.top, min: axis.bottom }, 
        ticks: axis.ticks 
      }
    };
         
    /* NOTE(John & Edward, Dec 2020): 
       Our goal for the part below was to add pointers (Specific Named Ticks) on another VAxis. 
       The Current Chart library necessitates that we assign at least one stack/bar to the 
       second axis in order for it to show up, and we have to fix the min/max of each axis 
       manually to make sure that both are consistent with each other rather than being relative 
       to the data. There is also a problem: When the pointers are too close to each other, one or 
       both of them disappear!
    */

    if (pointers_list.length > 0) { 
      colors_list = colors_list.slice(0, legends.length);
      
      // Add and Attach Empty Data Stack/bar to 2nd axis + Color it
      data.addColumn('number', 'Pointers')

      for (let i = 0; i < data.getNumberOfColumns() - 1; i++) {
        if (options['series'][i] == null) {
          options['series'][i] = {color: pointer_color, targetAxisIndex: 1};
        }
      }

      // Update Options to include the new axis ticks consistent with the first axis
      options[axisloc][1] = { 
        viewWindow: { 
          max: axis.top, 
          min: axis.bottom
        },
        gridlines: { color: pointer_color },
        ticks: pointers_list, 
        textStyle: { color: pointer_color }
      };
    } else {
      for (let i = 0; i < data.getNumberOfColumns() - 1; i++) {
        if (options['series'][i] == null) {
          options['series'][i] = {color: 'black', targetAxisIndex: 0};
        }
      }
    }
      
    return {
      data: data,
      options: options,
      chartType: horizontal ? google.visualization.BarChart : google.visualization.ColumnChart,
      onExit: defaultImageReturn,
      mutators: [backgroundMutator, axesNameMutator, yAxisRangeMutator],
    };
  }

  function boxPlot(globalOptions, rawData) {
    let table = get(rawData, 'tab');
    const dimension = toFixnum(get(rawData, 'height'));
    // TODO: are these two supposed to be on ChartWindow or DataSeries?
    const horizontal = get(rawData, 'horizontal');
    const showOutliers = get(rawData, 'show-outliers');
    const axisName = horizontal ? 'hAxis' : 'vAxis';
    const chartType = horizontal ? google.visualization.BarChart : google.visualization.ColumnChart;
    const data = new google.visualization.DataTable();

    const color = cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'color'), {
      none: function () {
        return "#777";
      },
      some: function (color) {
        return convertColor(color);
      }
    });


    const intervalOptions = {
      lowNonOutlier: {
        style: 'bars',
        fillOpacity: 1,
        color: color
      },
      highNonOutlier: {
        style: 'bars',
        fillOpacity: 1,
        color: color
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
        color: color,
        style: 'boxes'
      },
      interval: intervalOptions,
      dataOpacity: 0,
    };

    /* NOTE(Oak): manually set the default max to coincide with bar charts' height
     * so that the bar charts are concealed (the automatic value from Google
     * is likely to screw this up)
     */
    const axisOpts = {
      maxValue: dimension,
      viewWindow: {
        max: dimension
      },      
    };
    /* NOTE(Emmanuel): if min and max are set, override these defaults
     * 
     */
    cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'min'), {
      none: function () {},
      some: function (min) {
          axisOpts.viewWindow.min = toFixnum(min);
        }
    });
    cases(RUNTIME.ffi.isOption, 'Option', get(globalOptions, 'max'), {
      none: function () {},
      some: function (max) {
          axisOpts.viewWindow.max = toFixnum(max);
        }
    });
    options[axisName] = axisOpts;

    return {
      data: data,
      options: options,
      chartType: chartType,
      onExit: defaultImageReturn,
      mutators: [backgroundMutator, axesNameMutator],
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

    // ASSERT: if we're using custom images, there will be a 4th column
    const hasImage = table[0].length == 3;

    // set legend to none because there's only one data set
    const options = {
      legend: {position: 'none'}, 
      histogram: {},
      series : {
        0 : { dataOpacity : hasImage? 0 : 1.0 }
      }
    };

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

    cases(RUNTIME.ffi.isOption, 'Option', get(rawData, 'color'), {
      none: function () {},
      some: function (color) {
        options.colors = [convertColor(color)];
      }
    });
    
    return {
      data: data,
      options: options,
      chartType: google.visualization.Histogram,
      onExit: defaultImageReturn,
      mutators: [backgroundMutator, axesNameMutator, yAxisRangeMutator, xAxisRangeMutator],
      overlay: (overlay, restarter, chart, container) => {
        if(!hasImage) return;

        // if custom images are defined, use the image at that location
        // and overlay it atop each dot
        google.visualization.events.addListener(chart, 'ready', function () {
          // HACK(Emmanuel): 
          // The only way to hijack rect events is to walk the DOM here
          // If Google changes the DOM, these lines will likely break
          const svgRoot = chart.container.querySelector('svg');
          const rectRoot = svgRoot.children[1].children[1].children[1];
          const rects = rectRoot.children;

          // remove any labels that have previously been drawn
          $('.__img_labels').each((idx, n) => $(n).remove());

          // sort the table in value-order, so the images are in the same
          // order as the data used to draw the rects
          table.sort((r1,r2) => (toFixnum(r1[1]) < toFixnum(r2[1]))? -1 : 0)

          // walk the table and swap in the images for the rects
          table.forEach(function (row, i) {
            const rect = rects[i];
            // make an image element for the img, from the SVG namespace
            const imgDOM = row[2].val.toDomNode();
            row[2].val.render(imgDOM.getContext('2d'), 0, 0);
            let imageElt = document.createElementNS("http://www.w3.org/2000/svg", 'image');
            imageElt.classList.add('__img_labels'); // tag for later garbage collection
            imageElt.setAttributeNS(null, 'href', imgDOM.toDataURL());
            // position it using the position of the corresponding rect
            imageElt.setAttribute('preserveAspectRatio', 'none');
            imageElt.setAttribute('x', rects[i].getAttribute('x'));
            imageElt.setAttribute('y', rects[i].getAttribute('y'));
            imageElt.setAttribute('width', rects[i].getAttribute('width'));
            imageElt.setAttribute('height', rects[i].getAttribute('height'));
            Object.assign(imageElt, rects[i]); // we should probably not steal *everything*...
            rectRoot.appendChild(imageElt);
          });
        })
      }
    };
  }

  function plot(globalOptions, rawData) {
    const scatters = get(rawData, 'scatters');
    const lines = get(rawData, 'lines');
    const data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    const combined = scatters.concat(lines);
    const legends = [];
    let cnt = 1;
    const legendEnabled = combined.length > 1;
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

    // ASSERT: if we're using custom images, *every* series will have idx 3 defined
    const hasImage = combined.every(p => get(p, 'ps').filter(p => p[3]).length > 0);

    const options = {
      tooltip: {isHtml: true},
      series: combined.map((p, i) => {
        
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
            pointSize: hasImage ? 1 : toFixnum(get(p, 'point-size')),
            lineWidth: 0,
            dataOpacity: hasImage ? 0 : 1,
          });
        } else if (i - scatters.length < lines.length) {
          $.extend(seriesOptions, {
            pointSize: hasImage ? 0.1 : toFixnum(get(p, 'point-size')),
            dataOpacity: hasImage ? 0 : 1,
          });
        }
        return seriesOptions;
      }),
      legend: {position: legendEnabled ? 'bottom' : 'none'},
      crosshair: {trigger: 'selection'}
    };

    if (lines.length != 0) {
      const curveType = get(lines[0], 'curved');
      const lineWidth = toFixnum(get(lines[0], 'lineWidth'));

      
      const dashedLine = get(lines[0], 'dashedLine');
      const dashlineStyle = get(lines[0], 'dashlineStyle');
      const pointSize = toFixnum(get(lines[0], 'point-size'));
      

      options['curveType'] = curveType;
      options['lineWidth'] = lineWidth;
      options['pointSize'] = pointSize;
      
      if (dashedLine) {
        options['lineDashStyle'] = dashlineStyle;
      }
    }
    const trendlineType = cases(RUNTIME.ffi.isOption, 'Option', get(combined[0], 'trendlineType'), {
      none: function () {
        return null;
      },
      some: function (type) {
        return type;
      }
    });

    const trendlineColor = cases(RUNTIME.ffi.isOption, 'Option', get(combined[0], 'trendlineColor'), {
      none: function () {
        return 'green';
      },
      some: function (color) {
        return convertColor(color);
      }
    });

    const trendlineWidth = toFixnum(get(combined[0], 'trendlineWidth'));
    const trendlineOpacity = toFixnum(get(combined[0], 'trendlineOpacity'));
    const trendlineDegree = toFixnum(get(combined[0], 'trendlineDegree'));

    if (trendlineType != null) {
      options['trendlines'] = {
        0: {
          type: trendlineType,
          color: trendlineColor,
          lineWidth: trendlineWidth,
          opacity: trendlineOpacity,
          showR2: true,
          visibleInLegend: true
        }
      }
    }
    if (trendlineType == "polynomial") {
      options['trendlines'][0]['degree'] = trendlineDegree;
    }

    const pointshapeType = get(combined[0], 'pointshapeType');
    const pointshapeSides = toFixnum(get(combined[0], 'pointshapeSides'));
    const pointshapeDent = toFixnum(get(combined[0], 'pointshapeDent'));
    const pointshapeRotation = toFixnum(get(combined[0], 'pointshapeRotation'));
    const apothem = Math.cos(Math.PI / pointshapeSides)
  
    if (pointshapeType != 'circle') {
      options['pointShape'] = {
        type: 'star',
        sides: pointshapeSides, 
        dent: (pointshapeDent + 1) * apothem + 0.01,
        rotation: pointshapeRotation,
      }
    }

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
              let dataURI = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg_xml)));
              imageReturn(
                dataURI,
                restarter,
                RUNTIME.ffi.makeRight)
            },
      mutators: [axesNameMutator,
                 yAxisRangeMutator,
                 xAxisRangeMutator,
                 gridlinesMutator,
                 backgroundMutator, 
                 selectMultipleMutator],
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

        if(!hasImage) { return; } // If we don't have images, our work is done!
        
        // if custom images are defined, use the image at that location
        // and overlay it atop each dot
        google.visualization.events.addListener(chart, 'ready', function () {
          // HACK(Emmanuel): 
          // The only way to hijack marker events is to walk the DOM here
          // If Google changes the DOM, these lines will likely break
          // NOTE(joe, April 2022): It sort of happened. When we made the legend
          // sometimes not show (autohiding on single series), it shifted the
          // index. So this would only work if .title() was set. Use
          // legendEnabled to decided which index to look up.
          // This is brittle and needs to be revisited
          const svgRoot = chart.container.querySelector('svg');
          // const markers = svgRoot.children[3].children[2].children; from sbcContinuation
          let markers;
          if(legendEnabled) {
            markers = svgRoot.children[2].children[2].children;
          } else {
            markers = svgRoot.children[1].children[2].children;
          }

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

    // serialize the whole SVG element, in case of custom image overlays
    // then pass the URI to imageReturn`
    let svg = result.chart.container.querySelector('svg');
    let svg_xml = (new XMLSerializer()).serializeToString(svg);
    let dataURI = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg_xml)));
    imageReturn(dataURI, restarter, x => x);
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
        var tmp = f(globalOptions, rawData);
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
        // return true;
      }

      return RUNTIME.pauseStack(restarter => {
        google.charts.setOnLoadCallback(() => {
          try{
            setup(restarter)
          } catch (e) {
            return restarter.error(e);
          }
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

  return RUNTIME.makeModuleReturn(
    {
      'pie-chart': makeFunction(pieChart),
      'bar-chart': makeFunction(barChart),
      'multi-bar-chart': makeFunction(multiBarChart),
      'histogram': makeFunction(histogram),
      'box-plot': makeFunction(boxPlot),
      'plot': makeFunction(plot),
    }, 
    {
      "LoC": ann("List<Color>", checkListWith(IMAGE.isColorOrColorString)),
      "LoS": ann("List<String>", checkListWith(RUNTIME.isString)), 
      "LoN": ann("List<Number>", checkListWith(RUNTIME.isNumber)),
      "LoI": ann("List<Image>", checkListWith(v => RUNTIME.isOpaque(v) && IMAGE.isImage(v.val))),
      "LoLoN": ann("List<List<Number>>", checkListWith(checkListWith(RUNTIME.isNumber))),
      "LoLoLoN": ann("List<List<List<Number>>>", checkListWith(checkListWith(checkListWith(RUNTIME.isNumber)))),
      "LoOoS": ann("List<Option<String>>", checkListWith(checkOptionWith(RUNTIME.isString))),
      "LoLoOoS": ann("List<List<Option<String>>>", checkListWith(checkListWith(checkOptionWith(RUNTIME.isString)))),
      "LoNi": ann("List<NumInteger>", checkListWith(v => RUNTIME.isNumber(v) && RUNTIME.num_is_integer(v))),
    }
  )
}
})