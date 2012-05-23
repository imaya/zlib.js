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
  "inflate and deflate",
  {
    setUp: function() {
      var size = 1234567;
      var testData = new Buffer(size);

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
      assert.equals(testData.length, 1604, "source data size");
      assert.equals(decodedData.length, 1202, "base64 decoded data size");

      var inflated = zlib.inflateSync(decodedData);

      assert.equals(inflated.length, size, "inflated data size");
      assert(arrayEquals(inflated, plain));
    },
    // native deflate, js inflate
    "uncompressed random data": function(done) {
      var data = this.testData;

      makeRandomData(data);

      zlibBuffer(new nodeZlib.Deflate({level: 0}), data, function(err, buf) {
        var inflated = zlib.inflateSync(buf);

        assert.equals(inflated.length, data.length);
        assert.equals(inflated, data);

        done();
      });
    },
    "maxlevel random data": function(done) {
      var data = this.testData;

      makeRandomData(data);

      zlibBuffer(new nodeZlib.Deflate({level: 9}), data, function(err, buf) {
        var inflated = zlib.inflateSync(buf);

        assert.equals(inflated.length, data.length);
        assert(arrayEquals(inflated, data));

        done();
      });
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
      makeSequentialData(this.testData);
      inflateTest(done, this.testData);
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
    assert(buffer.length, testData.length);
    assert(arrayEquals(buffer, testData));

    done();
  });
}

// random
function makeRandomData(data) {
  var seed = +new Date();
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
function makeRandomSequentialData(data) {
  var seed = +new Date();
  var mt = new MersenneTwister(seed);
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
