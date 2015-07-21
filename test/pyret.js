var tester = require("../test-util/util.js");

describe("Running Image programs", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  var imageTestsBase = "./test-util/pyret-programs/images/";
  tester.doForEachPyretFile(it, "image", imageTestsBase, function(programText, testObj) {
    tester.runAndCheckAllTestsPassed(programText, testObj.browser, testObj.test, 300000);
  }, 300000);

});

