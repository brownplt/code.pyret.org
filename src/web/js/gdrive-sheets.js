"use strict";
define(["q", "js/secure-loader", "js/runtime-util"], function(q, loader, util) {
  // copied from npm querystring:encode.js
  var stringifyPrimitive = function(v) {
    switch (typeof v) {
    case 'string':
      return v;
      
    case 'boolean':
      return v ? 'true' : 'false';
      
    case 'number':
      return isFinite(v) ? v : '';
      
    default:
      return '';
    }
  };

  function encodeQuerystring(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
      obj = undefined;
    }
    
    if (typeof obj === 'object') {
      return Object.keys(obj).map(function(k) {
        var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return obj[k].map(function(v) {
            return ks + encodeURIComponent(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
      }).join(sep);
      
    }
    
    if (!name) return '';
    return encodeURIComponent(stringifyPrimitive(name)) + eq +
      encodeURIComponent(stringifyPrimitive(obj));
  };

  // Taken from http://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript
  function extractError(htmlStr){
    // We're not using jQuery here, so there shouldn't be
    // any XSS potential.
    var temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    // Non-published sheets have a fancier error message
    var maybeError = temp.getElementsByClassName("errorMessage");
    if (maybeError.length > 0) {
      return maybeError[0].innerHTML;
    }
    return temp.childNodes.length === 0 ? "" : temp.childNodes[0].nodeValue;
  }
  // copied from https://raw.githubusercontent.com/samcday/node-google-spreadsheets/master/lib/spreadsheets.js

  // If caller has installed googleapis, we do some sanity checking to make sure it's a version we know.
  var FEED_URL = "https://spreadsheets.google.com/feeds/";

  var Spreadsheets;

  var forceArray = function(val) {
    if(Array.isArray(val)) {
      return val;
    }

    return [val];
  };

  var getFeed = function(params, opts, query) {
    var visibility = "public";
    var projection = "values";
    var headers = {};
    var method = "GET";

    if (opts.auth) {
      visibility = "private";
      projection = "full";
    }
    if (opts.visibility) {
      visibility = opts.visibility;
    }

    query = query || {};
    query["alt"] = "json";


    if ( typeof(params) == 'string' ) {
      // used for edit / delete requests
      url = params;
    } else if ( Array.isArray( params )){
      //used for get and post requets
      params.push( visibility, projection );
      url = FEED_URL + params.join("/");
    }

    if ( opts.auth && opts.auth.getToken() ) {
      headers['Authorization'] = 'Bearer ' + opts.auth.getToken().access_token;
    }

    if ( method == 'POST' || method == 'PUT' ){
      headers['content-type'] = 'application/atom+xml';
    }

    if ( method == 'GET' && query ) {
      url += "?" + encodeQuerystring( query );
    }
    console.log("url = " + url);
    console.log("Trying to get /googleProxy?" + encodeURIComponent(url));

    var ret = q.defer();
    $.ajax("/googleProxy?" + encodeURIComponent(url), {
      method: method,
      headers: headers,
      body: method == 'POST' || method == 'PUT' ? query_or_data : null,
    }).done(function(data, textStatus, jqXHR) {
      // console.log(data);
      ret.resolve(data.feed);
    }).fail(function(jqXHR, textStatus, error) {
      if (jqXHR.status === 401) {
        ret.reject("Invalid authorization key");
      } else if (jqXHR.status == 501 ) {
        // A bit of a kludge, but this is more informative than 
        // 'Unsupported Projection.' As for the *real* source of
        // this, we may want to look into using "basic" instead
        // of "full" projection, as that *does* still work with
        // older spreadsheets.
        ret.reject("Old Spreadsheets not supported. Please upgrade the spreadsheet or try another.");
      } else if ( jqXHR.status >= 400 ) {
        ret.reject(extractError(jqXHR.responseText));
      } else if ( response.statusCode === 200 && response.headers['content-type'].indexOf('text/html') >= 0 ) {
        ret.reject("Sheet is private. Use authentication or make public. (see https://github.com/theoephraim/node-google-spreadsheet#a-note-on-authentication for details)");
      }
    });
    return ret.promise;
  };

  var Worksheet = function(spreadsheet, data) {
    // This should be okay, unless Google decided to change their URL scheme...
    var id = data.id.$t;
    this.id = id.substring(id.lastIndexOf("/") + 1);
    this.spreadsheet = spreadsheet;
    this.rowCount = data.gs$rowCount.$t;
    this.colCount = data.gs$colCount.$t;
    this.title = data.title.$t;
  };

  function prepareRowsOrCellsOpts(worksheet, opts) {
    opts = opts || {};
    opts.key = worksheet.spreadsheet.key;
    opts.auth = worksheet.spreadsheet.auth;
    opts.worksheet = worksheet.id;
    return opts;
  }

  Worksheet.prototype.rows = function(opts) {
    return Spreadsheets.rows(prepareRowsOrCellsOpts(this, opts));
  };

  Worksheet.prototype.cells = function(opts) {
    return Spreadsheets.cells(prepareRowsOrCellsOpts(this, opts));
  };

  var Spreadsheet = function(key, auth, data) {
    this.key = key;
    this.auth = auth;
    this.title = data.title.$t;
    this.updated = data.updated.$t;
    this.author = {
      name: data.author[0].name.$t,
      email: data.author[0].email.$t
    };

    this.worksheets = [];
    var worksheets = forceArray(data.entry);

    worksheets.forEach(function(worksheetData) {
      this.worksheets.push(new Worksheet(this, worksheetData));
    }, this);
  };

  var Row = function(data) {
    Object.keys(data).forEach(function(key) {
      var val;
      val = data[key];
      if(key.substring(0, 4) === "gsx:")  {
        if(typeof val === 'object' && Object.keys(val).length === 0) {
          val = null;
        }
        if (key === "gsx:") {
          this[key.substring(0, 3)] = val;
        } else {
          this[key.substring(4)] = val;
        }
      } else if(key.substring(0, 4) === "gsx$") {
        if (key === "gsx$") {
          this[key.substring(0, 3)] = val;
        } else {
          this[key.substring(4)] = val.$t || val;
        }
      } else {
        if (key === "id") {
          this[key] = val;
        } else if (val.$t) {
          this[key] = val.$t;
        }
      }
    }, this);
  };

  var Cells = function(data) {
    // Populate the cell data into an array grid.
    this.cells = [];

    var entries = forceArray(data.entry);
    var cell, row, col;
    entries.forEach(function(entry) {
      cell = entry.gs$cell;
      row = cell.row;
      col = cell.col;

      if(!this.cells[row - 1]) {
        this.cells[row - 1] = [];
      }

      var val = undefined;
      if (cell.numericValue) { val = Number(cell.numericValue); }
      else if (cell.$t === "true") { val = true; }
      else if (cell.$t === "false") { val = false; }
      else { val = cell.$t || ""; }
      this.cells[row - 1][col - 1] = val;
    }, this);
  };

  Spreadsheets = function(opts) {
    if(!opts) {
      throw new Error("Invalid arguments.");
    }
    if(!opts.key) {
      throw new Error("Spreadsheet key not provided.");
    }

    return getFeed(["worksheets", opts.key], opts, null).then(function(data) {
      return new Spreadsheet(opts.key, opts.auth, data);
    });
  };

  Spreadsheets.rows = function(opts) {
    if(!opts) {
      throw new Error("Invalid arguments.");
    }
    if(!opts.key) {
      throw new Error("Spreadsheet key not provided.");
    }
    if(!opts.worksheet) {
      throw new Error("Worksheet not specified.");
    }

    var query = {};
    if(opts.start) {
      query["start-index"] = opts.start;
    }
    if(opts.num) {
      query["max-results"] = opts.num;
    }
    if(opts.orderby) {
      query.orderby = opts.orderby;
    }
    if(opts.reverse) {
      query.reverse = opts.reverse;
    }
    if(opts.sq) {
      query.sq = opts.sq;
    }

    return getFeed(["list", opts.key, opts.worksheet], opts, query).then(function(data) {
      var rows = [];

      if(typeof data.entry !== "undefined" && data.entry !== null) {
        var entries = forceArray(data.entry);

        entries.forEach(function(entry) {
          rows.push(new Row(entry));
        });
      }

      return rows;
    });
  };

  Spreadsheets.cells = function(opts) {
    if(!opts) {
      throw new Error("Invalid arguments.");
    }
    if(!opts.key) {
      throw new Error("Spreadsheet key not provided.");
    }
    if(!opts.worksheet) {
      throw new Error("Worksheet not specified.");
    }

    var query = {
    };
    if(opts.range) {
      query.range = opts.range;
    }
    if (opts.maxRow) {
      query["max-row"] = opts.maxRow;
    }
    if (opts.minRow) {
      query["min-row"] = opts.minRow;
    }
    if (opts.maxCol) {
      query["max-col"] = opts.maxCol;
    }
    if (opts.minCol) {
      query["min-col"] = opts.minCol;
    }

    return getFeed(["cells", opts.key, opts.worksheet], opts, query).then(function(data) {
      if(typeof data.entry !== "undefined" && data.entry !== null) {
        return new Cells(data);
      } else {
        return { cells: {} }; // Not entirely happy about defining the data format in 2 places (here and in Cells()), but the alternative is moving this check for undefined into that constructor, which means it's in a different place than the one for .rows() above -- and that mismatch is what led to it being missed
      }
    });
  };





  return util.definePyretModule(
    "gdrive-sheets",
    [],
    {
      values: ["load-sheet-raw", "load-sheet"],
      types: []
    },
    function(runtime, namespace) {
      var F = runtime.makeFunction;
      var O = runtime.makeObject;
      function colNameToNum(name) {
        if (!/[A-Z]+/.test(name)) { return undefined; }
        var ans = 0;
        var A = 'A'.charCodeAt(0) - 1;
        for (var i = 0; i < name.length; i++) {
          ans = ans * 26 + (name.charCodeAt(i) - A);
        }
        return ans - 1;
      }
      function makePyretSpreadsheet(ss) {
        var sheetsByNamePy = {};
        var sheetsByPosPy = [];
        var getSheetByName = runtime.makeMethod1(function(self, sheetName) {
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['sheet-by-name'], 1, $a); }
          runtime.checkString(sheetName);
          if (sheetsByNamePy[sheetName]) { return sheetsByNamePy[sheetName]; }
          for (var i = 0; i < ss.worksheets.length; i++) {
            if (ss.worksheets[i].title === sheetName) {
              sheetsByNamePy[sheetName] = sheetsByPosPy[i] = makePyretWorksheet(ss.worksheets[i]);
              return sheetsByNamePy[sheetName];
            }
          }
          runtime.ffi.throwMessageException("No worksheet named " + sheetName + " in this spreadsheet");
        });
        var getSheetByPos = runtime.makeMethod1(function(self, pos) {
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['sheet-by-pos'], 1, $a); }
          runtime.checkNumber(pos);
          if (sheetsByPosPy[pos]) { return sheetsByPosPy[pos]; }
          if (pos >= ss.worksheets.length) {
            runtime.ffi.throwMessageException("No worksheet numbered " + pos + " in this spreadsheet");
          }
          sheetsByNamePy[ss.worksheets[pos].title] = sheetsByPosPy[pos] = makePyretWorksheet(ss.worksheets[pos]);
          return sheetsByPosPy[pos];
        });
        return O({
          title: ss.title,
          updated: ss.updated,
          author: ss.author.name,
          'sheet-by-name': getSheetByName,
          'sheet-by-pos': getSheetByPos
        });
      }
      function makePyretWorksheet(ws) {
        var cellsArr = undefined;
        function getCells() {
          var ret = q.defer();
          if (cellsArr) { ret.resolve(cellsArr); }
          else {
            ws.cells().then(function(cells) {
              cellsArr = cells.cells;
              ret.resolve(cellsArr);
            });
          }
          return ret.promise;
        }
        function processCells(cells, resumer, opts) {
          // the range $startCol$startRow:$endCol$endRow is INCLUSIVE
          var rows = [];
          var startRow = opts.startRow || 0;
          var endRow = opts.endRow || (cells.length - 1);
          for (var i = startRow; i <= endRow; i++) {
            if (i === 0 && opts.skipHeader) continue;
            var rowArr = cells[i];
            if (opts.startCol !== undefined && opts.endCol !== undefined) {
              rowArr = rowArr.slice(opts.startCol, opts.endCol + 1);
            }
            var rowPy;
            if (opts.constr) {
              rowPy = opts.constr.app.apply(null, rowArr); // NOT stack-safe yet
            } else {
              rowPy = runtime.ffi.makeList(rowArr);
            }
            rows.push(rowPy);
          }
          resumer.resume(runtime.ffi.makeList(rows));
        }
        function checkCol(colNum, colName, min, max) {
          if (colNum === undefined) { runtime.ffi.throwMessageException("Invalid column name: " + colName); }
          if (colNum < min) {
            runtime.ffi.throwMessageException("Invalid column index: " + colNum + " (indices must be at least " + min + ")");
          } else if (colNum >= max) { 
            runtime.ffi.throwMessageException("Invalid column index: this worksheet has fewer than " +
                                              (colNum === 1 ? "1 column" : colNum + " columns"));
          }
        }
        function checkRow(rowNum, min, max) {
          if (rowNum < min) {
            runtime.ffi.throwMessageException("Invalid row index: " + rowNum + " (indices must be at least " + min + ")");
          } else if (rowNum >= max) { 
            runtime.ffi.throwMessageException("Invalid row index: this worksheet has fewer than " +
                                              (rowNum === 1 ? "1 row" : rowNum + " rows"));
          }
        }
        var getCellAt = runtime.makeMethod2(function(self, col, rowNum) {
          if (arguments.length !== 3) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['cell-at'], 2, $a); }
          runtime.checkString(col);
          runtime.checkNumber(rowNum);
          var colNum = colNameToNum(col);
          checkCol(colNum, col, 0, ws.colCount);
          checkRow(rowNum, 0, ws.rowCount);
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) {
                if (cells[rowNum] && cells[rowNum][colNum]) { resumer.resume(cells[rowNum][colNum]); }
                else { resumer.resume(""); }
              })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.makeString(String(err))); }
              });
          });
        });
        var getAllCells = runtime.makeMethod0(function(self) {
          if (arguments.length !== 1) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['all-cells'], 0, $a); }
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) { processCells(cells, resumer, {}); })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.makeString(String(err))); }
              });
          });
        });
        var getAllCellsAs = runtime.makeMethod2(function(self, constr, skipHeader) {
          if (arguments.length !== 3) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['all-cells-as'], 2, $a); }
          runtime.checkFunction(constr);
          runtime.checkBoolean(skipHeader);
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) { processCells(cells, resumer, {constr: constr, skipHeader: skipHeader}); })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.makeString(String(err))); }
              });
          });
        });
        var getCellRange = runtime.makeMethod4(function(self, startColName, startRow, endColName, endRow) {
          if (arguments.length !== 5) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['cell-range'], 4, $a); }
          runtime.checkString(startColName);
          runtime.checkNumber(startRow);
          runtime.checkString(endColName);
          runtime.checkNumber(endRow);
          var startCol = colNameToNum(startColName);
          var endCol = colNameToNum(endColName);
          checkCol(startCol, startColName, 0, ws.colCount);
          checkRow(startRow, 0, ws.rowCount);
          checkCol(endCol, endColName, 0, ws.colCount);
          checkRow(endRow, 0, ws.rowCount);
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) { 
                processCells(cells, resumer, {startRow: startRow - 1, startCol: startCol, endRow: endRow - 1, endCol: endCol});
              })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.makeString(String(err))); }
              });
          });
        });
        var getCellRangeAs = runtime.makeMethod5(function(self, startColName, startRow, endColName, endRow, constr) {
          if (arguments.length !== 6) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['cell-range-as'], 5, $a); }
          runtime.checkString(startColName);
          runtime.checkNumber(startRow);
          runtime.checkString(endColName);
          runtime.checkNumber(endRow);
          runtime.checkFunction(constr);
          var startCol = colNameToNum(startColName);
          var endCol = colNameToNum(endColName);
          checkCol(startCol, startColName, 0, ws.colCount);
          checkRow(startRow, 0, ws.rowCount);
          checkCol(endCol, endColName, 0, ws.colCount);
          checkRow(endRow, 0, ws.rowCount);
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) { 
                processCells(cells, resumer, 
                             {startRow: startRow - 1, startCol: startCol, endRow: endRow - 1, endCol: endCol, constr: constr});
              })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.makeString(String(err))); }
              });
          });
        });
        return O({
          title: ws.title,
          'row-count': ws.rowCount,
          'col-count': ws.colCount,
          'cell-at': getCellAt,
          'all-cells': getAllCells,
          'all-cells-as': getAllCellsAs,
          'cell-range': getCellRange,
          'cell-range-as': getCellRangeAs
        });
      }
      function loadSheetAndProcess2(name, visibility) {
        runtime.pauseStack(function(resumer) {
          Spreadsheets({key: name, auth: gapi.auth, visibility: visibility})
            .then(function (spreadsheet) { resumer.resume(makePyretSpreadsheet(spreadsheet)); })
            .catch(function (err) {
              if (runtime.isPyretException(err)) { resumer.error(err); }
              else { resumer.error(runtime.makeString(String(err))); }
            });
        });
      }

      function loadSheetAndProcess(name, opts) {
        runtime.pauseStack(function(resumer) {
          Spreadsheets({key: name, auth: gapi.auth, visibility: opts.visibility})
            .then(function (spreadsheet) { return spreadsheet.worksheets[0].cells(); })
            .then(function(cells) { processCells(cells.cells, resumer, opts); })
            .catch(function (err) {
              if (runtime.isPyretException(err)) { resumer.error(err); }
              else { resumer.error(runtime.makeString(String(err))); }
            });
        });
      }


      function loadSpreadsheet(name, visibility) {
        if (arguments.length !== 2) { var $a=new Array(arguments.length); for (var $i=0;$i<arguments.length;$i++) { $a[$i]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['load-spreadsheet'], 2, $a); }
        runtime.checkString(name);
        runtime.checkString(visibility);
        loadSheetAndProcess2(name, visibility);
      }

      function loadSheetRaw(name) {
        if (arguments.length !== 1) { var $a=new Array(arguments.length); for (var $i=0;$i<arguments.length;$i++) { $a[$i]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['load-sheet-raw'], 1, $a); }
        runtime.checkString(name);
        loadSheetAndProcess(name, {});
      }
      function loadSheet(name, constr, skipHeader) {
        if (arguments.length !== 3) { var $a=new Array(arguments.length); for (var $i=0;$i<arguments.length;$i++) { $a[$i]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['load-sheet'], 3, $a); }
        runtime.checkString(name);
        runtime.checkFunction(constr);
        runtime.checkBoolean(skipHeader);
        loadSheetAndProcess(name, {constr: constr, skipHeader: skipHeader});
      }
        
      return O({
        "provide-plus-types": O({
          types: {},
          values: O({
            "load-sheet-raw": F(loadSheetRaw),
            "load-sheet": F(loadSheet),
            "load-spreadsheet": F(loadSpreadsheet),
            "public": runtime.makeString("public"),
            "private": runtime.makeString("private"),
          })
        }),
        "answer": runtime.nothing
      });
    });
});
