var webpackConfig = require('./webpack.config.js');

var reporters = ['dots'];

if (process.env.COVERAGE || process.env.CONTINUOUS_INTEGRATION) {
  console.log("This test run will generate coverage reports");
  reporters.push('coverage');

  if (process.env.CONTINUOUS_INTEGRATION) {
    console.log("Coverage reports will be uploaded to coveralls.io");
    reporters.push('coveralls');
  }
}

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      {pattern: 'spec/index.js', watch: false},
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "spec/index.js": ["webpack", "sourcemap"]
    },

    webpack: {
      devtool: 'inline-source-map',
      resolve: webpackConfig.resolve,
      module: {
        loaders: webpackConfig.module.loaders,
        preLoaders: webpackConfig.module.preLoaders,
      },
    },
    webpackMiddleware: {
      noInfo: true
    },
    client: {
      // log console output in our test console
      captureConsole: true
    },

    reporters: reporters,
    coverageReporter: {
      dir: '.coverage',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly' }
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [ process.env.CONTINUOUS_INTEGRATION ? 'ChromeTravisCI' : 'Chrome' ],
    customLaunchers: {
      ChromeTravisCI: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: process.env.CONTINUOUS_INTEGRATION,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity,
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000 // 60 seconds
  });
};
