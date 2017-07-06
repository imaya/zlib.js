describe("zip", function() {
  var size = 76543;

  this.timeout(60000);

  before(function() {
    Zlib = {
      Unzip: ZlibUnzip.Unzip,
      Zip: ZlibZip.Zip
    }
  });

  it('compress (store)', function () {
    var testData = makeRandomSequentialData(size);

    testData = {
      'hogehoge': testData,
      'fugafuga': testData,
      'piyopiyo': testData
    };
    var keys = [];
    var key;
    var i = 0;
    var il;

    for (key in testData) {
      keys[i++] = key;
    }

    var zip = new Zlib.Zip();
    for (i = 0, il = keys.length; i < il; ++i) {
      key = keys[i];
      zip.addFile(testData[key], {
        filename: stringToByteArray(key),
        compressionMethod: Zlib.Zip.CompressionMethod.STORE
      });
    }
    var zipped = zip.compress();

    var unzip = new Zlib.Unzip(zipped, {
      'verify': true
    });
    var files = {};
    var filenames = unzip.getFilenames();

    for (i = 0, il = filenames.length; i < il; ++i) {
      files[filenames[i]] = unzip.decompress(filenames[i]);
    }

    assertArray(files[keys[0]], testData[keys[0]]);
    assertArray(files[keys[1]], testData[keys[1]]);
    assertArray(files[keys[2]], testData[keys[2]]);
  });

  it('compress (deflate)', function () {
    var testData = makeRandomSequentialData(size);

    testData = {
      'hogehoge': testData,
      'fugafuga': testData,
      'piyopiyo': testData
    };
    var keys = [];
    var key;
    var i = 0;
    var il;

    for (key in testData) {
      keys[i++] = key;
    }

    var zip = new Zlib.Zip();
    for (i = 0, il = keys.length; i < il; ++i) {
      key = keys[i];
      zip.addFile(testData[key], {
        filename: stringToByteArray(key),
        compressionMethod: Zlib.Zip.CompressionMethod.DEFLATE
      });
    }
    var zipped = zip.compress();

    var unzip = new Zlib.Unzip(zipped, {
      'verify': true
    });
    var files = {};
    var filenames = unzip.getFilenames();

    for (i = 0, il = filenames.length; i < il; ++i) {
      files[filenames[i]] = unzip.decompress(filenames[i]);
    }

    assertArray(files[keys[0]], testData[keys[0]]);
    assertArray(files[keys[1]], testData[keys[1]]);
    assertArray(files[keys[2]], testData[keys[2]]);
  });

  it('compress with password (deflate)', function () {
    var testData = makeRandomSequentialData(size);

    testData = {
      'hogehoge': testData,
      'fugafuga': testData,
      'piyopiyo': testData
    };
    var keys = [];
    var key;
    var i = 0;
    var il;

    for (key in testData) {
      keys[i++] = key;
    }

    var zip = new Zlib.Zip();
    zip.setPassword([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (i = 0, il = keys.length; i < il; ++i) {
      key = keys[i];
      zip.addFile(testData[key], {
        filename: stringToByteArray(key),
        compressionMethod: Zlib.Zip.CompressionMethod.DEFLATE
      });
    }
    var zipped = zip.compress();

    var unzip = new Zlib.Unzip(zipped, {
      'password': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      'verify': true
    });
    var files = {};
    var filenames = unzip.getFilenames();

    for (i = 0, il = filenames.length; i < il; ++i) {
      files[filenames[i]] = unzip.decompress(filenames[i]);
    }

    assertArray(files[keys[0]], testData[keys[0]]);
    assertArray(files[keys[1]], testData[keys[1]]);
    assertArray(files[keys[2]], testData[keys[2]]);
  });

  it('compress with password (each file)', function () {
    var testData = makeRandomSequentialData(size);

    testData = {
      'hogehoge': [testData, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
      'fugafuga': [testData, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]],
      'piyopiyo': [testData, [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]]
    };
    var keys = [];
    var key;
    var i = 0;
    var il;

    for (key in testData) {
      keys[i++] = key;
    }

    var zip = new Zlib.Zip();
    for (i = 0, il = keys.length; i < il; ++i) {
      key = keys[i];
      zip.addFile(testData[key][0], {
        filename: stringToByteArray(key),
        compressionMethod: Zlib.Zip.CompressionMethod.DEFLATE,
        password: testData[key][1]
      });
    }
    var zipped = zip.compress();

    var unzip = new Zlib.Unzip(zipped, {
      'verify': true
    });
    var files = {};
    var filenames = unzip.getFilenames();

    for (i = 0, il = filenames.length; i < il; ++i) {
      files[filenames[i]] = unzip.decompress(
        filenames[i],
        {
          'password': testData[filenames[i]][1]
        }
      );
    }

    assertArray(files[keys[0]], testData[keys[0]][0]);
    assertArray(files[keys[1]], testData[keys[1]][0]);
    assertArray(files[keys[2]], testData[keys[2]][0]);
  });
});
