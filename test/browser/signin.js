_ = require("jasmine-node");
var server = require("./../../src/server.js");
var webdriver = require('selenium-webdriver');

server.start({
  baseUrl: process.env["BASE_URL"],
  port: process.env["PORT"],
  sessionSecret: process.env["SESSION_SECRET"],
  google: {
    clientId: process.env["GOOGLE_CLIENT_ID"],
    clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
    redirect: "/oauth2callback"
  }
}, afterServer);

var googleUsername = process.env["SELENIUM_GOOGLE_USER"];
var googlePassword = process.env["SELENIUM_GOOGLE_PASSWORD"];

function afterServer(app, server) {
  describe("Sign in", function() {
    var /*driver;
    beforeEach(function() {
      console.log("running test");*/
      driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();
//    });

    it("Should sign up", function(done) {
      console.log("foo");
      driver.get('http://localhost:5000');
      driver.findElement(webdriver.By.id('login')).click();
      driver.wait(function() {
        return driver.getTitle().then(function(title) {
          return title === 'Sign in - Google Accounts';
        });
      }, 1000);
      driver.findElement(webdriver.By.id("Email")).sendKeys(googleUsername);
      driver.findElement(webdriver.By.id("Passwd")).sendKeys(googlePassword);
      driver.findElement(webdriver.By.id("signIn")).click();
      driver.wait(function() {
        console.log("Waiting for confirmation button to activate...");
        return driver.findElement(webdriver.By.id("submit_approve_access")).getAttribute("disabled")
        .then(function(disabled) {
          return !disabled;
        });
      });
      driver.findElement(webdriver.By.id("submit_approve_access")).click();
      var loaded = driver.wait(function() {
        console.log("Waiting for page to load..");
        return driver.findElement(webdriver.By.id("loader")).getCssValue("display")
        .then(function(d) {
          console.log("style: ", d);
          return d === "none";
        });
      });
      loaded.then(function() { done(); });
      driver.quit();
    }, 15000);

    it("Should close the server", function(done) {
      server.close();
      done();
    });

  });
}
