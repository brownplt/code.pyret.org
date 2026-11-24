// Auto-indenting functions adapted from:
// https://github.com/codemirror/CodeMirror/issues/2120

function reindentRegion(cm, from, to) {
  cm.operation(function() {
    for (var line = from; line <= to; ++line) {
      cm.indentLine(line, "smart");
    }
  });
}

function reindentAll(cm) {
  reindentRegion(cm, cm.firstLine(), cm.lastLine());
}

function toggleElement(id) {
  var elt = document.getElementById(id);
  if (elt.style.display == "none") {
    elt.style.display = "block";
  } else {
    elt.style.display = "none";
  }
}

// Registers "reindent on paste" behavior
function registerReindentOnPaste(cm) {
  cm.on("change", function(cm, change) {
    if (change.origin == "paste" && change.text.length >= 2) {
      reindentRegion(cm, change.from.line, CodeMirror.changeEnd(change).line);
    }
  });
}

function addLineStateToElement(elt, ls) {
  elt.innerHTML += "LineState is:\n";
  elt.innerHTML += "  NestingsAtLineStart = " + ls.nestingsAtLineStart + "\n";
  elt.innerHTML += "  NestingsAtLineEnd = " + ls.nestingsAtLineEnd + "\n";
  elt.innerHTML += "  DeferedOpened = " + ls.deferedOpened + "\n";
  elt.innerHTML += "  DeferedClosed = " + ls.deferedClosed + "\n";
  elt.innerHTML += "  CurOpened = " + ls.curOpened + "\n";
  elt.innerHTML += "  CurClosed = " + ls.curClosed + "\n";
  elt.innerHTML += "  Token Stack = " + ls.tokens + "\n";
  elt.innerHTML += "  Last Token = " + ls.lastToken + "\n";
}

function showLineStateAtPoint(cm, elt) {
  var doc = cm.getDoc();
  var sel = doc.getSelection();
  elt.innerHTML = "";
  if (sel.length > 0) {
    return;
  }
  var cursor = doc.getCursor();
  elt.innerHTML += "Cursor at line " + cursor.line + ", ch " + cursor.ch + "\n";
  var tok = cm.getTokenAt(cursor);
  if (tok) {
    elt.innerHTML += "Comment Nesting Depth: " + tok.state.commentNestingDepth + "\n";
    elt.innerHTML += "In String: " + tok.state.inString + "\n";
    elt.innerHTML += "Start of Line: " + tok.state.sol + "\n";
    addLineStateToElement(elt, tok.state.lineState);
  } else {
    elt.innerHTML += "[No LineState at position]";
  }
}

function registerDebugLineState(cm, elt) {
  cm.on("cursorActivity", function(cm) {
    showLineStateAtPoint(cm, elt);
  });
}

function registerDebugInternal(elt) {
  CodeMirror.debugInternal = {
    clear: function() { elt.innerHTML = ""; },
    write: function(str) { elt.innerHTML += str; },
    writeLn: function(str) { elt.innerHTML += str + "\n"; }
  };
}
