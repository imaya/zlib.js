buster.testCase(
  "zip",
  {
    //-------------------------------------------------------------------------
    setUp:
    //-------------------------------------------------------------------------
      function() {
        var size = 76543;
        var testData = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);

        console.log("use typedarray:", USE_TYPEDARRAY);

        this.testData = testData;
      },
    //-------------------------------------------------------------------------
    'compress (store)':
    //-------------------------------------------------------------------------
      function() {
        makeRandomSequentialData(this.testData);

        var testData = {
          'hogehoge': this.testData,
          'fugafuga': this.testData,
          'piyopiyo': this.testData
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

        assert(
          arrayEquals(
            files['hogehoge'],
            this.testData
          ),
          "hogehoge"
        );
        assert(
          arrayEquals(
            files['fugafuga'],
            this.testData
          ),
          "fugafuga"
        );
        assert(
          arrayEquals(
            files['piyopiyo'],
            this.testData
          ),
          "piyopiyo"
        );
      },
    //-------------------------------------------------------------------------
    'compress (deflate)':
    //-------------------------------------------------------------------------
      function() {
        makeRandomSequentialData(this.testData);

        var testData = {
          'hogehoge': this.testData,
          'fugafuga': this.testData,
          'piyopiyo': this.testData
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

        assert(
          arrayEquals(
            files['hogehoge'],
            this.testData
          ),
          "hogehoge"
        );
        assert(
          arrayEquals(
            files['fugafuga'],
            this.testData
          ),
          "fugafuga"
        );
        assert(
          arrayEquals(
            files['piyopiyo'],
            this.testData
          ),
          "piyopiyo"
        );
      },
    //-------------------------------------------------------------------------
    'compress with password (deflate)':
    //-------------------------------------------------------------------------
      function() {
        makeRandomSequentialData(this.testData);

        var testData = {
          'hogehoge': this.testData,
          'fugafuga': this.testData,
          'piyopiyo': this.testData
        };
        var keys = [];
        var key;
        var i = 0;
        var il;

        for (key in testData) {
          keys[i++] = key;
        }

        var zip = new Zlib.Zip();
        zip.setPassword([0,1,2,3,4,5,6,7,8,9]);
        for (i = 0, il = keys.length; i < il; ++i) {
          key = keys[i];
          zip.addFile(testData[key], {
            filename: stringToByteArray(key),
            compressionMethod: Zlib.Zip.CompressionMethod.DEFLATE
          });
        }
        var zipped = zip.compress();

        var unzip = new Zlib.Unzip(zipped, {
          'password': [0,1,2,3,4,5,6,7,8,9],
          'verify': true
        });
        var files = {};
        var filenames = unzip.getFilenames();

        for (i = 0, il = filenames.length; i < il; ++i) {
          files[filenames[i]] = unzip.decompress(filenames[i]);
        }

        assert(
          arrayEquals(
            files['hogehoge'],
            this.testData
          ),
          "hogehoge"
        );
        assert(
          arrayEquals(
            files['fugafuga'],
            this.testData
          ),
          "fugafuga"
        );
        assert(
          arrayEquals(
            files['piyopiyo'],
            this.testData
          ),
          "piyopiyo"
        );
      }
  }
);





