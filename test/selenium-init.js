_ = require("jasmine-node");
var server = require("./../src/server.js");
var webdriver = require('selenium-webdriver');

var testServer;

var browserName = process.env["SAUCE_BROWSER"] || "chrome";

console.log("Browser name: ", browserName);

function start(testName, withDriver) {
  if (process.env["TEST_LOC"] === "local") {
    console.log("Starting local server");
    console.log("Environment variables are: ", process.env["BASE_URL"], process.env["PORT"], process.env["TEST_LOC"]);
    // only start one server if multiple jobs running
    if(!testServer) {
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
        testServer = server;
        console.log("Server started, initializing selenium");
        var driver = new webdriver.Builder().
          withCapabilities({browserName: browserName}).
          build();
        withDriver(server, process.env["BASE_URL"], driver);
      });
    }
    else {
      var driver = new webdriver.Builder().
        withCapabilities({browserName: browserName}).
        build();
      withDriver(testServer, process.env["BASE_URL"], driver);
    }
  }
  else if (process.env["TRAVIS_JOB_NUMBER"]) {
    var uname = process.env["SAUCE_USERNAME"];
    var access = process.env["SAUCE_ACCESS_KEY"];
    var jobid = process.env["TRAVIS_JOB_NUMBER"];
    console.log("Job id: ", jobid);
    var url = "http://" + uname + ":" + access + "@ondemand.saucelabs.com:80/wd/hub"
    var driver = new webdriver.Builder().
      usingServer(url).
      withCapabilities({
        browserName: browserName,
        username: process.env["SAUCE_USERNAME"],
        accessKey: process.env["SAUCE_ACCESS_KEY"],
        "tunnel-identifier": jobid,
        "build": jobid
      }).
      build();
      /*
    if(!testServer) {
      server.start({
        baseUrl: process.env["BASE_URL"],
        port: process.env["PORT"],
        sessionSecret: process.env["SESSION_SECRET"],
        google: {
          clientId: process.env["GOOGLE_CLIENT_ID"],
          clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
          redirect: "/oauth2callback"
        }
      }, function(_, server) {
        testServer = server;
        console.log("Server started, initializing selenium");
        withDriver(testServer, process.env["SAUCE_TEST_TARGET"], driver);
      });
    }
    */
    //else {
      withDriver(null, process.env["SAUCE_TEST_TARGET"], driver);
    //}
  }
  else { // Local sauce test, assumes server is running somewhere
    var uname = process.env["SAUCE_USERNAME"];
    var access = process.env["SAUCE_ACCESS_KEY"];
    var url = "https://ondemand.saucelabs.com/wd/hub"
    var driver = new webdriver.Builder().
      usingServer(url).
      withCapabilities({
        testName: testName,
        browserName: browserName,
        username: uname,
        accessKey: access
      }).
      build();
    console.log("Built tester, starting tests");
    withDriver(null, process.env["SAUCE_TEST_TARGET"], driver);
  }
}

var googleUsername = process.env["SELENIUM_GOOGLE_USER"];
var googlePassword = process.env["SELENIUM_GOOGLE_PASSWORD"];

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
function googleLogout(driver) {
  driver.get("https://accounts.google.com/Logout");
}
function waitThenClick(driver, query) {
  driver.wait(function() {
    return driver.isElementPresent(query);
  }, 4000);
  return driver.findElement(query).click();
}
function contains(str) {
  return webdriver.By.xpath("//*[contains(text(), '" + str + "')]")
}

function setupExceptions(test, done) {
  console.log("setting up exceptions");
  webdriver.promise.controlFlow().on('uncaughtException', function(e) {
    console.error('Unhandled error: ' + e);
    test.fail(new Error("Unhandled exception: " + e));
    done();
  });
}

function webbit(description, runner, timeout) {
  console.log("Registering test");
  it(description, function(done) {
    console.log("About to set up exceptions");
    setupExceptions(this, done);
    runner(done);
  }, timeout);
}

function pyretLoaded(driver) {
  return driver.findElement(webdriver.By.id("loader")).getCssValue("display")
    .then(function(d) {
      return d === "none";
    });
}

function waitForPyretLoad(driver, timeout) {
  return driver.wait(function() {
    console.log("Waiting for loader to disappear...");
    return driver.findElement(webdriver.By.id("loader")).getCssValue("display")
    .then(function(d) {
      console.log("style: ", d);
      return d === "none";
    });
  }, timeout || 3000);
}

function loadAndRunPyret(code, driver, timeout) {
  waitForPyretLoad(driver, timeout);
  // http://stackoverflow.com/a/1145525 
  var escaped = code.split("\n").join("\\n");
  driver.executeScript("$(\".CodeMirror\")[0].CodeMirror.setValue(\""+ escaped + "\");");
  driver.findElement(webdriver.By.id("runButton")).click();
}

module.exports = {
  webbit: webbit,
  googleLogout: googleLogout,
  googleLogin: googleLogin,
  contains: contains,
  waitThenClick: waitThenClick,
  waitForPyretLoad: waitForPyretLoad,
  pyretLoaded: pyretLoaded,
  loadAndRunPyret: loadAndRunPyret,
  start: start
};
