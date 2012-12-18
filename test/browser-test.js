var USE_TYPEDARRAY = window.Uint8Array !== void 0;

//-----------------------------------------------------------------------------
// base64 decoder
//-----------------------------------------------------------------------------
function decodeB64(b64buf) {
  var decoded =
    new (USE_TYPEDARRAY ? Uint8Array : Array)(b64buf.length * 3 / 4 | 0);
  var tmp;
  var pos = 0;
  var i, il;
  var table = decodeB64.DecodeTable;

  for (i = 0, il = b64buf.length; i < il; i += 4, pos += 3) {
    tmp = (table[b64buf.charCodeAt(i)  ] << 18) |
          (table[b64buf.charCodeAt(i+1)] << 12) |
          (table[b64buf.charCodeAt(i+2)] <<  6) |
          (table[b64buf.charCodeAt(i+3)]);
    decoded[pos]   = tmp >>> 16;
    decoded[pos+1] = tmp >>> 8 & 0xff;
    decoded[pos+2] = tmp       & 0xff;
  }

  return decoded;
}
decodeB64.DecodeTable = (function(chars){
  var table = new (USE_TYPEDARRAY ? Uint8Array : Array)(256);

  for (var i = 0, il = chars.length; i < il; ++i) {
    table[chars.charCodeAt(i)] = i;
  }

  return table;
})('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');

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
      assert.equals(decodedData.length, 1203, "base64 decoded data size");

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
      assert.equals(decodedData.length, 1203, "base64 decoded data size");

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
      assert.equals(decodedData.length, 1203, "base64 decoded data size");

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
      assert.equals(decodedData.length, 1203, "base64 decoded data size");

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

