var tester = require("../test-util/util.js");
var fs = require("fs");

describe("Rendering check blocks", function() {
  before(tester.setupMulti("Rendering check blocks"));
  after(tester.teardownMulti);

  function fileTest(name, expected) {
    var path = "test-util/pyret-programs/check-blocks/" + name + ".arr";
    return [name, fs.readFileSync(path), expected];
  }

  var tests = [
    ["simple", "check: 1 is 2 end", [[["reported failure"]]]],
    ["simple2", "check: 1 is 2\n3 is 4 end", [[["reported failure"], ["reported failure"]]]],
    ["simple3", "check: 1 is 2 end\ncheck: 3 is 4 end", [[["reported failure"]],[["reported failure"]]]],

    ["satisfies0", "check: 5 satisfies {(x): raise('nope')} end", [[["nope"]]]],
    
    ["doesNotRaise0", "check: raise('nope') does-not-raise end", [[["nope"]]]],

    fileTest("deep-recursion-in-first-test", [
      [["2001", "o is-not o"], ["reported failure"], ["reported failure"]]
    ])
  ];

  tests.forEach(function(t) {
    tester.testRunsAndHasCheckBlocks(it, t[0], t[1], t[2]);
  });

});
