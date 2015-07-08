var assert = require("assert");
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

function contains(str) {
  return webdriver.By.xpath("//*[contains(text(), '" + str + "')]")
}

function pyretLoaded(driver) {
  return driver.findElement(webdriver.By.id("loader")).getCssValue("display")
    .then(function(d) {
      return d === "none";
    });
}

function waitForPyretLoad(driver, timeout) {
  return driver.wait(function() { return pyretLoaded(driver); }, timeout);
}

function loadAndRunPyret(code, driver, timeout) {
  waitForPyretLoad(driver, timeout);
  // http://stackoverflow.com/a/1145525 
  var escaped = code.split("\n").join("\\n");
  driver.executeScript("$(\".CodeMirror\")[0].CodeMirror.setValue(\""+ escaped + "\");");
  driver.findElement(webdriver.By.id("runButton")).click();
}

function checkAllTestsPassed(code, driver, test, timeout) {
  loadAndRunPyret(code, driver, timeout);
  var replOutput = driver.findElement(webdriver.By.id("output"));
  driver.wait(function() {
    return replOutput.findElements(webdriver.By.xpath("*")).then(function(elements) {
      return elements.length > 0;
    });
  }, timeout);
  var outputElements = replOutput.findElements(webdriver.By.xpath("*"));
  outputElements.then(function(elements) {
    elements[0].getAttribute("class").then(function(cls) {
      if(cls.indexOf("error") !== -1) {
        elements[0].getInnerHtml().then(function(str) {
          driver.session_.then(function(s) {
            var message = "See https://saucelabs.com/jobs/" + s.id_ + "\n\n" + str;
            assert.equal("An error occurred", message);
          });
        });
      }
      else {
        return replOutput.findElement(contains("Looks shipshape"));
      }
    });
  });
}

module.exports = {
  pyretLoaded: pyretLoaded,
  waitForPyretLoad: waitForPyretLoad,
  setup: setup,
  teardown: teardown,
  checkAllTestsPassed: checkAllTestsPassed
}
