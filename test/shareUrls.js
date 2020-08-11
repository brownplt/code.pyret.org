var assert = require("assert");
var tester = require("../test-util/util.js");

const shares = [
  // id : /editor#share=<id>
  // name : An informative title for the test case output
  // expr : Run at REPL after running definitions and expected to *not produce an error*
  // modal : How many modal windows to expect to have to close
  // timeout : optionally a timeout to override the default, if it's a long-running program
  // skip : should we skip this test for now?
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

  // BS:P starter files (published)
  { id: "1o6jspfKg4gLToMKHIVheJO80_D2e0uq4", name: "COE Bouncing Ball - original",
    expr: "initial-height", modal: 1 },
  { id: "1Ng3a1lw0FBxGxIn_Ba-DCwvCgswxKbff", name: "Temp-F-to-C",
    skip: "doesn't work as given", modal: 0 },
  { id: "1MH3HAapOLpVkb9VidzNjGRs3ywKP3hIW", name: "Temp-F-to-C",
    skip: "doesn't work as given", modal: 0 },
  { id: "1DxU4E0C_gPBNcSS5l2_E1qKe4MtZG4I_", name: "U2 - Motion Maps (background)",
    expr: "arrow(30, 'red')", modal: 0 },
  { id: "1wr8-a5OXAPit3g-FIEetp89EM2awnIhh", name: "U2 - Graphing Motion (background)",
    expr: "scene", modal: 0 },
  { id: "1HobVmJK7J6pt_wxX645PKrwYNztQqrw9", name: "U2 - Simulating Multiple Objects v2 (background)",
    expr: "draw-background(10)", modal: 0 },
  { id: "1-Ybj6HFxsxbtbSyOtQE9ZXEV9rv2pUDM", name: "red ball",
    expr: "background", modal: 0 },
  { id: "1sdn1D9iX53RnQcSzT2k5S93-2pvSAsD3", name: "U2 - Simulating Multiple Objects v1 (background)",
    expr: "arrow(30, 'red')", modal: 0 },
  { id: "1W_wL0_t0rW1iGu93GPNzZcWThuliAFgi", name: "U2 - Buggy Collision (background)",
    expr: "textbox('hi', 30)", modal: 0 },
  { id: "1qKcIbXYF25NDChjxphfuNkzjOQMpvcQK", name: "U2 - Buggy Simulation w/ Data (background)",
    expr: "make-lane('fast')", modal: 0 },
  { id: "1JlU9qgGZfKFf-mJfyXQZEcUWuKtdPiCI", name: "CV-Bus simulation with 2-argument next-v background",
    expr: "scene", modal: 0 },
  { id: "1EKgjjuqO2fhjjnf5HCLAXcsHh0jtOxVF", name: "CV-Constant-Velocity-Simulation-Motion-background",
    expr: "background", modal: 0 },
  
  { id: "1EJksH-tQwo6iaRVur_-V3aAeycJ0vQ4S", name: "self-driving.arr",
    expr: "scaled", modal: 0 },
  { id: "1d4_l0-B_14O3btts0zz--GHBbuQIvdze", name: "U3 - Miniature Golf (background)",
    expr: "background", modal: 0 },
  { id: "1k9A5nBBkaKOPsCUp2Fh_a0IeM5HuJHqK", name: "Feather Fall (background)",
    expr: "FILMSTRIP", modal: 0 },
  { id: "1MBR3E8YY6VkHNq7a-5Z0FsVmlRjj-8ti", name: "U3-EarthMoonMars",
    expr: "BACKGROUND2", modal: 0 },
  { id: "1cRItCh_3OIxaCPnhsf-Cwz1kqZtLDeSJ", name: "U3 - Activity 3 (background)",
    expr: "background", modal: 0 },

  { id: "1KVlk8TieAQgTXzC_XRVEhjVz1PijldZ3", name: "air-hockey-3",
    expr: "Back", modal: 0 },
  { id: "1DzB-KbgWFa20WzB0GDoC6phRItRHIye_", name: "U4 - Ball Sand Fan (background)",
    expr: "allfansand", modal: 0 },
  { id: "1cgCpS58z1OgEqR_UEWWrm-ohvu8v4wjU", name: "U4 - Millikan Oil Drop (background)",
    expr: "F-ELEC(130, 5)", modal: 0 },
  
  { id: "1BuOf73aJDcsGGEUnIr5jL5BFAfRHlSLU", name: "U5 - Falling Coffee Filters (background)",
    expr: "filters", modal: 0 },
  { id: "1T8qpHcLveHYNW2US0tni3YKwQE8sDuJZ", name: "U5 - Activity 5 (background)",
    expr: "parachute-drag(2)", modal: 0 },
  { id: "1kWQC3w96MVt8kqPIDJAVTmvn8d6clnPj", name: "U5 - Activity 5b (background)",
    expr: "car-with-chute", modal: 0 },

  { id: "1TApd4-p6BVtDwrgUV4DO8Gt7Yjg70ooT", name: "Rocket!",
    expr: "ground-height(50)", modal: 0 },
  
];

describe("Load share urls for known starter files", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  shares.forEach(function(share) {
    var timeout = share.timeout !== undefined ? share.timeout : 30000;
    if (share.skip) { return; }
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
