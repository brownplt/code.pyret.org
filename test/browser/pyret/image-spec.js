_ = require("jasmine-node");
var tester = require("./../../selenium-init.js");
var webdriver = require('selenium-webdriver');

var contains = tester.contains;
var waitThenClick = tester.waitThenClick;
var loadAndRunPyret = tester.loadAndRunPyret;

describe("Running Pyret programs", function() {
      tester.start("Images", function(maybeServer, baseUrl, driver) {

        tester.webbit("should run a simple image program", function(done) {
          console.log("About to get " + baseUrl + "/editor");
          driver.get(baseUrl + "/editor");
          console.log("Registering Pyret run command");
          loadAndRunPyret(
"include image\n" +
"check:\n" +
"  circle(50, 'solid', 'red') is circle(50, 'solid', 'red')\n" +
"end\n",
           driver, 60000);
         driver.wait(function() {
          console.log("Waiting for test to complete.");
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

