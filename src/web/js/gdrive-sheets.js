"use strict";
define(["q", "js/secure-loader", "js/runtime-util"], function(q, loader, util) {
  return util.definePyretModule("gdrive-sheets", [],
    {values : ["load-sheet-raw", "load-sheet"],
      types : []},
    function(runtime, namespace) {
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

      function ensureXML(query) {
        // The json2xml function is taken from Stefan Gossner
        // (goessner.net). Modified to convert to XML using 
        // Google's rules
        function json2xml(o, tab) {
          // These two helpers taken from 
          // github.com/theoprahim/node-google-spreadsheets/blob/master/index.js
          function xmlSafeValue(val) {
            if (val == null) {
              return '';
            } 
            return String(val)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          }
          function xmlSafeColumnName(val) {
            if (!val) return '';
            return String(val)
              .replace(/[\s_]+/g, '');
          }
          function fixupKey(key) {
            return String(key).replace(/\$/g, ':');
          }
          function isString(s) { 
            return (s instanceof String) || (typeof s === 'string');
          }
          var toXml = function(v, name, ind) {
            name = fixupKey(name);
            var xml = "";
            if (v instanceof Array) {
              for (var i=0, n=v.length; i<n; i++)
                xml += ind + toXml(v[i], name, ind+"\t") + "\n";
            }
            else if (typeof(v) == "object") {
               var hasChild = false;
               xml += ind + "<" + name;
               for (var m in v) {
                 if (isString(v[m]) && !(m === "$t" || m === ":t"))
                   xml += " " + fixupKey(xmlSafeColumnName(m)) + "=\"" 
                     + xmlSafeValue(v[m]) + "\"";
                 else
                   hasChild = true;
               }
               xml += hasChild ? ">" : "/>";
               if (hasChild) {
                 for (var m in v) {
                   if (m === "$t" || m === ":t")
                     xml += v[m];
                   else if (!isString(v[m]))
                      xml += toXml(v[m], m, ind+"\t");
                 }
                 xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
               }
            }
            else {
              xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
            }
            return xml;
           };
           var xml="";
           for (var m in o){
              xml += toXml(o[m], m, "");
           }
           return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
        }
        if (query instanceof String) {
          return query;
        }
        return json2xml(query);
      };

      function ensureJSON(response) { 
        function renameKey(key) { 
          return key.replace(/:/g, '$');
        }
        function xml2json(res) { 
          var ret = {};
          if (res.nodeType === 3) { 
            return ret;
          }
          if (res.attributes) {
            var attributes = [];
            // Credit to Felipe Alcibar for this fast NodeList -> Array implementation
            for (var i=-1,l=res.attributes.length;++i!==l;attributes.push(res.attributes[i])){}
            attributes.forEach(function(attr){
              ret[renameKey(attr.nodeName)] = String(attr.nodeValue);
            });
          }
          if (res.childNodes) {
            var childNodes = [];
            for (var i=-1,l=res.childNodes.length;++i!==l;childNodes.push(res.childNodes[i])){}
            childNodes.forEach(function(child){
              var key = renameKey(child.nodeName);
              if (child.nodeType === 3) {
                ret.$t = child.nodeValue;
              } else if (ret[key]) { 
                if (Array.isArray(ret[key])) { 
                  ret[key].push(xml2json(child));
                } else { 
                  ret[key] = [ ret[key] ];
                  ret[key].push(xml2json(child));
                }
              } else {
                ret[key] = xml2json(child);
              }
            });
          }
          return ret;
        }
        // Taken from Douglas on Stack Overflow
        var documentElement = (response ? response.ownerDocument || response : 0).documentElement;
        var isXML = documentElement ? documentElement.nodeName !== "HTML" : false;
        return isXML ? xml2json(response) : response;
      }

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

      var token;

      var Spreadsheets;

      var forceArray = function(val) {
        if(Array.isArray(val)) {
          return val;
        }

        return [val];
      };

      var createSpreadsheet = function(name) {
        var opts = {};
        opts.mimeType = 'application/vnd.google-apps.spreadsheet';
        opts.fileExtension = false;
        var ret = q.defer();
        storageAPI
          .then(function(api){
            ret.resolve(api.createFile(name, opts));
          })
          .catch(ret.reject);
        return ret.promise;
      }

      var getFeed = function(params, opts, query, rootElt) {
        var visibility = "public";
        var projection = "values";
        var headers = {};
        var method = "GET";
        var checkTok = false;

        if (opts.auth) {
          visibility = "private";
          projection = "full";
        }
        if (opts.visibility) {
          visibility = opts.visibility;
        }
        if (opts.method) {
          method = opts.method;
        }

        query = query || {};
        // When sending POST/PUT requests, we want
        // to add attributes to the object which will
        // be converted into the root XML element.
        var queryDest = rootElt ? query[rootElt] : query;
        queryDest["alt"] = "json";


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
          queryDest['xmlns'] = 'http://www.w3.org/2005/Atom';
          delete queryDest['alt'];
          if( !queryDest['xmlns$gs'] && !queryDest['xmlns$gsx'] ) {
            queryDest['xmlns$gs'] = 'http://schemas.google.com/spreadsheets/2006';
          }
          /* The API only accepts XML in PUSH/PUT requests, it would seem,
           * so we convert the query object into XML using the rules found
           * at https://developers.google.com/gdata/docs/json
           */
          query = ensureXML(query);
          query = '<?xml version="1.0" encoding="UTF-8"?>' + query;
        }

        if ( method == 'POST' || method == 'PUT' || method == 'DELETE' ) { 
          if( token ) {
            // To keep csurf from getting upset
            headers['X-CSRF-Token'] = token;
          }    
        }

        if ( method == 'GET' ) { 
          checkTok = token === undefined;
          if ( query ) { 
            url += "?" + encodeQuerystring( query );
          }
        } 
        console.log("url = " + url);
        console.log("Trying to get /googleProxy?" + encodeURIComponent(url));

        var ret = q.defer();
        $.ajax("/googleProxy?" + encodeURIComponent(url), {
          method: method,
          headers: headers,
          data: method == 'POST' || method == 'PUT' ? query : null,
        }).done(function(data, textStatus, jqXHR) {
          if ( checkTok ) {
            // Retrieve the CSRF token from csurf
            token = jqXHR.getResponseHeader('X-Pyret-Token');
          }
          //console.log(data);
          ret.resolve(ensureJSON(data.feed || data));
        }).fail(function(jqXHR, textStatus, error) {
          /*console.log("FAILED");
          console.log(jqXHR);
          console.log(textStatus);
          console.log(error);*/
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
        this.rowCount = Number(data.gs$rowCount.$t);
        this.colCount = Number(data.gs$colCount.$t);
        this.title = data.title.$t;
        this.editLink = data.link.filter(function(l){ return l.rel === "edit"; })[0].href;
        this.rawData = data;
      };

      function prepareRowsOrCellsOpts(worksheet, opts) {
        opts = opts || {};
        opts.key = worksheet.spreadsheet.key;
        opts.auth = worksheet.spreadsheet.auth;
        opts.worksheet = worksheet.id;
        return opts;
      }

      Worksheet.prototype.rows = function(opts) {
        opts = opts || {};
        opts.ws = this;
        return Spreadsheets.rows(prepareRowsOrCellsOpts(this, opts));
      };

      Worksheet.prototype.cells = function(opts) {
        return Spreadsheets.cells(prepareRowsOrCellsOpts(this, opts));
      };

      // PRECONDITION: No bad entries in contents
      Worksheet.prototype.updateCells = function(startRow, startCol, contents, opts) {
        if (!(Array.isArray(contents))) {
          throw new Error("contents must be an array. Given: " + contents);
        }
        opts = prepareRowsOrCellsOpts(this, opts);
        opts.method = "PUT";
        var params = ["cells", opts.key, opts.worksheet, "private", "full"];
        var baseUrl = FEED_URL + params.join("/");
        /*
         * FIXME:
         * So here's the deal: Google Sheets has a means of doing batch
         * updates via their API, but it seems to have no intention of
         * cooperating. After playing with the OAuth playground, it became
         * apparent that the errors were stemming from the API not accepting
         * the batch requests, despite the XML being correctly formed.
         * As such, the entry-setting requests are currently *not* batched.
         */
        function setEntry(rowIdx, colIdx, value) {
          var rowNum = startRow + rowIdx + 1;
          var colNum = startCol + colIdx + 1;
          var url = baseUrl + "/R" + rowNum + "C" + colNum;
          var stringVal = runtime.toRepr(value);
          if (runtime.isString(value)) {
            // If we've been sent a quoted number,
            // leave the quotes
            stringVal = isNaN(value) ? value : stringVal;
          }
          var outObj = { 
            title : { type : "text", $t : "R" + rowNum + "C" + colNum },
            id : { $t : url },
            link : { rel : "edit", type : "application/atom+xml", href : url },
            gs$cell : { row : String(rowNum), col : String(colNum),
              inputValue : String(stringVal) }
          };
          if (runtime.isNumber(value)) {
            outObj.gs$cell.numericValue = stringVal;
          }
          return getFeed(url, opts, { entry : outObj }, 'entry');
        }
        var expectedLen;
        var promises = [];
        contents.forEach(function(row, rowIdx) {
          if (!(Array.isArray(row))) {
            throw new Error("Non-array row: " + row);
          } 
          expectedLen = expectedLen || row.length;
          if (row.length !== expectedLen) {
            throw new Error("Wrong number of columns given in row " + 
              rowIdx + ". Expected: " + expectedLen
              + " Given: " + row.length);
          }
          // Row is valid
          row.forEach(function(entry, colIdx) {
            // We still want to put in entry if entry === false
            var entryExists = (entry !== undefined) && (entry !== null);
            promises.push(setEntry(rowIdx, colIdx, entryExists ? entry : "")); 
                // Clear cell if entry is undefined or null
          });
        });
        return q.all(promises);
      };

      // FIXME: DOES NOT WORK RIGHT NOW
      // Attempting to use causes Google to return the error:
      // "Blank rows cannot be written; use delete instead."
      Worksheet.prototype.addRow = function(data, opts) {
        var outData = { xmlns$gsx : "https://schemas.google.com/spreadsheets/2006/extended" };
        Object.keys(data).forEach(function(key) { 
          outData['gsx:' + key] = { $t : String(data[key]) };
        });
        opts = prepareRowsOrCellsOpts(this, opts);
        opts.method = "POST";
        return getFeed(["list", opts.key, opts.worksheet], opts, { entry : outData }, 'entry');
      };

      Worksheet.prototype.updateRow = function(row, data, opts) {
        var isRow = row instanceof Row;
        if (!isRow && !this.rowEntries) {
          this.rows(); // Populates this.rowEntries
        }
        if (!isRow && (!this.rowEntries || !this.rowEntries[rowNum])) {
          throw new Error("Row at index " + rowNum + " not in row list.");
        }
        var rowEntry = isRow ? row : this.rowEntries[rowNum];
        Object.keys(data).forEach(function(key){
          rowEntry["gsx:" + key] = { $t : String(data[key]) };
        });
        opts = prepareRowsOrCellsOpts(this, opts);
        opts.method = "PUT";
        return getFeed(rowEntry.id, opts, { entry : rowEntry }, 'entry');
      };

      Worksheet.prototype.deleteRow = function(row, opts) {
        var ret = q.defer();
        opts = opts || {};
        var ws = this;
        if (!(row instanceof Row) && !ws.rowEntries) { 
          if (opts.rowsCalled) { 
            ret.reject("Internal error: Rows failed to populate");
          } else {
            this.rows()
              .then(function(res){
                opts['rowsCalled'] = true;
                ret.resolve(ws.deleteRow(row, opts));
              })
              .catch(ret.reject);
          }
        } else {
          if (!(row instanceof Row) && !ws.rowEntries[row]) { 
            ret.reject("Row at index " + row + " not in row list.");
          }
          row = (row instanceof Row) ? row : ws.rowEntries[row];
          var editLink = row.link.filter(function(l){ return l.rel === "edit"; })[0].href;
          opts = prepareRowsOrCellsOpts(ws, opts);
          opts.method = "DELETE";
          getFeed(editLink, opts, null)
            .then(function(result){
              var deleteSuccessful = ws.rowEntries.splice(ws.rowEntries.indexOf(row), 1);
              if (deleteSuccessful) { ret.resolve(result); }
              else { ret.reject("Internal Error: Failed to remove row"); }
            })
            .catch(ret.reject);
        }
        return ret.promise;
      };

      Worksheet.prototype.updateName = function(newName, opts) {
        opts = prepareRowsOrCellsOpts(this, opts);
        opts.method = "PUT";
        this.rawData.title.$t = String(newName);
        this.title = String(newName);
        var outData = { entry : $.extend({}, this.rawData) };
        delete outData.entry['gd$etag'];
        return getFeed(this.editLink, opts, outData, 'entry');
      };

      Worksheet.prototype.resizeRows = function(newRowNum, opts) {
        opts = prepareRowsOrCellsOpts(this, opts);
        opts.method = "PUT";
        this.rawData.gs$rowCount.$t = String(newRowNum);
        this.rowCount = newRowNum;
        var outData = { entry : $.extend({}, this.rawData) };
        delete outData.entry['gd$etag'];
        return getFeed(this.editLink, opts, outData, 'entry');
      };

      Worksheet.prototype.resizeCols = function(newColNum, opts) {
        opts = prepareRowsOrCellsOpts(this, opts);
        opts.method = "PUT";
        this.rawData.gs$colCount.$t = String(newColNum);
        this.colCount = newColNum;
        var outData = { entry : $.extend({}, this.rawData) };
        delete outData.entry['gd$etag'];
        return getFeed(this.editLink, opts, outData, 'entry');
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

      Spreadsheet.prototype.addWorksheet = function(name, opts) { 
        opts = opts || {};
        opts.key = opts.key || this.key;
        opts.auth = opts.auth || this.auth;
        opts.method = 'POST';
        var ret = q.defer();
        var outData = { entry : {} };
        var ss = this;
        outData.entry.title = {};
        outData.entry.title.$t = name;
        outData.entry.gs$rowCount = opts.rowCount || 50;
        outData.entry.gs$colCount = opts.colCount || 26;
        getFeed(['worksheets', opts.key], opts, outData, 'entry')
          .then(function(data){
            if (!data.entry) { 
              ret.reject("Internal Error: Failed to create worksheet '" + name + '"'); 
            }
            ss.worksheets.push(new Worksheet(ss, data.entry));
            ret.resolve(ss.worksheets[ss.worksheets.length - 1]);
          })
          .catch(ret.reject);
        return ret.promise;
      }

      Spreadsheet.prototype.deleteWorksheet = function(ws, opts) {
        opts = prepareRowsOrCellsOpts(ws, opts);
        opts.method = "DELETE";
        var ret = q.defer();
        var ss = this;
        getFeed(ws.editLink, opts, null)
          .then(function(result) {
            var deletionSuccessful = (ss.worksheets.splice(ss.worksheets.indexOf(ws), 1) !== []);
            if (deletionSuccessful) { ret.resolve(result); }
            else { ret.reject("Internal Error: Failed to delete worksheet from spreadsheet"); }
          })
          .catch(ret.reject);
        return ret.promise;
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
          if (cell.numericValue) { val = runtime.makeNumberFromString(cell.numericValue); }
          else if (cell.$t === "true") { val = true; }
          else if (cell.$t === "false") { val = false; }
          // Check if it's a quoted number (without this, 
          // quoted numbers are interpreted with extra
          // quotes... e.g. "\"11\"")
          else if ((typeof(cell.$t) === 'string') 
            && (cell.$t.length > 2)
            && (cell.$t.match(/^".*"$/))
            && !isNaN(cell.$t.substring(1, cell.$t.length - 1))) { 
              val = cell.$t.substring(1, cell.$t.length - 1); 
          }
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

        var ws = opts.ws;
        return getFeed(["list", opts.key, opts.worksheet], opts, query).then(function(data) {
          var rows = [];
          if (ws) {
            ws.rowEntries = [];
          }

          if(typeof data.entry !== "undefined" && data.entry !== null) {
            var entries = forceArray(data.entry);

            entries.forEach(function(entry) {
              rows.push(new Row(entry));
              if (ws) { ws.rowEntries.push(entry); }
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
          pos -= 1;
          if (sheetsByPosPy[pos]) { return sheetsByPosPy[pos]; }
          if ((pos >= ss.worksheets.length) || (pos < 0)) {
            runtime.ffi.throwMessageException("No worksheet numbered " + (pos + 1) + " in this spreadsheet");
          }
          sheetsByNamePy[ss.worksheets[pos].title] = sheetsByPosPy[pos] = makePyretWorksheet(ss.worksheets[pos]);
          return sheetsByPosPy[pos];
        });
        var deleteSheetByName = runtime.makeMethod1(function(self, name) {
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['delete-sheet-by-name'], 1, $a); }
          runtime.checkString(name);
          for (var i = 0; i < ss.worksheets.length; i++) { 
            if (ss.worksheets[i].title === name) { 
              runtime.pauseStack(function(resumer){
                ss.deleteWorksheet(ss.worksheets[i])
                  .then(function(res){
                    resumer.resume(runtime.makeNothing());
                  })
                  .catch(function(err){
                    if (runtime.isPyretException(err)) { resumer.error(err); }
                    else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
                  });
              });
            }
          }
          runtime.ffi.throwMessageException("No worksheet named " + name + " in this spreadsheet");
        });
        var deleteSheetByPos = runtime.makeMethod1(function(self, pos) { 
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['delete-sheet-by-pos'], 1, $a); }
          runtime.checkNumber(pos);
          pos -= 1;
          if ((pos >= ss.worksheets.length) || (pos < 0)) { 
            runtime.ffi.throwMessageException("No worksheet numbered " + (pos + 1) + " in this spreadsheet");
          }
          runtime.pauseStack(function(resumer){
            ss.deleteWorksheet(ss.worksheets[pos])
              .then(function(result){
                resumer.resume(runtime.makeNothing());
              })
              .catch(function(err){
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              })
          });
        });
        var addWorksheet = runtime.makeMethod1(function(self, name){
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['add-worksheet'], 1, $a); }
          runtime.checkString(name);
          ss.worksheets.forEach(function(ws){
            if (ws.title === name) { 
              runtime.ffi.throwMessageException('Worksheet with name "' + name + '" already exists in this spreadsheet');
            }
          });
          runtime.pauseStack(function(resumer){
            ss.addWorksheet(name)
              .then(function(newWs){
                sheetsByNamePy[name] = sheetsByPosPy[ss.worksheets.length - 1] = makePyretWorksheet(newWs);
                resumer.resume(sheetsByNamePy[name]);
              })
              .catch(function(err){
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        return O({
          title: ss.title,
          updated: ss.updated,
          author: ss.author.name,
          'sheet-by-name': getSheetByName,
          'sheet-by-pos': getSheetByPos,
          'delete-sheet-by-name': deleteSheetByName,
          'delete-sheet-by-pos': deleteSheetByPos,
          'add-worksheet': addWorksheet
        });
      }
      function makePyretWorksheet(ws) {
        var cellsArr = undefined;
        var rowsArr = undefined;
        var fetchCells = false;
        var fetchRows = false;
        function getCells() {
          var ret = q.defer();
          if (cellsArr && !fetchCells) { ret.resolve(cellsArr); }
          else {
            ws.cells().then(function(cells) {
              fetchCells = false;
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
        function getRows() {
          var ret = q.defer();
          if (rowsArr && !fetchRows) { ret.resolve(rowsArr); }
          else {
            ws.rows().then(function(rows) {
              fetchRows = false;
              rowsArr = rows;
              ret.resolve(rowsArr);
            });
          }
          return ret.promise;
        }
        function processRows(rows, resumer, opts) {
          var rowLst = [];
          var startRow = opts.startRow || 0;
          var endRow = opts.endRow || (rows.length - 1);
          // Removes extra information
          var blacklist = ['id', 'content', 'title', 'updated'];
          function notBlacklisted(key) { 
            return (blacklist.indexOf(key) === -1)
              && (key.match(/\$/) === null);
          }
          function sanitize(key) { 
            return key.replace(/\./g, '');
          }
          for (var i = startRow; i <= endRow; i++) {
            var row = rows[i];
            if(row !== undefined){
              var toPush = {};
              Object.keys(row).filter(notBlacklisted).forEach(function(key) {
                if(isNaN(row[key])){
                  toPush[sanitize(key)] = runtime.makeString(row[key]);
                } else {
                  toPush[sanitize(key)] = runtime.makeNumberFromString(row[key]);
                }
              });
              rowLst.push(runtime.makeObject(toPush));
            }
          }
          resumer.resume(runtime.ffi.makeList(rowLst));
        }
        function raiseFlags() { 
          fetchRows = true;
          fetchCells = true;
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
          checkRow(rowNum, 1, ws.rowCount + 1);
          rowNum -= 1;
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) {
                if (cells[rowNum] && cells[rowNum][colNum]) { resumer.resume(cells[rowNum][colNum]); }
                else { resumer.resume(""); }
              })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var setCellAt = runtime.makeMethod2(function(self, col, rowNum, newVal) {
          if (arguments.length !== 4) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['set-cell-at'], 3, $a); }
          runtime.checkString(col);
          runtime.checkNumber(rowNum);
          var colNum = colNameToNum(col);
          // Any cell can be set; we just need the indices to be positive
          checkCol(colNum, col, 0, Number.POSITIVE_INFINITY);
          checkRow(rowNum, 1, Number.POSITIVE_INFINITY);
          rowNum -= 1;
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) {
                if (cells[rowNum] && cells[rowNum][colNum]) {  
                  var contents = new Array(1);
                  contents[0] = new Array(1);
                  contents[0][0] = newVal;
                  ws.updateCells(rowNum, colNum, contents);
                  raiseFlags();
                  resumer.resume(runtime.makeNothing());}
                else { resumer.resume(runtime.makeNothing()); }
              })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var setCellRange = runtime.makeMethod2(function(self, startCol, startRow, entries){
          if (arguments.length !== 4) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['set-cell-range'], 3, $a); }
          runtime.checkString(startCol);
          runtime.checkNumber(startRow);
          var checkList = runtime.makeCheckType(runtime.ffi.isList, "List");
          checkList(entries);
          var rowNum = startRow - 1;
          var colNum = colNameToNum(startCol);
          var contents = runtime.ffi.toArray(entries);
          contents.forEach(checkList);
          // Any cell can be set; we just need the indices to be positive
          checkCol(colNum, startCol, 0, Number.POSITIVE_INFINITY);
          checkRow(startRow, 1, Number.POSITIVE_INFINITY);
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) {
                ws.updateCells(rowNum, colNum, contents.map(runtime.ffi.toArray));
                raiseFlags();
                resumer.resume(runtime.makeNothing());
              })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
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
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
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
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
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
          checkRow(startRow, 1, ws.rowCount + 1);
          checkCol(endCol, endColName, startCol, ws.colCount);
          checkRow(endRow, startRow, ws.rowCount + 1);
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) { 
                processCells(cells, resumer, {startRow: startRow - 1, startCol: startCol, endRow: endRow - 1, endCol: endCol});
              })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var getCellRangeAs = runtime.makeMethod5(function(self, startColName, startRow, endColName, endRow, constr) {
          if (arguments.length !== 6) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['cell-range-as'], 5, $a); }
          runtime.checkString(startColName);
          runtime.checkNumber(startRow);
          runtime.checkString(endColName);
          runtime.checkNumber(endRow);
          runtime.checkFunction(constr);
          var startCol = colNameToNum(startColName);
          var endCol = colNameToNum(endColName);
          checkCol(startCol, startColName, 0, ws.colCount);
          checkRow(startRow, 1, ws.rowCount + 1);
          checkCol(endCol, endColName, startCol, ws.colCount);
          checkRow(endRow, startRow, ws.rowCount + 1);
          runtime.pauseStack(function(resumer) {
            getCells()
              .then(function(cells) { 
                processCells(cells, resumer, 
                             {startRow: startRow - 1, startCol: startCol, endRow: endRow - 1, endCol: endCol, constr: constr});
              })
              .catch(function (err) {
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var getAllRows = runtime.makeMethod0(function(self) {
          if (arguments.length !== 1) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['all-rows'], 0, $a); }
          runtime.pauseStack(function(resumer) { 
            getRows()
              .then(function(rows){
                processRows(rows, resumer, {});
              })
              .catch(function(err) { 
                if (runtime.isPyretException(err)) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var addRow = runtime.makeMethod1(function(self, newRow){
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['add-row'], 1, $a); }
          runtime.checkObject(newRow);
          runtime.pauseStack(function(resumer){
            ws.addRow(newRow.dict)
              .then(function(result) { 
                resumer.resume(runtime.makeNothing());
              })
              .catch(function(err){
                if ( runtime.isPyretException(err) ) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var updateRow = runtime.makeMethod2(function(self, rowNum, contents) {
          if (arguments.length !== 3) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['update-row'], 2, $a); }
          runtime.checkNumber(rowNum);
          runtime.checkObject(contents);
          checkRow(rowNum, 1, ws.numRows + 1);
          rowNum -= 1;
          runtime.pauseStack(function(resumer){
            ws.updateRow(rowNum, contents.dict)
              .then(function(result){
                resumer.resume(runtime.makeNothing());
              })
              .catch(function(err){
                if ( runtime.isPyretException(err) ) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var deleteRow = runtime.makeMethod1(function(self, rowNum){
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['delete-row'], 1, $a); }
          runtime.checkNumber(rowNum);
          checkRow(rowNum, 1, ws.numRows + 1);
          rowNum -= 1;
          runtime.pauseStack(function(resumer) {
            ws.deleteRow(rowNum)
              .then(function(result){
                resumer.resume(runtime.makeNothing());
              })
              .catch(function(err){
                if ( runtime.isPyretException(err) ) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var updateName = runtime.makeMethod1(function(self, newName){
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['update-name'], 1, $a); }
          runtime.checkString(newName);
          runtime.pauseStack(function(resumer) {
            ws.updateName(newName)
              .then(function(result){
                self.dict.title = runtime.makeString(newName);
                resumer.resume(runtime.makeNothing());
              })
              .catch(function(err){
                if ( runtime.isPyretException(err) ) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var resizeRows = runtime.makeMethod1(function(self, numRows){
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['resize-rows'], 1, $a); }
          runtime.checkNumber(numRows);
          if (numRows < 1) { 
            runtime.ffi.throwMessageException("Invalid row number: " + String(numRows));
          }
          runtime.pauseStack(function(resumer){
            ws.resizeRows(numRows)
              .then(function(result){
                self.dict['row-count'] = runtime.makeNumber(numRows);
                resumer.resume(runtime.makeNothing());
              })
              .catch(function(err){
                if ( runtime.isPyretException(err) ) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        var resizeCols = runtime.makeMethod1(function(self, numCols){
          if (arguments.length !== 2) { var $a=new Array(arguments.length-1); for (var $i=1;$i<arguments.length;$i++) { $a[$i-1]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['resize-cols'], 1, $a); }
          runtime.checkNumber(numCols);
          if (numCols < 1) {
            runtime.ffi.throwMessageException("Invalid column number: " + String(numCols));
          }
          runtime.pauseStack(function(resumer){
            ws.resizeCols(numCols)
              .then(function(result){
                self.dict['col-count'] = runtime.makeNumber(numRows);
                resumer.resume(runtime.makeNothing());
              })
              .catch(function(err){
                if ( runtime.isPyretException(err) ) { resumer.error(err); }
                else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
              });
          });
        });
        return O({
          title: ws.title,
          'row-count': runtime.makeNumber(ws.rowCount),
          'col-count': runtime.makeNumber(ws.colCount),
          'cell-at': getCellAt,
          'set-cell-at': setCellAt,
          'set-cell-range': setCellRange,
          'all-cells': getAllCells,
          'all-cells-as': getAllCellsAs,
          'cell-range': getCellRange,
          'cell-range-as': getCellRangeAs,
          // 'all-rows': getAllRows, <---+
          // 'add-row': addRow, <- Disable for now; see Worksheet.addRow
          // 'update-row': updateRow, <--+
          // 'delete-row': deleteRow, <--+-- Disabled; pending removal
          'update-name': updateName,
          'resize-rows': resizeRows,
          'resize-cols': resizeCols
        });
      }
      function loadSheetAndProcess2(name, visibility) {
        runtime.pauseStack(function(resumer) {
          Spreadsheets({key: name, auth: gapi.auth, visibility: visibility})
            .then(function (spreadsheet) { resumer.resume(makePyretSpreadsheet(spreadsheet)); })
            .catch(function (err) {
              if (runtime.isPyretException(err)) { resumer.error(err); }
              else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
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
              else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
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

      function newSpreadsheet(name) {
        if (arguments.length !== 1) { var $a=new Array(arguments.length); for (var $i=0;$i<arguments.length;$i++) { $a[$i]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['new-spreadsheet'], 1, $a); }
        runtime.checkString(name);
        runtime.pauseStack(function(resumer){
          createSpreadsheet(name)
            .then(function(fileObj){
              Spreadsheets({key: fileObj.getUniqueId(), auth: gapi.auth, visibility: "private"})
                .then(function(ss){ resumer.resume(makePyretSpreadsheet(ss)) })
                .catch(function(err) {
                  if (runtime.isPyretException(err)) { resumer.error(err); }
                  else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
                });
            })
            .catch(function(err){
              if (runtime.isPyretException(err)) { resumer.error(err); }
              else { resumer.error(runtime.ffi.makeMessageException(String(err))); }
            });
        });
      }
        
      return O({
        "provide-plus-types": O({
          types: {},
          values: O({
            "load-sheet-raw": F(loadSheetRaw),
            "load-sheet": F(loadSheet),
            "load-spreadsheet": F(loadSpreadsheet),
            "new-spreadsheet": F(newSpreadsheet),
            "public": runtime.makeString("public"),
            "private": runtime.makeString("private"),
          })
        }),
        "answer": runtime.nothing
      });
    });
});
