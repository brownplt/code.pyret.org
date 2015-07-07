var assert = require("assert");
var webdriver = require("selenium-webdriver");

describe("testing javascript in the browser", function() {
  beforeEach(function() {
    if (process.env.SAUCE_USERNAME != undefined) {
      this.browser = new webdriver.Builder()
      .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities({
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        browserName: "chrome"
      }).build();
    } else {
      this.browser = new webdriver.Builder()
      .withCapabilities({
        browserName: "chrome"
      }).build();
    }

    return this.browser.get("http://localhost:8000/page/index.html");
  });

  afterEach(function() {
    return this.browser.quit();
  });

  it("should handle clicking on a headline", function(done) {
    var headline = this.browser.findElement(webdriver.By.id('right'));

    headline.click();

    headline.getText().then(function(txt) {
      assert.equal(txt, "awesome");
      done();
    });
  });
});
