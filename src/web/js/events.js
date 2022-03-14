let counter = 0;
let targetOrigin = POSTMESSAGE_ORIGIN;
function commSetup(config, messageCallback) {
  function sendEvent(data) {
    console.log("Sending from CPO ", event);
    config.sendPort.postMessage(
      {
        protocol: "pyret",
        messageNumber: counter++,
        timestamp: window.performance.now(),
        data: data,
      },
      targetOrigin
    );
  }
  config.receivePort.onmessage = function (event) {
    if (
      typeof event.data === "string" &&
      event.data.indexOf("setImmediate") === 0
    ) {
      return;
    }
    console.log("Message received: ", event);
    if (event.data.protocol !== "pyret") {
      return;
    }
    messageCallback(event.data.data);
  };
  return { sendEvent };
}

let interactionsSinceLastRun = [];
function getCurrentState(config) {
  return {
    editorContents: config.CPO.editor.cm.getValue(),
    interactionsSinceLastRun: interactionsSinceLastRun,
  };
}

function makeEvents(config) {
  const editor = config.CPO.editor;
  const onRun = config.CPO.onRun;
  const RUN_CODE = config.CPO.RUN_CODE;

  const comm = commSetup(config, onmessage);

  // Thanks internet! https://github.com/codemirror/CodeMirror/issues/3691
  const thisAPI = "@ignore-this-api";

  editor.cm.on("change", function (instance, change) {
    if (change.origin === thisAPI) {
      return;
    }
    comm.sendEvent({
      type: "change",
      change: change,
      currentState: getCurrentState(config),
    });
  });

  config.CPO.onRun(function () {
    interactionsSinceLastRun = [];
    comm.sendEvent({
      type: "run",
      currentState: getCurrentState(config),
    });
  });

  config.CPO.onInteraction(function (interaction) {
    interactionsSinceLastRun.push(interaction);
    comm.sendEvent({
      type: "runInteraction",
      currentState: getCurrentState(config),
    });
  });

  function onmessage(message) {
    console.log("received: ", message);
    switch (message.type) {
      case "setContents":
        editor.cm.setValue(message.text);
        break;
      case "change":
        editor.cm.replaceRange(
          message.change.text,
          message.change.from,
          message.change.to,
          thisAPI
        );
        if(config.CPO.editor.cm.getValue() !== message.currentState.editorContents) {
          console.log("Editor contents disagreed with message state, synchronizing.", config.CPO.editor.cm.getValue(), message.currentState.editorContents)
          editor.cm.setValue(message.currentState.editorContents);
        }
        break;
      case "run":
        interactionsSinceLastRun = [];
        window.RUN_CODE(editor.cm.getValue()); // TODO(don't require editor here, abstract more)
        break;
      case "runInteraction":
        const interactions = message.currentState.interactionsSinceLastRun;
        const src = interactions[interactions.length - 1];
        interactionsSinceLastRun.push(src);
        $(".repl-prompt")
          .find(".CodeMirror")[0]
          .CodeMirror.setOption("readOnly", "nocursor");
        const result = window.RUN_INTERACTION(src);
        result.fin(() => {
          $(".repl-prompt")
            .find(".CodeMirror")[0]
            .CodeMirror.setOption("readOnly", false);
        });
        break;
    }
  }
}
