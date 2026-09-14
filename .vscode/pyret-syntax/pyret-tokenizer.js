/**
 * pyret-tokenizer.js
 *
 * Adapts the Pyret CodeMirror tokenizer to run in a plain Node.js environment.
 * Instead of using `new Function()` (which is blocked by CSP in some VS Code builds),
 * we define `global.CodeMirror` before requiring pyret.js, so it sees CodeMirror
 * as a global.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const Module = require('module');

// ---------------------------------------------------------------------------
// CodeMirror Stream emulation
// ---------------------------------------------------------------------------
class PyretStream {
  constructor(line) {
    this.string    = line;
    this.pos       = 0;
    this.start     = 0;
    this.lineStart = 0;
  }

  eol()  { return this.pos >= this.string.length; }
  sol()  { return this.pos === this.lineStart; }
  peek() { return this.string[this.pos]; }

  next() {
    if (this.pos < this.string.length) return this.string[this.pos++];
  }

  eat(match) {
    const ch = this.string[this.pos];
    if (ch === undefined) return undefined;
    const ok = (typeof match === 'string')  ? ch === match
             : (match instanceof RegExp)    ? match.test(ch)
             :                               match(ch);
    if (ok) { this.pos++; return ch; }
  }

  eatWhile(match) {
    const s = this.pos;
    while (this.eat(match) !== undefined) {}
    return this.pos > s;
  }

  eatSpace() {
    const s = this.pos;
    while (this.pos < this.string.length && /\s/.test(this.string[this.pos])) this.pos++;
    return this.pos > s;
  }

  skipToEnd()  { this.pos = this.string.length; }
  skipTo(ch)   { const i = this.string.indexOf(ch, this.pos); if (i > -1) { this.pos = i; return true; } }

  match(pattern, consume) {
    if (typeof pattern === 'string') {
      if (this.string.startsWith(pattern, this.pos)) {
        if (consume !== false) this.pos += pattern.length;
        return [pattern];
      }
      return null;
    }
    // RegExp — strip 'g' flag, match from current position only
    const flags = pattern.flags.replace('g','').replace('y','');
    const re = new RegExp(pattern.source, flags);
    const m  = re.exec(this.string.slice(this.pos));
    if (m && m.index === 0) {
      if (consume !== false) this.pos += m[0].length;
      return m;
    }
    return null;
  }

  current()       { return this.string.slice(this.start, this.pos); }
  backUp(n)       { this.pos -= n; }
  column()        { return this.pos - this.lineStart; }
  indentation()   { return 0; }

  // Call before each token to record where the token begins
  markStart()     { this.start = this.pos; }
}

// ---------------------------------------------------------------------------
// Load pyret.js by temporarily setting global.CodeMirror
// ---------------------------------------------------------------------------
let pyretMode = null;

function loadPyretMode() {
  if (pyretMode) return;

  let _capturedMode = null;

  // Fake CodeMirror that captures the mode factory result
  const fakeCodeMirror = {
    defineMode(name, factory) {
      if (name === 'pyret') {
        _capturedMode = factory({}, {});
      }
    }
  };

  // Temporarily expose as a global so pyret.js (which references `CodeMirror`
  // as a free variable) can find it.
  const prev = global.CodeMirror;
  global.CodeMirror = fakeCodeMirror;

  try {
    const pyretJsPath = path.join(__dirname, 'pyret.js');
    // Use a fresh require so the module is executed each time if needed,
    // but normally it will be cached.
    // We need to clear the cache in case pyret.js was loaded before without
    // our fake global.
    delete require.cache[require.resolve(pyretJsPath)];
    require(pyretJsPath);
  } finally {
    global.CodeMirror = prev;
  }

  pyretMode = _capturedMode;
  if (!pyretMode) throw new Error('[pyret-syntax] Failed to capture Pyret mode from pyret.js');
}

// ---------------------------------------------------------------------------
// Public tokenize function
// ---------------------------------------------------------------------------

/**
 * Tokenize a full document (array of line strings).
 *
 * Returns an array of line arrays, each element:
 *   { type: string, start: number, length: number }
 *
 * `type` values: 'keyword', 'comment', 'string', 'unterminated-string',
 *   'number', 'roughnum', 'bad-number', 'boolean',
 *   'function-name', 'type', 'variable', 'builtin'
 */
function tokenizeDocument(lines) {
  loadPyretMode();

  let state = pyretMode.startState(0);
  const result = [];

  for (const line of lines) {
    const lineTokens = [];

    if (line.trim() === '') {
      if (pyretMode.blankLine) pyretMode.blankLine(state);
      result.push(lineTokens);
      continue;
    }

    const stream = new PyretStream(line);

    while (!stream.eol()) {
      stream.markStart();
      let style;
      try {
        style = pyretMode.token(stream, state);
      } catch (_) {
        // Skip bad char on tokenizer error
        stream.next();
        result.push(lineTokens);
        continue;
      }

      const len = stream.pos - stream.start;
      if (len > 0 && style && style !== 'IGNORED-SPACE') {
        lineTokens.push({ type: style, start: stream.start, length: len });
      }
    }

    result.push(lineTokens);
  }

  return result;
}

module.exports = { tokenizeDocument };
