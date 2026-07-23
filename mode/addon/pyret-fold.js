(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  /*
   * Logic for Keyword/Bracket Matching
   */

  /* =========== WARNING ============
   * CodeMirror mangles 0 and 1-indexed
   * values to a certain extent. CodeMirror.Pos
   * (aliased as just "Pos") expects the
   * character index to be 1-indexed, while
   * token objects returned by methods such as
   * cm.getTokenAt have `start` and `end` character
   * indices which are 0-indexed. As such,
   * some things in this file might look
   * a little weird, but bear the above
   * in mind before tweaking.
   */

  var Pos = CodeMirror.Pos;

  /**
   * Returns the difference between two {@link CodeMirror.Pos} objects
   */
  function cmp(a, b) { return a.line - b.line || a.ch - b.ch; }

  /**
   * Like cmp(...), but accepts two positions representing
   * a range and returns the distance to the closest point
   * of [a, b]. (If a <= c <= b, returns 0).
   */
  function cmpClosest(a, b, c) {
    var ret = a.line - c.line
    if (ret) { return ret; }
    if (a.ch <= c.ch && c.ch <= b.ch) { return 0; }
    if (Math.abs(a.ch - c.ch) < Math.abs(b.ch - c.ch)) { return a.ch - c.ch; }
    return b.ch - c.ch;
  }

  /**
   * Returns whether the given opening and closing tags
   * (textually) match. Undefined behavior if one or both
   * arguments are not valid
   * @param {token or string} open - The opening tag to check
   * @param {token or string} close - The closing tag to check
   * @returns {boolean} If the match succeeded
   */
  function keyMatches(open, close, isFunctionName) {
    if (typeof(open) !== 'string') {
      if (isFunctionName || open.type === 'function-name')
        open = 'fun';
      else
        open = open.string;
    } else if (isFunctionName) {
      open = 'fun';
    }
    let closeString = (typeof(close) === 'string') ? close : close.string;
    if (DELIMS.indexOf(open) != -1) {
      if (ENDDELIM.indexOf(closeString) != -1) {
        return true;
      }
      // Otherwise, we fall back on SPECIALDELIM
      // (this allows 'provide' to be closed by either
      //  'end' or '*')
    }
    // [TODO] Seems fragile:
    // console.log(close);
    let closeType = (typeof(close) === 'string') ? close : close.state.lastToken;
    for (var i = 0; i < SPECIALDELIM.length; i++) {
      if (open === SPECIALDELIM[i].start) {
        //console.log(`Checking if ${closeType} in ${JSON.stringify(SPECIALDELIM[i].ends)}`);
        let ret = SPECIALDELIM[i].ends.includes(closeType);
        //console.log(ret ? 'it is' : 'it is not');
        return ret;
      }
    }
    return false;
  }

  /**
   * Returns a function which checks that
   * the given field has one of the given
   * values.
   * @param {!string} fname - The name of the field to check
   * @param {...*}   vals  - The values to check that the field is equal to
   * @returns {function}
   */
  function fieldOneOf(fname,vals) {
    var oneOf = Array.prototype.slice.call(arguments,1);
    return function(obj) {
      var fval = obj[fname]
      for (var i = 0; i < oneOf.length; i++) {
        if (fval === oneOf[i])
          return true;
      }
      return false;
    };
  }

  /**
   * Returns a function which negates
   * the return value of the given function
   * @param {!function} func - The function to negate
   * @returns {function}
   */
  function negate(func) {
    return function() {
      return !(func.apply(this,arguments));
    }
  }

  /**
   * Returns a function which extracts the
   * given field from a given object
   * @param {!string} fname - The field to extract
   * @returns {function}
   */
  function getField(fname) {
    return function(o) {
      return o[fname];
    }
  }

  /**
   * Checks if the given array of strings
   * contains duplicates
   * Source: http://stackoverflow.com/questions/7376598
   *  (It's a nifty trick)
   * @param {!string[]} - The array to check
   * @returns {boolean}
   */
  function hasDuplicates(array) {
    // Uses valuesSoFar as a table and
    // checks that there are no collisions
    var valuesSoFar = Object.create(null);
    for (var i = 0; i < array.length; ++i) {
        var value = array[i];
        if (value in valuesSoFar) {
            return true;
        }
        valuesSoFar[value] = true;
    }
    return false;
  }

  var pyretMode = CodeMirror.getMode({},"pyret");
  if (pyretMode.name === "null") {
    throw Error("Pyret Mode not Defined");
  } else if (!pyretMode.delimiters || // Make sure delimiters exist
             !pyretMode.delimiters.opening ||      // and are valid
             !pyretMode.delimiters.closing ||
             !pyretMode.delimiters.subkeywords ||
             !pyretMode.delimiters.lastSubkeywords ||
             !pyretMode.delimiters.special ||
             !pyretMode.delimiters.types) {
    throw Error("No correct delimiters defined in Pyret Mode");
  } else if (pyretMode.delimiters.opening.some(negate(
               fieldOneOf("type", "keyword", "builtin")))
             || pyretMode.delimiters.closing.some(negate(
               fieldOneOf("type", "keyword", "builtin")))) {
    throw Error("Pyret Mode contains delimiters of unknown type");
  }
  // For now, there is no need to hold onto the type information
  // (See assumption below). The mode exports this information
  // for future-proofing purposes.

  // Opening Delimiter Tokens
  var DELIMS = pyretMode.delimiters.opening.map(getField("string"));
  // Closing Delimiter Tokens
  var ENDDELIM = pyretMode.delimiters.closing.map(getField("string"));
  // Contexts in which function names may be unprefixed
  var UPFXCONTEXTS = pyretMode.unprefixedContexts;
  // Make sure everything exists
  if (!DELIMS || !ENDDELIM || !UPFXCONTEXTS) {
    throw Error("Pyret Mode missing required exports.");
  }
  // There should never be duplicates (same string, different type).
  // If so, refactoring will be needed. An assertion of this is done
  // here, but this nonetheless rests on the assumption that it is
  // impossible to have the same string tokenize to both a keyword
  // and a builtin.
  if (hasDuplicates(DELIMS) || hasDuplicates(ENDDELIM)) {
    throw Error("Pyret Mode contains duplicate delimiter string values");
  }
  // Tokens with closing tokens other than "end"
  var SPECIALDELIM = pyretMode.delimiters.special;
  // Encapsulates subkeyword relationships
  var SUBKEYWORDS = pyretMode.delimiters.subkeywords;
  // Types of delimiters (open, close, etc.) (enum)
  var DELIMTYPES = pyretMode.delimiters.types;
  // Matches against any token text
  var delimrx = new RegExp("(" + DELIMS.join("|") + "|" +
                           ENDDELIM.join("|") + "|\\(|\\)|\\[|\\]|{|})", "g");

  // Represents subkeywords which cannot be followed
  // by any other keywords
  var LASTSUBKEYWORDS = pyretMode.delimiters.lastSubkeywords;

  // Like SIMPLESUBKEYWORDS, but goes from sub-keyword->parent
  var INV_SUBKEYWORDS = {};
  Object.keys(SUBKEYWORDS).forEach(function(key){
    var arr = SUBKEYWORDS[key];
    arr.forEach(function(skw) {
      INV_SUBKEYWORDS[skw] = INV_SUBKEYWORDS[skw] || [];
      INV_SUBKEYWORDS[skw].push(key);
    });
  });

  // Inverse mapping from LASTSUBKEYWORDS
  var INV_LASTSUBKEYWORDS = {};
  Object.keys(LASTSUBKEYWORDS).forEach(function(key){
    var kw = LASTSUBKEYWORDS[key];
    // Needs to be an array since mapping is (potentially) non-injective
    INV_LASTSUBKEYWORDS[kw] = INV_LASTSUBKEYWORDS[kw] || [];
    INV_LASTSUBKEYWORDS[kw].push(key);
  });

  var INV_DELIMTYPES = {};
  Object.keys(DELIMTYPES).forEach(function(key){
    INV_DELIMTYPES[DELIMTYPES[key]] = key;
  });

  /**
   * Encapsulates an iterator over the CodeMirror instance's body
   * @param {CodeMirror} cm - The CodeMirror instance
   * @param {number} line - The active line
   * @param {number} ch - The active location on the line
   * @param {Object} [range] - The delimiting start/end lines for the iterator
   * @constructor
   */
  function TokenTape(cm, line, ch, range) {
    this.line = line;
    this.startCh = ch;
    this.cm = cm;
    this.min = range ? range.from : cm.firstLine();
    this.max = range ? range.to - 1 : cm.lastLine();
    this.lineToks = cm.getLineTokens(line);
    this.dbg = CodeMirror.debugInternal;
    // this.current is the current index in lineToks
    if (ch <= 1){
      this.current = 0;
      // Skip any leading whitespace
      while (this.current < this.lineToks.length && !this.lineToks[this.current].type) {
        ++this.current;
      }
      // If the line is all whitespace, then there's no token here.
      if (this.current >= this.lineToks.length) {
        this.current = null;
      }
    } else {
      for (var i = 0; i < this.lineToks.length; i++) {
        if ((this.lineToks[i].start < ch)
            && (this.lineToks[i].end >= ch)) {
          this.current = i;
          break;
        }
      }
      // As a special case, we don't show this warning in the case of
      // entirely empty lines, since those are handled gracefully by
      // the folder.

      // TODO: Figure out the edge case we're missing here by not
      //       skipping whitespace, as done in the `ch <= 1` case
      if (this.current === undefined) {
        console.warn("TokenTape: Given invalid start ch of "
                     + ch + ". Defaulting to last.");
        // Default to last, since this should mean ch was too high
        this.current = this.lineToks.length - 1;
      }
    }
    // Used on line begin/end boundaries
    this.cachedLine = null;
    // Contains regions with continued keywords
    // e.g. will contain both "else if" and ":" tokens
    if (this.current === null)
      this.curRegion = null;
    else if (this.lineToks.length > 0)
      this.curRegion = {start: Pos(this.line, this.lineToks[this.current].start),
                        end: Pos(this.line, this.lineToks[this.current].end)};
    else
      this.curRegion = {start : Pos(this.line, 0), end : Pos(this.line, 0)};
  }

  function regionToString(r) {
    if (!r)
      return "null";
    return "{start: " + posToString(r.start) + ", end: " + posToString(r.end) + "}";
  }

  function posToString(p) {
    if (!p)
      return "null";
    return "{line: " + p.line + ", ch: " + p.ch + "}";
  }

  function tokenToString(t) {
    return "{start: " + t.start + ", end: " + t.end + ", string: '" + t.string + "', type: " + t.type + ", delimType: " + INV_DELIMTYPES[t.state.lineState.delimType] + "}";
  }

  TokenTape.prototype.toString = function() {
    var ret = "TokenTape:\n" +
        "\tline: " + this.line + "\n" +
        "\tmin: " + this.min + "\n" +
        "\tmax: " + this.max + "\n" +
        "\tlineToks: [";
    for (var i = 0; i < this.lineToks.length; ++i) {
      var t = this.lineToks[i];
      if (i > 0) {
        ret += ",\n\t           ";
      }
      ret += "[" + i + "] " + tokenToString(t);
    }
    ret += "]\n" +
      "\tcurrent: " + this.current + "\n" +
      "\tcurRegion: " + regionToString(this.curRegion);
    return ret;
  };

  // For future use
  /**
   * Wrapper for a semi-deep copy of TokenTapes
   * ("semi-deep" meaning that CM objects are not duplicated,
   *  but all others are)
   * @param {TokenTape} tt - The TokenTape to clone
   */
  function TokenTapeClone(tt) {
    // Keep clones shallow
    if (tt instanceof TokenTapeClone) {
      tt = tt.__wrapped;
    }
    this.__wrapped = tt;
    this.line = tt.line;
    this.cm = tt.cm;
    this.min = tt.min;
    this.max = tt.max;
    this.lineToks = tt.lineToks.slice(0);
    this.current = tt.current;
    this.cachedLine = tt.cachedLine;
    this.curRegion = {start: tt.curRegion.start, end: tt.curRegion.end};
  }
  TokenTapeClone.prototype = Object.create(TokenTape.prototype);

  /**
   * Creates a copy of this TokenTape.
   * @see TokenTapeClone
   * @return {TokenTape} The cloned TokenTape
   */
  TokenTape.prototype.clone = function() {
    return new TokenTapeClone(this);
  }

  /**
   * Internal function which changes the TokenTape's
   * current index to the given number
   * (handles index and region change)
   */
  TokenTape.prototype.setIndex = function(idx) {
    // Because this is internal and heavily used,
    // we will assume that the given index is valid
    // (to avoid doing a check each time)
    this.current = idx;
    this.curRegion = {start: Pos(this.line, this.lineToks[idx].start),
                      end: Pos(this.line, this.lineToks[idx].end)};
  }

  /**
   * Moves this {@link TokenTape} to the next line
   * @returns {boolean} Whether the move was successful
   */
  TokenTape.prototype.nextLine = function() {
    if (this.line >= this.max) {
      this.current = null;
      this.curRegion = null;
      return false;
    }
    var newCached = {dir : -1, toks : this.lineToks};
    // If we have the next line cached, use it.
    if (this.cachedLine && (this.cachedLine.dir === 1)) {
      this.lineToks = this.cachedLine.toks;
      ++this.line;
    } else {
      this.lineToks = this.cm.getLineTokens(++this.line);
    }
    this.cachedLine = newCached;
    if (this.lineToks.length === 0)
      return this.nextLine();
    else {
      this.setIndex(0);
      return true;
    }
  };

  /**
   * Moves this {@link TokenTape} to the previous line
   * @returns {boolean} Whether the move was successful
   */
  TokenTape.prototype.prevLine = function() {
    if (this.line <= this.min) {
      this.current = null;
      this.curRegion = null;
      return false;
    }
    var newCached = {dir : 1, toks : this.lineToks};
    // If we have the previous line cached, use it.
    if (this.cachedLine && (this.cachedLine.dir === -1)) {
      this.lineToks = this.cachedLine.toks;
      --this.line;
    } else {
      this.lineToks = this.cm.getLineTokens(--this.line);
    }
    this.cachedLine = newCached;
    if (this.lineToks.length === 0) {
      return this.prevLine();
    } else {
      this.setIndex(this.lineToks.length - 1);
      return true;
    }
  };

  /**
   * Grows this TokenTape to cover any continued keywords
   * (e.g. if the current keyword is "else if", grows this.curRegion
   *  to cover the ":" which should be adjacent)
   * PRECONDITION: The current token is one of: OPENING, CLOSING, SUBKEYWORD
   * KNOWN ERROR: Continued tokens on the next line are ignored; will handle in future
   */
  TokenTape.prototype.getContinued = function() {
    var idx = this.current;
    var tok = this.lineToks[idx];
    // Bail out if on last token in line
    if (this.current === this.lineToks.length - 1)
      return;
    // Not on last token; check for continued keywords
    var contdType;
    switch(tok.state.lineState.delimType) {
    case DELIMTYPES.OPENING:
      contdType = DELIMTYPES.OPEN_CONTD;
      break;
    case DELIMTYPES.CLOSING:
      contdType = DELIMTYPES.CLOSE_CONTD;
      break;
    case DELIMTYPES.SUBKEYWORD:
      contdType = DELIMTYPES.SUB_CONTD;
      break;
    default:
      console.warn("getContinued called with bad current token");
      console.warn(tok);
      return;
    }
    while (++idx < this.lineToks.length) {
      if (!this.lineToks[idx].type) { continue; }
      if (this.lineToks[idx].state.lineState.delimType === contdType) {
        tok = this.lineToks[idx];
      } else {
        break;
      }
    }
    this.curRegion.end = Pos(this.line, tok.end);
  };

  /**
   * Grows this TokenTape to cover any continued keywords
   * (e.g. if the current keyword is "else if", grows this.curRegion
   *  to cover the ":" which should be adjacent)...also selects folding-only
   * token continuations
   * PRECONDITION: The current token is one of: OPENING, CLOSING, SUBKEYWORD
   * KNOWN ERROR: Continued tokens on the next line are ignored; will handle in future
   */
  TokenTape.prototype.getFoldingContinued = function() {
    var idx = this.current;
    var tok = this.lineToks[idx];
    // Bail out if on last token in line
    if (this.current === this.lineToks.length - 1)
      return;
    // Not on last token; check for continued keywords
    var contdType;
    var foldContdType = null;
    switch(tok.state.lineState.delimType) {
    case DELIMTYPES.OPENING:
      contdType = DELIMTYPES.OPEN_CONTD;
      foldContdType = DELIMTYPES.FOLD_OPEN_CONTD;
      break;
    case DELIMTYPES.CLOSING:
      contdType = DELIMTYPES.CLOSE_CONTD;
      break;
    case DELIMTYPES.SUBKEYWORD:
      contdType = DELIMTYPES.SUB_CONTD;
      break;
    default:
      console.warn("getFoldingContinued called with bad current token");
      console.warn(tok);
      return;
    }
    while (++idx < this.lineToks.length) {
      if (!this.lineToks[idx].type) { continue; }
      if (this.lineToks[idx].state.lineState.delimType === contdType
          || this.lineToks[idx].state.lineState.delimType === foldContdType) {
        tok = this.lineToks[idx];
      } else {
        break;
      }
    }
    this.curRegion.end = Pos(this.line, tok.end);
  };

  /**
   * If this TokenTape is currently on a continued version for
   * a keyword, attempts to move backwards to the matching initial
   * keyword. This is only really used during the initial creation
   * of the TokenTape object by the matcher.
   * PRECONDITION: The current token is one of OPEN_CONTD, CLOSE_CONTD, SUB_CONTD
   * WARNING: For consistency's sake, does not match with initial keywords
   *   on previous lines
   * @returns {boolean} Whether a matching keyword was found (if not,
   *  TokenTape remains unmoved)
   */
  TokenTape.prototype.snapBack = function() {
    var idx = this.current;
    var tok = this.lineToks[idx];
    // If at start of line, bail out
    if (this.current === 0)
      return false;
    // Not at start of line, so search
    var contdType = tok.state.lineState.delimType;
    var initType;
    switch(contdType) {
    case DELIMTYPES.OPEN_CONTD:
    // No need for a special method here, since this should
    // only be called while on a FOLD_OPEN_CONTD token if we
    // want to support them
    case DELIMTYPES.FOLD_OPEN_CONTD:
      initType = DELIMTYPES.OPENING;
      break;
    case DELIMTYPES.CLOSE_CONTD:
      initType = DELIMTYPES.CLOSING;
      break;
    case DELIMTYPES.SUB_CONTD:
      initType = DELIMTYPES.SUBKEYWORD;
      break;
    default:
      console.warn("snapBack called with bad current token");
      console.warn(tok);
    }
    while (--idx >= 0) {
      if (!this.lineToks[idx].type){ continue; }
      var curType = this.lineToks[idx].state.lineState.delimType;
      if (curType === initType) {
        this.setIndex(idx);
        return true;
      } else if (curType !== contdType) {
        return false;
      }
    }
  };

  TokenTape.prototype.move = function(dir, opts){
    if ((this.current === null) && (this.line <= this.min) && (dir === -1)) return false;
    if ((this.current === null) && (this.line >= this.max) && (dir ===  1)) return false;
    if ((dir !== 1) && (dir !== -1)) {
      console.warn("Expected direction of 1 or -1. Given: " + dir);
      return false;
    }
    opts = opts || {};
    function isDelim(tok) {
      // All delimiters have types...
      // tokens missing them are (if not certainly) whitespace
      if (!tok.type) return false;
      if (opts.includeContd) {
        switch(tok.state.lineState.delimType) {
        case DELIMTYPES.OPEN_CONTD:
        case DELIMTYPES.CLOSE_CONTD:
        case DELIMTYPES.SUB_CONTD:
          return true;
        case DELIMTYPES.FOLD_OPEN_CONTD:
          if (opts.includeFoldContd) return true;
        default:
          break;
        }
      }
      switch(tok.state.lineState.delimType) {
      case DELIMTYPES.OPENING:
      case DELIMTYPES.CLOSING:
      case DELIMTYPES.SUBKEYWORD:
        return true;
      default:
        return false;
      }
    }
    var moveLine = (dir === 1 ? this.nextLine : this.prevLine).bind(this);
    var isEOL = dir === 1 ?
          (function(i) {return (i >= this.lineToks.length - 1);}).bind(this)
        : (function(i) {return (i <= 0);});
    var idx = this.current;
    var curTok = this.lineToks[this.current];
    for (;;) {
      if (isEOL(idx)) {
        if (!moveLine()) return false;
        idx = this.current;
      } else {
        idx += dir;
      }
      curTok = this.lineToks[idx];
      if (isDelim(curTok)) {
        this.setIndex(idx);
        return true;
      }
    }
  };

  TokenTape.prototype.next = function(opts) {
    this.move(1, opts);
    return this.cur();
  };

  TokenTape.prototype.prev = function() {
    this.move(-1);
    return this.cur();
  };

  TokenTape.prototype.cur = function() {
    if ((this.current === null) || (this.lineToks.length === 0))
      return null;
    var ret = this.lineToks[this.current];
    ret.line = this.line;
    return ret;
  };

  /**
   * Finds the initial token to match from
   * @param {boolean} folding - Whether folding token continuations should be allowed
   */
  TokenTape.prototype.findInit = function(folding) {
    var cur = this.cur();
    var dbg = this.dbg;
    if (dbg) {
      this.dbg.writeLn("cur: " + (cur && tokenToString(cur)));
    }
    if (!cur) return null;
    // Expected position if cursor has matchable token to right of it
    var startPos = Pos(this.line, this.startCh + 1);
    // As a fallback, we use this position to handle matches to the left
    // of the cursor (but we favor tokens to the right)
    var truePos = Pos(this.line, this.startCh);
    if (dbg) {
      dbg.writeLn("startPos: " + posToString(startPos));
      dbg.writeLn("truePos: " + posToString(truePos));
    }
    var matchesFwd = function(tok) {
      if (!tok || !tok.type) { return false; }
      var diff = cmpClosest(Pos(tok.line, tok.start), Pos(tok.line, tok.end), startPos);
      var sameLine = tok.line === startPos.line;
      // FIXME: The fact that this check is needed is proof that the nuances of this method's by-one adjustments
      // are all over the place. This method should be cleaned up.
      var allowed = tok.start <= truePos.ch;
      if (dbg) {
        dbg.writeLn("matchFwd: " + (tok && tokenToString(tok)) + "; diff = " + diff + "; sameLine = " + sameLine + "; allowed = " + allowed);
      }
      return (sameLine && (diff === 0) && allowed);
    };
    var matchesBwd = function(tok) {
      if (!tok || !tok.type) { return false; }
      var diff = cmpClosest(Pos(tok.line, tok.start), Pos(tok.line, tok.end), truePos);
      var sameLine = tok.line === startPos.line;
      if (dbg) {
        dbg.writeLn("matchBwd: " + (tok && tokenToString(tok)) + "; diff = " + diff + "; sameLine = " + sameLine);
      }
      return (sameLine && (diff === 0));
    };
    const snapCursorBackAfterBwd = () => {
      // Reset position
      while(this.line < startPos.line) {this.nextLine();}
      this.setIndex(curIdx);
    };
    const snapCursorBackAfterFwd = () => {
      // Reset position
      while(this.line > startPos.line) {this.prevLine();}
      this.setIndex(curIdx);
    }
    /**
     * What we want:
     * (|( matches the RIGHT (of cursor)
     * )|) matches the LEFT (of cursor)
     * )|( matches the LEFT (of cursor)
     * ))| matches the LEFT (of cursor)
     * (|  matches the LEFT (of cursor)
     * fun foo|(  matches the RIGHT of cursor
     * else:|(    matches the RIGHT of cursor
     *
     * if left of cursor is closing, match it
     * else if (right of cursor is opening), match it
     * else match anything adjacent
     */
    var curIdx = this.current;
    if (dbg) {
      this.dbg.writeLn("Checking if left at current position is closing")
    }
    if (matchesBwd(cur)) {
      if (cur.state.lineState.delimType === DELIMTYPES.CLOSING)
        return cur;
    }
    if (dbg) {
      this.dbg.writeLn("Checking forward at current position");
    }
    snapCursorBackAfterBwd();
    if (matchesFwd(cur)) {
      return cur;
    }
    if (dbg) {
      this.dbg.writeLn("Checking right adjacent token");
    }
    // [TODO]?
    var adj = this.next({includeContd : true, includeFoldContd : folding});
    if (matchesFwd(adj)) {
      return adj;
    }

    // Reset position
    snapCursorBackAfterFwd();
    if (dbg) {
      this.dbg.writeLn("Checking for any on left")
    }
    if (matchesBwd(cur)) {
      return cur;
    }
    return null;
  }

  function IterResult(token, fail, subs, badSubs) {
    this.token = token;
    this.fail = fail;
    this.subs = subs || [];
    this.badSubs = badSubs || [];
  }

  /**
   * Finds the keyword which matches the opening
   * or closing token at the current position (depending on
   * the direction being travelled)
   * @param {string} [kw] - The keyword to match
   * @param {int} [dir] - The direction to travel (-1 = Backward, 1 = Forward)
   * @returns {IterResult} The resulting matched opening keyword
   */
  TokenTape.prototype.findMatchingToken = function(kw, dir) {
    if (Math.abs(dir) !== 1)
      throw new Error("Invalid Direction Given to findMatchingToken: " + dir.toString());
    var curType = this.lineToks[this.current].state.lineState.delimType;
    if (!((curType === DELIMTYPES.OPENING) || (curType === DELIMTYPES.CLOSING)))
      throw new Error("Invalid starting token: " + this.lineToks[this.current]);
    var isFunctionName = kw.type === 'function-name';
    var kwOrig = kw; // [TODO] Delete
    kw = kw.string;
    var forward = dir === 1;
    var stack = [];
    // kw => matched subkeywords
    var subs = {};
    // Array of keywords for which the last subkeywords
    // have already been found
    var lastFound = [];
    // kw => matched subkeywords that don't belong
    var badSubs = {};
    // Directionally-based behavior:
    var getNext = (forward ? this.next : this.prev).bind(this);
    var deeperType = forward ? DELIMTYPES.OPENING : DELIMTYPES.CLOSING;
    var shallowerType = forward ? DELIMTYPES.CLOSING : DELIMTYPES.OPENING;
    var stackEmpty = function(){ return stack.length === 0; };
    var toksMatch = forward ?
        (function(tok){ return keyMatches(kw, tok, isFunctionName); })
        : (function(tok){ return keyMatches(tok, kwOrig); });
    // Should the starting token be red if the match fails?
    var failIfNoMatch = !forward;
    function isDeeper(t) {
      return t.state.lineState.delimType === deeperType;
    }
    function isShallower(t) {
      return t.state.lineState.delimType === shallowerType;
    }
    // Handles behavior for subtokens found after
    // token in "lastSubKeywords" has been processed
    // PRECONDITION: Currently on `tok`, which is a SUBKEYWORD
    var dealWithAfterLast = (function(tok, parent) {
      this.getContinued();
      var toAdd = {from: this.curRegion.start, to: this.curRegion.end};
      // If forward, new subkeyword is bad (e.g. "else if" after "else")
      if (forward) {
        badSubs[parent] = badSubs[parent] || [];
        badSubs[parent].push(toAdd);
        return;
      }
      // If going backward, the token is fine, as
      // long as *it* is not the last subkeyword.
      var invLast = INV_LASTSUBKEYWORDS[tok.string] || [];
      if (invLast.indexOf(parent) === -1) {
        subs[parent] = subs[parent] || [];
        subs[parent].push(toAdd);
        return;
      }
      // Last subkeyword found. Move current ones to bad
      // pile and replace valid ones w/ new token
      if (subs[parent]) {
        badSubs[parent] = badSubs[parent] || [];
        subs[parent].forEach(function(child) {
          badSubs[parent].push(child);
        });
      }
      subs[parent] = [toAdd];
    }).bind(this);
    for (;;) {
      var next = getNext();
      // EOF
      if (!next) return new IterResult(null, failIfNoMatch, kw ? subs[kw] : []);
      // Handle Subkeyword case
      if (stackEmpty() && (next.state.lineState.delimType === DELIMTYPES.SUBKEYWORD)) {
        // Optimize for forward case
        if (forward) {
          var matchingSubs = SUBKEYWORDS[kw];
          var lastSubs = LASTSUBKEYWORDS[kw];
          if (matchingSubs && (matchingSubs.indexOf(next.string) !== -1)) {
            if (lastFound.indexOf(kw) !== -1) {
              dealWithAfterLast(next, kw);
            } else {
              if (lastSubs && lastSubs === next.string)
                lastFound.push(kw);
              subs[kw] = subs[kw] || [];
              this.getContinued();
              subs[kw].push({from: this.curRegion.start, to: this.curRegion.end});
            }
            continue;
          }
        } else { // Backwards case
          var inv = INV_SUBKEYWORDS[next.string];
          if (inv) {
            inv.forEach(function(key) {
              if (lastFound.indexOf(key)) {
                dealWithAfterLast(next, key);
              } else {
                this.getContinued();
                var nextReg = {from: this.curRegion.start, to: this.curRegion.end};
                if (LASTSUBKEYWORDS[key] === next.string)
                  lastFound.push(key)
                subs[key] = subs[key] || [];
                subs[key].push(nextReg);
              }
            })
            continue;
          }
        }
      }// end if
      // Check if we need to remove/add stack layer
      if (isShallower(next)) {
        // If stack is empty, we've matched
        if (stackEmpty()) {
          // if (forceNoUnderflow) {
          //   return new IterResult(null, failIfNoMatch, []);
          // }
          var tok = {token: next,
                     from: this.curRegion.start,
                     to: this.curRegion.end};
          var fail = !(!kw || toksMatch(next));
          return new IterResult(tok, fail,
                                fail ? [] : (forward ? subs[kw] : subs[next.string]),
                                forward ? badSubs[kw] : badSubs[next.string]);
        } else {
          stack.pop();
        }
      } else if (isDeeper(next)) {
        stack.push(next);
      }
    }
  };

  /**
   * Finds the opening keyword which matches the
   * token at the current position
   * @param {string} [kw] - The keyword to match
   * @returns {IterResult} The resulting matched opening keyword
   */
  TokenTape.prototype.findMatchingOpen = function(kw) {
    return this.findMatchingToken(kw, -1);
  };
  /**
   * Finds the opening keyword which matches the
   * token at the current position
   * @param {string} [kw] - The keyword to match
   * @returns {IterResult} The resulting matched opening keyword
   */
  TokenTape.prototype.findMatchingClose = function(kw) {
    return this.findMatchingToken(kw, 1);
  };

  /**
   * Returns the parent token which matches with the given subtoken
   * (e.g. goes from "else if" to its matching "if")
   * @returns {IterResult} The matching parent token, if any
   */
  TokenTape.prototype.findMatchingParent = function(kw) {
    kw = kw.string;
    var stack = [];
    var skip = 0;
    var parents = INV_SUBKEYWORDS[kw];
    if (!parents) {
      throw new Error("Non-Subkeyword given to findMatchingParent");
    }
    for (;;) {
      var prev = this.prev();
      if (!prev) return new IterResult(null, true);
      if (skip > 0) { skip--; continue; }
      var prevIsLast = Object.keys(INV_LASTSUBKEYWORDS).indexOf(prev.string) !== -1;
      // If a last subkeyword is found at the
      // same stack level, it's a Syntax Error
      if (stack.length === 0 && prevIsLast) {
        return new IterResult(null, true);
      }
      var ptype = prev.state.lineState.delimType;
      if (ptype === DELIMTYPES.CLOSING) {
        stack.push(prev);
      } else if (parents.indexOf(prev.string !== -1)) {
        if (stack.length === 0)
          return new IterResult(prev, false, []);
        if (ptype === DELIMTYPES.OPENING) {
          stack.pop();
        }
      } else if (ptype === DELIMTYPES.OPENING) {
        stack.pop();
      }
    }
  };

  function initializeTape(cm, pos, foldOpen, range) {
    var ttape = new TokenTape(cm, pos.line, pos.ch, range);
    var start = ttape.findInit(foldOpen);
    if (ttape.dbg) {
      ttape.dbg.writeLn("Start token: " + (start && tokenToString(start)));
    }
    if (!start || cmp(Pos(start.line, start.start), pos) > 0) {
      return {
        ttape: ttape,
        didNotMatch: true
      };
    }
    var startType = start.state.lineState.delimType;
    switch(startType) {
    case DELIMTYPES.NONE:
      if (ttape.dbg) {
        ttape.dbg.writeLn("Invalid delimiter type.");
      }
      return {
        ttape: ttape,
        didNotMatch: true
      };
    case DELIMTYPES.OPEN_CONTD:
    case DELIMTYPES.CLOSE_CONTD:
    case DELIMTYPES.SUB_CONTD:
      if (!foldOpen) {
        if (!ttape.snapBack()) return {
          ttape: ttape,
          didNotMatch: true
        };
        start = ttape.cur();
        startType = start.state.lineState.delimType;
        break;
      }
      // ! FALL THROUGH WHEN foldOpen == true !
    case DELIMTYPES.FOLD_OPEN_CONTD:
      // If foldOpen is true, we want FOLD_OPEN_CONTD to trigger
      // snapping as well
      if (!ttape.snapBack()) return {
          ttape: ttape,
          didNotMatch: true
        };
      start = ttape.cur();
      startType = start.state.lineState.delimType;
    default:
      break;
    }
    var here = {from: Pos(start.line, start.start), to: Pos(start.line, start.end), token: start};
    return {
      ttape: ttape,
      start: start,
      startType: startType,
      here: here,
      didNotMatch: false
    };
  }

  CodeMirror.registerHelper("fold", "pyret", function(cm, start) {
    var dbg = CodeMirror.debugInternal;
    if (dbg) {
      dbg.clear();
      dbg.writeLn("Folding Debug Info:");
    }
    // This function should fold *lines*, so we always start
    // looking at the start of the line
    var lineStart = Pos(start.line, 0);
    // `range` will fallback onto default in TokenTape constructor
    var initialized = initializeTape(cm, lineStart, true);
    var ttape = initialized.ttape;
    var openKw = ttape.cur();

    function isValid(kw) {
      return kw && kw.state.lineState.delimType === DELIMTYPES.OPENING;
    }

    while (openKw && openKw.line === start.line) {
      // Don't fold parentheses
      if (isValid(openKw) && !(openKw.string === "(" && openKw.type === "builtin")) {
        ttape.getFoldingContinued();
        var startPos = ttape.curRegion.end;
        var close = ttape.findMatchingClose(openKw);
        return close && close.token && {from: startPos, to: close.token.from};
      } else {
        openKw = ttape.next();
      }
    }
    // If we get here, we ran out of tokens to check on the line
    return undefined;
  });

  CodeMirror.findMatchingKeyword = function(cm, pos, range) {
    var dbg = CodeMirror.debugInternal;
    if (dbg) {
      dbg.clear();
      dbg.writeLn("Keyword Matching Debug Info:");
    }
    var initialized = initializeTape(cm, pos, true, range);
    if (initialized.didNotMatch) {
      if (dbg) {
        dbg.writeLn("<no match>");
      }
      return null;
    }
    if (dbg) {
      dbg.writeLn("Initial tape:");
      dbg.writeLn(initialized.ttape.toString());
    }
    var ttape = initialized.ttape;
    var start = initialized.start;
    var startType = initialized.startType;
    var here = initialized.here;
    var other;
    if (startType === DELIMTYPES.CLOSING) {
      other = ttape.findMatchingOpen(start);
      return {open: other.token,
              close: here,
              at: "close",
              matches: !other.fail,
              extra: other.subs,
              extraBad: other.badSubs};
    } else if (Object.keys(INV_SUBKEYWORDS).indexOf(start.string) != -1 && startType !== DELIMTYPES.OPENING) {
      var parent = ttape.findMatchingParent(start);
      if (parent.fail) {
        return {open: parent.token,
                close: here,
                at: "close",
                matches: false,
                extra: [],
                extraBad: parent.badSubs};
      }
      return CodeMirror.findMatchingKeyword(
        cm, Pos(parent.token.line, parent.token.start + 1), range);
    } else {
      other = ttape.findMatchingClose(start);
      return {open: here,
              close: other.token,
              at: "open",
              matches: !other.fail,
              extra: other.subs,
              extraBad: other.badSubs};
    }
  };
});
