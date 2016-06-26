var tester = require("../test-util/util.js");

describe("Rendering errors", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  tester.testErrorRendersString(it, "field-not-found", "{}.x", "field")
  tester.testErrorRendersString(it, "non-obj-lookup", "5.x", "object")
  tester.testErrorRendersString(it, "constructor-lookup", "data D: d() end\n d.x", "constructor")

});
