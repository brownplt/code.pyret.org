import PyretIDE from 'pyret-ide';
import seedrandom from 'seedrandom';

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

const runtimeApi = {
  _getVal(mod, name) { // TODO(joe): is this an OK place to put helpers for this?
    var runtime = window.CPOIDEHooks.runtime;
    return runtime.getField(runtime.getField(window.CPOIDEHooks[mod], "values"), name);
  },
  _toReprOrDie(runtime, value, resolve, reject) {
    runtime.runThunk(
      () => runtime.toRepr(value),
      (renderResult) => {
        if(runtime.isSuccessResult(renderResult)) {
          reject(renderResult.result);
        }
        else {
          console.error("Could not render: ", value, " because ", renderResult);
          reject("An error occurred while rendering a value, details logged to console");
        }
      });
  },
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
    var runtime = window.CPOIDEHooks.runtime;
    // TODO(joe): is "this" trustworthy here?
    var self = this;
    var parse = this._getVal("parsePyret", "surface-parse");
    return new Promise((resolve, reject) => {
      runtime.runThunk(
        () => parse.app(src, url),
        (parseResult) => {
          if(runtime.isSuccessResult(parseResult)) {
            resolve(parseResult.result);
          }
          else {
            // NOTE(joe): intentionally passing reject twice; want to report an error either way
            self._toReprOrDie(runtime, parseResult.exn.exn, reject, reject);
          }
        });
    })
  },
  /*
    @param {AST} ast - A Pyret AST from parse

    @returns A promise that resolves with some "bytecode"—a JS string—or rejects
             with a string describing any error(s).
             (TODO: return richer values for error returns)
  */
  compile(ast) {
    var runtime = window.CPOIDEHooks.runtime;
    var get = runtime.getField;
    var self = this;
    return new Promise((resolve, reject) => {
      runtime.runThunk(
        () => window.CPOIDEHooks.compile(ast),
        (compileResult) => {
          // NOTE(joe): success here just means the compiler didn't blow up; the result
          // is a Pyret Either indicating compile errors or a final JS program to run
          if(runtime.isSuccessResult(compileResult)) {
            var maybeJS = compileResult.result;
            if(runtime.ffi.isLeft(maybeJS)) {
              self._toReprOrDie(runtime, maybeJS, reject)
            }
            else {
              resolve(get(maybeJS, "v"));
            }
          }
          else {
            // NOTE(joe): intentionally passing reject twice; want to report an error either way
            self._toReprOrDie(runtime, compileResult.exn.exn, reject, reject);
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
  execute(bytecode) {
    var runtime = window.CPOIDEHooks.runtime;
    var get = runtime.getField;
    var self = this;
    return new Promise((resolve, reject) => {
      runtime.runThunk(
        () => window.CPOIDEHooks.run(bytecode),
        (runResult) => {
          // NOTE(joe): success here means the run succeeded, and will report
          // both passing and failing tests, along with a final value

          // Just doing a barebones dive to retrieve and return the toRepr of
          // the final value for now, but there are lots of juicy things on
          // this result, and it's something we should build out an API for.
          var innerResult = runResult.result.val.result;
          if(runtime.isSuccessResult(innerResult)) {
            self._toReprOrDie(runtime, get(innerResult.result, "answer"), resolve, reject)
          }
          else {
            self._toReprOrDie(runtime, innerResult.exn.exn, reject, reject);
          }
        });
    });
  },
  stop() {
    
  }
};

PyretIDE.init({
  rootEl: appDiv,
  runtimeApiLoader() {
    return new Promise((resolve, reject) => {

      // this is needed by pyret I guess.
      require('script!requirejs/require.js');
      window.define('seedrandom', [], function() { return seedrandom; });
      loadScriptUrl(process.env.BASE_URL+'/js/cpo-ide-hooks.jarr');

      var startTime = new Date().getTime();
      function checkIfLoaded() {
        if (window.CPOIDEHooks) {
          resolve(runtimeApi);
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
