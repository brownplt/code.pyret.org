var assert = require("assert");
var tester = require("../test-util/util.js");
var webdriver = require("selenium-webdriver");

describe("Numbers at the REPL", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  it("should render toggle-able numbers", function(done) {
    this.timeout(80000);
    var self = this;
    this.browser.get(this.base + "/editor");
    this.browser.wait(function() { return tester.pyretLoaded(self.browser); });
    tester.evalPyret(this.browser, "1/7");
    this.browser.wait(function() {
        return self.browser.findElements(webdriver.By.className("rationalRepeat")).then((els) => els.length > 0);
    });
    this.browser.findElements(webdriver.By.className("rationalRepeat")).then(function(elements) {
        elements[0].getAttribute("innerText").then(function(text) {
            assert.equal(text, "142857");
        });
    });
    this.browser.call(done);

  });
});
