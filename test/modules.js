var tester = require("../test-util/util.js");

describe("Running Module programs", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  var moduleTestsBase = "./test-util/pyret-programs/modules/";
  tester.doForEachPyretFile(it, "module", moduleTestsBase, function(programText, testObj) {
    programText = programText.replace("BASE_URL", "\"" + process.env["BASE_URL"] + "\"");
    tester.runAndCheckAllTestsPassed(programText, testObj.browser, testObj.test, 900000);
  }, 900000);

});

