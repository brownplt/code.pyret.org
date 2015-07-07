var webdriver = require("selenium-webdriver");

function pyretLoaded(driver) {
  return driver.findElement(webdriver.By.id("loader")).getCssValue("display")
    .then(function(d) {
      return d === "none";
    });
}

module.exports = {
  pyretLoaded: pyretLoaded
}
