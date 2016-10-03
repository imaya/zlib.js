var buster = require('buster');
var nodeZlib = require('zlib');
var zlib = require('../bin/node-zlib.js');
var mt_rand = require('../vendor/mt.js/node-mt.js');

//-----------------------------------------------------------------------------
// array assertion
//-----------------------------------------------------------------------------
function arrayEquals(expected, actuals) {
  var i, il;
  if (!(expected instanceof actuals.constructor)) {
    return false;
  }

  if (expected.length !== actuals.length) {
    return false;
  }

  for (i = 0, il = expected.length; i < il; ++i) {
    if (expected[i] !== actuals[i]) {
      return false;
    }
  }

  return true;
}

//-----------------------------------------------------------------------------
// test cases
//-----------------------------------------------------------------------------
buster.testCase(
  "node inflate and deflate",
  {
    setUp: function() {
      var size = 1234567;
      var testData = new Buffer(size);

      this.timeout = 3000;
      this.testData = testData;
    },
    "inflate pre-deflated data": function() {
      var size = 123456;
      var plain = new Buffer(size);
      var i, il;
      var testData =
        'eJztzydhGAAAALDd/v////////////////////////////////9no6BxkF+///z99x8A'+
        'EAgYBBQMHAISChoGFg4eAREJGQUVDR0DEwsbBxcPn4CQiJiElIycgpKKmoaWjp6BkYmZ'+
        'hZWNnYOTi5uHl49fQFBIWERUTFxCUkpaRlZOXkFRSVlFVU1dQ1NLW0dXT9/A0MjYxNTM'+
        '3MLSytrG1s7ewdHJ2cXVzd3D08vbx9fPPyAwKDgkNCw8IjIqOiY2Lj4hMSk5JTUtPSMz'+
        'KzsnNy+/oLCouKS0rLyisqq6prauvqGxqbmlta29o7Oru6e3r39gcGh4ZHRsfGJyanpm'+
        'dm5+YXFpeWV1bX1jc2t7Z3dv/+Dw6Pjk9Oz84vLq+ub27v7h8en55fXt/ePz5//z//n/'+
        '/H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f'+
        '/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z'+
        '//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+'+
        'P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//'+
        '5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n/'+
        '/H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f'+
        '/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z'+
        '//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+'+
        'P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//'+
        '5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n/'+
        '/H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f'+
        '/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z'+
        '//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+'+
        'P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//'+
        '5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n/'+
        '/H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f'+
        '/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z'+
        '//n//H/+P/+f/8//5//z//n//H/+3+P/Ba1OJPE=';

      // make plain data
      for (i = 0, il = size; i < il; ++i) {
        plain[i] = i & 0xff;
      }

      var decodedData = new Buffer(testData, 'base64');

      // testdata size
      buster.assert.equals(testData.length, 1604, "source data size");
      buster.assert.equals(decodedData.length, 1202, "base64 decoded data size");

      var inflated = zlib.inflateSync(decodedData);

      buster.assert.equals(inflated.length, size, "inflated data size");
      buster.assert(arrayEquals(inflated, plain));
    },
    // native deflate, js inflate
    "uncompressed random data": function(done) {
      var data = this.testData;

      makeRandomData(data);

      zlibBuffer(new nodeZlib.Deflate({level: 0}), data, function(err, buf) {
        var inflated = zlib.inflateSync(buf);

        buster.assert.equals(inflated.length, data.length);
        buster.assert.equals(inflated, data);

        done();
      });
    },
    "maxlevel random data": function(done) {
      var data = this.testData;

      makeRandomData(data);

      zlibBuffer(new nodeZlib.Deflate({level: 9}), data, function(err, buf) {
        var inflated = zlib.inflateSync(buf);

        buster.assert.equals(inflated.length, data.length);
        buster.assert(arrayEquals(inflated, data));

        done();
      });
    },
    "undercomitted": function() {
      var data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
      var compressed = zlib.deflateSync(data);
      var decompressed = zlib.inflateSync(compressed);
      buster.assert(arrayEquals(data, Array.prototype.slice.call(decompressed)));
    },
    // js deflate, native inflate
    "random data": function(done) {
      makeRandomData(this.testData);
      inflateTest(done, this.testData);
    },
    "sequential data": function(done) {
      makeSequentialData(this.testData);
      inflateTest(done, this.testData);
    },
    "random sequential data": function(done) {
      makeRandomSequentialData(this.testData);
      inflateTest(done, this.testData);
    },
    // native gzip, js gunzip
    "gunzip random data": function(done) {
      makeRandomData(this.testData);
      gunzipTest(done, this.testData);
    },
    "gunzip sequential data": function(done) {
      makeSequentialData(this.testData);
      gunzipTest(done, this.testData);
    },
    "gunzip random sequential data": function(done) {
      makeRandomSequentialData(this.testData);
      gunzipTest(done, this.testData);
    },
    // js gzip, native gunzip
    "gzip random data": function(done) {
      makeRandomData(this.testData);
      gzipTest(done, this.testData);
    },
    "gzip sequential data": function(done) {
      makeSequentialData(this.testData);
      gzipTest(done, this.testData);
    },
    "gzip random sequential data": function(done) {
      makeRandomSequentialData(this.testData);
      gzipTest(done, this.testData);
    },
    // 過去に失敗したことのあるテスト
    "bitbuflen error": function(done) {
      makeRandomSequentialData(this.testData, 1339494909128);
      gunzipTest(done, this.testData);
    },
    "issue#35 wrong inflate 1": function() {
      var compressed = new Buffer(
        "eJx9jq0NQCEMhG8YJMOwAgJdhWYA9kAyAIuQoBmkvNQ80Z+kP/l6uRy8urIysOVoprTaLlOlcXyzvE7qP3jBuo4XCDg/QAyZCQjI",
        "base64"
      );
      var plain = new Buffer(
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,228,0,0,0,0,0,0,97,0,0,215,0,0,0,0,0,97,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,117,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,44,166,0,0,0,0,101,0,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,139,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,186,0,111,0,0,218,0,0,0,0,0,0,0,0,0,0,0,111]
      );

      inflateOnlyTest(compressed, plain);
    },
    "issue#35 wrong inflate 2": function() {
      var compressed = new Buffer(
        "eJxtjD0NgEAMhd8IBlDAigNMsDCxsSIIAyScikvOzAk4A02Tdujf8r2/FPl1Fctk8jufDzSGbGdJ17A7fbAZd6iowMMswM78tLjCy9+417UEYNsIeA==",
        "base64"
      );
      var plain = new Buffer(
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,231,0,0,0,0,0,0,0,0,22,8,0,0,0,0,0,0,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,243,0,194,0,0,0,0,8,0,0,0,0,0,0,9,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,191,0,0,108,0,0,0,0,169,0,0,60,0,0,0,0,165,0,0,0,0,0,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,0,0,0,0,0,0,0,0,0,0,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      );

      inflateOnlyTest(compressed, plain);
    },
    "issue#35 take a long time and throw exception": function() {
      var compressed = new Buffer(
        "eJx1jb8NQFAQxj+J2MAASo1EJGIEM1hAhV6iVEg0GgvozGEHG+jscDm5Q/L+FL/3+y73vjfAfVbciDXkqFR9lKretz3XWHbxxl44RSKb+9PWmFw/7+U+MvNlgtTa2D0s3jwyAsYZMgl65Qwx",
        "base64"
      );
      var plain = new Buffer(
        [125,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,150,0,237,0,41,0,0,0,0,0,0,0,0,54,0,90,0,0,0,0,0,0,0,0,4,0,72,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,140,103,0,145,170,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,137,33,0,0,0,0,0,0,0,163,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,230,0,0,0,0,0,0,0,0,0,0,0,122,0,0,0,0,0,0,0,196,51,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,46,0,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,111,0,0,0,0,0,56,0,0,0,0,0,0,0,0,0,133,0,0,0,0,6,0,0,0,0,215,21,0,0,0,0]
      );

      inflateOnlyTest(compressed, plain);
    }
  }
);

// inflate test
function inflateTest(done, testData) {
  var deflate;

  // deflate
  deflate = zlib.deflateSync(testData);
  console.log("deflated data size:", deflate.length);

  // inflate
  nodeZlib.inflate(deflate, function(err, buffer) {
    console.log("inflated data size:", buffer.length);

    // assertion
    buster.assert(buffer.length, testData.length);
    buster.assert(arrayEquals(buffer, testData));

    done();
  });
}

function inflateOnlyTest(compressed, plain) {
  var inflated = zlib.inflateSync(compressed);

  buster.assert.equals(inflated.length, plain.length);
  buster.assert.equals(inflated, plain);
}

// gzip test
function gzipTest(done, testData) {
  var deflated = zlib.gzipSync(testData);

  console.log("Source:", testData.length);
  console.log("Deflate:", deflated.length);
  nodeZlib.gunzip(deflated, function(err, buf) {
    console.log("Inflate:", buf.length);
    buster.assert.equals(buf.length, testData.length);
    buster.assert(arrayEquals(buf, testData));

    done();
  });
}

// gunzip test
function gunzipTest(done, testData) {
  nodeZlib.gzip(testData, function(err, buf) {
    var inflated = zlib.gunzipSync(buf);

    buster.assert.equals(inflated.length, testData.length);
    buster.assert(arrayEquals(inflated, testData));

    done();
  });
}

// random
function makeRandomData(data, opt_seed) {
  var seed = typeof opt_seed === 'number' ? opt_seed : +new Date();
  var mt = new mt_rand.MersenneTwister(seed);
  var i, il;

  console.log("seed:", seed);

  // make random data
  for (i = 0, il = data.length; i < il; ++i) {
    data[i] = mt.nextInt(256);
  }
}

// sequential
function makeSequentialData(data) {
  var i, il;

  // make sequential data
  for (i = 0, il = data.length; i < il; ++i) {
    data[i] = i & 0xff;
  }
}

// random sequential
function makeRandomSequentialData(data, opt_seed) {
  var seed = typeof opt_seed === 'number' ? opt_seed : +new Date();
  var mt = new mt_rand.MersenneTwister(seed);
  var i, il;
  var random1, random2;

  console.log("seed:", seed);

  // make random data
  for (i = 0, il = data.length; i < il;) {
    random1 = mt.nextInt(256);
    random2 = mt.nextInt(256);
    while (random2--) {
      if (i === il) {
        break;
      }
      data[i++] = random1++ & 0xff;
    }
  }
}
//-----------------------------------------------------------------------------
// extract from node.js implementation
//-----------------------------------------------------------------------------
function zlibBuffer(engine, buffer, callback) {
  var buffers = [];
  var nread = 0;

  function onError(err) {
    engine.removeListener('end', onEnd);
    engine.removeListener('error', onError);
    callback(err);
  }

  function onData(chunk) {
    buffers.push(chunk);
    nread += chunk.length;
  }

  function onEnd() {
    var buffer;
    switch (buffers.length) {
      case 0:
        buffer = new Buffer(0);
        break;
      case 1:
        buffer = buffers[0];
        break;
      default:
        buffer = new Buffer(nread);
        var n = 0;
        buffers.forEach(function(b) {
          var l = b.length;
          b.copy(buffer, n, 0, l);
          n += l;
        });
        break;
    }
    callback(null, buffer);
  }

  engine.on('error', onError);
  engine.on('data', onData);
  engine.on('end', onEnd);

  engine.write(buffer);
  engine.end();
}
