_ = require("jasmine-node");
var tester = require("./selenium-init.js");
var webdriver = require('selenium-webdriver');

var contains = tester.contains;
var waitThenClick = tester.waitThenClick;
var googleLogin = tester.googleLogin;
var googleLogout = tester.googleLogout;

tester.start(function(maybeServer, baseUrl, driver) {
  describe("Sign in", function() {

    tester.webbit("Should forget everything it knows", function(done) {
      driver.get("https://security.google.com/settings/security/permissions");
      googleLogin(driver);
      console.log("Waiting to see if Patch permissions are present...");
      driver.wait(function() {
        return driver.executeScript("return document.readyState === 'complete'");
      }, 3000);
      driver.isElementPresent(contains("Patch Test")).then(function(present) {
        if(present) {
          waitThenClick(driver, contains("Patch Test"));
          waitThenClick(driver, contains("Revoke access"));
          return waitThenClick(driver, webdriver.By.name("ok"));
        } else {
          // do nothing otherwise
        }
      });
      googleLogout(driver);
      driver.call(done);
    }, 60000);

    tester.webbit("Should sign up from not being logged in", function(done) {
      driver.get(baseUrl);
      driver.findElement(webdriver.By.id('login')).click();
      googleLogin(driver);
      console.log("Waiting for permission confirmation button...");
      driver.wait(function() {
        return driver.findElement(webdriver.By.id("submit_approve_access")).getAttribute("disabled")
        .then(function(disabled) {
          return !disabled;
        });
      }, 3000);
      driver.findElement(webdriver.By.id("submit_approve_access")).click();
      tester.waitForPyretLoad(driver);
      driver.call(done);
    }, 60000);

    tester.webbit("When logging back in, should skip authentication and go straight to my-programs", function(done) {
      driver.get(baseUrl);
      driver.findElement(webdriver.By.id('login')).click();
      tester.waitForPyretLoad(driver);
      driver.call(done);
    }, 60000);

    tester.webbit("If cookies are cleared, should still log in seamlessly and work", function(done) {
      driver.manage().deleteAllCookies();
      driver.get(baseUrl);
      driver.findElement(webdriver.By.id('login')).click();
      tester.waitForPyretLoad(driver);
      driver.call(done);
    }, 60000);

    it("Should close the server and the connection to the browser", function(done) {
      console.log("closing down server");
      if(maybeServer) { maybeServer.close(); }
      driver.quit();
      done();
    });

  });
});
