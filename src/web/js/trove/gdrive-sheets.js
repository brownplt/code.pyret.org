({
  requires: [
    { "import-type": "builtin", "name": "table" },
    { "import-type": "builtin", "name": "lists" }
  ],
  nativeRequires: [
    "pyret-base/js/type-util"
  ],
  provides: {},
  theModule: function(runtime, namespace, uri, table, list, t){
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

    var None = runtime.ffi.makeNone;
    var Some = runtime.ffi.makeSome;

    var SHEET_TYPES;

    function loadWorksheet(loader) {
      function doLoadWorksheet() {
        runtime.pauseStack(function(resumer) {
          function handleError(err) {
            if (runtime.isPyretException(err)) {
              resumer.error(err);
            } else {
              if (err && err.message) err = err.message;
              resumer.error(runtime.ffi.makeMessageException(err));
            }
          }
          try {
            var p = worksheetToTable(loader());
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
      });
    }

    function deleteWorksheet(deleter) {
      runtime.pauseStack(function(resumer) {
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
        runtime.pauseStack(function(resumer) {
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
      runtime.pauseStack(doAdd, function(thunk) {
        return thunk();
      });
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
          throw new Error(ws.typeErrors[0]);
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
            // First, we change the data values into Pyret values
            for (var i = 0; i < data.length; ++i) {
              // Should be entirely unneccesary, but let's be
              // cautious with the stack
              var curIdx = -1;
              function buildHelp() {
                while (++curIdx < width) {
                  // This line is why a simple raw_array_map doesn't work
                  outData[i][curIdx] = constructors[curIdx](data[i][curIdx]);
                }
              }
              function buildFun($ar) {
                try {
                  if (runtime.isActivationRecord($ar)) {
                    outData[i][curIdx] = $ar.ans;
                  }
                  return buildHelp();
                } catch($e) {
                  if (runtime.isCont($e)) {
                    $e.stack[runtime.EXN_STACKHEIGHT++] = runtime.makeActivationRecord(
                      ["load-spreadsheet"],
                      buildFun,
                      0,
                      [], []);
                  }
                  if (runtime.isPyretException($e)) {
                    $e.pyretStack.push(["load-spreadsheet"]);
                  }
                  throw $e;
                }
              }
              buildFun();
            }
            debugger;
            return table.makeTable(colNames, outData);
          };
        }
      });
    }

    function makePyretSpreadsheet(ss) {
      var sheets = runtime.ffi.makeList(
        ss.worksheetsInfo.map(function(ws) {
          return runtime.makeString(ws.properties.title);
        }));
      
      function sheetByName(name) {
        runtime.ffi.checkArity(1, arguments, "sheet-by-name");
        runtime.checkString(name);
        return loadWorksheet(function(){return ss.getByName(name);});
      }
      
      function sheetByPos(idx) {
        runtime.ffi.checkArity(1, arguments, "sheet-by-index");
        runtime.checkNumber(idx);
        return loadWorksheet(function(){return ss.getByIndex(idx);});
      }
      function deleteSheetByName(name) {
        runtime.ffi.checkArity(1, arguments, "delete-sheet-by-name");
        runtime.checkString(name);
        return deleteWorksheet(function(){return ss.deleteByName(name);});
      }
      function deleteSheetByPos(idx) {
        runtime.ffi.checkArity(1, arguments, "delete-sheet-by-index");
        runtime.checkNumber(idx);
        return deleteWorksheet(function(){return ss.deleteByIndex(idx);});
      }
      function addSheet(name) {
        runtime.ffi.checkArity(1, arguments, "add-sheet");
        runtime.checkString(name);
        return addWorksheet(function(){return ss.addWorksheet(name);});
      }

      return O({
        'sheet-list': sheets,
        'sheet-by-name': F(sheetByName),
        'sheet-by-index': F(sheetByPos),
        'delete-sheet-by-name': F(deleteSheetByName),
        'delete-sheet-by-index': F(deleteSheetByPos),
        'add-sheet': F(addSheet)
      });
    }
    
    function createSpreadsheet(name) {
      runtime.ffi.checkArity(1, arguments, "create-spreadsheet");
      runtime.checkString(name);
      runtime.pauseStack(function(resumer) {
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
      
      runtime.pauseStack(function(resumer) {
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
      runtime.ffi.checkArity(1, arguments, 'my-spreadsheet');
      runtime.checkString(name);
      return loadSpreadsheet(function(api) {
        return api.loadSpreadsheetByName(name);
      });
    }

    function loadSheetById(id) {
      runtime.ffi.checkArity(1, arguments, 'load-spreadsheet');
      runtime.checkString(id);
      return loadSpreadsheet(function(api) {
        return api.loadSpreadsheetById(id);
      });
    }

    return O({
      'provide-plus-types': O({
        'types': {
        },
        'values': O({
          'create-spreadsheet': F(createSpreadsheet),
          'my-spreadsheet': F(loadLocalSheet),
          'load-spreadsheet': F(loadSheetById)
        })}),
      'answer': runtime.nothing
    });
  }
})
