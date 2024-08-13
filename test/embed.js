var assert = require("assert");
var tester = require("../test-util/util.js");
var webdriver = require("selenium-webdriver");

describe("Embedding API Basics – Single embedded instance", function() {
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
    this.timeout(6000);
    var self = this;
    this.browser.get(this.base + "/embed/embed1.html?" + this.base);
    waitForInit(this.browser);
    this.browser.call(done);
  });
  
  it("should have definitions set after a simple reset", function(done) {
    this.timeout(6000);
    var self = this;
    this.browser.get(this.base + "/embed/embed1.html?" + this.base);
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

describe("Embedding API – Two instances", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  function waitForInit(browser) {
    browser.wait(function() {
      // NOTE(joe): wait for two inits because embedding 2 instances
      return browser.executeScript(`
        const initmessage = window.messages.filter(m => m.data.protocol === 'pyret' && m.data.data.type === 'pyret-init');
        return initmessage.length === 2;
      `);
    });
  }
  function basicReset(browser, whichFrame) {
    browser.executeScript(`
      window.${whichFrame}API.sendReset({
        definitionsAtLastRun: false,
        editorContents: "use context starter2024\\n\\n",
        replContents: "",
        interactionsSinceLastRun: []
      })
      `);
  }
  
  it("should get a pyret-init event from each frame on startup", function(done) {
    this.timeout(6000);
    var self = this;
    this.browser.get(this.base + "/embed/embed2.html?" + this.base);
    waitForInit(this.browser);
    this.browser.call(done);
  });
  
  it("should propagate definitions changes across", function(done) {
    this.timeout(6000);
    var self = this;
    this.browser.get(this.base + "/embed/embed2.html?" + this.base);
    waitForInit(this.browser);
    basicReset(this.browser, 'frame1');
    basicReset(this.browser, 'frame2');
    
    
    this.browser.switchTo().frame('embed1');
    this.browser.executeScript(`
      const CM = $(".CodeMirror")[0].CodeMirror;
      CM.replaceRange(
        "x = 100\\n",
        {line: 2, ch: 0},
        null
      );
      `);
    this.browser.switchTo().defaultContent();
    this.browser.switchTo().frame('embed2');
    this.browser.wait(function() {
      return self.browser.executeScript(`
        return $(".CodeMirror")[0].CodeMirror.getValue().includes("x = 100");
      `);
    });
    this.browser.call(done);
  });
});
