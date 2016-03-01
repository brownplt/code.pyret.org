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
      cm.state.keywordMarks.push(cm.markText(hit.from, hit.to, {className: wordStyle}));
      match.extra.forEach(function(tok){
        cm.state.keywordMarks.push(cm.markText(tok.from, tok.to, {className: wordStyle}));
      });
      match.extraBad.forEach(function(tok){
        cm.state.keywordMarks.push(cm.markText(tok.from, tok.to, {className: "CodeMirror-nonmatchingbracket"}));
      });
      if (other) {
        cm.state.keywordMarks.push(cm.markText(other.from, other.to, {className: wordStyle}));
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
});
