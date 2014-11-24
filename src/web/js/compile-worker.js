importScripts("/js/require.js");

function Handled(newState, messages) {
  this.newState = newState;
  this.messages = messages;
}

function Message(client, data) {
  this.client = client;
  this.data = data;
}

// console.log within a worker doesn't work reliably, so post back to the
// parent in order to log
function log(client, message) {
  client.postMessage({
    type: "log",
    args: {
      message: message
    }
  });
}

function loadPyret(base) {
  if(firstLoad) {
    requirejs.config({
      paths: {
        "q": "/js/q",
        "s-expression": "/js/s-expression",
        "fs": "/js/fsstub"
      },
      waitSeconds: 0
    });
    var pyretSrc = base + "pyret.js"
    importScripts(pyretSrc);
  }
}

function handleInitialConnection(args, client) {
  loadPyret(args.base);
  return Handled({
    firstLoad: false,
    connectedWindows: [{
      args.windowId: client
    }]
  },
  [
    Message(client, {
      type: "loaded",
      args: {}
    }
  ]);
}

function handleCompile() {

}


function dispatch(type, args, state, client) {
  switch(type) {
    case "initialize":
      return handleInitialConnection(args, client)
    case "compile":
      return handleCompile(type, args, client);
  }
}

var initialState = {
  firstLoad: true,
  connectedWindows: []
};

var currentState = initialState;

self.onconnect = function(initialMessageEvent) {
  initialMessageEvent.source.onmessage = function(message) {
    var result = dispatch(message.data.type, message.data.args, message.source);
    currentState = result.state;
    result.messages.forEach(function(m) {
      m.client.postMessage(m.data);
    });
  };
  dispatch(
      initialMessageEvent.data.type,
      initialMessageEvent.data.args,
      initialMessageEvent.source
    );
}

