define(["q", "js/secure-loader", "js/runtime-util", "js/type-util"], function(q, loader, util, t, table) {
  var List = function(thing) { 
    return t.tyapp(t.libName("lists", "List"), [thing]);
  }
  // Tables not yet in the Typechecker, AFAIK
  var TableT = t.any;
  var SpreadsheetT = t.record({
    'sheet-list': List(t.string),
    'sheet-by-name': TableT,
    'sheet-by-index': TableT,
    'delete-sheet-by-name': t.nothing,
    'delete-sheet-by-index': t.nothing,
    'add-sheet': TableT
  });
  return util.definePyretModule("gdrive-sheets", [util.modBuiltin("table")],
    {
      values: {
        "create-spreadsheet": t.arrow([t.string], SpreadsheetT),
        "my-spreadsheet": t.arrow([t.string], SpreadsheetT),
        "load-spreadsheet": t.arrow([t.string], SpreadsheetT)
        //"load-spreadsheet-url": t.arrow([t.string], SpreadsheetT)
      },
      aliases: {},
      datatypes: {}
    },
    function(runtime, namespace, table) {
      // FIXME: I'm 90% sure this isn't the correct way to do this
      table = runtime.getField(table, "values");
      var F = runtime.makeFunction;
      var O = runtime.makeObject;

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
            colNames = Array.apply(null, Array(cols)).map(function (_, i) {
                         return String.fromCharCode(65 + i);});
            // Convoluted way of generating ['A', 'B', ..., 'AA', 'AB', ...]
            while(++i <= cols) {
              if (k >= colNames.length) {
                k = 0;
                ++j;
                j = j % 26
                curChar = String.fromCharCode(65 + j);
              }
              colNames.push(curChar + colNames[k]);
              ++k;
            }
          }
        }
        return ws.getAllCells().then(function(values) {
          return function() {
            // Since `cols` can overshoot, we check again
            var maxWidth = 0;
            values = values.map(function(row) {
              maxWidth = Math.max(maxWidth, row.length);
              return row.map(runtime.makeString);
            });
            colNames = colNames.slice(0, maxWidth);
            return runtime.getField(table, "makeTable")(colNames, values);
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
    });
});