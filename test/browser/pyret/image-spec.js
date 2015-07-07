_ = require("jasmine-node");
var tester = require("./../../selenium-init.js");
var webdriver = require('selenium-webdriver');

var contains = tester.contains;
var waitThenClick = tester.waitThenClick;
var loadAndRunPyret = tester.loadAndRunPyret;

describe("Running Pyret programs", function() {
      tester.start("Images", function(maybeServer, baseUrl, driver) {

        tester.webbit("should run a simple image program", function(done) {
          driver.get(baseUrl + "/editor");
          loadAndRunPyret(
"include image\n" +
"check:\n" +
"  circle(50, 'solid', 'red') is circle(50, 'solid', 'red')\n" +
"end\n",
           driver, 60000);
         driver.wait(function() {
          return driver.isElementPresent(tester.contains("Looks shipshape"));
         }, 40000);
         driver.call(done);
        }, 120000);

        it("should close the server and the connection to the browser", function(done) {
          console.log("closing down server");
          if(maybeServer) { maybeServer.close(); }
          driver.quit();
          done();
        });
      });
});

