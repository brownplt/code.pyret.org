var assert = require("assert");
var tester = require("../test-util/util.js");

const shares = [
  // name : An informative title for the test case output
  // id : /editor#share=<id>
  // expr : Run at REPL after running definitions and expected to *not produce an error*

  // NOTE: Definitions can't produce any modal windows for this to work (e.g.
  // no overlaid charts, etc, has to show REPL)
  { name: "Data Science 1.5", id: "1Z8ncVGKqWiED_wHl8TlNF3D9AGBb7awm", expr: "animals-table.column('name')" }
];

describe("Load share urls for known starter files", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  shares.forEach(function(share) {
    it("should load the shared file at " + share.id + " (" + share.name + ")", function(done) {
      this.timeout(20000);
      var self = this;
      this.browser.get(this.base + "/editor#share=" + share.id);
      this.browser.wait(function() { return tester.pyretLoaded(self.browser); });
      this.browser.wait(function() { return tester.evalDefinitionsAndWait(self.browser); });
      this.browser.wait(function() { return tester.evalPyretNoError(self.browser, share.expr); });
      this.browser.sleep(10000);
      this.browser.call(done);
    });
  });
});
