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

function makeRuntimeAPI(CPOIDEHooks) {

  const cpo = CPOIDEHooks.cpo;
  const parsePyret = CPOIDEHooks.parsePyret;
  const runtime = CPOIDEHooks.runtime;
  const loadLib = CPOIDEHooks.loadLib;
  const runtimeLib = CPOIDEHooks.runtimeLib;
  const compileStructs = CPOIDEHooks.compileStructs;
  const compileLib = CPOIDEHooks.compileLib;
  const cpoModules = CPOIDEHooks.cpoModules;


  const gf = runtime.getField;
  const gmf = function(m, f) { return gf(gf(m, "values"), f); };

  function findModule(contextIgnored, dependency) {
    // TODO(joe): enhance this with gdrive locators, etc, later
    return runtime.safeCall(function() {
      return runtime.ffi.cases(gmf(compileStructs, "is-Dependency"), "Dependency", dependency,
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
        });
     }, function(l) {
        return gmf(compileLib, "located").app(l, runtime.nothing);
     }, "findModule");
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
  var builtinsForPyret = runtime.ffi.makeList(builtins);

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

  function toReprOrDie(value, resolve, reject) {
    runtime.runThunk(
      () => runtime.toRepr(value),
      (renderResult) => {
        if(runtime.isSuccessResult(renderResult)) {
          resolve(renderResult.result);
        }
        else {
          console.error("Could not render: ", value, " because ", renderResult);
          reject("An error occurred while rendering a value, details logged to console");
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
            if(runtime.isSuccessResult(parseResult)) {
              resolve(parseResult.result);
            }
            else {
              // NOTE(joe): intentionally passing reject twice; want to report an error either way
              toReprOrDie(parseResult.exn.exn, reject, reject);
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
      var get = runtime.getField;
      return new Promise((resolve, reject) => {
        runtime.runThunk(
          () => compile(ast),
          (compileResult) => {
            // NOTE(joe): success here just means the compiler didn't blow up; the result
            // is a Pyret Either indicating compile errors or a final JS program to run
            if(runtime.isSuccessResult(compileResult)) {
              var maybeJS = compileResult.result;
              if(runtime.ffi.isLeft(maybeJS)) {
                toReprOrDie(maybeJS, reject, reject)
              }
              else {
                resolve(get(maybeJS, "v"));
              }
            }
            else {
              // NOTE(joe): intentionally passing reject twice; want to report an error either way
              toReprOrDie(compileResult.exn.exn, reject, reject);
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
            if(runtime.isSuccessResult(innerResult)) {
              toReprOrDie(get(innerResult.result, "answer"), resolve, reject)
            }
            else {
              toReprOrDie(innerResult.exn.exn, reject, reject);
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
