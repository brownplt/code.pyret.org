var assert = require("assert");
var tester = require("../test-util/util.js");
var webdriver = require("selenium-webdriver");

// Add endpoints here to extend template-variable checking to more static pages
var static_pages = [
  "/faq",
];

describe("Make sure template variables are used in static pages", function() {
  static_pages.forEach(function(endpoint) {
    describe(endpoint, function() {
      beforeEach(tester.setup);
      afterEach(tester.teardown);

      it("should substitute APP_NAME and APP_DOMAIN", function(done) {
        this.timeout(20000);
        var self = this;

        self.browser.get(self.base + endpoint);

        // Verify the page title does not contain raw Mustache tokens
        self.browser.getTitle().then(function(title) {
          assert.ok(
            !title.includes("{{APP_NAME}}"),
            endpoint + " title should not contain unsubstituted {{APP_NAME}}, got: " + title
          );
          assert.ok(
            title.length > 0,
            endpoint + " title should not be empty"
          );
        });

        // Verify the page body does not contain any raw Mustache tokens
        self.browser.findElement(webdriver.By.tagName("body")).getText().then(function(bodyText) {
          assert.ok(
            !bodyText.includes("{{APP_NAME}}"),
            endpoint + " body should not contain unsubstituted {{APP_NAME}}"
          );
          assert.ok(
            !bodyText.includes("{{APP_DOMAIN}}"),
            endpoint + " body should not contain unsubstituted {{APP_DOMAIN}}"
          );
          assert.ok(
            !bodyText.includes("{{"),
            endpoint + " body should not contain any unsubstituted Mustache tokens"
          );
        });

        // Verify that the actual APP_NAME value appears somewhere on the page
        // (Since .env sets APP_NAME=TESTING, this confirms real substitution occurred)
        var appName = process.env.APP_NAME;
        if (appName) {
          self.browser.findElement(webdriver.By.tagName("body")).getText().then(function(bodyText) {
            assert.ok(
              bodyText.includes(appName),
              endpoint + " body should contain the APP_NAME value '" + appName + "'"
            );
          });
        }

        self.browser.call(done);
      });
    });
  });
});
