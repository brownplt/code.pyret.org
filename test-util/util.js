var assert = require("assert");
var webdriver = require("selenium-webdriver");
var fs = require("fs");
var Q = require("q");
const chromedriver = require('chromedriver');

let PATH_TO_CHROME;
// Used by Travis
if (process.env.GOOGLE_CHROME_BINARY) {
  PATH_TO_CHROME = process.env.GOOGLE_CHROME_BINARY;
}
else {
  console.log("The tester is guessing that you're on a Mac :-) You can set GOOGLE_CHROME_BINARY to the path to your Chrome install if this path isn't for your machine work");
  PATH_TO_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

let args = process.env.SHOW_BROWSER ? [] : [
  '--headless',
];
if(!process.env.SHOW_BROWSER) {
  console.log("Running Chrome headless. You can set SHOW_BROWSER=true to see what's going on");
}

// Working from https://developers.google.com/web/updates/2017/04/headless-chrome#drivers
const chromeCapabilities = webdriver.Capabilities.chrome();
chromeCapabilities.set('chromeOptions', {
  binary: PATH_TO_CHROME,
  'args': args
});


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
  this.base = process.env.BASE_URL;
  this.browser = new webdriver.Builder()
  .forBrowser("chrome")
  .withCapabilities(chromeCapabilities).build();

  this.browser.manage().window().maximize();

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

function evalDefinitions(driver, toEval, options) {
  // http://stackoverflow.com/a/1145525 
  var escaped = escape(toEval);
  driver.executeScript("$(\".CodeMirror\")[0].CodeMirror.setValue(unescape(\""+ escaped + "\"));");
  if(options && options.typeCheck) {
    driver.findElement(webdriver.By.id("runDropdown")).click();
    driver.findElement(webdriver.By.id("select-tc-run")).click();
  }
  else {
    driver.findElement(webdriver.By.id("runButton")).click();
  }
}

function evalPyretDefinitionsAndWait(driver, toEval, options) {
  evalDefinitions(driver, toEval, options);
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
              return resps[0][0]
                .findElement(webdriver.By.xpath("//tbody/tr[" + row + "]"
                                                + "/td[" + col + "]/span"))
                .then(function(tableRender) {
                  return P.all([tableRender.getOuterHtml(), resps[1][0].getOuterHtml()]);
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
  checkAllTestsPassed(driver, test.title, timeout);
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
  checkAllTestsPassed(driver, test.title, timeout);
}

function runAndCheckAllTestsPassed(code, driver, test, timeout) {
  loadAndRunPyret(code, driver, timeout);
  checkAllTestsPassed(driver, test.title, timeout);
}

function checkAllTestsPassed(driver, name, timeout) {
  var replOutput = driver.findElement(webdriver.By.id("output"));
  driver.wait(function() {
    return replOutput.isElementPresent(webdriver.By.className("testing-summary"));
  }, timeout);
  var checkBlocks = replOutput.then(function(response) {
    driver.wait(function () {
      return driver.isElementPresent(webdriver.By.className("check-results-done-rendering"));
    }, 20000);
    return response.findElements(webdriver.By.className("check-block-result"));
  });
  return checkBlocks.then(function(cbs) {
    return replOutput.findElements(contains("Looks shipshape")).then(function(shipshapes) {
      if(shipshapes.length >= 1) { return true; }
      // If no shipshape element, report the failure
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
      return blocksAsSpec.then(function(spec) {
        return screenshot(driver, "test-util/failed-test-screenshots/" + name + ".png").then(function() {
          throw new Error("Expected all tests to pass, but got: " + JSON.stringify(spec));
        });
      });
    });
  });
}

// http://stackoverflow.com/a/16882197
function screenshot(driver, saveAs) {
  return driver.takeScreenshot().then(function(data){
     var base64Data = data.replace(/^data:image\/png;base64,/,"")
     fs.writeFile(saveAs, base64Data, 'base64', function(err) {
          if(err) console.log(err);
     });
     return;
  });
}

function doForEachPyretFile(it, name, base, testFun, baseTimeout) {
  var tests = fs.readdirSync(base).filter(function(p) {
    return p.indexOf(".arr") === (p.length - 4);
  });
  tests.forEach(function(program) {
    it("should run " + name + " programs from " + program, function(done) {
      var self = this;
      self.browser.get(self.base + "/editor");
      self.timeout(tests.length * (baseTimeout || 40000));
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
      throw new Error("Failed to run Pyret code, no elements after executing: " + toEval);
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

        if (!(clss === "echo-container" || clss === "trace")) {
          throw new Error("Failed to run Pyret code: " + toEval);
        } else {
          return element.findElements(webdriver.By.className("replOutput"));
        }
      });
  });
}

function testRunAndUseRepl(it, name, toEval, toRepl, options) {
  it("should evaluate definitions and see the effects at the repl for " + name, function() {
    this.timeout(15000);
    var self = this;
    var replOutput = self.browser.findElement(webdriver.By.id("output"));
    evalPyretDefinitionsAndWait(self.browser, toEval, options);
    var replResults = Q.all(toRepl.map(function(tr) {
      return evalPyretNoError(self.browser, tr[0]).then(function(elts) {
        if(elts.length === 0 && tr[1] === "") {
          return true;
        }
        else {
          return elts[0].getText().then(function(t) {
            if(t.indexOf(tr[1]) !== -1) { return true; }
            else {
              throw new Error("Expected repl text content " + tr[1] + " not contained in output " + t + " for repl entry " + tr[0]);
            }
          });
        }
      });
    }));
    return replResults;
  });
}

function testRunAndAllTestsPass(it, name, toEval, options) {
  it("should pass regression equality for " + name, function() {
    this.timeout(15000);
    var self = this;
    var replOutput = self.browser.findElement(webdriver.By.id("output"));
    evalPyretDefinitionsAndWait(this.browser, toEval, options);
    return checkAllTestsPassed(self.browser, name, 20000);
  });
}

function testErrorRendersString(it, name, toEval, expectedString, options) {
  it("should render " + name + " errors", function() {
    this.timeout(15000);
    var self = this;
    var replOutput = self.browser.findElement(webdriver.By.id("output"));
    return evalPyretDefinitionsAndWait(this.browser, toEval, options).then(function(response) {
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
function testRunsAndHasCheckBlocks(it, name, toEval, specs, options) {
  it("should render " + name + " check blocks", function() {
    var self = this;
    this.timeout(20000);
    var replOutput = evalPyretDefinitionsAndWait(this.browser, toEval, options);
    var checkBlocks = replOutput.then(function(response) {
      self.browser.wait(function () {
        return self.browser.isElementPresent(webdriver.By.className("check-results-done-rendering"));
      }, 20000);
      return response.findElements(webdriver.By.className("check-block"));
    });
    var blocksAsSpec = checkBlocks.then(function(cbs) {
      var tests = cbs.slice(1).map(function(cb, i) {
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
  loadAndRunPyret: loadAndRunPyret,
  testErrorRendersString: testErrorRendersString,
  testRunsAndHasCheckBlocks: testRunsAndHasCheckBlocks,
  testRunAndAllTestsPass: testRunAndAllTestsPass,
  testRunAndUseRepl: testRunAndUseRepl,
  setup: setup,
  setupMulti: setupMulti,
  teardown: teardown,
  teardownMulti: teardownMulti,
  runAndCheckAllTestsPassed: runAndCheckAllTestsPassed,
  checkTableRendersCorrectly: checkTableRendersCorrectly,
  checkWorldProgramRunsCleanly: checkWorldProgramRunsCleanly,
  doForEachPyretFile: doForEachPyretFile
}
