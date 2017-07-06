describe('gunzip', function() {
  this.timeout(60000);

  before(function() {
    Zlib = {
      Gzip: ZlibGzip.Gzip,
      Gunzip: ZlibGunzip.Gunzip
    }
  });

  it("pre-compressed data", function() {
    var testData =
      "H4sIAAAAAAAAA0tMTEwEAEXlmK0EAAAA";
    var plain = new Uint8Array("aaaa".split('').map(function(c) { return c.charCodeAt(0); }));

    var decodedData = base64toArray(testData);

    var inflator = new Zlib.Gunzip(decodedData);
    var inflated = inflator.decompress();

    assert(inflated.length === plain.length);
    assertArray(inflated, plain);
  });

  it("decompress pre-compressed data with filename", function() {
    var testData =
      "H4sICOzl1k8AA2hvZ2UudHh0AMtIzcnJVyjPL8pJ4QIALTsIrwwAAAA=";
    var plain = new Uint8Array(
      "hello world".split('').map(function(c) { return c.charCodeAt(0); }).concat(0x0a)
    );

    var decodedData = base64toArray(testData);
    var inflator = new Zlib.Gunzip(decodedData);
    var inflated = inflator.decompress();

    assert(inflated.length === plain.length);
    assertArray(inflated, plain);
    assert((inflator.getMembers())[0].getName() === 'hoge.txt');
  });
});

