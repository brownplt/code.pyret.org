let counter = 0;
let targetOrigin = "*"; // TODO(joe): config?
function commSetup(config, messageCallback) {
  function sendEvent(data) {
    console.log("Sending from CPO ", event);
    config.sendPort.postMessage({
      protocol: 'pyret',
      messageNumber: counter++,
      timestamp: window.performance.now(),
      data: data
    }, targetOrigin);
  }
  config.receivePort.onmessage = function(event) {
    if(typeof event.data === 'string' && event.data.indexOf("setImmediate") === 0) { return; }
    console.log("Message received: ", event);
    if(event.data.protocol !== 'pyret') { return; }
    messageCallback(event.data.data);
  };
  return { sendEvent };
}

function makeEvents(config) {
  const editor = config.CPO.editor;

  const comm = commSetup(config, onmessage);

  // Thanks internet! https://github.com/codemirror/CodeMirror/issues/3691
  const thisAPI = "@ignore-this-api";

  editor.cm.on("change", function(instance, change) {
    if(change.origin === thisAPI) { return; }
    comm.sendEvent({
      type: "change",
      change: change
    });
  });

  function onmessage(message) {
    console.log("received: ", message);
    if(message.type === "change") {
      editor.cm.replaceRange(message.change.text, message.change.from, message.change.to, thisAPI);
    }
  }
}
