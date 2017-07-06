describe("code path", function () {
  var size = 76543;
  var none;
  var fixed;
  var dynamic;

  this.timeout(60000);

  before(function() {
    Zlib = ZlibPretty;
  });

  beforeEach(function () {
    none = sinon.spy(ZlibPretty.RawDeflate.prototype, "makeNocompressBlock");
    fixed = sinon.spy(ZlibPretty.RawDeflate.prototype, "makeFixedHuffmanBlock");
    dynamic = sinon.spy(ZlibPretty.RawDeflate.prototype, "makeDynamicHuffmanBlock");
  });

  afterEach(function () {
    none.restore();
    fixed.restore();
    dynamic.restore();
  });

  it("undercomitted", function () {
    var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    var compressed = new ZlibPretty.Deflate(data).compress();
    var decompressed = new ZlibPretty.Inflate(compressed).decompress();

    assertArray(data, Array.prototype.slice.call(decompressed));
  });

  it("uncompressed random data", function () {
    var testData = makeRandomData(size);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.NONE);

    assert(none.called === true);
    assert(fixed.called === false);
    assert(dynamic.called === false);
  });

  it("fixed random data", function () {
    var testData = makeRandomData(testData);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.FIXED);

    assert(none.called === false);
    assert(fixed.called === true);
    assert(dynamic.called === false);
  });

  it("dynamic random data", function () {
    var testData = makeRandomData(testData);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.DYNAMIC);

    assert(none.called == false);
    assert(fixed.called === false);
    assert(dynamic.called === true);
  });

  it("uncompressed sequential data", function () {
    var testData = makeSequentialData(testData);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.NONE);

    assert(none.called === true);
    assert(fixed.called === false);
    assert(dynamic.called === false);
  });

  it("fixed sequential data", function () {
    var testData = makeSequentialData(testData);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.FIXED);

    assert(none.called === false);
    assert(fixed.called === true);
    assert(dynamic.called === false);
  });

  it("dynamic sequential data", function () {
    var testData = makeSequentialData(testData);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.DYNAMIC);

    assert(none.called == false);
    assert(fixed.called === false);
    assert(dynamic.called === true);
  });

  it("uncompressed random sequential data", function () {
    var testData = makeRandomSequentialData(testData);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.NONE);

    assert(none.called === true);
    assert(fixed.called === false);
    assert(dynamic.called === false);
  });

  it("fixed random sequential data", function () {
    var testData = makeRandomSequentialData(testData);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.FIXED);

    assert(none.called === false);
    assert(fixed.called === true);
    assert(dynamic.called === false);
  });

  it("dynamic random sequential data", function () {
    var testData = makeRandomSequentialData(testData);

    compressionAndDecompressionTest(testData, ZlibPretty.Deflate.CompressionType.DYNAMIC);

    assert(none.called == false);
    assert(fixed.called === false);
    assert(dynamic.called === true);
  });

  //-------------------------------------------------------------------------
  // stream
  //-------------------------------------------------------------------------
  it("uncompressed random sequential data (stream)", function () {
    var testData = makeRandomSequentialData(testData);

    compressionAndDecompressionByStreamTest(testData, ZlibPretty.Deflate.CompressionType.NONE);

    assert(none.called === true);
    assert(fixed.called === false);
    assert(dynamic.called === false);
  });

  it("fixed random sequential data (stream)", function () {
    var testData = makeRandomSequentialData(testData);

    compressionAndDecompressionByStreamTest(testData, ZlibPretty.Deflate.CompressionType.FIXED);

    assert(none.called === false);
    assert(fixed.called === true);
    assert(dynamic.called === false);
  });

  it("dynamic random sequential data (stream)", function () {
    var testData = makeRandomSequentialData(testData);

    compressionAndDecompressionByStreamTest(testData, ZlibPretty.Deflate.CompressionType.DYNAMIC);

    assert(none.called == false);
    assert(fixed.called === false);
    assert(dynamic.called === true);
  });
});
