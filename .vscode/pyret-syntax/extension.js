/**
 * extension.js — Pyret Light Theme Extension
 *
 * Registers a DocumentSemanticTokensProvider that uses the real Pyret
 * CodeMirror tokenizer to produce accurate semantic token highlighting
 * matching the Pyret Light color theme.
 */

'use strict';

const vscode = require('vscode');
const { tokenizeDocument } = require('./pyret-tokenizer');

const TOKEN_TYPES     = ['keyword', 'comment', 'string', 'number', 'function', 'type', 'variable', 'operator', 'constant'];
const TOKEN_MODIFIERS = ['declaration'];
const LEGEND = new vscode.SemanticTokensLegend(TOKEN_TYPES, TOKEN_MODIFIERS);

// Map CodeMirror style strings → semantic token type index
const CM_TO_INDEX = {
  'keyword':             0,  // keyword
  'comment':             1,  // comment
  'string':              2,  // string
  'unterminated-string': 2,  // string
  'number':              3,  // number
  'roughnum':            3,  // number
  'roughnum-start':      3,  // number
  'bad-number':          3,  // number
  'boolean':             0,  // keyword (true/false treated as keyword)
  'function-name':       4,  // function
  'type':                5,  // type
  'variable':            6,  // variable (function arguments & usages)
  'parameter':           6,  // variable
  'builtin':             7,  // operator
  'constant':            8,  // constant (all constants & top-level values)
};

class PyretSemanticTokensProvider {
  provideDocumentSemanticTokens(document) {
    const lines = [];
    for (let i = 0; i < document.lineCount; i++) {
      lines.push(document.lineAt(i).text);
    }

    let tokenized;
    try {
      tokenized = tokenizeDocument(lines);
    } catch (e) {
      console.error('[pyret-light-theme] Tokenizer error:', e.message);
      return new vscode.SemanticTokens(new Uint32Array(0));
    }

    const builder = new vscode.SemanticTokensBuilder(LEGEND);
    for (let lineIdx = 0; lineIdx < tokenized.length; lineIdx++) {
      for (const tok of tokenized[lineIdx]) {
        const typeIdx = CM_TO_INDEX[tok.type];
        if (typeIdx === undefined) continue;
        builder.push(lineIdx, tok.start, tok.length, typeIdx, 0);
      }
    }
    return builder.build();
  }
}

function activate(context) {
  console.log('[pyret-light-theme] Extension activated');
  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: 'pyret' },
      new PyretSemanticTokensProvider(),
      LEGEND
    )
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
