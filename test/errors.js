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

// NOTE(joe Sep 2017): Removing these _plus tests because it's not clear what
// should happen for errors on this semi-internal interface. It would be good
// to have an answer for this, though

//    ["renderSimpleReasonSimple", "_plus(1, 'x')", "(definitions://, 1, 0, 0, 1, 13, 13)"],
//    ["renderSimpleReasonError",  "_plus(1, 'x')", "An error occurred rendering the reason"],
    
    ["field-not-found", "{}.x", "did not have a field"],
    ["lookup-non-object", "5.x", "not an object"],
    ["lookup-constructor-not-object", "data D: d() end\n d.x", "was a constructor"],
    ["update-non-obj", "5!{x : 10}", "reference update expression"],
    ["update-non-ref", "{x:5}!{x : 10}", "is not a mutable reference"],
    ["update-non-existent-field", "{x:5}!{y : 10}", "does not exist"],
    ["no-cases-matched", "cases(List) link(1, empty): | empty => true end", "matched the value"],
    ["no-branches-matched", "if 1 == 2: 5 else if 3 == 4: 6 end", "the condition of at least one branch be satisfied"],
    ["template-not-finished", "fun f(): ... end\nf()", "Template expressions cannot be evaluated."],
    ["template-not-finished", "fun f(): ... end\nf()", "Template expressions cannot be evaluated."],
    ["lookup-non-tuple", "5.{1}", "was not a tuple value"],
    ["lookup-large-index", "{1;2}.{3}", "given position"],

    ["type-id-used-as-value", "data D: d(x) end\nmy-x = D.x", "But it is defined as a type"],

    ["images-equal-preds", "include image\nimages-equal(5, 'a')", "failed because the 1ˢᵗ argument evaluated to an unexpected value"],
    ["text-preds", "include image\ntext('a', 'a', 'blue')", "failed because the 2ⁿᵈ argument evaluated to an unexpected value"],
    ["text-font-preds", "include image\ninclude image-structs\ntext-font('a', 5, blue, 'times', true, 'italic', 'bold', true)", "failed because the 5ᵗʰ argument evaluated to an unexpected value"],

    ["regular-polygon", "include image\nregular-polygon(20, 1/2, 'solid', 'blue')", "failed because the 2ⁿᵈ argument evaluated to an unexpected value"],

    // TODO(joe): Need a better way to close the world window when this is done
//    ["arity-on-world-callback", "import world as W\nW.big-bang('a', [list: W.on-tick(lam(x, y): x end)])", "defined accepting 2 arguments"],

    fileTest("deeply-recursive-field-not-found", "did not have a field")
  ];

  tests.forEach(function(t) {
    tester.testErrorRendersString(it, t[0], t[1], t[2]);
  });

});
