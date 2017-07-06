//define(['base', 'rawinflate', 'util'], function() {
  describe('raw-inflate', function() {
    var size = 76543;
    var testData;

    this.timeout(60000);

    before(function() {
      Zlib = {
        RawInflate: ZlibRawInflate.RawInflate,
        RawDeflate: ZlibRawDeflate.RawDeflate
      };
    });

    beforeEach(function() {
      testData = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);
    });

    it("uncompressed random data", function() {
      makeRandomData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.NONE);
    });

    it("fixed random data", function() {
      makeRandomData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.FIXED);
    });

    it("dynamic random data", function() {
      makeRandomData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.DYNAMIC);
    });

    it("uncompressed sequential data", function() {
      makeSequentialData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.NONE);
    });

    it("fixed sequential data", function() {
      makeSequentialData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.FIXED);
    });

    it("dynamic sequential data", function() {
      makeSequentialData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.DYNAMIC);
    });

    it("uncompressed random sequential data", function() {
      makeRandomSequentialData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.NONE);
    });

    it("fixed random sequential data", function() {
      makeRandomSequentialData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.FIXED);
    });

    it("dynamic random sequential data", function() {
      makeRandomSequentialData(testData);
      rawInflateTest(testData, Zlib.RawDeflate.CompressionType.DYNAMIC);
    });

    it("undercomitted", function() {
      var data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
      var compressed = new Zlib.RawDeflate(data).compress();
      var decompressed = new Zlib.RawInflate(compressed).decompress();

      assertArray(data, Array.prototype.slice.call(decompressed));
    });
  });
//});


// inflate test
function rawInflateTest(testData, compressionType, inflateOption) {
  var deflate;
  var inflate;

  // deflate
  deflate = new Zlib.RawDeflate(testData, {
    compressionType: compressionType
  }).compress();

  // inflate
  if (inflateOption) {
    inflateOption.verify = true;
  } else {
    inflateOption = {verify: true};
  }
  inflate = (new Zlib.RawInflate(deflate, inflateOption)).decompress();

  // assertion
  assert(inflate.length === testData.length);
  assertArray(inflate, testData);
}
