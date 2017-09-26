//
// When building a web-standalone, browserify will parse this file
// and produce a version which include each dependency that is required()
//
sexpr = require("s-expression");
define("s-expression", [], function() {return sexpr;});

//q = require("q");
if(!!Q) {
  define("q", [], function() {return Q;});
}

seedrandom = require("seedrandom");
define("seedrandom", [], function() {return seedrandom;});

sourcemap = require("source-map");
define("source-map", [], function () { return sourcemap; });

jssha256 = require("js-sha256");
define("js-sha256", [], function () { return jssha256; });

jsmd5 = require("js-md5");
define("js-md5", [], function () { return jsmd5; });

colorspaces = require("colorspaces");
define("colorspaces", [], function () { return colorspaces; });

d3 = require("d3");
define("d3", [], function() { return d3; });

d3_tip = require("d3-tip");
define("d3-tip", [], function() { return d3_tip(d3); });

if(!!google) {
  define("google-charts", [], function() {return google;});
}

define("fs", [], function () { return {}; });

// NOTE(joe): this is slightly bogus, but due to the way pathlib can load, even
// though it's not used, this needs to be defined (it represents the separator
// for the system).
define("path", [], function () { return {
    sep: "/"
  };
});

define("http", [], function () {return {};});

define("lockfile", [], function () { return {}; });

define("websocket", [], function () { return {}; });
