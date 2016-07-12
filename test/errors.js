var tester = require("../test-util/util.js");
var fs = require("fs");

describe("Rendering errors", function() {
  before(tester.setupMulti("Rendering errors"));
  after(tester.teardownMulti);

  function fileTest(name, expected) {
    var path = "test-util/pyret-programs/errors/" + name + ".arr";
    return [name, fs.readFileSync(path), expected];
  }

  var tests = [
    ["field-not-found", "{}.x", "did not have a field"],
    ["lookup-non-object", "5.x", "non-object value"],
    ["lookup-constructor-not-object", "data D: d() end\n d.x", "evaluated to a constructor (d)"],
    ["update-non-obj", "5!{x : 10}", "The reference update expression"],
    ["update-non-ref", "{x:5}!{x : 10}", "is not a reference"],
    ["update-non-existent-field", "{x:5}!{y : 10}", "does not exist"],
    ["no-cases-matched", "cases(List) link(1, empty): | empty => true end", "expects there to always be a branch matching"],
    ["no-branches-matched", "if 1 == 2: 5 else if 3 == 4: 6 end", "expects that the condition of at least one branch be satisfied"],
    ["template-not-finished", "fun f(): ... end\nf()", "tried to evaluate an unfinished template"],
    ["template-not-finished", "fun f(): ... end\nf()", "tried to evaluate an unfinished template"],
    ["lookup-non-tuple", "5.{1}", "evaluate to a tuple"],
    ["lookup-large-index", "{1;2}.{3}", "a value could not be found at the given position"],

    ["type-id-used-as-value", "data D: d(x) end\nmy-x = D.x", "but it is defined as a type"],

    ["images-equal-preds", "include image\nimages-equal(5, 'a')", "failed because the 1ˢᵗ argument evaluated to an unexpected value"],
    ["text-preds", "include image\ntext('a', 'a', 'blue')", "failed because the 2ⁿᵈ argument evaluated to an unexpected value"],
    ["text-font-preds", "include image\ntext-font('a', 5, 'blue', 'times', true, 'italic', 'bold', true)", "failed because the 5ᵗʰ argument evaluated to an unexpected value"],

    ["regular-polygon", "include image\nregular-polygon(20, 1/2, 'solid', 'blue')", "failed because the 2ⁿᵈ argument evaluated to an unexpected value"],

    ["arity-on-world-callback", "import world as W\nW.big-bang('a', [list: W.on-tick(lam(x, y): x end)])", "expected to get 2 arguments"],

    fileTest("deeply-recursive-field-not-found", "did not have a field")
  ];

  tests.forEach(function(t) {
    tester.testErrorRendersString(it, t[0], t[1], t[2]);
  });

});
