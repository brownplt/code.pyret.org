var assert = require("assert");
var tester = require("../test-util/util.js");
var webdriver = require("selenium-webdriver");

describe("Embedding API", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  it("should get a pyret-init event on startup", function(done) {
    this.timeout(80000);
    var self = this;
    this.browser.get(this.base + "/embed/embed1.html");
    this.browser.wait(function() {
      return self.browser.executeScript(`
        const initmessage = window.messages.filter(m => m.data.protocol === 'pyret' && m.data.data.type === 'pyret-init');
        return initmessage.length === 1;
      `);
    });
    this.browser.call(done);
  });
});
