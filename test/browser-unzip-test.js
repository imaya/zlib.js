buster.testCase(
  "unzip",
  {
    //-------------------------------------------------------------------------
    'decompression files':
    //-------------------------------------------------------------------------
      function() {
        var testData =
          "UEsDBAoAAAAAALZDSEKdh+K5BQAAAAUAAAAIABwAaG9nZS50eHRVVAkAA+g4FFHoOBR"+
          "RdXgLAAEE9gEAAAQUAAAAaG9nZQpQSwMECgAAAAAAukNIQgNLGl0FAAAABQAAAAgAHA"+
          "BmdWdhLnR4dFVUCQAD7zgUUe84FFF1eAsAAQT2AQAABBQAAABmdWdhClBLAwQKAAAAA"+
          "ADCQ0hC8mJOIAUAAAAFAAAACAAcAHBpeW8udHh0VVQJAAP7OBRR+zgUUXV4CwABBPYB"+
          "AAAEFAAAAHBpeW8KUEsBAh4DCgAAAAAAtkNIQp2H4rkFAAAABQAAAAgAGAAAAAAAAQA"+
          "AAKSBAAAAAGhvZ2UudHh0VVQFAAPoOBRRdXgLAAEE9gEAAAQUAAAAUEsBAh4DCgAAAA"+
          "AAukNIQgNLGl0FAAAABQAAAAgAGAAAAAAAAQAAAKSBRwAAAGZ1Z2EudHh0VVQFAAPvO"+
          "BRRdXgLAAEE9gEAAAQUAAAAUEsBAh4DCgAAAAAAwkNIQvJiTiAFAAAABQAAAAgAGAAA"+
          "AAAAAQAAAKSBjgAAAHBpeW8udHh0VVQFAAP7OBRRdXgLAAEE9gEAAAQUAAAAUEsFBgA"+
          "AAAADAAMA6gAAANUAAAAAAA==";
        var decodedData = decodeB64(testData);
        var unzip = new Zlib.Unzip(decodedData);
        var files = {};
        var filenames = unzip.getFilenames();
        var i, il;

        for (i = 0, il = filenames.length; i < il; ++i) {
          files[filenames[i]] = unzip.decompress(filenames[i]);
        }

        assert(
          arrayEquals(
            files['hoge.txt'],
            new Uint8Array(stringToByteArray("hoge\x0a"))
          ),
          "hoge.txt"
        );
        assert(
          arrayEquals(
            files['fuga.txt'],
            new Uint8Array(stringToByteArray("fuga\x0a"))
          ),
          "fuga.txt"
        );
        assert(
          arrayEquals(
            files['piyo.txt'],
            new Uint8Array(stringToByteArray("piyo\x0a"))
          ),
          "piyo.txt"
        );
      }
  }
);