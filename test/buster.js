/**
 * unit test settings for BusterJS.
 */
var config = module.exports;

// ブラウザ共通設定
var browserCommon = {
    rootPath: "../",
    environment: "browser",
    libs: [
      "vendor/mt.js/mt.js",
      "test/use_typedarray.js",
      "test/util.js"
    ],
    tests: [
      'test/browser-inflate-test.js',
      'test/browser-zlib-test.js',
      'test/browser-gunzip-test.js',
      'test/browser-gzip-test.js',
      'test/browser-unzip-test.js',
      'test/browser-zip-test.js'
    ]
};

// ブラウザでコンパイル前のテスト
config["codepath"] = mixin(
  mixin({}, browserCommon),
  {
    resources: [
      "src/**/*.js"
    ],
    libs: [
      "closure-primitives/base.js",
      "closure-primitives/deps.js",
      "test/plain.js"
    ],
    tests: [
      'test/browser-codepath-test.js',
      'test/browser-raw-test.js'
    ]
  }
);

// ブラウザで独立ビルド版のテスト
config["respectively build"] = mixin(
  mixin({}, browserCommon),
  {
    tests: [
      'test/browser-raw-test.js'
    ],
    libs: [
      "bin/rawinflate.dev.min.js",
      "bin/rawdeflate.dev.min.js",
      "bin/inflate.dev.min.js",
      "bin/deflate.dev.min.js",
      "bin/gunzip.dev.min.js",
      "bin/gzip.dev.min.js",
      "bin/unzip.dev.min.js",
      "bin/zip.dev.min.js"
    ]
  }
);

// ブラウザで Zlib まとめてビルド版のテスト
config["zlib"] = mixin(
  mixin({}, browserCommon),
  {
    libs: [
      "bin/inflate.dev.min.js",
      "bin/zip.dev.min.js",
      "bin/unzip.dev.min.js",
      "bin/zlib_and_gzip.dev.min.js"
    ]
  }
);

// node
config["node"] = {
  rootPath: "../",
  environment: "node",
  tests: [
    "test/node-test.js"
  ]
};

// config mixin
function mixin(dst, src) {
  var i;

  for (i in src) {
    if (dst[i] instanceof Array && src[i] instanceof Array) {
      dst[i] = dst[i].concat(src[i]);
    } else if (typeof dst[i] === 'object' && typeof src[i] === 'object') {
      mixin(dst[i], src[i]);
    } else {
      dst[i] = src[i];
    }
  }

  return dst;
}
