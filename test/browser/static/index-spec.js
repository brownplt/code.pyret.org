_ = require("jasmine-node");
var tester = require("./../../selenium-init.js");
var webdriver = require('selenium-webdriver');

var contains = tester.contains;
var waitThenClick = tester.waitThenClick;

describe("Loading pages", function() {
      tester.start("Loading pages", function(maybeServer, baseUrl, driver) {

        function loadPage(url, pred) {
          tester.webbit("should load " + url, function(done) {
            console.log("Trying to load " + url + " with driver");
            driver.get(url);
            driver.wait(function() {
              console.log("Waiting...");
              return pred;
            }, 40000);
            driver.call(function() { 
              console.log("Success");
              done();
            });
          }, 60000);
        }

        loadPage(baseUrl, function() {
          driver.isElementPresent(tester.contains("Start Coding"));
        });

        loadPage(baseUrl + "/editor", function() {
          return tester.pyretLoaded(driver);
        });

        it("should close the server and the connection to the browser", function(done) {
          console.log("closing down server");
          if(maybeServer) { maybeServer.close(); }
          driver.quit();
          done();
        });
      });
});

