var assert = require("assert");
var tester = require("../test-util/util.js");

const shares = [
  // id : /editor#share=<id>
  // name : An informative title for the test case output
  // expr : Run at REPL after running definitions and expected to *not produce an error*
  // modal : How many modal windows to expect to have to close
  // timeout : optionally a timeout to override the default, if it's a long-running program
  { id: "1Z8ncVGKqWiED_wHl8TlNF3D9AGBb7awm", name: "Data Science 1.5",
    expr: "animals-table.column('name')", modal: 0 },
  { id: "1xL3ZnWb43d5ih_fRib3dz3h8z9d__2om", name: "Blank Game.arr",
    expr: "BACKGROUND", modal: 1 },

  // BS:DS starter files
  { id: "1VVz4l0P6GLwbcpYyAGYJuRgBxj69R52Z", name: "Trust, but verify!",
    expr: "verify1", modal: 0 },
  { id: "1Fm3bSkeWZ5f4VwZ24TtOkZ3Pu0CPkJT2", name: "Table Methods Starter File (v1.5.1)",
    expr: "animals-table", modal: 0 },
  { id: "1ymyvlI7RTtq8lHh4VH3x1N3WlcZB650j", name: "Mood Generator Starter File",
    expr: "mood('happy')", modal: 0 },
  { id: "1d3HuG_LjdX9HpfQPCmVmDG9mYml4nOX8", name: "Random Animals Starter File (v1.5.1)",
    expr: "big-animals-table", modal: 0 },

];

describe("Load share urls for known starter files", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  shares.forEach(function(share) {
    var timeout = share.timeout !== undefined ? share.timeout : 30000;
    it("should load the shared file at " + share.id + " (" + share.name + ")", function(done) {
      this.timeout(timeout);
      var self = this;
      this.browser.get(this.base + "/editor#share=" + share.id);
      this.browser.wait(function() { return tester.pyretLoaded(self.browser); });
      tester.evalDefinitions(self.browser, {});
      for(var i = 0; i < share.modal; i += 1) {
        tester.waitForWorldProgram(self.browser, timeout, 5000);
      }
      tester.waitForBreakButton(this.browser);
      this.browser.wait(function() { return tester.evalPyretNoError(self.browser, share.expr); });
      this.browser.call(done);
    });
  });
});
