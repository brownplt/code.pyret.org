/**
 * File to handle visualizing function calls.
 * For now, just `console.log`'s function calls
 * and returns, but eventually will integrate d3
 * and display windows.
 * Looking at http://d3indepth.com/layouts/
 * and https://stackoverflow.com/questions/21727202/append-dom-element-to-the-d3
 */
({
  requires: [],
  nativeRequires: [],
  provides: {},
  theModule: function(runtime, n, u) {

    var indentation = 1;
    var indentation_char = "-";
    // packet: {action: String, funName: String, params: List<String>, args: List<Vals>}
    var simpleOnPush = function(packet) {
      console.log(Array(indentation).join(indentation_char) +
        [packet.action, packet.funName, packet.params.toString(), packet.args.toString()].join(" "));
      indentation++;
    }

    // packet: {action: String, retVal: Vals}
    var simpleOnPop = function(packet) {
      indentation--;
      console.log(Array(indentation).join(indentation_char) +
        [packet.action, packet.retVal].join(" "));
    }

    return runtime.makeJSModuleReturn({
      pushFun: simpleOnPush,
      popFun : simpleOnPop,
    });
  }
})
