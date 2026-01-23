import React from 'react';
import { init, LanguageError, UserError, HoverHighlight } from 'pyret-ide';
import seedrandom from 'seedrandom';
import sExpression from 's-expression';
import 'babel-polyfill';
import CodeMirror from 'codemirror';

// TODO: don't export CodeMirror on window once
// if we can help it
window.CodeMirror = CodeMirror;
require('script!pyret-codemirror-mode/mode/pyret');

function loadScriptUrl(url) {
  var scriptTag = document.createElement('script');
  scriptTag.src = url;
  scriptTag.type = "text/javascript";
  document.body.appendChild(scriptTag);
}


var appDiv = document.createElement("div");
document.body.appendChild(appDiv);

/*

type AST: An instance of Program from src/arr/trove/ast.arr in pyret-lang

*/

function makeRuntimeAPI(CPOIDEHooks) {

  const {
    cpo,
    parsePyret,
    runtime,
    loadLib,
    runtimeLib,
    compileStructs,
    compileLib,
    cpoModules,
    jsnums
  } = CPOIDEHooks;


  const gf = runtime.getField;
  const gmf = function(m, f) { return gf(gf(m, "values"), f); };

  function findModule(contextIgnored, dependency) {
    // TODO(joe): enhance this with gdrive locators, etc, later
    return runtime.safeCall(
      function() {
        return runtime.ffi.cases(
          gmf(compileStructs, "is-Dependency"),
          "Dependency",
          dependency,
          {
            builtin: function(name) {
              var raw = cpoModules.getBuiltinLoadableName(runtime, name);
              if(!raw) {
                throw runtime.throwMessageException("Unknown module: " + name);
              }
              else {
                return gmf(cpo, "make-builtin-js-locator").app(name, raw);
              }
            },
            dependency: function(protocol, args) {
              console.error("Unknown import: ", dependency);
            }
          }
        );
      },
      function(l) {
        return gmf(compileLib, "located").app(l, runtime.nothing);
      },
      "findModule"
    );
  }
  var pyFindModule = runtime.makeFunction(findModule, "find-module");

  // NOTE(joe): This line is "cheating" by mixing runtime levels, and uses
  // the same runtime for the compiler and running code.  Usually you can
  // only get a new pyret-viewable Runtime by calling create, but here we
  // magic the current runtime into one.
  // Someday Pyret will be quick enough that we won't need to save theses
  // seconds of instantiation.
  var pyRuntime = gf(gf(runtimeLib, "internal").brandRuntime, "brand").app(
    runtime.makeObject({
      "runtime": runtime.makeOpaque(runtime)
    }));
  var pyRealm = gf(loadLib, "internal").makeRealm(cpoModules.getRealm());

  var builtins = [];
  Object.keys(runtime.getParam("staticModules")).forEach(function(k) {
    if(k.indexOf("builtin://") === 0) {
      builtins.push(runtime.makeObject({
        uri: k,
        raw: cpoModules.getBuiltinLoadable(runtime, k)
      }));
    }
  });
  // the below probably isn't needed? it's not used...
  // var builtinsForPyret = runtime.ffi.makeList(builtins);

  function parse(source, uri) {
    var parse = gmf(parsePyret, "surface-parse");
    return runtime.safeTail(function() {
      return parse.app(source, uri);
    });
  }

  function compile(ast) {
    var compileAst = gmf(cpo, "compile-ast");
    return runtime.safeTail(function() {
      return compileAst.app(ast, pyRuntime, pyFindModule, gmf(compileStructs, "default-compile-options"));
    });
  }

  function run(jsSrc) {
    var run = gmf(cpo, "run");
    return runtime.safeTail(function() {
      return run.app(pyRuntime, pyRealm, jsSrc);
    });
  }

  runtime.ReprMethods.createNewRenderer("$cpoide", runtime.ReprMethods._torepr);
  const renderers = runtime.ReprMethods["$cpoide"];
  renderers["opaque"] = () => ({type: 'opaque'});
  renderers["cyclic"] = () => ({type: 'cyclic'});
  renderers["number"] = function renderPNumber(num) {
    // If we're looking at a rational number, arrange it so that a
    // click will toggle the decimal representation of that
    // number.  Note that this feature abandons the convenience of
    // publishing output via the CodeMirror textarea.
    if (jsnums.isRational(num) && !jsnums.isInteger(num)) {
      // This function returns three string values, numerals to
      // appear before the decimal point, numerals to appear
      // after, and numerals to be repeated.
      var decimal = jsnums.toRepeatingDecimal(num.numerator(), num.denominator(), runtime.NumberErrbacks);
      return {
        type: 'number',
        value: {
          numerator: num.numerator(),
          denominator: num.denominator(),
          whole: decimal[0].toString(),
          fractional: decimal[1].toString(),
          repeating: decimal[2].toString(),
        }
      };
    } else {
      return {type: 'number', value: num};
    }
  };
  renderers["nothing"] = () => ({type: "nothing"});
  renderers["boolean"] = value => ({type: "boolean", value});
  renderers["string"] = value => ({type: "string", value});
  renderers["method"] = () => ({type: "method"});
  renderers["function"] = () => ({type: "func"});
  renderers["render-array"] = top => {
    const values = [];
    var maxIdx = top.done.length;
    for (var i = maxIdx - 1; i >= 0; i--) {
      values.push(top.done[i]);
    }
    return {type: 'array', values};
  };
  renderers["tuple"] = function(t, pushTodo) {
    pushTodo(undefined, undefined, undefined, Array.prototype.slice.call(t.vals), "render-tuple");
  };
  renderers["render-tuple"] = function(top){
    const values = [];
    for (var i = top.done.length - 1; i >= 0; i--) {
      values.push(top.done[i]);
    }
    return {type: 'tuple', values};
  };
  renderers["object"] = function(val, pushTodo) {
    var keys = [];
    var vals = [];
    for (var field in val.dict) {
      keys.push(field); // NOTE: this is reversed order from the values,
      vals.unshift(val.dict[field]); // because processing will reverse them back
    }
    pushTodo(undefined, val, undefined, vals, "render-object", { keys: keys, origVal: val });
  };
  renderers["render-object"] = function(top) {
    const keyValuePairs = [];
    for (var i = 0; i < top.extra.keys.length; i++) {
      keyValuePairs.push({key: top.extra.keys[i], value: top.done[i]});
    }
    return {type: 'object', keyValues: keyValuePairs};
  };
  renderers["render-data"] = function renderData(top) {
    const fields = [];
    if (top.extra.arity !== -1) {
      var numFields = top.extra.fields.length;
      for (var i = 0; i < numFields; i++) {
        fields.push({key: top.extra.fields[i], value: top.done[numFields - i - 1]});
      }
    }
    return {
      type: 'data',
      value: {
        name: top.extra.constructorName,
        fields,
      }
    };
  };
  // not sure what to do here
  // renderers["render-valueskeleton"] = function renderValueSkeleton(top) {
  //   var container = $("<span>").addClass("replOutput");
  //   return helper(container, top.extra.skeleton, top.done);
  // };

  function toReprOrDie(value, resolve, reject) {
    runtime.runThunk(
      () => runtime.toReprJS(value, renderers),
      renderResult => {
        if(runtime.isSuccessResult(renderResult)) {
          resolve(renderResult.result);
        }
        else {
          console.error("Could not render: ", value, " because ", renderResult);
          reject(new Error("An error occurred while rendering a value, details logged to console"));
        }
      });
  }
  function toReprErrorOrDie(value, reject) {
    toReprOrDie(
      value,
      error => reject(new UserError(error)),
      reject
    );
  }
  let pass = { app: function() { return true; } };
  function srclocToHighlight(srcloc, color, target) {
    return runtime.ffi.cases(pass, "Srcloc", srcloc, {
      builtin: (name) => ({
        color: color,
        span: { from: { line: 0, ch: 0 }, to: { line: 0, ch: 0 } }
      }),
      srcloc: (source, sl, sc, sch, el, ec, ech) => ({
        color: color,
        span: { from: { line: sl - 1, ch: sc }, to: { line: el - 1, ch: ec } }
      })
    });
  }
  function makeIDERenderable(pyretErrorDisplay) {
    let A = runtime.ffi.toArray;
    return runtime.ffi.cases(pass, "ErrorDisplay", pyretErrorDisplay, {

      "paragraph": (contents) =>
        <p>{A(contents).map(makeIDERenderable)}</p>,

      "highlight": (contents, locs, color) =>
        <HoverHighlight
          color={String(color)}
          target="definitions://" // TODO(joe): refactor to be per-loc?
          highlights={A(locs).map(l => srclocToHighlight(l, color, "definitions://"))}
        >
          {makeIDERenderable(contents)}
        </HoverHighlight>,

      "text": (str) => <span>{str}</span>,

      "embed": (val) => <span>Pyret Value</span>,

      "loc-display": (loc, style, contents) => makeIDERenderable(contents),

      "optional": (contents) => makeIDERenderable(contents),

      "code": (contents) => <code>{makeIDERenderable(contents)}</code>,

      "loc": (loc) =>
        <HoverHighlight
          color="red"
          target="definitions://"
          highlights={[srclocToHighlight(loc, "red", "definitions://")]}
        >{runtime.getField(loc, "format").app(false)}</HoverHighlight>,

      "maybe-stack-loc": (n, ufo, cwl, cwol) => <span>Maybe Stack Loc</span>,

      "cmcode": (loc) => <span>CM-code</span>,

      "v-sequence": (contents) =>
        <div>
          {A(contents).map(makeIDERenderable).map(function(c) { return <div>{c}</div>; })}
        </div>,

      "bulleted-sequence": (contents) =>
        <ul>
          {A(contents).map(makeIDERenderable).map(function(c) { return <li>{c}</li>; })}
        </ul>,

      "h-sequence": (contents) =>
        <div>
          {A(contents).map(makeIDERenderable).map(function(c) { return <span>{c}</span>; })}
        </div>
    });
  }
  function renderParseError(value, reject) {
    runtime.runThunk(
      () => runtime.getField(value, "render-fancy-reason").app(
        runtime.makeFunction(function() { return false; }, "ide-src-available"),
      ),
      (result) => {
        if(runtime.isSuccessResult(result)) {
          reject(new LanguageError(makeIDERenderable(result.result)));
        } else {
          console.error("Failed while rendering parse error: ", result);
          reject("Failed while rendering parse error");
        }
      });
  }
  return {
    /*
      @param {string} src - some Pyret code
      @param {string} url - a unique name to store in source locations

      @returns A promise that resolves either to an AST or rejects with a
               (stringified) parse error
               (TODO: return richer values for parse error return)
    */
    parse(src, url) {
      // TODO(joe): pass in a URL to uniquely identify this program
      if(!url) { url = "definitions://"; }
      return new Promise((resolve, reject) => {
        runtime.runThunk(
          () => parse(src, url),
          (parseResult) => {
            if (runtime.isSuccessResult(parseResult)) {
              resolve(parseResult.result);
            } else {
              renderParseError(parseResult.exn.exn, reject);
            }
          });
      });
    },
    /*
      @param {AST} ast - A Pyret AST from parse

      @returns A promise that resolves with some "bytecode"—a JS string—or rejects
               with a string describing any error(s).
               (TODO: return richer values for error returns)
    */
    compile(ast) {
      var get = runtime.getField;
      return new Promise((resolve, reject) => {
        runtime.runThunk(
          () => compile(ast),
          (compileResult) => {
            // NOTE(joe): success here just means the compiler didn't blow up; the result
            // is a Pyret Either indicating compile errors or a final JS program to run
            if (runtime.isSuccessResult(compileResult)) {
              var maybeJS = compileResult.result;
              if(runtime.ffi.isLeft(maybeJS)) {
                toReprErrorOrDie(maybeJS, reject);
              } else {
                resolve(get(maybeJS, "v"));
              }
            } else {
              toReprErrorOrDie(compileResult.exn.exn, reject);
            }
          });
      });
    },
    /*
      @param {string} bytecode - JS code to evaluate

      @returns A promise that resolves with an answer data structure, or rejects
               with a string describing any error(s).
               (TODO: return richer values for error returns)
    */
    execute(bytecode, stdout, stderr, onResult) {
      var get = runtime.getField;
      return new Promise((resolve, reject) => {
        runtime.runThunk(
          () => run(bytecode),
          (runResult) => {
            // NOTE(joe): success here means the run succeeded, and will report
            // both passing and failing tests, along with a final value

            // Just doing a barebones dive to retrieve and return the toRepr of
            // the final value for now, but there are lots of juicy things on
            // this result, and it's something we should build out an API for.
            var innerResult = runResult.result.val.result;
            if (runtime.isSuccessResult(innerResult)) {
              toReprOrDie(
                get(innerResult.result, "answer"),
                (renderedResult) => {
                  onResult(renderedResult);
                  resolve(renderedResult);
                },
                reject
              );
            } else {
              toReprErrorOrDie(innerResult.exn.exn, reject);
            }
          });
      });
    },
    stop() {
      // NOTE(joe): This will cause the current parse, compile, OR execute to
      // reject() with a "user break" message.
      runtime.breakAll();
    }
  };
}

init({
  firebaseConfig: {
    apiKey:        process.env.FIREBASE_API_KEY,
    authDomain:    process.env.FIREBASE_AUTH_DOMAIN,
    databaseUrl:   process.env.FIREBASE_DB_URL,
    storageBucket: process.env.FIREBASE_BUCKET,
  },
  debug: process.env.NODE_ENV !== 'production',
  rootEl: appDiv,
  baseUrl: '/ide',
  codemirrorOptions: {
    mode: 'pyret',
  },
  runtimeApiLoader() {
    return new Promise((resolve, reject) => {
      // this is needed by pyret I guess.
      require('script!requirejs/require.js');
      window.define('seedrandom', [], function() { return seedrandom; });
      window.define('s-expression', [], function() { return sExpression; });
      loadScriptUrl(process.env.BASE_URL+'/js/cpo-ide-hooks.jarr');

      var startTime = new Date().getTime();
      function checkIfLoaded() {
        if (window.CPOIDEHooks) {
          const CPOIDEHooks = window.CPOIDEHooks;
          delete window.CPOIDEHooks;
          resolve(makeRuntimeAPI(CPOIDEHooks));
        } else if (new Date().getTime() - startTime > 30000) {
          reject(new Error("Timed out while waiting for runtime to load :("));
        } else {
          // ugh, we're polling to see if it's been loaded yet :(
          window.setTimeout(checkIfLoaded, 250);
        }
      }

      checkIfLoaded();
    });
  }
});
