//-----------------------------------------------------------------------------
// base64 decoder
//-----------------------------------------------------------------------------
function decodeB64(b64buf) {
  var decoded = new Array();
  var tmp, t1, t2, t3, t4;
  var pos = 0;
  var i, il;
  var table = decodeB64.DecodeTable;

  for (i = 0, il = b64buf.length; i < il; i += 4, pos += 3) {
    t1 = table[b64buf.charCodeAt(i)];
    t2 = table[b64buf.charCodeAt(i+1)];
    t3 = table[b64buf.charCodeAt(i+2)];
    t4 = table[b64buf.charCodeAt(i+3)];
    tmp = (t1 << 18) | (t2 << 12) | (t3 << 6) | t4;

    decoded[pos] = tmp >>> 16;
    if (t3 === 255) break;
    decoded[pos+1] = tmp >>> 8 & 0xff;
    if (t4 === 255) break;
    decoded[pos+2] = tmp & 0xff;
  }

  return decoded;
}
decodeB64.DecodeTable = (function(chars){
  var table = new (USE_TYPEDARRAY ? Uint8Array : Array)(256);

  for (var i = 0, il = chars.length; i < il; ++i) {
    table[chars.charCodeAt(i)] = i;
  }
  table['='.charCodeAt(0)] = 255;

  return table;
})('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');

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
      var size = 76543;
      var testData = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);

      console.log("use typedarray:", USE_TYPEDARRAY);

      this.testData = testData;
      this.none = sinon.spy(Zlib.RawDeflate.prototype, "makeNocompressBlock");
      this.fixed = sinon.spy(Zlib.RawDeflate.prototype, "makeFixedHuffmanBlock");
      this.dynamic = sinon.spy(Zlib.RawDeflate.prototype, "makeDynamicHuffmanBlock");
    },
    tearDown: function() {
      this.none.restore();
      this.fixed.restore();
      this.dynamic.restore();
    },
    "inflate pre-deflated data": function() {
      var size = 123456;
      var plain = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);
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

      var decodedData = decodeB64(testData);

      // testdata size
      assert.equals(testData.length, 1604, "source data size");
      assert.equals(decodedData.length, 1202, "base64 decoded data size");

      var inflator = new Zlib.Inflate(decodedData);
      var inflated = inflator.decompress();

      assert.equals(inflated.length, size, "inflated data size");
      assert(arrayEquals(inflated, plain));
    },
    "uncompressed random data": function() {
      makeRandomData(this.testData);
      inflateTest('random', this.testData, Zlib.Deflate.CompressionType.NONE);

      assert(this.none.called);
      refute(this.fixed.called);
      refute(this.dynamic.called);
    },
    "fixed random data": function() {
      makeRandomData(this.testData);
      inflateTest('random', this.testData, Zlib.Deflate.CompressionType.FIXED);

      refute(this.none.called);
      assert(this.fixed.called);
      refute(this.dynamic.called);
    },
    "dynamic random data": function() {
      makeRandomData(this.testData);
      inflateTest('random', this.testData, Zlib.Deflate.CompressionType.DYNAMIC);

      refute(this.none.called);
      refute(this.fixed.called);
      assert(this.dynamic.called);
    },
    "uncompressed sequential data": function() {
      makeSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.NONE);

      assert(this.none.called);
      refute(this.fixed.called);
      refute(this.dynamic.called);
    },
    "fixed sequential data": function() {
      makeSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.FIXED);

      refute(this.none.called);
      assert(this.fixed.called);
      refute(this.dynamic.called);
    },
    "dynamic sequential data": function() {
      makeSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.DYNAMIC);

      refute(this.none.called);
      refute(this.fixed.called);
      assert(this.dynamic.called);
    },
    "uncompressed random sequential data": function() {
      makeRandomSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.NONE);

      assert(this.none.called);
      refute(this.fixed.called);
      refute(this.dynamic.called);
    },
    "fixed random sequential data": function() {
      makeRandomSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.FIXED);

      refute(this.none.called);
      assert(this.fixed.called);
      refute(this.dynamic.called);
    },
    "dynamic random sequential data": function() {
      makeRandomSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.DYNAMIC);

      refute(this.none.called);
      refute(this.fixed.called);
      assert(this.dynamic.called);
    },
    //-------------------------------------------------------------------------
    // stream
    //-------------------------------------------------------------------------
    "uncompressed random sequential data (stream)": function() {
      makeRandomSequentialData(this.testData);
      inflateStreamTest('sequential', this.testData, Zlib.Deflate.CompressionType.NONE);

      assert(this.none.called);
      refute(this.fixed.called);
      refute(this.dynamic.called);
    },
    "fixed random sequential data (stream)": function() {
      makeRandomSequentialData(this.testData);
      inflateStreamTest('sequential', this.testData, Zlib.Deflate.CompressionType.FIXED);

      refute(this.none.called);
      assert(this.fixed.called);
      refute(this.dynamic.called);
    },
    "dynamic random sequential data (stream)": function() {
      makeRandomSequentialData(this.testData);
      inflateStreamTest('sequential', this.testData, Zlib.Deflate.CompressionType.DYNAMIC);

      refute(this.none.called);
      refute(this.fixed.called);
      assert(this.dynamic.called);
    },
    //-------------------------------------------------------------------------
    // gzip
    //-------------------------------------------------------------------------
    "gzip": function() {
      makeRandomSequentialData(this.testData);

      var deflator = new Zlib.Gzip(this.testData);
      var deflated = deflator.compress();

      console.log(deflated.length);
      var inflator = new Zlib.Gunzip(deflated);
      var inflated = inflator.decompress();

      assert.equals(inflated.length, this.testData.length, "inflated data size");
      assert.equals(inflated, this.testData);
    },
    "gzip with filename": function() {
      makeRandomSequentialData(this.testData);

      var deflator =
        new Zlib.Gzip(
          this.testData,
          {
            flags: {
              fname: true,
              fcommenct: false,
              fhcrc: false
            },
            filename: 'foobar.filename'
          }
        );
      var deflated = deflator.compress();

      console.log(deflated.length);
      var inflator = new Zlib.Gunzip(deflated);
      var inflated = inflator.decompress();

      assert.equals(inflated.length, this.testData.length, "inflated data size");
      assert.equals(inflated, this.testData);
      assert.equals(inflator.member[0].name, 'foobar.filename');
    },
    "gunzip": function() {
      var testData =
        "H4sIAAAAAAAAA0tMTEwEAEXlmK0EAAAA";
      var plain = new Uint8Array("aaaa".split('').map(function(c) { return c.charCodeAt(0); }));

      var decodedData = decodeB64(testData);

      var inflator = new Zlib.Gunzip(decodedData);
      var inflated = inflator.decompress();

      assert.equals(inflated.length, plain.length, "inflated data size");
      assert.equals(inflated, plain);
    },
    "gunzip with filename": function() {
      var testData =
        "H4sICOzl1k8AA2hvZ2UudHh0AMtIzcnJVyjPL8pJ4QIALTsIrwwAAAA=";
      var plain = new Uint8Array(
        "hello world".split('').map(function(c) { return c.charCodeAt(0); }).concat(0x0a)
      );

      var decodedData = decodeB64(testData);

      var inflator = new Zlib.Gunzip(decodedData);
      var inflated = inflator.decompress();

      assert.equals(inflated.length, plain.length, "inflated data size");
      assert.equals(inflated, plain);
      assert.equals(inflator.member[0].name, 'hoge.txt');
    },
    "gzip with filename (seed: 1346432776267)": function() {
      makeRandomSequentialData(this.testData, 1346432776267);

      var deflator =
        new Zlib.Gzip(
          this.testData,
          {
            flags: {
              fname: true,
              fcommenct: false,
              fhcrc: false
            },
            filename: 'foobar.filename'
          }
        );
      var deflated = deflator.compress();

      console.log(deflated.length);
      var inflator = new Zlib.Gunzip(deflated);
      var inflated = inflator.decompress();

      assert.equals(inflated.length, this.testData.length, "inflated data size");
      assert.equals(inflated, this.testData);
      assert.equals(inflator.member[0].name, 'foobar.filename');
    }
  }
);

// inflate test
function inflateTest(mode, testData, compressionType) {
  var deflate;
  var inflate;

  console.log("mode:", mode);
  console.log("type:", compressionType);

  // deflate
  deflate = Zlib.Deflate.compress(testData, {
    compressionType: compressionType
  });
  console.log("deflated data size:", deflate.length);

  // inflate
  inflate = (new Zlib.Inflate(deflate, {
    verify: true
  })).decompress();
  console.log("inflated data size:", inflate.length)

  // assertion
  assert(inflate.length, testData.length);
  assert(arrayEquals(inflate, testData));
}
// inflate test
function inflateStreamTest(mode, testData, compressionType) {
  var deflate;
  var inflate;
  var inflator;
  var buf;
  var tmp;
  var i;
  var il;

  console.log("mode:", mode);
  console.log("type:", compressionType);

  // deflate
  deflate = Zlib.Deflate.compress(testData, {
    compressionType: compressionType
  });
  console.log("deflated data size:", deflate.length);

  // inflate
  inflator = new Zlib.InflateStream();
  inflate = new (USE_TYPEDARRAY ? Uint8Array : Array)();
  for (i = 0, il = deflate.length; i < il; ++i) {
    buf = inflator.decompress(deflate.subarray(i, i + 1));
    tmp = new (USE_TYPEDARRAY ? Uint8Array : Array)(buf.length + inflate.length);
    tmp.set(inflate, 0);
    tmp.set(buf, inflate.length);
    inflate = tmp;
  }
  console.log("inflated data size:", inflate.length)

  // assertion
  assert(inflate.length, testData.length);
  assert(arrayEquals(inflate, testData));
}

// random
function makeRandomData(data, seed) {
  var mt = new MersenneTwister(typeof seed === 'number' ? seed : seed = +new Date());
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
function makeRandomSequentialData(data, seed) {
  var mt = new MersenneTwister(typeof seed === 'number' ? seed : seed = +new Date());
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

