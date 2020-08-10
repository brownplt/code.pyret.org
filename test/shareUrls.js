var assert = require("assert");
var tester = require("../test-util/util.js");

const shareIds = [
  { name: "Data Science 1.5", id: "1Z8ncVGKqWiED_wHl8TlNF3D9AGBb7awm" }
];

describe("Load share urls for known starter files", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

/*
  it("should load the index", function(done) {
    this.timeout(10000);
    this.browser.get(this.base);
    var headline = this.browser.findElement(webdriver.By.id('right'));
    this.browser.call(done);
  });
*/

  shareIds.forEach(function(shareId) {
    it("should load the shared file at " + shareId.id + " (" + shareId.name + ")", function(done) {
      this.timeout(20000);
      var self = this;
      this.browser.get(this.base + "/editor#share=" + shareId.id);
      this.browser.wait(function() { return tester.pyretLoaded(self.browser); });
      this.browser.wait(function() { return tester.evalDefinitionsAndWait(self.browser); });
      this.browser.wait(function() { return tester.evalPyretNoError(self.browser, "link"); });
      this.browser.sleep(10000);
      this.browser.call(done);
    });
  });
});
