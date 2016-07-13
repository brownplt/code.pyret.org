var assert = require("assert");
var webdriver = require("selenium-webdriver");
var fs = require("fs");
var Q = require("q");

function teardown() {
  if(!(this.currentTest.state === 'failed')) {
    return this.browser.quit();
  }
}

function teardownMulti() {
  return this.browser.quit();
}

function setupWithName(name) {
  if(this.currentTest) { name = this.currentTest.title; }
  var browser = process.env.SAUCE_BROWSER || "chrome";
  if (process.env.TRAVIS_JOB_NUMBER != undefined) {
    this.base = process.env.SAUCE_TEST_TARGET;
    this.browser = new webdriver.Builder()
    .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
    .withCapabilities({
      name: name,
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

function setup() {
  setupWithName.call(this, undefined)
}

function setupMulti(name) {
  return function() {
    setupWithName.call(this, name);
    this.browser.get(this.base + "/editor");
    this.timeout(20000);
    return waitForPyretLoad(this.browser);
  }
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

function evalDefinitions(driver, toEval) {
  // http://stackoverflow.com/a/1145525 
  var escaped = escape(toEval);
  driver.executeScript("$(\".CodeMirror\")[0].CodeMirror.setValue(unescape(\""+ escaped + "\"));");
  driver.findElement(webdriver.By.id("runButton")).click();
}

function evalPyretDefinitionsAndWait(driver, toEval) {
  evalDefinitions(driver, toEval);
  var breakButton = driver.findElement(webdriver.By.id('breakButton'));
  driver.wait(webdriver.until.elementIsDisabled(breakButton));
  return driver.findElement(webdriver.By.id("output"));
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
            var evaled = P.all([evalPyretNoError(driver, tbl),
                                evalPyretNoError(driver, val)]);
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

function loadAndRunPyret(code, driver, timeout) {
  waitForPyretLoad(driver, timeout);
  evalDefinitions(driver, code);
}

function checkWorldProgramRunsCleanly(code, driver, test, timeout) {
  loadAndRunPyret(code, driver, timeout);
  driver.wait(function() {
    return driver
      .findElements(webdriver.By.className("ui-dialog-title")).then(
        function(elements) { return elements.length > 0; });
  }, timeout);
  driver.sleep(5000); // make sure the big-bang can run for 5 seconds
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
    return replOutput.isElementPresent(webdriver.By.className("testing-summary"));
  }, timeout);
  return replOutput.findElement(contains("Looks shipshape"));
}

function doForEachPyretFile(it, name, base, testFun, baseTimeout) {
  var tests = fs.readdirSync(base).filter(function(p) {
    return p.indexOf(".arr") === (p.length - 4);
  });
  tests.forEach(function(program) {
    it("should run " + name + " programs from " + program, function(done) {
      var self = this;
      self.browser.get(self.base + "/editor");
      self.timeout(tests.length * (baseTimeout || 30000));
      var programText = String(fs.readFileSync(base + program));
      testFun(programText, self);
      self.browser.call(done);
    });
  })
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
      return elements[elements.length - 1];
    }
  });
}

function evalPyretNoError(driver, toEval) {
  return evalPyret(driver, toEval).then(function(element) {
    return webdriver.promise
      .all([element.getTagName(), element.getAttribute('class')])
      .then(function(resp) {
        var name = resp[0];
        var clss = resp[1];

        if ((name != 'div') || (clss != 'trace')) {
          throw new Error("Failed to run Pyret code: " + toEval);
        } else {
          return element.findElement(webdriver.By.className("replOutput"));
        }
      });
  });
}

function testErrorRendersString(it, name, toEval, expectedString) {
  it("should render " + name + " errors", function() {
    this.timeout(15000);
    var self = this;
    var replOutput = self.browser.findElement(webdriver.By.id("output"));
    return evalPyretDefinitionsAndWait(this.browser, toEval).then(function(response) {
      self.browser.wait(function () {
        return replOutput.isElementPresent(webdriver.By.className("compile-error"));
      }, 6000);
      return response.getText().then(function(text) {
        if(text.indexOf(expectedString) !== -1) {
          return true;
        }
        else {
          throw new Error("Text content of error \"" + text + "\" did not match \"" + expectedString + "\"");
        }
      });
    });
  });
}

/*
  specs: an Array<Array<Array<String>>>:

    There should be a number of check blocks equal to the outer array, each
    with a number of test results equal to the inner array, each containing
    all of the given strings as substrings of the output.
*/
function testRunsAndHasCheckBlocks(it, name, toEval, specs) {
  it("should render " + name + " check blocks", function() {
    var self = this;
    this.timeout(20000);
    var replOutput = evalPyretDefinitionsAndWait(this.browser, toEval);
    var checkBlocks = replOutput.then(function(response) {
      self.browser.wait(function () {
        return self.browser.isElementPresent(webdriver.By.className("check-results-done-rendering"));
      }, 20000);
      return response.findElements(webdriver.By.className("check-block-result"));
    });
    var blocksAsSpec = checkBlocks.then(function(cbs) {
      var tests = cbs.map(function(cb, i) {
        return cb.findElement(webdriver.By.className("check-block-header")).click().then(function(_) {
          return cb.findElements(webdriver.By.className("check-block-test")).then(function(tests) {
            return tests.length === 0
              ? Q.all(Array(specs[i].length).fill("Passed"))
              : Q.all(tests.map(function(t) { return t.getText(); }));
          });
        });
      });
      return Q.all(tests);
    });
    return blocksAsSpec.then(function(blocks) {
      var expectedBlocks = specs.length;
      if(expectedBlocks !== blocks.length) {
        throw new Error("Expected to see output for " + expectedBlocks + " check blocks, but saw " + blocks.length);
      }
      blocks.forEach(function(b, i) {
        var expectedTests = specs[i].length;
        if(b.length !== expectedTests) {
          throw new Error("Expected to see output for " + expectedTests + " tests within check block at index " + i + ", but saw " + b.length);
        }
        b.forEach(function(text, j) {
          specs[i][j].forEach(function(testMustContain) {
            if(text.indexOf(testMustContain) === -1) {
              throw new Error("Text content of error \"" + text + "\" did not contain \"" + testMustContain + "\"");
            }
          });
        });
      });
      return true;
    });
  });
}

module.exports = {
  pyretLoaded: pyretLoaded,
  waitForPyretLoad: waitForPyretLoad,
  evalPyret: evalPyret,
  testErrorRendersString: testErrorRendersString,
  testRunsAndHasCheckBlocks: testRunsAndHasCheckBlocks,
  setup: setup,
  setupMulti: setupMulti,
  teardown: teardown,
  teardownMulti: teardownMulti,
  runAndCheckAllTestsPassed: runAndCheckAllTestsPassed,
  checkTableRendersCorrectly: checkTableRendersCorrectly,
  checkWorldProgramRunsCleanly: checkWorldProgramRunsCleanly,
  doForEachPyretFile: doForEachPyretFile
}
