var assert = require("assert");
var tester = require("../test-util/util.js");

const shares = [
  // name : An informative title for the test case output
  // id : /editor#share=<id>
  // expr : Run at REPL after running definitions and expected to *not produce an error*
  // modal : How many modal windows to expect to have to close
  { name: "Data Science 1.5", id: "1Z8ncVGKqWiED_wHl8TlNF3D9AGBb7awm", expr: "animals-table.column('name')", modal: 0 },
  { name: "Blank Game.arr", id: "1xL3ZnWb43d5ih_fRib3dz3h8z9d__2om", expr: "BACKGROUND", modal: 1 }
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
      tester.evalDefinitions(self.browser, {});
      for(var i = 0; i < share.modal; i += 1) {
        tester.waitForWorldProgram(self.browser, 20000, 5000);
      }
      tester.waitForBreakButton(this.browser);
      this.browser.wait(function() { return tester.evalPyretNoError(self.browser, share.expr); });
      this.browser.call(done);
    });
  });
});
