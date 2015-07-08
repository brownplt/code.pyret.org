var assert = require("assert");
var tester = require("../test-util/util.js");
var webdriver = require("selenium-webdriver");
var fs = require("fs");

describe("Running Pyret programs", function() {
  beforeEach(tester.setup);
  afterEach(tester.teardown);

  var testsBase = "./test-util/pyret-programs/images/";

  it("should run image programs", function(done) {
    var self = this;
    self.browser.get(self.base + "/editor");
    var tests = fs.readdirSync(testsBase).filter(function(p) {
      return p.indexOf(".arr") === (p.length - 4);
    });
    self.timeout(tests.length * 30000);
    tests.forEach(function(program) {
      var programText = String(fs.readFileSync(testsBase + program));
      tester.checkAllTestsPassed(programText, self.browser, self.test, 60000);
    });
    self.browser.call(done);
  });
});

