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

//-----------------------------------------------------------------------------

/** @define {boolean} export symbols. */
var ZLIB_DEFLATE_EXPORT = false;

//-----------------------------------------------------------------------------

goog.require('Zlib.Adler32');
goog.require('Zlib.BitStream');
goog.require('Zlib.RawDeflate');
goog.require('Zlib.Util');

goog.scope(function() {

/**
 * Zlib Deflate
 * @param {({
 *   compressionType: Zlib.RawDeflate.CompressionType
 * }|Object)=} opt_params
 *     parameters.
 * @constructor
 */
Zlib.Deflate = function(opt_params) {
  /**
   * Deflate 符号化対象のバッファ
   * @type {!(Array|Uint8Array)}
   */
  this.buffer = [];

  this.output =
    new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.Deflate.DefaultBufferSize);

  /**
   * 圧縮タイプ(非圧縮, 固定ハフマン符号, 動的ハフマン符号)
   * デフォルトでは動的ハフマン符号が使用される.
   * @type {Zlib.RawDeflate.CompressionType}
   */
  this.compressionType = Zlib.RawDeflate.CompressionType.DYNAMIC;

  // option parameters
  if (typeof opt_params === 'object') {
    if (typeof opt_params.compressionType === 'number') {
      this.compressionType =
        /** @type {Zlib.RawDeflate.CompressionType} */opt_params.compressionType;
    }
  }

  /**
   * Deflate アルゴリズム実装
   * @type {Zlib.RawDeflate}
   */
  this.rawDeflate = new Zlib.RawDeflate(opt_params);
};

/**
 * @const {boolean} デフォルトバッファサイズ.
 */
Zlib.Deflate.DefaultBufferSize = 0x8000;

// Zlib.Util のエイリアス
var push = Zlib.Util.push;
var slice = Zlib.Util.slice;
var convertNetworkByteOrder = Zlib.Util.convertNetworkByteOrder;

/**
 * 直接圧縮に掛ける
 * @param {!(Array|Uint8Array)} buffer Data.
 * @param {{
 *     compressionType: Zlib.RawDeflate.CompressionType
 * }=} opt_params option parameters.
 * @return {!(Array|Uint8Array)} compressed data byte array.
 */
Zlib.Deflate.compress = function(buffer, opt_params) {
  return (new Zlib.Deflate(opt_params)).compress(buffer);
};

/**
 * Deflate Compression
 * @param {!(Array|Uint8Array)} buffer Data.
 * @return {!(Array|Uint8Array)} compressed data byte array.
 */
Zlib.Deflate.prototype.compress = function(buffer) {
  /** @type {Zlib.CompressionMethod} */
  var cm;
  /** @type {number} */
  var cinfo;
  /** @type {number} */
  var cmf;
  /** @type {number} */
  var flg;
  /** @type {number} */
  var fcheck;
  /** @type {number} */
  var fdict;
  /** @type {number} */
  var flevel;
  /** @type {number} */
  var clevel;
  /** @type {number} */
  var adler;
  /** @type {boolean} */
  var error = false;
  /** @type {!(Array|Uint8Array)} */
  var deflate;
  /** @type {number} */
  var pos = 0;

  deflate = this.output;

  // Compression Method and Flags
  cm = Zlib.CompressionMethod.DEFLATE;
  switch (cm) {
    case Zlib.CompressionMethod.DEFLATE:
      cinfo = Math.LOG2E * Math.log(Zlib.RawDeflate.WindowSize) - 8;
      break;
    default:
      throw new Error('invalid compression method');
  }
  cmf = (cinfo << 4) | cm;
  deflate[pos++] = cmf;

  // Flags
  fdict = 0;
  switch (cm) {
    case Zlib.CompressionMethod.DEFLATE:
      switch (this.compressionType) {
        case Zlib.RawDeflate.CompressionType.NONE: flevel = 0; break;
        case Zlib.RawDeflate.CompressionType.FIXED: flevel = 1; break;
        case Zlib.RawDeflate.CompressionType.DYNAMIC: flevel = 2; break;
        default: throw new Error('unsupported compression type');
      }
      break;
    default:
      throw new Error('invalid compression method');
  }
  flg = (flevel << 6) | (fdict << 5);
  fcheck = 31 - (cmf * 256 + flg) % 31;
  flg |= fcheck;
  deflate[pos++] = flg;

  // Adler-32 checksum
  adler = Zlib.Adler32(buffer);

  deflate = this.rawDeflate.compress(buffer, pos);
  pos = deflate.length;

  if (USE_TYPEDARRAY) {
    // subarray 分を元にもどす
    deflate = new Uint8Array(deflate.buffer);
    // expand buffer
    if (deflate.length <= pos + 4) {
      this.output = new Uint8Array(deflate.length + 4);
      this.output.set(deflate);
      deflate = this.output;
    }
    deflate = deflate.subarray(0, pos + 4);
  }

  // adler32
  deflate[pos++] = adler       & 0xff;
  deflate[pos++] = adler >>  8 & 0xff;
  deflate[pos++] = adler >> 16 & 0xff;
  deflate[pos++] = adler >> 24 & 0xff;

  console.log("0,1 --- ", deflate[0], deflate[1]);
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
