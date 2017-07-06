// inflate test
function compressionAndDecompressionTest(testData, compressionType) {
  var deflate;
  var inflate;

  // deflate
  deflate = new Zlib.Deflate(testData, {
    compressionType: compressionType
  }).compress();

  // inflate
  inflate = (new Zlib.Inflate(deflate, {
    verify: true
  })).decompress();

  // assertion
  assert(inflate.length, testData.length);
  assertArray(inflate, testData);
}

// inflate test
function compressionAndDecompressionByStreamTest(testData, compressionType) {
  var deflate;
  var inflate;
  var inflator;
  var buf;
  var tmp;
  var i;
  var il;

  // deflate
  deflate = new Zlib.Deflate.compress(testData, {
    compressionType: compressionType
  });

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

  // assertion
  assert(inflate.length === testData.length);
  assertArray(inflate, testData);
}

function decompressionTest(compressed, plain) {
  var inflated = new Zlib.Inflate(compressed).decompress();

  assert(inflated.length === plain.length);
  assertArray(inflated, plain);
}