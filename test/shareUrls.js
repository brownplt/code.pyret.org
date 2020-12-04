var assert = require("assert");
var tester = require("../test-util/util.js");

const shares = [
  // id : /editor#share=<id>
  // name : An informative title for the test case output
  // expr : Run at REPL after running definitions and expected to *not produce an error*
  // modal : How many modal windows to expect to have to close
  // timeout : optionally a timeout to override the default, if it's a long-running program
  // skip : should we skip this test for now?
  { id: "1xL3ZnWb43d5ih_fRib3dz3h8z9d__2om", name: "Algebra: Blank Game.arr",
    expr: "BACKGROUND", modal: 1 },

  // BS:R starter files
  { id: "0B9rKDmABYlJVaVpta3FVc0wydG8", name: "Reactive: Take a Hike! Starter",
    expr: "SCENE", modal: 0 },
  { id: "0B9rKDmABYlJVdHZESmZ6ZnRmdXc", name: "Reactive: Review",
    expr: "SQUARE", modal: 0 },
  { id: "0B9rKDmABYlJVWUlZTHVVRDFOdk0", name: "Reactive: Package Delivery",
    expr: "next-position(10, 10)", modal: 1 },
  { id: "0B9rKDmABYlJVa0cxbEpoSG1pT0k", name: "Reactive: Your Bakery",
    expr: "red-velvet-cake", modal: 0 },
  { id: "0B9rKDmABYlJVSm94cFA4T3R2NTA", name: "Reactive: Sunset",
    expr: "HORIZON-HEIGHT", modal: 0 },
  { id: "0B9rKDmABYlJVaUw0VjdiOE5DVzQ", name: "Reactive: What to wear",
    expr: "wear(81)", modal: 0 },
  { id: "0B9rKDmABYlJVNDdsNDBNcHdSVWs", name: "Reactive: Where's my Order?",
    expr: "next-position(10, 10)", modal: 1 },
  { id: "0B9rKDmABYlJVVWk4MGJidEtsRWc", name: "Reactive: Moving Character",
    expr: "char-react", modal: 1 },
  { id: "0B9rKDmABYlJVVWk4MGJidEtsRWc", name: "Reactive: Moving Character",
    expr: "char-react", modal: 1 },
  { id: "0B9rKDmABYlJVXy00M1VteEZxaHM", name: "Reactive: Virtual Pet Starter",
    expr: "pet-react", modal: 1 },

  // BS:DS starter files
  { id: "1Z8ncVGKqWiED_wHl8TlNF3D9AGBb7awm", name: "DataScience: Data Science 1.5",
    expr: "animals-table.column('name')", modal: 0 },
  { id: "1VVz4l0P6GLwbcpYyAGYJuRgBxj69R52Z", name: "DataScience: Trust, but verify!",
    expr: "verify1", modal: 0 },
  { id: "1Fm3bSkeWZ5f4VwZ24TtOkZ3Pu0CPkJT2", name: "DataScience: Table Methods Starter File (v1.5.1)",
    expr: "animals-table", modal: 0 },
  { id: "1ymyvlI7RTtq8lHh4VH3x1N3WlcZB650j", name: "DataScience: Mood Generator Starter File",
    expr: "mood('happy')", modal: 0 },
  { id: "1d3HuG_LjdX9HpfQPCmVmDG9mYml4nOX8", name: "DataScience: Random Animals Starter File (v1.5.1)",
    expr: "big-animals-table", modal: 0 },

  // BS:P starter files (published)
  { id: "1o6jspfKg4gLToMKHIVheJO80_D2e0uq4", name: "Physics: COE Bouncing Ball - original",
    expr: "initial-height", modal: 1 },
  { id: "1Ng3a1lw0FBxGxIn_Ba-DCwvCgswxKbff", name: "Physics: Temp-F-to-C",
    skip: "doesn't work as given", modal: 0 },
  { id: "1MH3HAapOLpVkb9VidzNjGRs3ywKP3hIW", name: "Physics: Temp-F-to-C",
    skip: "doesn't work as given", modal: 0 },
  { id: "1DxU4E0C_gPBNcSS5l2_E1qKe4MtZG4I_", name: "Physics: U2 - Motion Maps (background)",
    expr: "arrow(30, 'red')", modal: 0 },
  { id: "1wr8-a5OXAPit3g-FIEetp89EM2awnIhh", name: "Physics: U2 - Graphing Motion (background)",
    expr: "scene", modal: 0 },
  { id: "1HobVmJK7J6pt_wxX645PKrwYNztQqrw9", name: "Physics: U2 - Simulating Multiple Objects v2 (background)",
    expr: "draw-background(10)", modal: 0 },
  { id: "1-Ybj6HFxsxbtbSyOtQE9ZXEV9rv2pUDM", name: "Physics: red ball",
    expr: "background", modal: 0 },
  { id: "1sdn1D9iX53RnQcSzT2k5S93-2pvSAsD3", name: "Physics: U2 - Simulating Multiple Objects v1 (background)",
    expr: "arrow(30, 'red')", modal: 0 },
  { id: "1W_wL0_t0rW1iGu93GPNzZcWThuliAFgi", name: "Physics: U2 - Buggy Collision (background)",
    expr: "textbox('hi', 30)", modal: 0 },
  { id: "1qKcIbXYF25NDChjxphfuNkzjOQMpvcQK", name: "Physics: U2 - Buggy Simulation w/ Data (background)",
    expr: "make-lane('fast')", modal: 0 },
  { id: "1JlU9qgGZfKFf-mJfyXQZEcUWuKtdPiCI", name: "Physics: CV-Bus simulation with 2-argument next-v background",
    expr: "scene", modal: 0 },
  { id: "1EKgjjuqO2fhjjnf5HCLAXcsHh0jtOxVF", name: "Physics: CV-Constant-Velocity-Simulation-Motion-background",
    expr: "background", modal: 0 },
  
  { id: "1EJksH-tQwo6iaRVur_-V3aAeycJ0vQ4S", name: "Physics: self-driving.arr",
    expr: "scaled", modal: 0 },
  { id: "1d4_l0-B_14O3btts0zz--GHBbuQIvdze", name: "Physics: U3 - Miniature Golf (background)",
    expr: "background", modal: 0 },
  { id: "1k9A5nBBkaKOPsCUp2Fh_a0IeM5HuJHqK", name: "Physics: Feather Fall (background)",
    expr: "FILMSTRIP", modal: 0 },
  { id: "1MBR3E8YY6VkHNq7a-5Z0FsVmlRjj-8ti", name: "Physics: U3-EarthMoonMars",
    expr: "BACKGROUND2", modal: 0 },
  { id: "1cRItCh_3OIxaCPnhsf-Cwz1kqZtLDeSJ", name: "Physics: U3 - Activity 3 (background)",
    expr: "background", modal: 0 },

  { id: "1KVlk8TieAQgTXzC_XRVEhjVz1PijldZ3", name: "Physics: air-hockey-3",
    expr: "Back", modal: 0 },
  { id: "1DzB-KbgWFa20WzB0GDoC6phRItRHIye_", name: "Physics: U4 - Ball Sand Fan (background)",
    expr: "allfansand", modal: 0 },
  { id: "1cgCpS58z1OgEqR_UEWWrm-ohvu8v4wjU", name: "Physics: U4 - Millikan Oil Drop (background)",
    expr: "F-ELEC(130, 5)", modal: 0 },
  
  { id: "1BuOf73aJDcsGGEUnIr5jL5BFAfRHlSLU", name: "Physics: U5 - Falling Coffee Filters (background)",
    expr: "filters", modal: 0 },
  { id: "1T8qpHcLveHYNW2US0tni3YKwQE8sDuJZ", name: "Physics: U5 - Activity 5 (background)",
    expr: "parachute-drag(2)", modal: 0 },
  { id: "1kWQC3w96MVt8kqPIDJAVTmvn8d6clnPj", name: "Physics: U5 - Activity 5b (background)",
    expr: "car-with-chute", modal: 0 },

  { id: "1TApd4-p6BVtDwrgUV4DO8Gt7Yjg70ooT", name: "Physics: Rocket!",
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
      tester.waitForEditorContent(this.browser);
      tester.evalDefinitions(self.browser, {});
      for(var i = 0; i < share.modal; i += 1) {
        tester.waitForWorldProgram(self.browser, timeout, 5000);
      }
      this.browser.sleep(1000);
      this.browser.call(function() { return tester.evalPyretNoError(self.browser, share.expr); });
      this.browser.call(done);
    });
  });
});
