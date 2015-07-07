j = require("jasmine-node");

j.executeSpecsInFolder({
    specFolders: [process.argv[2] || "test/browser/"],
    onComplete:   function() { console.log("done"); },
    onError: function(err) { console.log("Require failed! ", err); },
    isVerbose:    true,
    showColors:   true,
    teamcity:     false,
    regExpSpec:   false,
    junitreport:  false,
    includeStackTrace: true,
    growl:        false
  });

