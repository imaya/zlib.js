// Karma configuration
// Generated on Tue Oct 04 2016 06:12:57 GMT+0900 (JST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon', 'power-assert'],


    // list of files / patterns to load in the browser
    files: [
      'test/browser/base.js',
      'test/browser/util.js',
      'vendor/mt.js/mt.js',

      // load all Zlib library and avoid conflict
      'bin/zlib.pretty.dev.js',
      'test/browser/avoid_conflict/zlib.pretty.js',

      'bin/rawinflate.dev.min.js',
      'test/browser/avoid_conflict/rawinflate.js',

      'bin/rawdeflate.dev.min.js',
      'test/browser/avoid_conflict/rawdeflate.js',

      'bin/gzip.dev.min.js',
      'test/browser/avoid_conflict/gzip.js',

      'bin/gunzip.dev.min.js',
      'test/browser/avoid_conflict/gunzip.js',

      'bin/zip.dev.min.js',
      'test/browser/avoid_conflict/zip.js',

      'bin/unzip.dev.min.js',
      'test/browser/avoid_conflict/unzip.js',

      'bin/zlib.dev.min.js',
      'test/browser/avoid_conflict/zlib.js',


      // test files
      'test/browser/*-test.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*-test.js': ['espower']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],


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
    browsers: ['Chrome', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    browserNoActivityTimeout: 100000,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
};
