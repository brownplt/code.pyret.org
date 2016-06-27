var tester = require("../test-util/util.js");

describe("Rendering errors", function() {
  before(tester.setupMulti("Rendering errors"));
  after(tester.teardownMulti);

  // NOTE(joe): A few failing cases commented out below, good TODOs for
  // easy things to fix first.
  var tests = [
    ["field-not-found", "{}.x", "to contain a field named"],
    ["lookup-non-object", "5.x", "to evaluate to an object"],
    ["lookup-constructor-not-object", "data D: d() end\n d.x", "on a constructor"],
    ["update-non-obj", "5!{x : 10}", "The reference update expression"],
    ["update-non-ref", "{x:5}!{x : 10}", "is not a reference"],
    ["update-non-existent-field", "{x:5}!{y : 10}", "does not exist"],
//    ["no-cases-matched", "cases(List) link(1, 2): | empty => true end", "expects there to always be a branch matching"],
    ["no-branches-matched", "if 1 == 2: 5 else if 3 == 4: 6 end", "expects that the condition of at least one branch be satisfied"],
    ["template-not-finished", "fun f(): ... end\nf()", "tried to evaluate an unfinished template"],
    ["template-not-finished", "fun f(): ... end\nf()", "tried to evaluate an unfinished template"],
//   ["lookup-non-tuple", "5.{1}", "to evaluate to a tuple"],
//   ["lookup-large-index", "{1;2}.{3}", "expects the index to be smaller"],
  ];

  tests.forEach(function(t) {
    tester.testErrorRendersString(it, t[0], t[1], t[2]);
  });

});
