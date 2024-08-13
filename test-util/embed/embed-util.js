function sendReset(frame, state) {
  if(!state) {
    state = {
      definitionsAtLastRun: false,
      interactionsSinceLastRun: [],
      editorContents: "use context starter2024",
      replContents: ""
    };
  }
  frame.contentWindow.postMessage({
    data: {
      type: 'reset',
      state: JSON.stringify(state)
    },
    protocol: 'pyret'
  });
}
function directPostMessage(frame, message) {
  frame.contentWindow.postMessage(message);
}

function makeEmbedAPI(frame) {
  return {
    sendReset: (state) => sendReset(frame, state),
    postMessage: (message) => directPostMessage(frame, message)
  }
}
