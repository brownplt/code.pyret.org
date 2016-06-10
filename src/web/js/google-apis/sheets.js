/**
 * Builds a new Google Sheets API interface
 */
function createSheetsAPI(immediate) {

  function createAPI(spreadsheets) {

    // Easy toggling
    var _COLUMNS_ONE_INDEXED = true;
    
    /**
     * Creates a new Google Sheets Error
     * @constructor
     * @param {*} [message] - The contents of this error
     */
    function SheetsError(message) {
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.message = message || "";
    }
    SheetsError.prototype = Object.create(Error.prototype);
    SheetsError.prototype.name = "SheetsError";
    SheetsError.prototype.constructor = SheetsError;

    /**
     * Takes a column and, if it is a numeric index,
     * converts it into A1 notation.
     */
    function colAsString(col) {
      if (!isNaN(col)) {
        // http://stackoverflow.com/questions/181596/how-to-convert-a-column-number-eg-127-into-an-excel-column-eg-aa
        var out = '';
        while(col > 0) {
          var modulo = (col - (_COLUMNS_ONE_INDEXED ? 1 : 0)) % 26;
          out = String.fromCharCode(65 + modulo) + out;
          col = Math.floor((col - modulo) / 26);
        }
        return out;
      } else if (typeof col !== 'string'){
        throw new SheetsError("Invalid column: " + (col ? col.toString : col));
      } else {
        return col;
      }
    }

    /**
     * Ensures that the given column is in its numeric form
     */
    function colAsNumber(col) {
      if (typeof col === 'string') {
        // https://github.com/python-excel/xlwt/blob/master/xlwt/Utils.py
        var colNum = 0;
        var power = 1;
        for (var i = col.length - 1; i >= 0; --i) {
          colNum += (col.charCodeAt(i) - 65 + 1) * power;
          power *= 26;
        }
        return colNum - (_COLUMNS_ONE_INDEXED ? 1 : 0);
      } else if (!isNaN(col)) {
        throw new SheetsError("Invalid column: " + (col ? col.toString : col));
      } else {
        return col;
      }
    }

    /**
     * Constructs a range from the given parameters in A1 notation
     */
    function makeRange(title, fromCol, fromRow, toCol, toRow) {
      if (fromCol === toCol) {
        fromCol = colAsString(fromCol);
        toCol = fromCol;
      } else {
        fromCol = colAsString(fromCol);
        toCol = colAsString(toCol);
      }
      return title + "!" + fromCol + fromRow + ":" + toCol + toRow;
    }

    /**
     * Creates a new Spreadsheet object, representing
     * a Google Sheets spreadsheet.
     * @constructor
     * @param {Object} data - The JSON response from Google representing
              this spreadsheet.
     */
    function Spreadsheet(data) {
      this.id = data.spreadsheetId;
      this.title = data.properties.title;
      this.defaultFormat = data.properties.defaultFormat || {};
      this.worksheetsInfo = data.sheets || [];
      this.worksheets = [];
    }

    /**
     * Internal method for looking up Worksheet information
     * via the name of the worksheet.
     * @param {string} name - The name of the worksheet to look up
     */
    Spreadsheet.prototype.lookupInfoByName = function(name) {
      var worksheetIdx = -1;
      for (var i = 0; i < this.worksheetsInfo.length; ++i) {
        var info = this.worksheetsInfo[i];
        if (info.properties.title === name) {
          worksheetIdx = i;
          break;
        }
      }
      if (worksheetIdx === -1) {
        throw new SheetsError("No worksheet with name \"" + name + "\"");
      } else {
        return this.worksheetsInfo[worksheetIdx];
      }
    };

    /**
     * Internal method for looking up worksheet information
     * via the index of the worksheet.
     * @param {number} worksheetIdx - The index of the worksheet to look up
     */
    Spreadsheet.prototype.lookupInfoByIndex = function(worksheetIdx) {
      if (worksheetIdx >= this.worksheetsInfo.length) {
        throw new SheetsError("No worksheet with index " + worksheetIdx + "");
      } else {
        return this.worksheetsInfo[worksheetIdx];
      }
    };

    /**
     * Returns the worksheet in this spreadsheet at the specified
     * index.
     * @param {number} worksheetIdx - The index of the worksheet to return
     */
    Spreadsheet.prototype.getByIndex = function(worksheetIdx) {
      var info = this.lookupInfoByIndex(worksheetIdx);
      if (this.worksheets[worksheetIdx]) { // Have we loaded this worksheet already?
        return this.worksheets[worksheetIdx];
      } else {
        this.worksheets[worksheetIdx] = new Worksheet(this, info);
        return this.worksheets[worksheetIdx];
      }
    };

    /**
     * Returns the worksheet in this spreadsheet with the
     * given name.
     * @param {string} name - The name of the worksheet to return
     */
    Spreadsheet.prototype.getByName = function(name) {
      return new Worksheet(this, this.lookupInfoByName(name));
    };

    /**
     * Adds a worksheet to this spreadsheet with the given title
     * and (optionally) index
     * @param {string} name - The title of the new worksheet
     * @param {number} [index] - The index to place the new sheet at.
     *        By default, the worksheet is added after all existing sheets.
     */
    Spreadsheet.prototype.addWorksheet = function(name, index) {
      var request = {addSheet:
                     {properties:
                      {title: name}}};
      if (index !== undefined) {
        request.addSheet.properties.index = index;
      }
      return spreadsheets.batchUpdate({
        spreadsheetId: this.id,
        resource: {
          requests: [request]
        }
      })
      .then((function(data) { return new Worksheet(this, data); }).bind(this))
      .fail(function(err) {
               if (err.message && /already exists/.test(err.message)) {
                 throw new SheetsError("A sheet with name \"" + name + "\""
                                      + " already exists in this spreadsheet.");
               } else {
                 throw err;
               }
             });
    };

    /**
     * Internal method for deleting worksheets
     * @param {number} id - The ID of the worksheet to delete
     */
    Spreadsheet.prototype.deleteSheetById = function(id) {
      return spreadsheets.batchUpdate({
        spreadsheetId: this.id,
        resource: {
          requests: [{deleteSheet: {sheetId: id}}]
        }
      })
      .then(function(_) { return true; })
      .fail(function(err) {
               if (err.message && /sheet with ID.*does not exist/.test(err.message)) {
                 throw new SheetsError("A sheet with ID \"" + id + "\" "
                                       + "does not exist in this spreadsheet.");
               } else {
                 throw err;
               }
      });
    };

    /**
     * Deletes the worksheet from this spreadsheet with
     * the given name
     * @param {string} name - The name of the worksheet to delete
     */
    Spreadsheet.prototype.deleteSheetByName = function(name) {
      return this.deleteSheetById(this.lookupInfoByName(name).properties.sheetId)
        .fail(function(err) {
           if (err.message && /does not exist in this spreadsheet/.test(err.message)) {
               throw new SheetsError(
                   err.message.replace(/ID "[^"]*"/, "name \"" + name + "\""));
             } else {
               throw err;
             }
        });
    };

    /**
     * Deletes the worksheet from this spreadsheet at
     * the given index
     * @param {number} idx - The index of the sheet to delete
     */
    Spreadsheet.prototype.deleteSheetByIndex = function(idx) {
      // lookupInfoByIndex does error handling
      return this.deleteSheetById(this.lookupInfoByIndex(idx).properties.sheetId);
    };

    /**
     * Constructs a new Worksheet object, representing
     * a worksheet in a {@link Spreadsheet}.
     * @constructor
     * @param {Object} data - The JSON object describing the worksheet
     *        (returned from the Google Sheets API)
     */
    function Worksheet(spreadsheet, data) {
      this.id = data.properties.sheetId;
      this.title = data.properties.title;
      this.rows = data.properties.gridProperties.rowCount;
      this.cols = data.properties.gridProperties.columnCount;
      this.index = data.properties.index;
      this.spreadsheet = spreadsheet;
    }

    /**
     * Returns the cell at the given position in this worksheet
     * @param {string|number} col - The column to retrieve
     * @param {number} row - The row to retrieve
     */
    Worksheet.prototype.getCellAt = function(col, row) {
      return this.getCellRange(col, row, col, row)
             .then(function(arr) { return arr[0][0]; });
    };

    /**
     * Sets the cell at the given position in this worksheet
     * @param {string|number} col - The column to set
     * @param {number} row - The row to set
     * @param {*} val - The value to set the cell to
     */
    Worksheet.prototype.setCellAt = function(col, row, val) {
      return this.setCellRange(col, row, col, row, [[val]]);
    };

    /**
     * Sets the given cell range in this worksheet
     * @param {string|number} fromCol - The starting column of the range
     * @param {number} fromRow - The starting row of the range
     * @param {string|number} toCol - The ending column of the range
     * @param {number} toRow - The ending row of the range
     * @param {*[][]} values - The values to set in the worksheet
     */
    Worksheet.prototype.setCellRange = function(fromCol, fromRow, toCol, toRow, values) {
      var range = makeRange(this.title, fromCol, fromRow, toCol, toRow);
      return spreadsheets.values.update({
        spreadsheetId: this.spreadsheet.id,
        range: range,
        resource: {
          range: range,
          majorDimension: "ROWS",
          values: values
        }
      });
    };

    /**
     * Returns all cells in this worksheet
     */
    Worksheet.prototype.getAllCells = function() {
      return this.getCellRange("A", 1, this.cols, this.rows);
    };

    /**
     * Returns the given range of cells in this worksheet
     * @param {string|number} fromCol - The column to start at
     * @param {number} fromRow - The row to start at
     * @param {string|number} toCol - The column to end at
     * @param {number} toRow - The row to end at
     */
    Worksheet.prototype.getCellRange = function(fromCol, fromRow, toCol, toRow) {
      return spreadsheets.values.get({
        spreadsheetId: this.spreadsheet.id,
        range: makeRange(this.title, fromCol, fromRow, toCol, toRow),
        resource: {
          majorDimension: "ROWS"
        }
      }).then(function(resp) { return resp.values; });
    };

    /**
     * Updates the name of this worksheet to the given name
     * @param {string} name - The new name of this worksheet
     */
    Worksheet.prototype.updateName = function(name) {
      var ret = spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheet.id,
        resource: {
          requests: [
            {updateSheetProperties: {properties: {title: name}, fields: "title"}}
          ]
        }
      });
      ret.then((function(_) { this.title = name; }).bind(this));
      return ret;
    };

    /**
     * Loads the spreadsheet with the given id
     */
    Spreadsheet.fromId = function(id) {
      return spreadsheets.get({
        spreadsheetId: id
      }).then(function(data) { return new Spreadsheet(data); });
    };
    
    /**
     * Loads a spreadsheet from the given file object
     * @param file - A file object (as returned from `drive.js`)
     */
    Spreadsheet.fromFile = function(file) {
      return Spreadsheet.fromId(file.getUniqueId());
    };

    return {
      createSpreadsheet: function(name) {
        var opts = {};
        opts.mimeType = 'application/vnd.google-apps.spreadsheet';
        opts.fileExtension = false;
        var ret = Q.defer();
        storageAPI
          .then(function(api){
            return api.createFile(name, opts);
          })
          .then(function(file) {
            return spreadsheets.get({
              spreadsheetId: file.getUniqueId()
            });
          })
          .then(function(data) {
            ret.resolve(new Spreadsheet(data));
          })
          .fail(ret.reject);
        return ret.promise;
      },
      loadSpreadsheetByName: function(name) {
        return storageAPI.then(function(api) {
                 return api.getFileByName(name);
               }).then(function(res) {
                 if (res.length === 0) {
                   throw new SheetsError("No spreadsheet named \"" + name + "\" found.");
                 } else {
                   return res[0];
                 }
               }).then(Spreadsheet.fromFile);
      },
      loadSpreadsheetById: function(id) {
        return Spreadsheet.fromId(id);
      }
    };
  }

  var ret = Q.defer();
  gwrap.load({url: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
              reauth: {
                immediate: immediate
              },
              callback: function(sheets) {
                ret.resolve(createAPI(sheets.spreadsheets));
              }});
  return ret.promise;
}
