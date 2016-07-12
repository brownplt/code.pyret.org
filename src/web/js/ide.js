import React from 'react';
import PyretIDE from 'pyret-ide';
import ReactDOM from 'react-dom';
import seedrandom from 'seedrandom';

function loadScriptUrl(url) {
  var scriptTag = document.createElement('script');
  scriptTag.src = url;
  scriptTag.type = "text/javascript";
  document.body.appendChild(scriptTag);
}

// this is needed by pyret I guess.
require('script!requirejs/require.js');
window.define('seedrandom', [], function() { return seedrandom; });
loadScriptUrl(process.env.BASE_URL+'/js/cpo-ide-hooks.jarr');

var appDiv = document.createElement("div");
document.body.appendChild(appDiv);
ReactDOM.render(React.createElement(PyretIDE, null), appDiv);
