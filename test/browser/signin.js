_ = require("jasmine-node");
var server = require("./../../src/server.js");
var webdriver = require('selenium-webdriver');

if (process.env["TEST_LOC"] === "local") {
  server.start({
    baseUrl: process.env["BASE_URL"],
    port: process.env["PORT"],
    sessionSecret: process.env["SESSION_SECRET"],
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      redirect: "/oauth2callback"
    }
  }, function(app, server) {
    var driver = new webdriver.Builder().
      withCapabilities({browserName: "chrome"}).
      build();
    afterServer(server, process.env["BASE_URL"], driver);
  });
}
else {
  var driver = new webdriver.Builder().
    usingServer("https://ondemand.saucelabs.com/wd/hub").
    withCapabilities({
      browserName: "internet explorer",
      username: process.env["SAUCE_USERNAME"],
      accessKey: process.env["SAUCE_ACCESS_KEY"]
    }).
    build();
  afterServer(null, process.env["SAUCE_TEST_TARGET"], driver);
}
  

var googleUsername = process.env["SELENIUM_GOOGLE_USER"];
var googlePassword = process.env["SELENIUM_GOOGLE_PASSWORD"];

function afterServer(maybeServer, baseUrl, driver) {
  function googleLogin(driver) {
    driver.wait(function() {
      return driver.getTitle().then(function(title) {
        return title === 'Sign in - Google Accounts';
      });
    }, 3000);
    // Sometimes email isn't present because the browser remembers which
    // Google account we last logged in as
    driver.findElement(webdriver.By.id("Email")).getAttribute("class").then(function(cls) {
      if(cls.indexOf("hidden") === -1) {
        driver.findElement(webdriver.By.id("Email")).sendKeys(googleUsername);
      }
      driver.findElement(webdriver.By.id("Passwd")).sendKeys(googlePassword);
      driver.findElement(webdriver.By.id("signIn")).click();
    });
  }
  function waitThenClick(driver, query) {
    driver.wait(function() {
      return driver.isElementPresent(query);
    }, 4000);
    return driver.findElement(query).click();
  }
  describe("Sign in", function() {
    webdriver.promise.controlFlow().on('uncaughtException', function(e) {
      console.error('Unhandled error: ' + e);
      fail();
    });

    it("Should forget everything it knows", function(done) {
      try {
        driver.get("https://security.google.com/settings/security/permissions");
        googleLogin(driver);
        console.log("waiting...");
        driver.wait(function() {
          console.log("Waiting for page...");
          return driver.executeScript("return document.readyState === 'complete'");
        }, 3000);
//        driver.isElementPresent(webdriver.By.xpath("//*[contains(text(), 'Patch Test')]")).then(function(p) { console.log(p); });
          driver.isElementPresent(webdriver.By.xpath("//*[contains(text(), 'Patch Test')]")).then(function(present) {
            console.log("present: ", present);
            if(present) {
              waitThenClick(driver, webdriver.By.xpath("//*[contains(text(), 'Patch Test')]"));
              waitThenClick(driver, webdriver.By.xpath("//*[contains(text(), 'Revoke access')]"));
              return waitThenClick(driver, webdriver.By.name("ok"));
            } else {
              // do nothing
            }
          });
        driver.get("https://accounts.google.com/Logout");
        driver.call(function() { done(); });
      }
      catch(e) { console.log(e); }
    }, 60000);

    it("Should sign up from not being logged in", function(done) {
      console.log("sign up");
      driver.get(baseUrl);
      driver.findElement(webdriver.By.id('login')).click();
      googleLogin(driver);
      driver.wait(function() {
        console.log("Waiting for confirmation button to activate...");
        return driver.findElement(webdriver.By.id("submit_approve_access")).getAttribute("disabled")
        .then(function(disabled) {
          return !disabled;
        });
      }, 3000);
      driver.findElement(webdriver.By.id("submit_approve_access")).click();
      var loaded = driver.wait(function() {
        console.log("Waiting for page to load..");
        return driver.findElement(webdriver.By.id("loader")).getCssValue("display")
        .then(function(d) {
          console.log("style: ", d);
          return d === "none";
        });
      }, 3000);
      loaded.then(function() { console.log("done with test"); done(); });
    }, 60000);

    it("Should close the server and the connection to the browser", function(done) {
      console.log("closing down server");
      if(maybeServer) { maybeServer.close(); }
      driver.quit();
      done();
    });

  });
}
