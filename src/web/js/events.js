let messageCounter = 0;
let targetOrigin = POSTMESSAGE_ORIGIN;
function commSetup(config, messageCallback) {
  function sendEvent(data) {
    console.log("Sending from CPO ", event);
    config.sendPort.postMessage(
      {
        protocol: "pyret",
        messageNumber: ++messageCounter,
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
// Sometimes there are interleavings of edits with running, so the currently-shown
// definitions isn't the one used for running the program.
// `false` indicates that the program has not been run yet
let definitionsAtLastRun = false;
function getCurrentState(config) {
  return {
    editorContents: config.CPO.editor.cm.getValue(),
    definitionsAtLastRun,
    interactionsSinceLastRun,
    messageNumber: messageCounter
  };
}

function makeEvents(config) {
  const editor = config.CPO.editor;

  async function reset(state) {
    interactionsSinceLastRun = [];
    messageCounter = state.messageNumber;
    if(state.definitionsAtLastRun && state.definitionsAtLastRun !== state.currentState) {
      await window.RUN_CODE(state.definitionsAtLastRun);
    }
    editor.cm.setValue(state.editorContents);
    const interactions = state.interactionsSinceLastRun;
    for(let i = 0; i < interactions.length; i += 1) {
      await runInteraction(interactions[i]);
    }
  }

  config.CPO.onLoad(async function () {
    comm.sendEvent({
      type: "pyret-init"
    });
  });

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
    definitionsAtLastRun = getCurrentState(config).editorContents;
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

  function runInteraction(src) {
    interactionsSinceLastRun.push(src);
    $(".repl-prompt")
      .find(".CodeMirror")[0]
      .CodeMirror.setOption("readOnly", "nocursor");
    const result = window.RUN_INTERACTION(src);
    return result.fin(() => {
      $(".repl-prompt")
        .find(".CodeMirror")[0]
        .CodeMirror.setOption("readOnly", false);
    });
  }

  function onmessage(message) {
    console.log("received: ", message);
    if(message.type === "reset") {
      reset(JSON.parse(message.state));
      return;
    }
    if(message.currentState.messageNumber !== messageCounter + 1) {
      console.log("Messages received in a strange order: ", message, messageCounter, getCurrentState(config));
      reset(message.currentState);
      return;
    }
    messageCounter = message.currentState.messageNumber;
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
        const code = message.currentState.editorContents
        editor.cm.setValue(code);
        definitionsAtLastRun = code;
        window.RUN_CODE(code);
        break;
      case "runInteraction":
        const interactions = message.currentState.interactionsSinceLastRun;
        const src = interactions[interactions.length - 1];
        runInteraction(src);
        break;
    }
  }
}
