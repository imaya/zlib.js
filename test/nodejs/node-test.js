"use strict";
import * as NodeZlib from 'zlib';
import * as Zlib from '../../bin/node-zlib.js';
import * as MersenneTwister from '../../vendor/mt.js/node-mt.js';
import * as assert from 'power-assert';

//-----------------------------------------------------------------------------
// array assertion
//-----------------------------------------------------------------------------
function assertArray(expected, actuals) {
  assert(expected instanceof actuals.constructor);
  assert(expected.length === actuals.length);

  for (let i = 0, il = expected.length; i < il; ++i) {
    assert(expected[i] === actuals[i]);
  }
}

//-----------------------------------------------------------------------------
// test cases
//-----------------------------------------------------------------------------
describe("node inflate and deflate", function() {
  this.timeout(60000);
  const size = 1234567;

  it("inflate pre-deflated data", function () {
    const size = 123456;
    const plain = new Buffer(new Uint8Array(size));
    const testData =
      'eJztzydhGAAAALDd/v////////////////////////////////9no6BxkF+///z99x8A' +
      'EAgYBBQMHAISChoGFg4eAREJGQUVDR0DEwsbBxcPn4CQiJiElIycgpKKmoaWjp6BkYmZ' +
      'hZWNnYOTi5uHl49fQFBIWERUTFxCUkpaRlZOXkFRSVlFVU1dQ1NLW0dXT9/A0MjYxNTM' +
      '3MLSytrG1s7ewdHJ2cXVzd3D08vbx9fPPyAwKDgkNCw8IjIqOiY2Lj4hMSk5JTUtPSMz' +
      'KzsnNy+/oLCouKS0rLyisqq6prauvqGxqbmlta29o7Oru6e3r39gcGh4ZHRsfGJyanpm' +
      'dm5+YXFpeWV1bX1jc2t7Z3dv/+Dw6Pjk9Oz84vLq+ub27v7h8en55fXt/ePz5//z//n/' +
      '/H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f' +
      '/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z' +
      '//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+' +
      'P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//' +
      '5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n/' +
      '/H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f' +
      '/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z' +
      '//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+' +
      'P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//' +
      '5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n/' +
      '/H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f' +
      '/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z' +
      '//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+' +
      'P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//' +
      '5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n/' +
      '/H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f' +
      '/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z//n//H/+P/+f/8//5//z' +
      '//n//H/+P/+f/8//5//z//n//H/+3+P/Ba1OJPE=';
    const decodedData = new Buffer(testData, 'base64');
    const inflated = Zlib.inflateSync(decodedData);

    // make plain data
    for (let i = 0, il = size; i < il; ++i) {
      plain[i] = i;
    }

    assert(testData.length === 1604);
    assert(decodedData.length === 1202);
    assertArray(inflated, plain);
  });

  // native deflate, js inflate
  it('uncompressed random data', function (done) {
    const data = makeRandomData(size);

    zlibBuffer(new NodeZlib.Deflate({level: 0}), data, function (err, buf) {
      const inflated = Zlib.inflateSync(buf);

      assertArray(inflated, data);

      done();
    });
  });

  it('maxlevel random data', function (done) {
    const data = makeRandomData(size);

    zlibBuffer(new NodeZlib.Deflate({level: 9}), data, function (err, buf) {
      const inflated = Zlib.inflateSync(buf);

      assertArray(inflated, data);

      done();
    });
  });

  it('undercomitted', function () {
    const data = new Buffer([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    const compressed = Zlib.deflateSync(data);
    const decompressed = Zlib.inflateSync(compressed);

    assertArray(data, decompressed);
  });

  // js deflate, native inflate
  it('random data', function (done) {
    inflateTest(done, makeRandomData(size));
  });
  it('sequential data', function (done) {
    inflateTest(done, makeSequentialData(size));
  });
  it('random sequential data', function (done) {
    inflateTest(done, makeRandomSequentialData(size));
  });

  // native gzip, js gunzip
  it('gunzip random data', function (done) {
    gunzipTest(done, makeRandomData(size));
  });
  it('gunzip sequential data', function (done) {
    gunzipTest(done, makeSequentialData(size));
  });
  it('gunzip random sequential data', function (done) {
    gunzipTest(done, makeRandomSequentialData(size));
  });

  // js gzip, native gunzip
  it('gzip random data', function (done) {
    gzipTest(done, makeRandomData(size));
  });
  it('gzip sequential data', function (done) {
    gzipTest(done, makeSequentialData(size));
  });
  it('gzip random sequential data', function (done) {
    gzipTest(done, makeRandomSequentialData(this.testData));
  });

  // 過去に失敗したことのあるテスト
  it('bitbuflen error', function (done) {
    gunzipTest(done, makeRandomSequentialData(this.testData, 1339494909128));
  });

  it('issue#35 wrong inflate 1', function () {
    const compressed = new Buffer(
      "eJx9jq0NQCEMhG8YJMOwAgJdhWYA9kAyAIuQoBmkvNQ80Z+kP/l6uRy8urIysOVoprTaLlOlcXyzvE7qP3jBuo4XCDg/QAyZCQjI",
      "base64"
    );
    const plain = new Buffer(
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 228, 0, 0, 0, 0, 0, 0, 97, 0, 0, 215, 0, 0, 0, 0, 0, 97, 127, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 117, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 174, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 166, 0, 0, 0, 0, 101, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 186, 0, 111, 0, 0, 218, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 111]
    );

    inflateOnlyTest(compressed, plain);
  });

  it('issue#35 wrong inflate 2', function () {
    const compressed = new Buffer(
      "eJxtjD0NgEAMhd8IBlDAigNMsDCxsSIIAyScikvOzAk4A02Tdujf8r2/FPl1Fctk8jufDzSGbGdJ17A7fbAZd6iowMMswM78tLjCy9+417UEYNsIeA==",
      "base64"
    );
    const plain = new Buffer(
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 231, 0, 0, 0, 0, 0, 0, 0, 0, 22, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 243, 0, 194, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 81, 0, 0, 0, 0, 0, 0, 0, 0, 191, 0, 0, 108, 0, 0, 0, 0, 169, 0, 0, 60, 0, 0, 0, 0, 165, 0, 0, 0, 0, 0, 0, 0, 0, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 168, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 152, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    );

    inflateOnlyTest(compressed, plain);
  });

  it('issue#35 take a long time and throw exception', function () {
    const compressed = new Buffer(
      "eJx1jb8NQFAQxj+J2MAASo1EJGIEM1hAhV6iVEg0GgvozGEHG+jscDm5Q/L+FL/3+y73vjfAfVbciDXkqFR9lKretz3XWHbxxl44RSKb+9PWmFw/7+U+MvNlgtTa2D0s3jwyAsYZMgl65Qwx",
      "base64"
    );
    const plain = new Buffer(
      [125, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 0, 237, 0, 41, 0, 0, 0, 0, 0, 0, 0, 0, 54, 0, 90, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 72, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 140, 103, 0, 145, 170, 0, 0, 0, 0, 0, 0, 0, 109, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 137, 33, 0, 0, 0, 0, 0, 0, 0, 163, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 230, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 122, 0, 0, 0, 0, 0, 0, 0, 196, 51, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 111, 0, 0, 0, 0, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 133, 0, 0, 0, 0, 6, 0, 0, 0, 0, 215, 21, 0, 0, 0, 0]
    );

    inflateOnlyTest(compressed, plain);
  });

  it('issue#45 Infinite loop when decoding invalid zip file', function() {
    var data = new Buffer([
      0x08, 0x1D, 0x74, 0x65, 0x73, 0x74, 0x2f, 0x61,
      0x2f, 0x62, 0x6c, 0x61, 0x68, 0x2e, 0x6a, 0x73,
      0x55, 0x58, 0x0c, 0x00, 0x14, 0x2c, 0xdb, 0x55,
      0xa9, 0x98, 0x85, 0x55, 0xf5, 0x01, 0x14, 0x00,
      0x2b, 0x4b, 0x2c, 0x52, 0x28, 0x4e, 0x2d, 0x2a,
      0x4b, 0x2d, 0x52, 0xb0, 0x55, 0xc8, 0x28, 0x29,
      0x29, 0xd0, 0x4b,
    ]);

    assert.throws(
      () => {
        Zlib.inflateSync(data);
      },
      Error
    );
  })
});

// inflate test
function inflateTest(done, testData) {
  const deflate = Zlib.deflateSync(testData);

  // inflate
  NodeZlib.inflate(deflate, function(err, buffer) {
    assertArray(buffer, testData);

    done();
  });
}

function inflateOnlyTest(compressed, plain) {
  const inflated = Zlib.inflateSync(compressed);

  assertArray(inflated, plain);
}

// gzip test
function gzipTest(done, testData) {
  const deflated = Zlib.gzipSync(testData);

  NodeZlib.gunzip(deflated, function(err, buf) {
    assertArray(buf, testData);

    done();
  });
}

// gunzip test
function gunzipTest(done, testData) {
  NodeZlib.gzip(testData, function(err, buf) {
    const inflated = Zlib.gunzipSync(buf);

    assertArray(inflated, testData);

    done();
  });
}

// random
function makeRandomData(size, opt_seed) {
  const data = new Buffer(new Uint8Array(size));
  const seed = typeof opt_seed === 'number' ? opt_seed : +new Date();
  const mt = new MersenneTwister.MersenneTwister(seed);

  console.log("[MersenneTwister] Seed: ", seed);

  // make random data
  for (let i = 0, il = data.length; i < il; ++i) {
    data[i] = mt.nextInt(256);
  }

  return data;
}

// sequential
function makeSequentialData(size) {
  const data = new Buffer(new Uint8Array(size));

  // make sequential data
  for (let i = 0, il = data.length; i < il; ++i) {
    data[i] = i & 0xff;
  }

  return data;
}

// random sequential
function makeRandomSequentialData(size, opt_seed) {
  const data = new Buffer(new Uint8Array(size));
  const seed = typeof opt_seed === 'number' ? opt_seed : +new Date();
  const mt = new MersenneTwister.MersenneTwister(seed);

  console.log("[MersenneTwister] Seed: ", seed);

  // make random data
  for (let i = 0, il = data.length; i < il;) {
    let random1 = mt.nextInt(256);
    let random2 = mt.nextInt(256);

    while (random2--) {
      if (i === il) {
        break;
      }
      data[i++] = random1++ & 0xff;
    }
  }

  return data;
}
//-----------------------------------------------------------------------------
// extract from node.js implementation
//-----------------------------------------------------------------------------
function zlibBuffer(engine, buffer, callback) {
  const buffers = [];
  let nread = 0;

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
    let buffer;
    let n = 0;

    switch (buffers.length) {
      case 0:
        buffer = new Buffer(0);
        break;
      case 1:
        buffer = buffers[0];
        break;
      default:
        buffer = new Buffer(nread);
        buffers.forEach(function(b) {
          const l = b.length;

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
