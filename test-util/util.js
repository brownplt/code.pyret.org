var assert = require("assert");
var webdriver = require("selenium-webdriver");
var fs = require("fs");

function teardown() {
  if(!(this.currentTest.state === 'failed')) {
    return this.browser.quit();
  }
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
      tags: [process.env.TRAVIS_BRANCH, browser, "travis"],
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
  var escaped = escape(code);
  driver.executeScript("$(\".CodeMirror\")[0].CodeMirror.setValue(unescape(\""+ escaped + "\"));");
  driver.findElement(webdriver.By.id("runButton")).click();
}


function evalPyret(driver, toEval) {
  var replOutput = driver.findElement(webdriver.By.id("output"));
  var breakButton = driver.findElement(webdriver.By.id('breakButton'));
  var escaped = escape(toEval);
  driver.executeScript([
    "(function(cm){",
    "cm.setValue(unescape(\"" + escaped + "\"));",
    "cm.options.extraKeys.Enter(cm);",
    "})",
    "($(\".repl-prompt > .CodeMirror\")[0].CodeMirror)"
  ].join(""));
  driver.wait(webdriver.until.elementIsDisabled(breakButton));
  return replOutput.findElements(webdriver.By.xpath("*")).then(function(elements) {
    if (elements.length === 0) {
      throw new Error("Failed to run Pyret code: " + toEval);
    } else {
      return elements[elements.length - 1].getTagName().then(function(name) {
        if (name != 'span') {
          throw new Error("Failed to run Pyret code: " + toEval);
        } else {
          return elements[elements.length - 1];
        }
      });
    }
  });
}

function checkTableRendersCorrectly(code, driver, test, timeout) {
  loadAndRunPyret(code, driver, timeout);
  var replOutput = driver.findElement(webdriver.By.id("output"));
  // Wait until finished running
  driver.wait(function() {
    return replOutput.findElements(webdriver.By.xpath("*")).then(function(elements) {
      return elements.length > 0;
    });
  }, timeout);
  var maybeTest = replOutput.findElements(webdriver.By.xpath('pre'));
  return maybeTest.then(function(elements) {
    if (elements.length > 0) {
      elements[0].getInnerHtml()
        .then(function(testsStr) {
          try {
            return JSON.parse(testsStr);
          } catch (e) {
            if (e instanceof SyntaxError) {
              throw new Error("Failed to parse tables tests");
            } else {
              throw e;
            }
          }
        })
        .then(function(tests) {
          var replResults = replOutput.findElements(webdriver.By.xpath('span'));
          tests.forEach(function(test) {
            var tbl = test.table,
                row = test.row,
                col = test.col,
                val = test.val;
            var P = webdriver.promise;
            var evaled = P.all([evalPyret(driver, tbl),
                                evalPyret(driver, val)]);
            evaled.then(function(resps) {
              return resps[0]
                .findElement(webdriver.By.xpath("//tbody/tr[" + row + "]"
                                                + "/td[" + col + "]/span"))
                .then(function(tableRender) {
                  return P.all([tableRender.getOuterHtml(), resps[1].getOuterHtml()]);
                });
              })
              .then(function(rendered) {
                assert.equal(rendered[0], rendered[1],
                             "Table renders example " + val + " correctly");
              });
          });
        });
    } else {
      throw new Error("No tables tests found");
    }
  });
  checkAllTestsPassed(driver, test, timeout);
}

function checkWorldProgramRunsCleanly(code, driver, test, timeout) {
  loadAndRunPyret(code, driver, timeout);
  driver.wait(function() {
    return driver
      .findElements(webdriver.By.className("ui-dialog-title")).then(
        function(elements) { return elements.length > 0; });
  }, timeout);
  driver.sleep(5); // make sure the big-bang can run for 5 seconds
  driver.findElement(webdriver.By.className("ui-icon-closethick"))
    .click();
  checkAllTestsPassed(driver, test, timeout);
}

function runAndCheckAllTestsPassed(code, driver, test, timeout) {
  loadAndRunPyret(code, driver, timeout);
  checkAllTestsPassed(driver, test, timeout);
}

function checkAllTestsPassed(driver, test, timeout) {
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

function doForEachPyretFile(it, name, base, testFun, baseTimeout) {
  it("should run " + name + " programs", function(done) {
    var self = this;
    self.browser.get(self.base + "/editor");
    var tests = fs.readdirSync(base).filter(function(p) {
      return p.indexOf(".arr") === (p.length - 4);
    });
    self.timeout(tests.length * (baseTimeout || 30000));
    tests.forEach(function(program) {
      var programText = String(fs.readFileSync(base + program));
      testFun(programText, self);
    });
    self.browser.call(done);
  });
}


module.exports = {
  pyretLoaded: pyretLoaded,
  waitForPyretLoad: waitForPyretLoad,
  setup: setup,
  teardown: teardown,
  runAndCheckAllTestsPassed: runAndCheckAllTestsPassed,
  checkTableRendersCorrectly: checkTableRendersCorrectly,
  checkWorldProgramRunsCleanly: checkWorldProgramRunsCleanly,
  doForEachPyretFile: doForEachPyretFile
}
