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

function loadPyret(base, standalone) {
  if(standalone) {
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
  else {
    var phase1Base = base + "phase1/";
    requirejs.config({
      paths: {
        "js": phase1Base + "js",
        "compiler": phase1Base + "arr/compiler",
        "arr": phase1Base + "arr",
        "js/../../../lib/jglr": phase1Base + "../../lib/jglr",
        "trove": phase1Base + "trove",
        "q": "/js/q",
        "s-expression": "/js/s-expression",
        "fs": "/js/fsstub"
      },
      waitSeconds: 0
    });
  }
}

function handleInitialConnection(args, state, client) {
  log(client, "Connecting to " + args.windowId);
  // Only load Pyret if on first load
  if (state.firstLoad) {
    loadPyret(args.base, args.standalone);
  }
  var connected = {};
  connected[args.windowId] = client;
  return new Handled({
    firstLoad: false,
    connectedWindows: [connected]
  },
  [
    new Message(client, {
      type: "loaded",
      args: {}
    })
  ]);
}

function handleCompileSrcPyret(args, client) {
  // Behavior of compileSrcPyret from eval-lib goes here

  // Somehow need to serialize a "compileEnv" for the message and reconstitute it here.
}


function dispatch(type, args, state, client) {
  switch(type) {
    case "initialize":
      return handleInitialConnection(args, state, client)
    case "compile-src-pyret":
      return handleRestartInteractions(args, client);
    default:
      throw "Unknown message type: " + type;
  }
}

var initialState = {
  firstLoad: true,
  connectedWindows: []
};

console.log("Loading");

var currentState = initialState;

self.onconnect = function(initialMessageEvent) {
  var clientWindow = initialMessageEvent.source;
  initialMessageEvent.source.onmessage = function(message) {
    var result = dispatch(message.data.type, message.data.args, currentState, clientWindow);
    currentState = result.state;
    result.messages.forEach(function(m) {
      m.client.postMessage(m.data);
    });
  };
}

