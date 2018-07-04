({
  requires: [
    { "import-type": "builtin", "name": "table" },
    { "import-type": "builtin", "name": "lists" },
    { "import-type": "builtin", "name": "valueskeleton" }
  ],
  nativeRequires: [
    "pyret-base/js/type-util"
  ],
  provides: {
    values: {
      "create-spreadsheet": "tany",
      "my-spreadsheet": "tany",
      "load-spreadsheet": "tany",
      "open-sheet": "tany",
      "open-sheet-by-index": "tany"
    },
    aliases: {},
    datatypes: {}
  },
  theModule: function(runtime, namespace, uri, table, list, VSlib, t){
    var List = function(thing) { 
      return t.tyapp(t.libName("lists", "List"), [thing]);
    };
    // Tables not yet in the Typechecker, AFAIK
    /*
    var TableT = t.any;
    var SpreadsheetT = t.record({
      'sheet-list': List(t.string),
      'sheet-by-name': TableT,
      'sheet-by-index': TableT,
      'delete-sheet-by-name': t.nothing,
      'delete-sheet-by-index': t.nothing,
      'add-sheet': TableT
    });
    var types = {
      values: {
        "create-spreadsheet": t.arrow([t.string], SpreadsheetT),
        "my-spreadsheet": t.arrow([t.string], SpreadsheetT),
        "load-spreadsheet": t.arrow([t.string], SpreadsheetT)
        //"load-spreadsheet-url": t.arrow([t.string], SpreadsheetT)
      },
      aliases: {},
      datatypes: {}
    };*/
    
    var F = runtime.makeFunction;
    var O = runtime.makeObject;
    var VS = runtime.getField(VSlib, "values");

    var None = runtime.ffi.makeNone;
    var Some = runtime.ffi.makeSome;

    var SHEET_TYPES;

    function applyBrand(brand, val) {
      return runtime.getField(brand, "brand").app(val);
    }

    function hasBrand(brand, val) {
      return runtime.getField(brand, "test").app(val);
    }

    var brandWS = runtime.namedBrander("sheet", ["worksheet: worksheet brander"]);
    var brandSS = runtime.namedBrander("spreadsheet", ["spreadsheet: spreadsheet brander"]);

    function isSpreadsheet(val) {
      return hasBrand(brandSS, val);
    }

    function isWorksheet(val) {
      return hasBrand(brandWS, val);
    }

    var checkSpreadsheet = runtime.makeCheckType(isSpreadsheet, "Spreadsheet");
    var checkWorksheet = runtime.makeCheckType(isWorksheet, "Worksheet");

    function loadWorksheet(loader, buildFun) {
      buildFun = buildFun || worksheetToTable;
      function doLoadWorksheet() {
        return runtime.pauseStack(function(resumer) {
          function handleError(err) {
            if (runtime.isPyretException(err)) {
              resumer.error(err);
            } else {
              if (err && err.message) err = err.message;
              resumer.error(runtime.ffi.makeMessageException(err));
            }
          }
          try {
            var p = buildFun(loader());
            p.then(function(thunk) {
              resumer.resume(thunk);
            });
            p.catch(handleError);
          } catch (err) {
            handleError(err);
          }
        });
      }
      return runtime.safeCall(doLoadWorksheet, function(thunk) {
        return thunk();
      }, "gdrive-sheets:loadWorksheet:doLoadWorksheet");
    }

    function deleteWorksheet(deleter) {
      return runtime.pauseStack(function(resumer) {
        function handleError(err) {
          if (runtime.isPyretException(err)) {
            resumer.error(err);
          } else {
            if (err && err.message) err = err.message;
            resumer.error(runtime.ffi.makeMessageException(err));
          }
        }
        try {
          deleter().then(function(_) {
            resumer.resume(runtime.makeNothing());
          }).catch(handleError);
        } catch (err) {
          handleError(err);
        }
      })
    }

    function addWorksheet(adder) {
      function doAdd() {
        return runtime.pauseStack(function(resumer) {
          function handleError(err) {
            if (runtime.isPyretException(err)) {
              resumer.error(err);
            } else {
              if (err && err.message) err = err.message;
              resumer.error(runtime.ffi.makeMessageException(err));
            }
          }
          try {
            adder().then(worksheetToTable).then(function(thunk) {
              resumer.resume(thunk);
            }).catch(handleError);
          } catch (err) {
            handleError(err);
          }
        });
      }
      return runtime.safeCall(doAdd, function(thunk) {
        return thunk();
      }, "gdrive-sheets:addWorksheet:doAdd");
    }

    function worksheetToTable(ws, colNames) {
      var cols = colNames ? colNames.length : ws.cols;
      if (!colNames) {
        if (cols <= 26) {
          colNames = Array.apply(null, Array(cols)).map(function (_, i) {
            return String.fromCharCode(65 + i);});
        } else {
          var i = 26;
          var j = 0;
          var k = 0;
          var curChar = String.fromCharCode(65 + j);
          var suffix = '';
          colNames = Array.apply(null, Array(26)).map(function (_, i) {
            return String.fromCharCode(65 + i);});
          var startOff = 0;
          var startLen = 26;
          // Convoluted way of generating ['A', 'B', ..., 'AA', 'AB', ...]
          while(++i <= cols) {
            if (k >= startLen) {
              ++j;
              j = j % 26;
              if (j === 0) {
                startOff += startLen;
                startLen *= 26;
              }
              k = startOff;
              curChar = String.fromCharCode(65 + j);
            }
            colNames.push(curChar + colNames[k]);
            ++k;
          }
        }
      }
      function applyArray(arr) {
        return function(v, i) {
          return arr[i](v);
        };
      }
      function schemaToConstructor(schema) {
        if (schema.isOption) {
          var typeConstructor = schemaToConstructor({
            type: schema.type, isOption: false
          });
          return function(v) {
            if (v === null) {
              return None();
            } else {
              return Some(typeConstructor(v));
            }
          };
        } else {
          switch (schema.type) {
          case SHEET_TYPES.STRING:
            return runtime.makeString;
          case SHEET_TYPES.NUMBER:
            return runtime.makeNumber;
          case SHEET_TYPES.BOOL:
            return runtime.makeBoolean;
          case SHEET_TYPES.NONE:
          default:
            return function(v) {
              if (v !== null) {
                throw new Error(
                  "Unknown type for sheet value " + v.toString());
              } else {
                return None();
              }
            };
          }
        }
      }
      return ws.getAllCells().then(function(data) {
        if (ws.typeErrors && (ws.typeErrors.length > 0)) {
          var errmsgs = ws.typeErrors.map(runtime.ffi.makeMessageException);
          errmsgs.unshift(
            runtime.ffi.makeMessageException("There were worksheet importing errors."));
          runtime.ffi.throwMultiErrorException(runtime.ffi.makeList(errmsgs));
        } else if (data.length === 0) {
          return function() { runtime.getField(table, "makeTable")([], []); };
        } else {
          var constructors = ws.schema.map(schemaToConstructor);
          var width = data[0].length;
          data.forEach(function(row) {
            if (row.length !== width) {
              throw new Error(
                "Internal Error: Expected row of length " + width.toString()
                  + ", but found row of length " + row.length.toString()
                  + ". Please report this error to the developers.");
            }
          });
          colNames = colNames.slice(ws.startCol, ws.startCol + width);
          var outData = (new Array(data.length)).fill().map(function(){
            return new Array(width);
          });
          return function() {
            return runtime.safeCall(function() {
              return runtime.eachLoop(runtime.makeFunction(function(i) {
                return runtime.eachLoop(runtime.makeFunction(function(curIdx) {
                  return runtime.safeCall(function() {
                    return constructors[curIdx](data[i][curIdx]);
                  }, function(result) {
                    outData[i][curIdx] = result;
                    return runtime.nothing;
                  }, "gdrive-sheets:worksheetToTable:constructCell");
                }), 0, width);
              }), 0, data.length);
            }, function(_) {
              return table.makeTable(colNames, outData);
            }, "gdrive-sheets:worksheetToTable:constructValues");
          };
        }
      });
    }

    /**
     * Constructs a new Pyret Table Loader which is bound to
     * the worksheet associated with the given function.
     * @param load - A function which accepts a list of column indices
     *        needing type inference and returns the worksheet object
     */
    function makeSheetLoader(load) {
      function doLoad(colNames, sanitizers) {
        runtime.ffi.checkArity(2, arguments, "load", false);
        runtime.checkArray(colNames);
        runtime.checkArray(sanitizers);
        sanitizers = sanitizers.map(runtime.extractLoaderOption);
        var needsInference = [];
        var resolved = [];
        for (var i = 0; i < colNames.length; ++i) {
          var matching = sanitizers.find(function(s) {
            return s.col == colNames[i];
          });
          if (matching === undefined) {
            needsInference.push({name: colNames[i], index: i});
          } else {
            resolved.push({name: colNames[i], sanitizer: matching.sanitizer, index: i});
          }
        }
        return loadWorksheet(function() {
          return load(needsInference.map(function(o){ return o.index; }));
        }, function(ws) {
          return worksheetToLoadedTable(ws, resolved, needsInference);
        });
      }
      return O({
        'load': F(doLoad)
      });
    }

    function worksheetToLoadedTable(ws, resolved, needsInference) {

      function schemaToSanitizer(schema) {
        var sanitizer;
        switch(schema.type) {
        case SHEET_TYPES.STRING:
          sanitizer = runtime.builtin_sanitizers.string;
          break;
        case SHEET_TYPES.NUMBER:
          sanitizer = runtime.builtin_sanitizers.strict_num;
          break;
        case SHEET_TYPES.BOOL:
          sanitizer = runtime.builtin_sanitizers.bool;
          break;
        case SHEET_TYPES.NONE:
        default:
          sanitizer = runtime.builtin_sanitizers.empty_only;
        }
        if (schema.isOption) {
          sanitizer = runtime.builtin_sanitizers.option.app(sanitizer);
        }
        return sanitizer;
      }

      function wrapCell(v) {
        if (v === null) {
          return runtime.makeCEmpty();
        } else if (typeof v === 'string') {
          return runtime.makeCStr(runtime.makeString(v));
        } else if (typeof v === 'number') {
          return runtime.makeCNum(runtime.makeNumber(v));
        } else if (typeof v === 'boolean') {
          return runtime.makeCBool(runtime.makeBoolean(v));
        } else {
          runtime.ffi.throwMessageException(
            "Internal Error: wrapCell got unknown value: "
              + ((v && v.toString) ? v.toString() : v));
        }
      }

      return ws.getAllCells().then(function(data) {
        if (ws.typeErrors && (ws.typeErrors.length > 0)) {
          var errmsgs = ws.typeErrors.map(runtime.ffi.makeMessageException);
          errmsgs.unshift(runtime.ffi.makeMessageException(
            "There were worksheet importing errors."));
          runtime.ffi.throwMultiErrorException(runtime.ffi.makeList(errmsgs));
        } else if (data.length === 0) {
          runtime.ffi.throwMessageException("Empty worksheets cannot be imported.");
        } else {
          var width = data[0].length;
          // resolved and needsInference are *sorted by index*
          var expectedLength = resolved.length + needsInference.length;
          if (expectedLength !== width) {
            runtime.ffi.throwMessageException("Loaded worksheet has "
                                              + ws.cols
                                              + " columns, but "
                                              + expectedLength
                                              + " column names were given.");
          }
          data.forEach(function(row) {
            if (row.length !== width) {
              throw new Error(
                "Internal Error: Expected row of length " + width.toString()
                  + ", but found row of length " + row.length.toString()
                  + ". Please report this error to the developers.");
            }
          });

          var fullySanitized = [];
          var rIdx = resolved.length - 1;
          var nIdx = needsInference.length - 1;
          while (rIdx >= 0 && nIdx >= 0) {
            if (resolved[rIdx].index > needsInference[nIdx].index) {
              fullySanitized.push(resolved[rIdx--]);
            } else {
              var colIdx = needsInference[nIdx].index;
              needsInference[nIdx].sanitizer = schemaToSanitizer(ws.schema[colIdx]);
              fullySanitized.push(needsInference[nIdx--]);
            }
          }
          // At most one of the following two loops will run
          while (rIdx >= 0) {
            fullySanitized.push(resolved[rIdx--]);
          }
          while (nIdx >= 0) {
            var colIdx = needsInference[nIdx].index;
            needsInference[nIdx].sanitizer = schemaToSanitizer(ws.schema[colIdx]);
            fullySanitized.push(needsInference[nIdx--]);
          }
          fullySanitized = fullySanitized.reverse();
          var outData = (new Array(data.length)).fill().map(function(){
            return new Array(width);
          });
          return function() {
            return runtime.safeCall(function() {
              return runtime.eachLoop(runtime.makeFunction(function(i) {
                return runtime.eachLoop(runtime.makeFunction(function(curIdx) {
                  return runtime.safeCall(function() {
                    return wrapCell(data[i][curIdx]);
                  }, function(result) {
                    outData[i][curIdx] = result;
                    return runtime.nothing;
                  }, "gdrive-sheets:worksheetToLoadedTable:constructCell");
                }), 0, width)
              }), 0, data.length);
            },
            function(_) {
              return runtime.makeLoadedTable(fullySanitized, outData);
            }, "gdrive-sheets:worksheetToLoadedTable:constructValues");
          }
        }
      });
    }

    function spreadsheetSheetByName(ss, name, skipHeaders) {
      runtime.ffi.checkArity(3, arguments, "open-sheet", false);
      checkSpreadsheet(ss);
      runtime.checkString(name);
      runtime.checkBoolean(skipHeaders);
      return runtime.getField(ss, 'sheet-by-name').app(name, skipHeaders);
    }

    function spreadsheetSheetByIndex(ss, idx, skipHeaders) {
      runtime.ffi.checkArity(3, arguments, "open-sheet-by-index", false);
      checkSpreadsheet(ss);
      runtime.checkNumber(idx);
      runtime.checkBoolean(skipHeaders);
      return runtime.getField(ss, 'sheet-by-index').app(idx, skipHeaders);
    }

    function makePyretSpreadsheet(ss) {
      function rawSheetNames() {
        return ss.worksheetsInfo.map(function(ws) { return runtime.makeString(ws.properties.title); });
      }
      function sheetNames() {
        runtime.ffi.checkArity(0, arguments, "sheet-names", true);
        return runtime.ffi.makeList(rawSheetNames());
      }
      
      function sheetByName(name, skipHeaders) {
        runtime.ffi.checkArity(2, arguments, "sheet-by-name", true);
        runtime.checkString(name);
        runtime.checkBoolean(skipHeaders);
        return makeSheetLoader(function(onlyInfer) {
          return ss.getByName(name, skipHeaders, onlyInfer);
        });
        //return loadWorksheet(function(){return ss.getByName(name, skipHeaders);});
      }
      
      function sheetByPos(idx, skipHeaders) {
        runtime.ffi.checkArity(2, arguments, "sheet-by-index", true);
        runtime.checkNumber(idx);
        runtime.checkBoolean(skipHeaders);
        return makeSheetLoader(function(onlyInfer) {
          return ss.getByIndex(idx, skipHeaders, onlyInfer);
        });
        //return loadWorksheet(function(){return ss.getByIndex(idx, skipHeaders);});
      }
      function deleteSheetByName(name) {
        runtime.ffi.checkArity(1, arguments, "delete-sheet-by-name", true);
        runtime.checkString(name);
        return deleteWorksheet(function(){return ss.deleteByName(name);});
      }
      function deleteSheetByPos(idx) {
        runtime.ffi.checkArity(1, arguments, "delete-sheet-by-index", true);
        runtime.checkNumber(idx);
        return deleteWorksheet(function(){return ss.deleteByIndex(idx);});
      }
      function addSheet(name) {
        runtime.ffi.checkArity(1, arguments, "add-sheet", true);
        runtime.checkString(name);
        return addWorksheet(function(){return ss.addWorksheet(name);});
      }

      return applyBrand(brandSS, O({
        'sheet-names': F(sheetNames),
        'sheet-by-name': F(sheetByName),
        'sheet-by-index': F(sheetByPos),
        'delete-sheet-by-name': F(deleteSheetByName),
        'delete-sheet-by-index': F(deleteSheetByPos),
        'add-sheet': F(addSheet),
        '_output': runtime.makeMethod0(function(self) {
          return runtime.getField(VS, "vs-constr").app(
            "spreadsheet",
            runtime.ffi.makeList(rawSheetNames().map(function(v) { return runtime.getField(VS, "vs-value").app(v); })));
        })
      }));
    }
    
    function createSpreadsheet(name) {
      runtime.ffi.checkArity(1, arguments, "create-spreadsheet", false);
      runtime.checkString(name);
      return runtime.pauseStack(function(resumer) {
        sheetsAPI.then(function(api) {
          return api.createSpreadsheet(name);
        })
          .then(makePyretSpreadsheet)
          .then(function(ss) { resumer.resume(ss); })
          .catch(function(err) {
            if (runtime.isPyretException(err)) {
              resumer.error(err);
            } else {
              if (err && err.message) err = err.message;
              resumer.error(runtime.ffi.makeMessageException(err));
            }
          });
      });
    }

    function loadSpreadsheet(loader) {
      
      return runtime.pauseStack(function(resumer) {
        sheetsAPI.then(function(api) {
          SHEET_TYPES = api.TYPES;
          return loader(api);
        })
          .then(makePyretSpreadsheet)
          .then(function(ss) { resumer.resume(ss); })
          .catch(function(err) {
            if (runtime.isPyretException(err)) {
              resumer.error(err);
            } else {
              if (err && err.message) err = err.message;
              resumer.error(runtime.ffi.makeMessageException(err));
            }
          });
      });
    }

    function loadLocalSheet(name) {
      runtime.ffi.checkArity(1, arguments, 'my-spreadsheet', false);
      runtime.checkString(name);
      return loadSpreadsheet(function(api) {
        return api.loadSpreadsheetByName(name);
      });
    }

    function loadSheetById(id) {
      runtime.ffi.checkArity(1, arguments, 'load-spreadsheet', false);
      runtime.checkString(id);
      return loadSpreadsheet(function(api) {
        return api.loadSpreadsheetById(id);
      });
    }
    
    return runtime.makeModuleReturn(
      {
        'create-spreadsheet': F(createSpreadsheet, "create-spreadsheet"),
        'my-spreadsheet': F(loadLocalSheet, "my-spreadsheet"),
        'load-spreadsheet': F(loadSheetById, "load-spreadsheet"),
        // Drop the `-by-name` since this is what people will
        // probably want ~90% of the time
        'open-sheet': F(spreadsheetSheetByName, "open-sheet"),
        'open-sheet-by-index': F(spreadsheetSheetByIndex, "open-sheet-by-index")
      },
      {}
    );
  }
})

