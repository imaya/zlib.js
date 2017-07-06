describe("gzip", function() {
  var size = 76543;
  var USE_TYPEDARRAY = (typeof Uint8Array !== 'undefined');

  this.timeout(60000);

  before(function() {
    Zlib = {
      Gzip: Zlib.Gzip,
      Gunzip: Zlib.Gunzip
    }
  });

  it("random sequential data", function () {
    var testData = makeRandomSequentialData(size);

    var deflator = new Zlib.Gzip(testData);
    var deflated = deflator.compress();

    var inflator = new Zlib.Gunzip(deflated);
    var inflated = inflator.decompress();

    assert(inflated.length === testData.length);
    assertArray(inflated, testData);
  });

  it("compress with filename", function () {
    var testData = makeRandomSequentialData(size);
    var deflator = new Zlib.Gzip(
      testData,
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

    var inflator = new Zlib.Gunzip(deflated);
    var inflated = inflator.decompress();

    assert(inflated.length === testData.length);
    assertArray(inflated, testData);
    assert((inflator.getMembers())[0].getName() === 'foobar.filename');
  });

  it("compress with filename (seed: 1346432776267)", function () {
    var testData = makeRandomSequentialData(size, USE_TYPEDARRAY, 1346432776267);
    var deflator = new Zlib.Gzip(
      testData,
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

    var inflator = new Zlib.Gunzip(deflated);
    var inflated = inflator.decompress();

    assert(inflated.length === testData.length);
    assertArray(inflated, testData);
    assert((inflator.getMembers())[0].getName() === 'foobar.filename');
  });
});