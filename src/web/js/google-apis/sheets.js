/**
 * Builds a new Google Sheets API interface
 */
function createSheetsAPI(immediate) {

  function createAPI(spreadsheets) {

    // Easy toggling
    var _COLUMNS_ONE_INDEXED = true;

    const SHEET_REQ_FIELDS = (function(){
      var sheetData = "data(";
      // Worksheet data
      sheetData += "rowData(values(effectiveFormat/numberFormat,effectiveValue,formattedValue))";
      // Wishful thinking
      sheetData += ",startColumn,startRow)";
      var sheetProperties = "properties(";
      // Grid Properties
      sheetProperties += "gridProperties(columnCount,frozenColumnCount,frozenRowCount,rowCount)";
      // Worksheet title, etc.
      sheetProperties += ",index,sheetId,title)";
      var sheets = "sheets(" + [sheetData,sheetProperties].join(",") + ")";
      return ["properties(defaultFormat,title)",
              sheets,
              "spreadsheetId"].join(',');
    })();
    
    /**
     * Creates a new Google Sheets Error
     * @constructor
     * @param {*} [message] - The contents of this error
     * @param {*} [extra] - Record of extra data to associate with this error
     */
    function SheetsError(message, extra) {
      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
      }
      this.name = this.constructor.name;
      this.message = message || "";
      this.extra = extra || {};
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
        throw new SheetsError("Invalid column: " + (col ? col.toString() : col));
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
      } else if (isNaN(col)) {
        throw new SheetsError("Invalid column: " + (col ? col.toString() : col));
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

    const VALUE_TYPES = {
      STRING: 1,
      NUMBER: 2,
      BOOL: 3,
      NONE: 4
    };

    /**
     * Reads in the raw row data from the spreadsheet and
     * returns it such that types match up (i.e. everything
     * in each column has the same type or is null).
     *
     * For an in-depth explanation of the inference rules
     * used here, refer to http://belph.github.io/docs/sheet-infer.pdf
     * (if link is dead, contact Philip (belph)).
     *
     * @param rowData - The raw data to process
     * @param [skipHeaders] - If true, omits the first nonempty row from
     *        the processed data set.
     * @param [onlyInfer] - If given, lists the only columns for which
     *        type inference should take place (effectively, this just
     *        doesn't log any type errors for other columns)
     */
    function unifyRows(rowData, skipHeaders, onlyInfer) {
      var errors = [];
      // Schemas of individual rows
      var rowSchemas = [];
      // Unified table schema
      var schema = [];
      // What column does the data start at?
      var startCol = Infinity;
      var endCol = 0;
      var startRow = 0;

      function processValue(v, idx) {
        if (!v) {
          throw new SheetsError("Internal Error: unifyRows called with no value");
        } else if (!v.effectiveValue) {
          // Empty entry
          return { value: null, type: VALUE_TYPES.NONE };
        }

        // We have an entry; update the start column if needed
        startCol = Math.min(startCol, idx);
        endCol = Math.max(endCol, idx);

        if (v.effectiveValue.numberValue !== undefined) {
          var format = v.effectiveFormat
                && v.effectiveFormat.numberFormat
                && v.effectiveFormat.numberFormat.type;
          var asStr = v.formattedValue
                || v.effectiveValue.numberValue.toString();

          switch(format) {
          // For these formats, use string representation for now.
            // TODO: Make a datetime type for these 
          case "TEXT":
          case "DATE":
          case "TIME":
          case "DATE_TIME":
            return { value: asStr, type: VALUE_TYPES.STRING };
          default:
            return { value: v.effectiveValue.numberValue, type: VALUE_TYPES.NUMBER };
          }
        } else if (v.effectiveValue.boolValue !== undefined) {
          return { value: v.effectiveValue.boolValue, type: VALUE_TYPES.BOOL };
        } else if (v.effectiveValue.errorValue) {
          if(v.effectiveValue.errorValue.type === "N_A") {
            errors.push("Google Sheets Error: there are #N/A values in the sheet, so it cannot be loaded correctly. The #N/A values must first be fixed before importing.");
          }
          else {
            errors.push("Google Sheets Error: " + v.effectiveValue.errorValue);
          }
          return { value: null, type: VALUE_TYPES.NONE };
        } else {
          return { value: v.formattedValue, type: VALUE_TYPES.STRING };
        }
      }

      // Unzips the results of processValue
      function extractRowSchema(row, rowNum) {
        return row.reduce(function(acc, cur, idx){
          acc.values.push(cur.value);
          acc.schema.push(
            { type: cur.type,
              isOption: (cur.type === VALUE_TYPES.NONE),
              trueRow: rowNum,
              trueCol: idx });
          return acc;
        }, { values: [], schema: []});
      }

      // Type -> String
      function typeName(t) {
        switch(t) {
        case VALUE_TYPES.STRING:
          return "String";
          break;
        case VALUE_TYPES.NUMBER:
          return "Number";
          break;
        case VALUE_TYPES.BOOL:
          return "Bool";
          break;
        case VALUE_TYPES.NONE:
        default: // <- to make linters be quiet
          return "Option";
        }
      }

      // schema1 = accumulated
      function unifySchemas(schema1, schema2, row, index) {
        function logFail() {
          if (onlyInfer && !onlyInfer.includes(schema2.trueCol)) {
            return;
          }
          var trueRow = schema2.trueRow;
          var trueCol = schema2.trueCol;

          var data = rowData[row][index];
          // Surround in quotes for error message clarity
          if (typeof data === "string") {
            data = '"' + data + '"';
          }
          var error = "All items in every column must have the same type. "
                      + "We expected to find a " + typeName(schema1.type)
                      + " at cell " + colAsString(trueCol + 1) + (trueRow + 1)
                      + ", but we instead found this " + typeName(schema2.type)
                      + ": " + data + ".";
          if ((schema1.type === VALUE_TYPES.STRING && schema2.type === VALUE_TYPES.NUMBER)
              || (schema1.type === VALUE_TYPES.NUMBER && schema2.type === VALUE_TYPES.STRING)) {
            error += " If you want some Numbers to be read as Strings, you need to format those cells "
              + "in Google Sheets as \"Plain Text\" (Select the cells, click \"Format\", then click \"Number\""
              + ", and then click \"Plain Text\").";
          }
          errors.push(error);
        }
        if (!schema1) { // (T-INTROS)
          return schema2;
        } else if (schema1.type === VALUE_TYPES.NONE) {
          if (schema2.type === VALUE_TYPES.NONE) { // (T-NONE)
            return schema1;
          } else { // (T-OPTION-1)
            schema2.isOption = true;
            return schema2;
          }
        } else if (schema1.isOption) { // (T-OPTION-3)
          if (schema2.type === VALUE_TYPES.NONE || schema2.type === schema1.type) {
            return schema1;
          } else { // (T-ERROR-1)
            logFail();
            // Continue to expect accumulated schema
            return schema1;
          }
        } else if (schema2.type === VALUE_TYPES.NONE) { // (T-OPTION-2)
          schema1.isOption = true;
          return schema1;
        } else if (schema1.type === schema2.type) { // (T-CHECK)
          return schema1;
        } else { // (T-ERROR-2)
          logFail();
          // Continue to expect accumulated schema
          return schema1;
        }
      }

      var foundFirstRow = false;
      var foundHeaders = false;
      var emptyRows = [];
      rowData = rowData.map(function(row, rowNum) {
        if (row.values
            && (row.values.length > 0)
            && (row.values.some(function(v){return v.effectiveValue !== undefined;}))) {
          if (!foundHeaders && skipHeaders) {
            foundHeaders = true;
            startRow += 1;
            rowSchemas.push([]);
            return [];
          }
          foundFirstRow = true;
          var extracted = extractRowSchema(row.values.map(processValue), rowNum);
          row.values = extracted.values;
          rowSchemas.push(extracted.schema);
          return row.values;
        } else if (!foundFirstRow) {
          startRow += 1;
        } else {
          emptyRows.push(rowNum);
        }
        rowSchemas.push([]);
        return [];
      });
      // Remove empty rows (reverse order to preserve index locations)
      for (var i = emptyRows.length - 1; i >= 0; --i) {
        rowData.splice(emptyRows[i], 1);
        rowSchemas.splice(emptyRows[i], 1);
      }
      rowData.splice(0, startRow);
      rowSchemas.splice(0, startRow);
      var tableWidth = (endCol - startCol) + 1;
      // Trim/pad remaining rows to uniform shape
      for (var i = 0; i < rowData.length; ++i) {
        // Trim off any leading columns
        rowData[i] = rowData[i].slice(startCol, endCol + 1);
        rowSchemas[i] = rowSchemas[i].slice(startCol, endCol + 1);
        // Pad out any missing trailing columns
        for (var j = rowData[i].length; j < tableWidth; ++j) {
          rowData[i][j] = null;
          rowSchemas[i].push({ type: VALUE_TYPES.NONE, isOption: false });
        }
      }
      // Unify schemas
      for (var i = 0; i < rowSchemas.length; ++i) {
        for (var j = 0; j < Math.max(schema.length, rowSchemas[i].length); ++j) {
          schema[j] = unifySchemas(schema[j], rowSchemas[i][j], i, j);
        }
      }
      var ret = { values: rowData, schema: schema, startCol: startCol };
      if (errors.length > 0) {
        ret.errors = errors;
      }
      return ret;
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
      data.sheets = data.sheets || [];
      this.worksheetsInfo = [];
      this.worksheets = data.sheets.map(function(wsdata) {
        return new Worksheet(this, wsdata);
      }, this);
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
     * @param {boolean} skipHeaders - Indicates whether or not header rows
     *        should be skipped (ignored if this worksheet has been previously loaded)
     * @param {integer[]} [onlyInfer] - If given, will only perform type inference
     *        on the given columns (i.e. does not report type errors on other columns)
     */
    Spreadsheet.prototype.getByIndex = function(worksheetIdx, skipHeaders, onlyInfer) {
      // Performs validation on index
      this.lookupInfoByIndex(worksheetIdx);
      var ret = this.worksheets[worksheetIdx];
      ret.init(skipHeaders, onlyInfer);
      return ret;
    };

    /**
     * Returns the worksheet in this spreadsheet with the
     * given name.
     * @param {string} name - The name of the worksheet to return
     * @param {boolean} skipHeaders - Indicates whether or not header rows
     *        should be skipped (ignored if this worksheet has been previously loaded)
     * @param {integer[]} [onlyInfer] - If given, will only perform type inference
     *        on the given columns (i.e. does not report type errors on other columns)
     */
    Spreadsheet.prototype.getByName = function(name, skipHeaders, onlyInfer) {
      var info = this.lookupInfoByName(name);
      var ret = this.worksheets[info.properties.index];
      ret.init(skipHeaders, onlyInfer);
      return ret;
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
        .then((function(data) {
          return spreadsheets.get({
            spreadsheetId: this.id,
            ranges: name,
            fields: SHEET_REQ_FIELDS
          });}).bind(this))
        .then((function(data) {
          if (!data.sheets || (data.sheets.length === 0)) {
            throw new SheetsError("Failed to add worksheet: \"" + name + "\"");
          }
          var ret = new Worksheet(this, data.sheets[0]);
          ret.init(false);
          return ret;
        }).bind(this))
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
      if (!data) {
        throw new SheetsError("Worksheet: Internal Error: No data. "
                              + "Please report this error to the developers.");
      } else if (!data.properties) {
        throw new SheetsError("Worksheet: Internal Error: No properties. "
                              + "Please report this error to the developers.");
      }
      this.id = data.properties.sheetId;
      this.title = data.properties.title;
      this.rows = data.properties.gridProperties.rowCount;
      this.cols = data.properties.gridProperties.columnCount;
      this.index = data.properties.index;
      spreadsheet.worksheetsInfo[this.index] = { properties: data.properties };
      this.cache = [];
      this.spreadsheet = spreadsheet;
      this.rawData = data;
      this.listener = {
        handleEvent: (function(){
          return this.flushCache(true);
        }).bind(this)
      };
      if (window === undefined) {
        console.warn("No window detected. Sheets may fall out of sync.");
        this.useTimer = false;
      } else {
        // Sync with Google Sheets server on save
        window.addEventListener('pyret-save', this.flushCache.bind(this), false);
        this.useTimer = true;
      }
    }

    /**
     * Reads in row data from the Google Sheets API response,
     * runs the type inference scheme on it, and populates this
     * worksheet's data.
     * @param {boolean} skipHeaders - Indicates whether or not header rows
     *        should be skipped (ignored if this worksheet has been previously loaded)
     * @param {integer[]} [onlyInfer] - If given, will only perform type inference
     *        on the given columns (i.e. does not report type errors on other columns)
     */
    Worksheet.prototype.init = function(skipHeaders, onlyInfer) {
      if ((this.hasHeaders !== undefined)
          && (this.hasHeaders !== !skipHeaders)) {
        throw new SheetsError("Attempted to load worksheet with"
                              + (skipHeaders ? "out" : "")
                              + " headers, but worksheet was already previously"
                              + " loaded with" + (skipHeaders ? "" : "out")
                              + " headers.");
      } else if (this.data !== undefined) {
        return;
      }
      var data = this.rawData;
      this.hasHeaders = !skipHeaders;
      if (!(data.data && data.data[0] && data.data[0].rowData)) {
        this.data = [];
        this.startCol = 0;
        this.schema = [];
      } else {
        var unified = unifyRows(data.data[0].rowData, skipHeaders, onlyInfer);
        this.startCol = unified.startCol;
        this.data = unified.values;
        this.schema = unified.schema;
        // Might be undefined
        this.typeErrors = unified.errors;
        if (!this.data) {
          throw new SheetsError("Worksheet: Internal Error: "
                                + "Type-check yielded no values. "
                                + "Please report this error to the developers.");
        } else if (!this.schema) {
          throw new SheetsError("Worksheet: Internal Error: "
                                + "Type-check yielded no schema. "
                                + "Please report this error to the developers.");
        }
      }
    };

    /**
     * Clears this worksheet's timers (for pushing data to the server)
     */
    Worksheet.prototype.clearTimer = function() {
      if (this.useTimer && (this.timeoutId !== undefined)) {
        window.removeEventListener("beforeunload", this.listener);
        window.clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }
    };

    /**
     * Sets this worksheet's timers (for pushing data to the server).
     * If any timers already exist, they are replaced by the new ones.
     *
     * The rationale here is that a large number of updates can be batched
     * together, and, if none are received after 10sec, it's assumed that
     * the updates are done, so we can go ahead and sync.
     */
    Worksheet.prototype.resetTimer = function() {
      if (this.useTimer) {
        this.clearTimer();
        window.addEventListener("beforeunload", this.listener);
        this.timeoutId = window.setTimeout(this.flushCache.bind(this), 10000);
      }
    };

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
      this.cache.push({
        range: range,
        majorDimension: "ROWS",
        values: values
      });
      this.resetTimer();
      return true;
    };

    /**
     * Pushes all pending changes to the Google Sheets server.
     * @param {bool} noRefresh - If true, will not reload data
     *        (useful for pre-closing pushes)
     */
    Worksheet.prototype.flushCache = function(noRefresh) {
      this.clearTimer();
      // If we're not waiting to set anything, bail out.
      if (this.cache.length === 0) {
        return Q(this);
      } else {
        // We're waiting to set some values, so set them.
        var promise = spreadsheets.values.batchUpdate({
          spreadsheetId: this.spreadsheet.id,
          resource: {
            data: this.cache
          }
        });
        this.cache = [];
        return promise.then(noRefresh ?
                            function(){return this;}.bind(this)
                              : this.refresh.bind(this));
      }
    };

    /**
     * Returns all cells in this worksheet
     */
    Worksheet.prototype.getAllCells = function() {
      return this.flushCache().then((function(){
        return this.data;
      }).bind(this));
    };

    /**
     * Returns the given range of cells in this worksheet (inclusive)
     * @param {string|number} fromCol - The column to start at
     * @param {number} fromRow - The row to start at
     * @param {string|number} toCol - The column to end at
     * @param {number} toRow - The row to end at
     */
    Worksheet.prototype.getCellRange = function(fromCol, fromRow, toCol, toRow) {
      fromCol = colAsNumber(fromCol);
      toCol = colAsNumber(toCol);
      return this.flushCache().then((function(){
        return this.data.map((function(row) {
          return row.slice(fromCol - this.startCol, (toCol - this.startCol) + 1);
        }).bind(this)).slice(fromRow - 1, toRow);
      }).bind(this));
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
     * Fetches the latest worksheet contents from the
     * Google Sheets server.
     */
    Worksheet.prototype.refresh = function() {
      return spreadsheets.get({
        spreadsheetId: this.spreadsheet.id,
        ranges: this.title,
        fields: SHEET_REQ_FIELDS
      }).then((function(data){
        if (!data.sheets || !data.sheets[0]
            || !data.sheets[0].data
            || !data.sheets[0].data[0]
            || !data.sheets[0].data[0].rowData) {
          throw new SheetsError("Worksheet data not returned by Google. "
                                + "Please report this error to the developers.");
        }
        // Re-unify
        this.rawData = data.sheets[this.index];
        this.init();
        return this;
      }).bind(this));
    };

    /**
     * Loads the spreadsheet with the given id
     */
    Spreadsheet.fromId = function(id) {
      // NOTE(joe): The true as a second argument below drills pretty far down
      // into api-wrapper.js to tell it to *disable* the user's credential if
      // logged in. This is another instance of the issue at 
      // https://github.com/brownplt/code.pyret.org/issues/255
      return spreadsheets.get({
        spreadsheetId: id,
        fields: SHEET_REQ_FIELDS
      }, true).then(function(data) { return new Spreadsheet(data); },
              function(err) {
                throw new SheetsError("No Spreadsheet with id \"" + id + "\" found");
              });
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
      },
      TYPES: VALUE_TYPES
    };
  }

  var ret = Q.defer();
  gwrap.load({url: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
              reauth: {
                immediate: immediate
              },
              callback: function(sheets) {

                // NOTE(joe, July 13 2017): The load interface seems to
                // inconsistently (perhaps depending on state w/Google login?)
                // return an array and a single value here.  The array contains
                // both the spreadsheets API object and the Google Plus API
                // object, which was added recently to get user emails for
                // display.  I haven't dug into why this happens (the
                // processDelta() function in the load API is responsible for
                // these return values), but this fix isn't completely
                // senseless and works.

                if(Array.isArray(sheets)) {
                  for(var i = 0; i < sheets.length; i += 1) {
                    if(sheets[i].spreadsheets) {
                      ret.resolve(createAPI(sheets[i].spreadsheets));
                      return;
                    }
                  }
                  ret.reject("Sheets could not load");
                }
                else {
                  ret.resolve(createAPI(sheets.spreadsheets));
                }
              }});
  return ret.promise;
}
