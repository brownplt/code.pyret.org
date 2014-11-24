
var compileWorker = new SharedWorker("/js/compile-worker.js");

compileWorker.onerror = function(err) {
  console.log("Worker failed with error: ", err);
}

function dispatch(type, args) {
  switch(type) {
    case "log":
      console.log("[worker] ", args.message);
      break;
    case "loaded":
      console.log("Successfully connected to worker");
      break;
  }
}

compileWorker.port.onmessage = function (workerEvent) {
  dispatch(workerEvent.data.type, workerEvent.data.args);
};

var myId = Math.random() * 100000000;

compileWorker.port.postMessage({
  type: "initialize",
  args: {
    base: BASE,
    useStandalone: STANDALONE,
    windowId: myId
  }
});

console.log("My windowId is " + myId);
