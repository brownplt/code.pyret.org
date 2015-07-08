var assert = require("assert");
var tester = require("../test-util/util.js");
var webdriver = require("selenium-webdriver");

describe("testing javascript in the browser", function() {
  before(tester.setup);
  after(tester.teardown);

  it("should load the index page", function(done) {
    this.timeout(10000);
    this.browser.get(this.base);
    var headline = this.browser.findElement(webdriver.By.id('right'));
    this.browser.call(done);
  });

  it("should load the editor", function(done) {
    this.timeout(60000);
    var self = this;
    this.browser.get(this.base + "/editor");
    this.browser.wait(function() { return tester.pyretLoaded(self.browser); });
    this.browser.call(done);
  });
});
