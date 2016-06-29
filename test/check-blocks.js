var tester = require("../test-util/util.js");

describe("Rendering check blocks", function() {
  before(tester.setupMulti("Rendering check blocks"));
  after(tester.teardownMulti);

  var tests = [
    ["simple", "check: 1 is 2 end", [[["reported failure"]]]],
    ["simple2", "check: 1 is 2\n3 is 4 end", [[["reported failure"], ["reported failure"]]]],
    ["simple3", "check: 1 is 2 end\ncheck: 3 is 4 end", [[["reported failure"]],[["reported failure"]]]],

    
  ];

  tests.forEach(function(t) {
    tester.testRunsAndHasCheckBlocks(it, t[0], t[1], t[2]);
  });

});
