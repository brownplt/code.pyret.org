_ = require("jasmine-node");
var tester = require("./../../selenium-init.js");
var webdriver = require('selenium-webdriver');

var contains = tester.contains;
var waitThenClick = tester.waitThenClick;
var googleLogin = tester.googleLogin;
var googleLogout = tester.googleLogout;

describe("Saving programs", function() {
      tester.start(function(maybeServer, baseUrl, driver) {
        tester.webbit("should open up the editor and save a new program", function(done) {
          var name = "test-program" + String(Math.floor(Math.random() * 10000));
          driver.get(baseUrl);
          driver.findElement(webdriver.By.id('login')).click();
          tester.googleLogin(driver);
          driver.get(baseUrl + "/editor");
          tester.waitForPyretLoad(driver, 15000);
          driver.findElement(webdriver.By.id('program-name')).sendKeys(name);
          driver.findElement(webdriver.By.id('saveButton')).click();
          driver.wait(function() {
            return driver.isElementPresent(tester.contains("saved as " + name));
          }, 4000);
          driver.get(baseUrl + "/my-programs");
          driver.wait(function() {
            return driver.isElementPresent(tester.contains(name));
          }, 4000);
          driver.call(done);
        }, 60000);

        it("should close the server and the connection to the browser", function(done) {
          console.log("closing down server");
          if(maybeServer) { maybeServer.close(); }
          driver.quit();
          done();
        });
      });
});

