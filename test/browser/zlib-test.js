describe('zlib', function() {
  var size = 76543;

  this.timeout(60000);

  before(function() {
    Zlib = ZlibOriginal;
  });

  it("uncompressed random data", function () {
    var testData = makeRandomData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.NONE);
  });

  it("fixed random data", function () {
    var testData = makeRandomData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.FIXED);
  });

  it("dynamic random data", function () {
    var testData = makeRandomData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.DYNAMIC);
  });

  it("uncompressed sequential data", function () {
    var testData = makeSequentialData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.NONE);
  });

  it("fixed sequential data", function () {
    var testData = makeSequentialData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.FIXED);
  });

  it("dynamic sequential data", function () {
    var testData = makeSequentialData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.DYNAMIC);
  });

  it("uncompressed random sequential data", function () {
    var testData = makeRandomSequentialData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.NONE);
  });

  it("fixed random sequential data", function () {
    var testData = makeRandomSequentialData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.FIXED);
  });

  it("dynamic random sequential data", function () {
    var testData = makeRandomSequentialData(size);
    compressionAndDecompressionTest(testData, Zlib.Deflate.CompressionType.DYNAMIC);
  });

  it("undercomitted", function () {
    var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    var compressed = new Zlib.Deflate(data).compress();
    var decompressed = new Zlib.Inflate(compressed).decompress();

    assertArray(data, Array.prototype.slice.call(decompressed));
  });
});

