var assert = require("assert");
var webdriver = require("selenium-webdriver");
var tester = require("../test-util/util.js");

var browser = process.env.SAUCE_BROWSER || "chrome";

describe("testing javascript in the browser", function() {
  beforeEach(function() {
    if (process.env.TRAVIS_JOB_NUMBER != undefined) {
      this.base = process.env.SAUCE_TEST_TARGET;
      this.browser = new webdriver.Builder()
      .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities({
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        browserName: browser
      }).build();
    } else if(process.env.SAUCE_USERNAME !== undefined) {
      this.base = process.env.SAUCE_TEST_TARGET;
      this.browser = new webdriver.Builder()
      .usingServer('https://ondemand.saucelabs.com/wd/hub')
      .withCapabilities({
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        browserName: browser
      }).build();

    } else {
      this.base = process.env.BASE_URL;
      this.browser = new webdriver.Builder()
      .withCapabilities({
        browserName: browser
      }).build();
    }

    return;
  });

  afterEach(function() {
    return this.browser.quit();
  });


  it("should load the index page", function(done) {
    this.browser.get(this.base);
    var headline = this.browser.findElement(webdriver.By.id('right'));
    this.browser.call(done);
  });

  it("should load the editor", function(done) {
    var self = this;
    this.browser.get(this.base + "/editor");
    this.browser.wait(function() { return tester.pyretLoaded(self.browser); });
    this.browser.call(done);
  });
});
