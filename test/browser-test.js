var USE_TYPEDARRAY = window.Uint8Array !== void 0;

//-----------------------------------------------------------------------------
// base64 decoder
// see http://sourceforge.net/projects/libb64/
//-----------------------------------------------------------------------------
function decodeB64(str) {
  var c, decoded, fragment, i, op, n, table_length, v, il;
  var table = [
    62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1,
    -1, -1, -2, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
  ];
  table_length = table.length;
  decoded = new Array((((table_length + 2) / 3) | 0) * 4);
  c = n = op = 0;

  for (i = 0, il = str.length; i < il; ++i) {
    v = (str.charCodeAt(i) & 0xff) - 43;
    if (v < 0 || v >= table_length) {
      continue;
    }
    fragment = table[v];
    if (fragment < 0) {
      continue;
    }
    switch (n) {
      case 0:
        c = (fragment & 0x03f) << 2;
        ++n;
        break;
      case 1:
        c |= (fragment & 0x030) >> 4;
        decoded[op++] = c;
        c = (fragment & 0x00f) << 4;
        ++n;
        break;
      case 2:
        c |= (fragment & 0x03c) >> 2;
        decoded[op++] = c;
        c = (fragment & 0x003) << 6;
        ++n;
        break;
      case 3:
        c |= fragment & 0x03f;
        decoded[op++] = c;
        n = 0;
    }
  }
  decoded.length = op;

  return decoded;
}

//-----------------------------------------------------------------------------
// array assertion
//-----------------------------------------------------------------------------
function arrayEquals(expected, actuals) {
  var i, il;

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

var fixedData =
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
    },
    "inflate pre-deflated data": function() {
      var size = 123456;
      var plain = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);
      var i, il;
      var testData = fixedData;

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
    "inflate pre-deflated data with inflate bufferSize option": function() {
      var size = 123456;
      var plain = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);
      var i, il;
      var testData = fixedData;

      // make plain data
      for (i = 0, il = size; i < il; ++i) {
        plain[i] = i & 0xff;
      }

      var decodedData = decodeB64(testData);

      // testdata size
      assert.equals(testData.length, 1604, "source data size");
      assert.equals(decodedData.length, 1202, "base64 decoded data size");

      var inflator = new Zlib.Inflate(decodedData, {bufferSize: 123456});
      var inflated = inflator.decompress();

      console.log("buffer size:", inflated.buffer.byteLength);
      assert.equals(inflated.length, size, "inflated data size");
      assert.equals(inflated.buffer.byteLength, 123456, "inflated data buffer size");
      assert(arrayEquals(inflated, plain));
    },
    "inflate pre-deflated data with inflate bufferType option": function() {
      var size = 123456;
      var plain = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);
      var i, il;
      var testData = fixedData;

      // make plain data
      for (i = 0, il = size; i < il; ++i) {
        plain[i] = i & 0xff;
      }

      var decodedData = decodeB64(testData);

      // testdata size
      assert.equals(testData.length, 1604, "source data size");
      assert.equals(decodedData.length, 1202, "base64 decoded data size");

      var inflator = new Zlib.Inflate(decodedData, {
        bufferType: Zlib.Inflate.BufferType.BLOCK,
        bufferSize: 41152,
        verify: true
      });
      var inflated = inflator.decompress();

      console.log("buffer size:", inflated.buffer.byteLength);
      assert.equals(inflated.length, size, "inflated data size");
      assert.equals(inflated.buffer.byteLength, 123456, "inflated data buffer size");
      assert(arrayEquals(inflated, plain));
    },
    "inflate pre-deflated data with inflate resize option": function() {
      var size = 123456;
      var plain = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);
      var i, il;
      var testData = fixedData;

      // make plain data
      for (i = 0, il = size; i < il; ++i) {
        plain[i] = i & 0xff;
      }

      var decodedData = decodeB64(testData);

      // testdata size
      assert.equals(testData.length, 1604, "source data size");
      assert.equals(decodedData.length, 1202, "base64 decoded data size");

      var inflator = new Zlib.Inflate(decodedData, {
        bufferType: Zlib.Inflate.BufferType.BLOCK,
        bufferSize: 41153,
        resize: true
      });
      var inflated = inflator.decompress();

      console.log("buffer size:", inflated.buffer.byteLength);
      assert.equals(inflated.length, size, "inflated data size");
      assert.equals(inflated.buffer.byteLength, 123456, "inflated data buffer size");
      assert(arrayEquals(inflated, plain));
    },
    "undercomitted": function() {
      var data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
      var compressed = new Zlib.Deflate(data).compress();
      var decompressed = new Zlib.Inflate(compressed).decompress();
      assert(arrayEquals(data, Array.prototype.slice.call(decompressed)));
    },
    "uncompressed random data": function() {
      makeRandomData(this.testData);
      inflateTest('random', this.testData, Zlib.Deflate.CompressionType.NONE);
    },
    "fixed random data": function() {
      makeRandomData(this.testData);
      inflateTest('random', this.testData, Zlib.Deflate.CompressionType.FIXED);
    },
    "dynamic random data": function() {
      makeRandomData(this.testData);
      inflateTest('random', this.testData, Zlib.Deflate.CompressionType.DYNAMIC);
    },
    "uncompressed sequential data": function() {
      makeSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.NONE);
    },
    "fixed sequential data": function() {
      makeSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.FIXED);
    },
    "dynamic sequential data": function() {
      makeSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.DYNAMIC);
    },
    "uncompressed random sequential data": function() {
      makeRandomSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.NONE);
    },
    "fixed random sequential data": function() {
      makeRandomSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.FIXED);
    },
    "dynamic random sequential data": function() {
      makeRandomSequentialData(this.testData);
      inflateTest('sequential', this.testData, Zlib.Deflate.CompressionType.DYNAMIC);
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
      assert.equals((inflator.getMembers())[0].getName(), 'foobar.filename');
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
      console.log(decodedData);

      var inflator = new Zlib.Gunzip(decodedData);
      var inflated = inflator.decompress();

      assert.equals(inflated.length, plain.length, "inflated data size");
      assert.equals(inflated, plain);
      assert.equals((inflator.getMembers())[0].getName(), 'hoge.txt');
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
      assert.equals((inflator.getMembers())[0].getName(), 'foobar.filename');
    }
  }
);

// inflate test
function inflateTest(mode, testData, compressionType, inflateOption) {
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
  if (inflateOption) {
    inflateOption.verify = true;
  } else {
    inflateOption = {verify: true};
  }
  inflate = (new Zlib.Inflate(deflate, inflateOption)).decompress();
  console.log("inflated data size:", inflate.length)

  // assertion
  assert(inflate.length, testData.length);
  assert(arrayEquals(inflate, testData));
}

// random
function makeRandomData(data) {
  var seed = +new Date();
  var mt = new MersenneTwister(seed);
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

