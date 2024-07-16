
let messageCounter = 0;
let targetOrigin = POSTMESSAGE_ORIGIN;
let RECEIVED_RESET = false;
function commSetup(config, messageCallback) {
  function sendEvent(data, description) {
    if(!RECEIVED_RESET && data.type !== "pyret-init") {
      console.log("Pyret skipping a message synthesized before initialization via 'reset':", data, getCurrentState(config));
      return;
    }
    messageCounter += 1;
    const state = { ...getCurrentState(config), messageNumber: messageCounter };
    console.log("Sending from CPO ", data, state);
    config.sendPort.postMessage(
      {
        protocol: "pyret",
        timestamp: window.performance.now(),
        data: data,
        state,
        description
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
    if (event.data.protocol !== "pyret") {
      return;
    }
    messageCallback(event.data.data, event.data.state);
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
    replContents: config.CPO.replWidget.cm.getValue()
  };
}

function makeEvents(config) {
  const editor = config.CPO.editor;
  const replCM = function() { return config.CPO.replWidget.cm; }

  async function reset(state) {
    interactionsSinceLastRun = [];
    messageCounter = state.messageNumber;
    definitionsAtLastRun = state.definitionsAtLastRun;
    if(typeof state.definitionsAtLastRun === 'string') {
      await window.RUN_CODE(state.definitionsAtLastRun);
    }
    const interactions = state.interactionsSinceLastRun;
    for(let i = 0; i < interactions.length; i += 1) {
      await runInteraction(interactions[i]);
    }
    editorUpdate(state.editorContents);
    replUpdate(state.replContents);
  }

  config.CPO.onLoad(async function () {
    replCM().on("change", function (instance, change) {
      if (change.origin === thisAPI || change.origin === "setValue") {
        return;
      }
      comm.sendEvent({
        type: "changeRepl",
        change: change,
      }, "Edited the last interaction.");
    });
    comm.sendEvent({
      type: "pyret-init"
    });
  });

  const comm = commSetup(config, onmessage);

  function editorUpdate(newCode) {
    editor.cm.replaceRange(
      newCode,
      { line: 0, ch: 0},
      { line: editor.cm.lastLine(), ch: 99999 },
      thisAPI
    );
    editor.cm.refresh();
  }

  function replUpdate(newCode) {
    replCM().replaceRange(
      newCode,
      { line: 0, ch: 0},
      { line: replCM().lastLine(), ch: 99999 },
      thisAPI
    );
    window.setTimeout(() => replCM().refresh(), 100);
  }

  // Thanks internet! https://github.com/codemirror/CodeMirror/issues/3691
  const thisAPI = "@ignore-this-api";

  editor.cm.on("change", function (instance, change) {
    if (change.origin === thisAPI || change.origin === "setValue") {
      return;
    }
    comm.sendEvent({
      type: "change",
      change: change,
    }, "Made a change to the program.");
  });



  config.CPO.onRun(function () {
    interactionsSinceLastRun = [];
    definitionsAtLastRun = getCurrentState(config).editorContents;
    comm.sendEvent({
      type: "run"
    }, "Ran the program.");
  });

  async function runProgram(state) {
    interactionsSinceLastRun = [];
    const code = state.editorContents
    editorUpdate(code);
    definitionsAtLastRun = code;
    await window.RUN_CODE(code);
    replCM().display.input.blur()
  }

  config.CPO.onInteraction(function (interaction) {
    interactionsSinceLastRun.push(interaction);
    comm.sendEvent({
      type: "runInteraction"
    }, `Ran the last interaction, ${interaction}.`);
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
      replCM().display.input.blur()
    });
  }

  const initialState = {
    editorContents: "use context starter2024\n\n",
    interactionsSinceLastRun: [],
    definitionsAtLastRun: false,
    replContents: ""
  };

  function resetFromShare(link) {
    var initialParams = url.parse(link); // https://code.pyret.org/editor#share=2390485
    // initialParams = "share=2390485"
    var params = url.parse("/?" + initialParams["hash"]);
    if(params["get"]["share"]) {
      const toLoad = CPO.storageAPI.then((api) => {
        return api.getSharedFileById(params["get"]["share"]);
      });
      CPO.loadProgram(toLoad).then((text) => {
        editorUpdate(text);
      })
      .catch((e) => {
        console.error("Error loading initial state from share link: ", e, link);
      });
    }
  }

  function onmessage(message, state) {
    console.log("Pyret received an onmessage: ", message);
    if(message.type === "reset") {
      console.log("Got explicit reset: ", message, "current state", getCurrentState(config));
      RECEIVED_RESET = true;
      if(message.state === "") {
        reset(initialState);
        return;
      }
      // This means we got a CPO link as the initial state.
      if(message.state.startsWith(APP_BASE_URL)) {
        resetFromShare(message.state);
        return;
      }
      const state = JSON.parse(message.state);
      reset(state);
      return;
    }

    if(state.messageNumber !== messageCounter + 1) {
      console.log("Messages received in a strange order: ", message, state, messageCounter, getCurrentState(config));
      reset(state);
      return;
    }
    else {
      messageCounter += 1;
    }
    
    switch (message.type) {
      case "setContents":
        editorUpdate(message.text);
        break;
      case "change":
        editor.cm.replaceRange(
          message.change.text,
          message.change.from,
          message.change.to,
          thisAPI
        );
        if(config.CPO.editor.cm.getValue() !== state.editorContents) {
          console.log("Editor contents disagreed with message state, synchronizing.", config.CPO.editor.cm.getValue(), state.editorContents)
          editorUpdate(state.editorContents);
        }
        break;
      case "changeRepl":
        replCM().replaceRange(
          message.change.text,
          message.change.from,
          message.change.to,
          thisAPI
        );
        if(replCM().getValue() !== state.replContents) {
          console.log("Editor contents disagreed with message state, synchronizing.", replCM().getValue(), state.replContents)
          replUpdate(state.replContents);
        }
        break;
      case "run":
        runProgram(state);
        break;
      case "runInteraction":
        const interactions = state.interactionsSinceLastRun;
        const src = interactions[interactions.length - 1];
        runInteraction(src);
        break;
    }
  }
}
