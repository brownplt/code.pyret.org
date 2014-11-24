var myWorker = new SharedWorker("/js/compile-worker.js");

myWorker.onerror = function(err) {
  console.log("Worker failed with error: ", err);
}

function dispatch(type, args) {
  switch(type) {
    case "log":
      console.log("[worker] ", args.message);
      break;
  }
  if(oEvent.data === "Loaded Pyret!") {
    console.log("Loaded Pyret!");
  }
  
}

myWorker.port.onmessage = function (oEvent) {
  console.log("Received message", oEvent);
  dispatch(oEvent.data.type, oEvent.data.args);
};

myWorker.port.postMessage({
  type: "initialize",
  args: {
    base: BASE,
    useStandalone: STANDALONE
  }
});
