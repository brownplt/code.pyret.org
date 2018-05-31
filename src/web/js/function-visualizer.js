/**
 * File to handle visualizing function calls.
 * For now, just `console.log`'s function calls
 * and returns, but eventually will integrate d3
 * and display windows.
 * Looking at http://d3indepth.com/layouts/
 */
({
  requires: [],
  nativeRequires: [],
  provides: {},
  theModule: function(runtime, n, u) {

    var indentation = 1;
    var indentation_char = "-";
    var simpleOnPush = function(packet_list) {
      console.log(Array(indentation).join(indentation_char) + packet_list.join(" "));
      indentation++;
    }

    var simpleOnPop = function(packet_list) {
      indentation--;
      console.log(Array(indentation).join(indentation_char) + packet_list.join(" "));
    }

    return runtime.makeJSModuleReturn({
      pushFun: simpleOnPush,
      popFun : simpleOnPop,
    });
  }
})
