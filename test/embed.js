var assert = require("assert");
var tester = require("../test-util/util.js");
var webdriver = require("selenium-webdriver");

describe("Embedding API", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  function waitForInit(browser) {
    browser.wait(function() {
      return browser.executeScript(`
        const initmessage = window.messages.filter(m => m.data.protocol === 'pyret' && m.data.data.type === 'pyret-init');
        return initmessage.length === 1;
      `);
    });
  }
  
  it("should get a pyret-init event on startup", function(done) {
    this.timeout(80000);
    var self = this;
    this.browser.get(this.base + "/embed/embed1.html");
    waitForInit(this.browser);
    this.browser.call(done);
  });
  
  it("should have definitions set after a simple reset", function(done) {
    this.timeout(80000);
    var self = this;
    this.browser.get(this.base + "/embed/embed1.html");
    waitForInit(this.browser);
    this.browser.executeScript(`
      window.embedAPI.sendReset({
        definitionsAtLastRun: false,
        editorContents: "use context starter2024\\n\\nx = 'simple reset test'",
        replContents: "",
        interactionsSinceLastRun: []
      })
      `)
    this.browser.switchTo().frame('embed1');
    this.browser.wait(function() {
      return self.browser.executeScript(`
        return $(".CodeMirror")[0].CodeMirror.getValue().includes("simple reset test")
      `);
    });
    this.browser.call(done);
  });

});
