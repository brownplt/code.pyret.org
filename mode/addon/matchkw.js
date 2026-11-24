(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../fold/pyret-fold"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../fold/pyret-fold"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineOption("matchKeywords", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      cm.off("cursorActivity", doMatchKeywords);
      cm.off("viewportChange", maybeUpdateMatch);
      clear(cm);
    }
    if (val) {
      cm.state.matchBothKeywords = typeof val == "object" && val.bothKeywords;
      cm.on("cursorActivity", doMatchKeywords);
      cm.on("viewportChange", maybeUpdateMatch);
      doMatchKeywords(cm);
    }
  });

  function clear(cm) {
    if (cm.state.keywordMarks)
      for (var i = 0; i < cm.state.keywordMarks.length; i++)
        cm.state.keywordMarks[i].clear();
    cm.state.keywordMarks = [];
  }

  function doMatchKeywords(cm) {
    cm.state.failedKeywordMatch = false;

    cm.operation(function() {
      clear(cm);
      if (cm.somethingSelected()) return;
      var cur = cm.getCursor(), range = cm.getViewport();
      range.from = Math.min(range.from, cur.line);
      range.to = Math.max(cur.line + 1, range.to);
      var match = CodeMirror.findMatchingKeyword(cm, cur, range);
      if (!match) return;
      var hit = match.at == "open" ? match.open : match.close;
      var other = match.at == "close" ? match.open : match.close;
      var wordStyle; // = match.matches ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
      if (match.matches) {
        wordStyle = other ? "CodeMirror-matchingbracket" : "CodeMirror-pyret-no-match-start";
      } else {
        wordStyle = other ? "CodeMirror-nonmatchingbracket" : "CodeMirror-pyret-no-match-end";
      }
      var regionStyle = wordStyle + "-region";
      cm.state.failedKeywordMatch = !match.matches;
      cm.state.keywordMarks.push(cm.markText(hit.from, hit.to, {className: wordStyle + " " + (match.at == 'open' ? 'open' : 'close')}));
      match.extra.forEach(function(tok){
        cm.state.keywordMarks.push(cm.markText(tok.from, tok.to, {className: wordStyle}));
      });
      match.extraBad.forEach(function(tok){
        cm.state.keywordMarks.push(cm.markText(tok.from, tok.to, {className: "CodeMirror-nonmatchingbracket"}));
      });
      if (other) {
        cm.state.keywordMarks.push(cm.markText(other.from, other.to, {className: wordStyle + " " + (match.at == 'close' ? 'open' : 'close')}));
        cm.state.keywordMarks.push(cm.markText(match.open.from, match.close.to, {className: regionStyle}));
      }
    });
  }

  function maybeUpdateMatch(cm) {
    if (cm.state.failedKeywordMatch) doMatchKeywords(cm);
  }

  CodeMirror.commands.toMatchingKeyword = function(cm) {
    var found = CodeMirror.findMatchingKeyword(cm, cm.getCursor());
    if (found) {
      var other = found.at == "close" ? found.open : found.close;
      if (other) cm.extendSelection(other.to, other.from);
    }
  };

  function nonBlankToken(tok) {
    return !(tok.type === null || /^\s*$/.test(tok.string));
  }

  function nextNonblankTokenAfter(cm, pos, allowAtCurrent) {
    var line = pos.line;
    var toks = cm.getLineTokens(line);
    if (allowAtCurrent) {
      for (var i = 0; i < toks.length; i++) {
        if (toks[i].start == pos.ch && nonBlankToken(toks[i])) {
          toks[i].line = line;
          return toks[i];
        }
      }
    }
    for (var i = 0; i < toks.length; i++) {
      if (toks[i].start <= pos.ch && toks[i].end > pos.ch) {
        if (nonBlankToken(toks[i])) i++;
        for (; i < toks.length; i++) {
          if (nonBlankToken(toks[i])) {
            toks[i].line = line;
            return toks[i];
          }
        }
      }
    }
    for (line = line + 1; line <= cm.lastLine(); line++) {
      var toks = cm.getLineTokens(line);
      for (var i = 0; i < toks.length; i++) {
        if (nonBlankToken(toks[i])) {
          toks[i].line = line;
          return toks[i];
        }
      }
    }
    return undefined;
  }
  function prevNonblankTokenBefore(cm, pos) {
    var line = pos.line;
    var toks = cm.getLineTokens(line);
    for (var i = toks.length - 1; i >= 0; i--) {
      if (toks[i].start < pos.ch && toks[i].end >= pos.ch) {
        if (nonBlankToken(toks[i])) i--;
        for (; i >= 0; i--) {
          if (nonBlankToken(toks[i])) {
            toks[i].line = line;
            return toks[i];
          }
        }
      }
    }
    for (line = line - 1; line >= cm.firstLine(); line--) {
      var toks = cm.getLineTokens(line);
      for (var i = toks.length - 1; i >= 0; i--) {
        if (nonBlankToken(toks[i])) {
          toks[i].line = line;
          return toks[i];
        }
      }
    }
    return undefined;
  }
  function goToOpenComment(cm, pos, nestingDepth) {
    var line = pos.line;
    var toks = cm.getLineTokens(line);
    for (var i = toks.length - 1; i >= 0; i--) {
      if (toks[i].start < pos.ch
          && toks[i].state.lastToken === "COMMENT-START"
          && toks[i].state.commentNestingDepth == nestingDepth) {
        var pos = {line: line, ch: toks[i].start};
        cm.extendSelection(pos, pos);
        return;
      }
    }
    for (line = line - 1; line >= cm.firstLine(); line--) {
      var toks = cm.getLineTokens(line);
      for (var i = toks.length - 1; i >= 0; i--) {
        if (toks[i].state.lastToken === "COMMENT-START"
            && toks[i].state.commentNestingDepth == nestingDepth) {
          var pos = {line: line, ch: toks[i].start};
          cm.extendSelection(pos, pos);
          return;
        }
      }
    }
    var pos = {line: cm.firstLine(), ch: 0};
    cm.extendSelection(pos, pos);
  }
  function goToCloseComment(cm, pos, nestingDepth) {
    var line = pos.line;
    var toks = cm.getLineTokens(line);
    for (var i = 0; i < toks.length; i++) {
      if (toks[i].start > pos.ch
          && toks[i].state.lastToken === "COMMENT-END"
          && toks[i].state.commentNestingDepth == nestingDepth - 1) {
        var pos = {line: line, ch: toks[i].end};
        cm.extendSelection(pos, pos);
        return;
      }
    }
    for (line = line + 1; line <= cm.lastLine(); line++) {
      var toks = cm.getLineTokens(line);
      for (var i = 0; i < toks.length; i++) {
        if (toks[i].state.lastToken === "COMMENT-END"
            && toks[i].state.commentNestingDepth == nestingDepth - 1) {
          var pos = {line: line, ch: toks[i].end};
          cm.extendSelection(pos, pos);
          return;
        }
      }
    }
    var pos = {line: cm.lastLine(), ch: null};
    cm.extendSelection(pos, pos);
  }
  CodeMirror.commands.goBackwardSexp = function(cm) {
    var cursor = cm.getCursor();
    var cur = cm.getTokenAt(cursor);
    var origPos = cursor.ch;
    // Only snap back if we are *really* in the middle of whitespace
    var prev = prevNonblankTokenBefore(cm, cursor);
    if (prev &&
        ((cursor.ch === cur.start) // we're at the start of this token and should really be at the previous
         || !nonBlankToken(cur) // we're in the middle of a whitespace token
         || (prev.state.lastToken === "COMMENT-END"))) {
      cur = prev;
      cursor = {line: prev.line, ch: prev.start};
    }
    if (cur && cur.type === "comment") {
      if (cur.state.lastToken === "COMMENT-END") {
        goToOpenComment(cm, cursor, cur.state.commentNestingDepth + 1);
        return;
      } else {
        // line comment or inside block comment; do usual token thing
      }
    }
    var found = CodeMirror.findMatchingKeyword(cm, cursor);
    if (found && found.open.from.line == cursor.line && found.open.from.ch == cursor.ch) {
      found = null;
    }
    if (found) {
      cm.extendSelection(found.open.from, found.open.from);
    } else {
      CodeMirror.commands.goBackwardToken(cm);
    }
  };
  CodeMirror.commands.goForwardSexp = function(cm) {
    var cursor = cm.getCursor();
    var cur = cm.getTokenAt(cursor);
    var next = nextNonblankTokenAfter(cm, cursor, true);
    if (next &&
        ((cursor.ch === cur.end) // we're done with this token; we should be on the next one
         || (next.start === cursor.ch && next.line === cur.line) // we're really at the start of the next one
         || !nonBlankToken(cur) // we're in the middle of a whitespace token
         || (next.state.lastToken === "COMMENT-START"))) {
      cur = next; // needed because getTokenAt is left-biased
      cursor = {line: next.line, ch: next.start};
    }
    if (cur && cur.type === "comment") {
      if (cur.state.lastToken === "COMMENT-START") {
        goToCloseComment(cm, cursor, cur.state.commentNestingDepth);
        return;
      } else {
        // line comment or inside block comment; do usual token thing
      }
    }
    var found = CodeMirror.findMatchingKeyword(cm, cursor);
    if (found && found.close.to.line == cursor.line && found.close.to.ch == cursor.ch) {
      if (next) {
        next.ch = next.end;
        found = CodeMirror.findMatchingKeyword(cm, next);
      }
    }
    if (found) {
      cm.extendSelection(found.close.to, found.close.to);
    } else {
      CodeMirror.commands.goForwardToken(cm);
    }
  };
  CodeMirror.commands.goBackwardToken = function(cm) {
    var cursor = cm.getCursor();
    var cur = cm.getTokenAt(cursor);
    var pos;
    if (!cur) return;
    if (cur.type === "comment") { CodeMirror.commands.goWordLeft(cm); return; }
    if (cur.type && cur.start < cursor.ch) {
      pos = {line: cursor.line, ch: cur.start};
    } else {
      var prev = prevNonblankTokenBefore(cm, cursor);
      if (!prev) return;
      pos = {line: prev.line, ch: prev.start};
    }
    cm.extendSelection(pos, pos);
  };
  CodeMirror.commands.goForwardToken = function(cm) {
    var cursor = cm.getCursor();
    var cur = cm.getTokenAt(cursor);
    var next = nextNonblankTokenAfter(cm, cursor, true);
    var pos;
    if (next &&
        ((cursor.ch === cur.end) // we're done with this token; we should be on the next one
         || (next.start === cursor.ch && next.line === cur.line))) {
      cur = next;
      cursor = {line: next.line, ch: next.start};
    }
    if (cur) {
      if (!nonBlankToken(cur)) { cur = nextNonblankTokenAfter(cm, cursor, true); }
      else if (cur.type === "comment") {
        var index = cursor.ch - cur.start;
        for (; index < cur.string.length; index++) {
          if (cur.string[index] !== " " && cur.string[index] !== "\t"
              && (cur.string[index + 1] === " " || cur.string[index + 1] == "\t")) {
            index++;
            break;
          }
        }
        pos = {line: cursor.line, ch: cur.start + index};
        cm.extendSelection(pos, pos);
        return;
      }
    }
    if (!cur) return;
    if (cur.type && cur.end > cursor.ch) {
      pos = {line: cursor.line, ch: cur.end};
    } else {
      var next = nextNonblankTokenAfter(cm, cursor);
      if (!next) return;
      pos = {line: next.line, ch: next.end};
    }
    cm.extendSelection(pos, pos);
  };
});
