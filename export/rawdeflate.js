goog.require('Zlib.RawDeflate');

goog.exportSymbol(
  'Zlib.RawDeflate',
  Zlib.RawDeflate
);
Zlib.exportObject(
  'Zlib.RawDeflate.CompressionType',
  {
    'NONE': Zlib.RawDeflate.CompressionType.NONE,
    'FIXED': Zlib.RawDeflate.CompressionType.FIXED,
    'DYNAMIC': Zlib.RawDeflate.CompressionType.DYNAMIC
  }
);
