var tester = require("../test-util/util.js");

describe("Rendering errors", function() {
  before(tester.setupEditor);
  after(tester.teardownEditor);

  var tests = [
    ["field-not-found", "{}.x", "to contain a field named"],
    ["lookup-non-object", "5.x", "to evaluate to an object"],
    ["lookup-constructor-not-object", "data D: d() end\n d.x", "on a constructor"],
  ];

  tests.forEach(function(t) {
    tester.testErrorRendersString(it, t[0], t[1], t[2]);
  });

});
