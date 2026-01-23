// Usage: node src/scripts/get-image.js
// See files pie.png and bar.png appear in the same directory
// See what's going on by setting SHOW_BROWSER=true (will thumbnail images, so don't use for “the real thing”)
// If you're not on a Mac set PATH_TO_CHROME to your Chrome binary

// You may have to fiddle with `npm install chromedriver@VERSION` to get the
// right version for your Chrome. It updates frequently (and your Chrome does,
// too).


const webdriver = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');

if (process.env.CHROMEDRIVER_BINARY) {
  // Note(Ben): Use `env CHROMDRIVER_BINARY=/snap/bin/chromium.chromedriver npm run mocha`
  // Based on https://stackoverflow.com/a/53971573
  chrome.setDefaultService(new chrome.ServiceBuilder(process.env.CHROMEDRIVER_BINARY).build());
} else if (process.env.GOOGLE_CHROME_BINARY) {
  // Used by Travis
  PATH_TO_CHROME = process.env.GOOGLE_CHROME_BINARY;
}
else if (process.platform === 'darwin') {
  PATH_TO_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  console.log(`The tester is guessing that you're on a Mac and using ${PATH_TO_CHROME}. You can set GOOGLE_CHROME_BINARY to the path to your Chrome install if this path is not working.`);
}

let leave_open = process.env.LEAVE_OPEN === "true" || false;

let args = process.env.SHOW_BROWSER ? [] : [
  '--headless',
  '--no-sandbox',
  '--window-size=10000,10000'
  // Make the browser HUGE so you images don't get thumbnailed
];
if(!process.env.SHOW_BROWSER) {
  console.log("Running Chrome headless. You can set SHOW_BROWSER=true to see what's going on");
}

const chromeCapabilities = webdriver.Capabilities.chrome();
const options = { args };
if (PATH_TO_CHROME !== undefined) {
  options.binary = PATH_TO_CHROME;
}
chromeCapabilities.set('chromeOptions', options);


function setupWithName() {
  return new webdriver.Builder()
  .forBrowser("chrome")
  .withCapabilities(chromeCapabilities).build();

//  this.browser.manage().window().maximize();

  return;
}

const browser = setupWithName();

function pyretLoaded(driver) {
  return driver.findElement(webdriver.By.id("loader")).getCssValue("display")
    .then(function(d) {
      return d === "none";
    });
}

function waitForPyretLoad(driver, timeout) {
  return driver.wait(function() { return pyretLoaded(driver); }, timeout);
}

function setCodemirror(driver, getCM, content) {
  var escaped = escape(content);
  driver.executeScript(`
var CM = ${getCM};
var first = CM.firstLine();
var last = CM.lastLine();
CM.replaceRange(unescape(\"${escaped}\"), {line: first, ch: 0}, {line: last + 1, ch: 0});
`);
  // driver.executeScript("$(\".CodeMirror\")[0].CodeMirror.setValue(unescape(\""+ escaped + "\"));");
}

function setDefinitions(driver, code) {
  // http://stackoverflow.com/a/1145525 
  setCodemirror(driver, "$(\".CodeMirror\")[0].CodeMirror", code);
}
function evalDefinitions(driver, options) {
  if(options && options.typeCheck) {
    driver.findElement(webdriver.By.id("runDropdown")).click();
    driver.findElement(webdriver.By.id("select-tc-run")).click();
  }
  else {
    driver.findElement(webdriver.By.id("runButton")).click();
  }
}

function waitForBreakButton(driver) {
  var breakButton = driver.findElement(webdriver.By.id('breakButton'));
  driver.wait(webdriver.until.elementIsDisabled(breakButton));
}

function waitForNoPrompt(driver) {
  var livePrompt = driver.findElement(webdriver.By.className('prompt-container'));
  return driver.wait(webdriver.until.elementIsNotVisible(livePrompt));
}

function evalDefinitionsAndWait(driver, options) {
  evalDefinitions(driver, options);
  waitForBreakButton(driver);
  return driver.findElement(webdriver.By.id("output"));
}

function setDefinitionsEvalAndWait(driver, toEval, options) {
  setDefinitions(driver, toEval);
  return evalDefinitionsAndWait(driver, options);
}

function setDefinitionsAndEval(driver, toEval, options) {
  setDefinitions(driver, toEval);
  evalDefinitions(driver, options);
}



const examples = [{
  name: "bar.png",
  code: `
include chart

render-chart(from-list.bar-chart([list: "a", "b", "c"], [list: 2, 2, 3])).get-image()
`,
},
{
  name: "pie.png",
  code: `
include chart

render-chart(from-list.pie-chart([list: "a", "b", "c"], [list: 2, 2, 3])).get-image()
`,
}
];

function saveBase64PngToFile(base64, filename) {
  const fs = require('fs');
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(filename, buffer);
}

async function go(example) {
  const fetchresult = browser.get("https://code.pyret.org/editor");
  const result = await waitForPyretLoad(browser);
  const result2 = await setDefinitionsEvalAndWait(browser, example.code, { typeCheck: false });
  browser.wait(webdriver.until.elementLocated(webdriver.By.css("canvas")), 10000);
  const canvas = await browser.findElement(webdriver.By.css("canvas"));
  const dataUrl = await browser.executeScript("return arguments[0].toDataURL('image/png').substring(21);", canvas)

  saveBase64PngToFile(dataUrl, example.name);
  console.log("done: ", result, result2, dataUrl);
}




async function runAll() {
  for(let i = 0; i < examples.length; i++) {
    await go(examples[i]);
  }
  browser.quit();
}
runAll();

