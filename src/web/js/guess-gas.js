define("cpo/guess-gas", [], function() {
  // Hard to do better than this
  function guessGas(gas, repl) {
    var rt = repl.runtime;
    var ua = "";
    if(window.navigator && window.navigator.userAgent) {
      ua = window.navigator.userAgent;
    }
    if(ua.indexOf("Firefox") !== -1) {
      rt.INITIAL_GAS = 200;
      // clear out the definition of "f"
      return repl.restartInteractions("").then(function() { return repl; });
    }
    rt.INITIAL_GAS = gas;
    var body = "if x == 0: 0 else: f(x - 1, y, z) end"
    var onRun = repl.restartInteractions("fun f(x :: Number, y, z) -> Number: " + body + " end\nf(" + gas + ", \"y\", \"z\")", "noname");
    console.log("Trying gas: ", gas);
    onRun.fail(function(err) {
      console.log("Gas run failed at: ", gas);
      return guessGas(Math.floor(gas / 2), repl);
    });
    return onRun.then(function(result) {
      if(rt.isSuccessResult(result)) {
        console.log("Gas run succeeded at: ", gas, result);
        rt.INITIAL_GAS = Math.floor(gas / 2);
        // clear out the definition of "f"
        return repl.restartInteractions("").then(function() { return repl; });
      } else {
        console.log("Gas run failed at: ", gas);
        return guessGas(Math.floor(gas / 2), repl);
      }
    });
  }

  return {
    guessGas: guessGas
  };
});
