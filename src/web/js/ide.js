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
  /*
    @param {string} src - some Pyret code
    @param {string} url - a unique name to store in source locations

    @returns A promise that resolves either to an AST or rejects with a
             (stringified) parse error
             (TODO: return richer values for parse error return)
  */
  parse(src, url) {
    var runtime = window.CPOIDEHooks.runtime;
    var parse = runtime.getField(window.CPOIDEHooks.parsePyret, "surface-parse");
    function handleError(parseResult) {
      runtime.runThunk(
        () => return runtime.toReprJS(parseResult.exn),
        (exnResult) => {
          if(runtime.isSuccessResult(exnResult)) {
            reject(exnResult.result);
          }
          else {
            console.error("Could not render: ", parseResult, " because ", exnResult);
            reject("An error occurred while rendering a parse error, details logged to console");
          }
        });
    }
    return new Promise((resolve, reject) =>
      runtime.runThunk(
        () => return parse.app(src, url),
        (parseResult) => {
          if(runtime.isSuccessResult(parseResult)) {
            resolve(parseResult.result);
          }
          else {
            handleError(parseResult);
          }
        }));
  },
  /*
    @param {AST} ast - A Pyret AST from parse

    @returns A promise that resolves with some "bytecode"—a JS string—or rejects
             with a string describing any error(s).
             (TODO: return richer values for error returns)
  */
  compile(ast) {
    return new Promise((resolve, reject) => reject(new Error("Not Implemented")));
  },
  /*
    @param {string} bytecode - JS code to evaluate

    @returns A promise that resolves with an answer data structure, or rejects
             with a string describing any error(s).
             (TODO: return richer values for error returns)
  */
  execute(bytecode) {
    return new Promise((resolve, reject) => reject(new Error("Not Implemented")));
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
