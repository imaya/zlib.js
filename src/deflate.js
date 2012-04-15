/**
 * zlib.deflate.js
 *
 * The MIT License
 *
 * Copyright (c) 2011 imaya
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @fileoverview Deflate (RFC1951) 実装.
 * Deflateアルゴリズム本体は Zlib.RawDeflate で実装されている.
 */

goog.provide('Zlib.Deflate');

/** @define {boolean} export symbols. */
var ZLIB_DEFLATE_EXPORT = false;
if (ZLIB_DEFLATE_EXPORT) {
  var ZLIB_RAWDEFLATE_EXPROT = true;
}

goog.require('Zlib.Adler32');
goog.require('Zlib.BitStream');
goog.require('Zlib.RawDeflate');
goog.require('Zlib.Util');


goog.scope(function() {

/**
 * Zlib Deflate
 * @param {{compressionType: Zlib.RawDeflate.CompressionType}=} opt_params
 *     parameters.
 * @constructor
 */
Zlib.Deflate = function(opt_params) {
  /**
   * Deflate 符号化対象のバッファ
   * @type {!(Array|Uint8Array)}
   */
  this.buffer = [];

  /**
   * 圧縮タイプ(非圧縮, 固定ハフマン符号, 動的ハフマン符号)
   * デフォルトでは動的ハフマン符号が使用される.
   * @type {Zlib.RawDeflate.CompressionType}
   */
  this.compressionType = Zlib.RawDeflate.CompressionType.DYNAMIC;

  // option parameters
  if (typeof(opt_params) === 'object') {
    if (typeof(opt_params.compressionType) === 'number') {
      this.compressionType = opt_params.compressionType;
    }
  }

  /**
   * Deflate アルゴリズム実装
   * @type {Zlib.RawDeflate}
   */
  this.rawDeflate = new Zlib.RawDeflate(opt_params);

};

// Zlib.Util のエイリアス
var push = Zlib.Util.push;
var slice = Zlib.Util.slice;
var convertNetworkByteOrder = Zlib.Util.convertNetworkByteOrder;

/**
 * 直接圧縮に掛ける
 * @param {!(Array|Uint8Array|string)} buffer Data.
 * @param {{
 *     compressionType: Zlib.RawDeflate.CompressionType
 * }=} opt_params option parameters.
 * @return {!Array} compressed data byte array.
 */
Zlib.Deflate.compress = function(buffer, opt_params) {
  return (new Zlib.Deflate(opt_params)).compress(buffer);
};

/**
 * Deflate Compression
 * @param {!(Array|Uint8Array|string)} buffer Data.
 * @return {!Array} compressed data byte array.
 */
Zlib.Deflate.prototype.compress = function(buffer) {
  var cmf, flg, cm, cinfo, fcheck, fdict, flevel,
      clevel, compressedData, adler, error = false, deflate;

  // Compression Method and Flags
  cm = Zlib.CompressionMethod.DEFLATE;
  switch (cm) {
    case Zlib.CompressionMethod.DEFLATE:
      cinfo = Math.LOG2E * Math.log(Zlib.RawDeflate.WindowSize) - 8;
      break;
    default:
      throw 'invalid compression method';
  }
  cmf = (cinfo << 4) | cm;

  // Flags
  fdict = 0;
  switch (cm) {
    case Zlib.CompressionMethod.DEFLATE:
      switch (this.compressionType) {
        case Zlib.RawDeflate.CompressionType.NONE: flevel = 0; break;
        case Zlib.RawDeflate.CompressionType.FIXED: flevel = 1; break;
        case Zlib.RawDeflate.CompressionType.DYNAMIC: flevel = 2; break;
        default: throw 'unsupported compression type';
      }
      break;
    default:
      throw 'invalid compression method';
  }
  flg = (flevel << 6) | (fdict << 5);
  fcheck = 31 - (cmf * 256 + flg) % 31;
  flg |= fcheck;

  // Adler-32 checksum
  adler = convertNetworkByteOrder(Zlib.Adler32(buffer), 4);

  // compressed data
  compressedData = this.rawDeflate.compress(buffer);

  // make zlib string
  deflate = [];
  deflate.push(cmf, flg);
  push(deflate, compressedData);
  push(deflate, adler);

  return deflate;
};

//*****************************************************************************
// export
//*****************************************************************************

if (ZLIB_DEFLATE_EXPORT) {
  goog.exportSymbol('Zlib.Deflate', Zlib.Deflate);
  goog.exportSymbol(
    'Zlib.Deflate.compress',
    Zlib.Deflate.compress
  );
}

// end of scope
});

/* vim:set expandtab ts=2 sw=2 tw=80: */
