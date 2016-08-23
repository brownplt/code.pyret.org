var tester = require("../test-util/util.js");

describe("Running Google Sheets programs", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  var sheetsTestsBase = "./test-util/pyret-programs/sheets/";
  tester.doForEachPyretFile(it, "sheets", sheetsTestsBase, function(programText, testObj) {
    tester.runAndCheckAllTestsPassed(programText, testObj.browser, testObj.test, 900000);
  }, 900000);
});
