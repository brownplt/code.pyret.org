importScripts("/js/require.js");

var initialState = {
  firstLoad: true,
  connectedWindows: []
};

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



function dispatch(type, args, client) {
  switch(type) {
    case "initialize":
      return handleInitialConnection(args, client)
    case "compile":
      return handleCompile(type, args);
  }
}

function makeHandlers(client) {
  return {
    log: function(message) { return log(client, message); },
    registerConnection: function() {
      client.postMessage({
        type: "connected",
        args: { /* some sort of windowId? */ }
      );
    },
    dispatch: {
      initialize: function(message) {

      }
    }
  }
}


self.onmessage = function(messageEvent) {
  console.log("New message");
  messageEvent.source.postMessage("Messaged!");
  dispatch(messageEvent.data.type, messageEvent.data.args);
};

self.onconnect = function(message) {
  var handlers = makeHandlers(message.source);
  handleInitialConnection(message.data, message.source);
}

