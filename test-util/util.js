var webdriver = require("selenium-webdriver");

function teardown() {
  return this.browser.quit();
}

function setup() {
  var browser = process.env.SAUCE_BROWSER || "chrome";
  if (process.env.TRAVIS_JOB_NUMBER != undefined) {
    this.base = process.env.SAUCE_TEST_TARGET;
    this.browser = new webdriver.Builder()
    .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
    .withCapabilities({
      name: this.currentTest.title,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      build: process.env.TRAVIS_BUILD_NUMBER,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      tags: [process.env.TRAVIS_BRANCH, browser],
      customData: {
        "browser": browser,
        "commit": process.env.TRAVIS_COMMIT,
        "commit-range": process.env.TRAVIS_COMMIT_RANGE,
        "branch": process.env.TRAVIS_BRANCH,
      },
      browserName: browser
    }).build();
  } else if(process.env.SAUCE_USERNAME !== undefined) {
    this.base = process.env.SAUCE_TEST_TARGET;
    this.browser = new webdriver.Builder()
    .usingServer('https://ondemand.saucelabs.com/wd/hub')
    .withCapabilities({
      name: this.currentTest.title,
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
}

function pyretLoaded(driver) {
  return driver.findElement(webdriver.By.id("loader")).getCssValue("display")
    .then(function(d) {
      return d === "none";
    });
}

module.exports = {
  pyretLoaded: pyretLoaded,
  setup: setup,
  teardown: teardown
}
