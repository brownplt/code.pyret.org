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

const runtimeApi = {
  parse(src) {
    return new Promise((resolve, reject) => reject(new Error("Not Implemented")));
  },
  compile(ast) {
    return new Promise((resolve, reject) => reject(new Error("Not Implemented")));
  },
  execute(bytecode) {
    return new Promise((resolve, reject) => reject(new Error("Not Implemented")));
  },
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
