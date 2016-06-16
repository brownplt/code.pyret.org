import React from 'react';
import PyretIDE from 'pyret-ide';
import ReactDOM from 'react-dom';

var appDiv = document.createElement("div");
document.body.appendChild(appDiv);
ReactDOM.render(React.createElement(PyretIDE, null), appDiv);
