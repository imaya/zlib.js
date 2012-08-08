/**
 * gunzip.js
 *
 * The MIT License
 *
 * Copyright (c) 2012 imaya
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
 * @fileoverview GZIP (RFC1952) 展開コンテナ実装.
 */
goog.provide('Zlib.Gunzip');

goog.require('Zlib.CRC32');
goog.require('Zlib.Gzip');
goog.require('Zlib.RawInflate');

//-----------------------------------------------------------------------------

/** @define {boolean} export symbols. */
var ZLIB_GUNZIP_EXPORT = false;

//-----------------------------------------------------------------------------
//
goog.scope(function() {

/**
 * @constructor
 * @param {!(Array|Uint8Array)} input input buffer.
 * @param {Object=} opt_params option parameters.
 */
Zlib.Gunzip = function(input, opt_params) {
  /** @type {!(Array.<number>|Uint8Array)} input buffer. */
  this.input = input;
  /** @type {number} input buffer pointer. */
  this.ip = 0;
  /** @type {!(Array.<number>|Uint8Array)} output buffer. */
  this.output;
  /** @type {number} output buffer. */
  this.op = 0;
  /** @type {string} filename. */
  this.name;
  /** @type {Date} modification time. */
  this.mtime;
  /** @type {string} comment. */
  this.comment;
};

/**
 * inflate gzip data.
 * @return {!(Array.<number>|Uint8Array)} inflated buffer.
 */
Zlib.Gunzip.prototype.decompress = function() {
  /** @type {number} input length. */
  var il = this.input.length;

  while (this.ip < il) {
    this.decodeMember();
  }

  return this.output;
};

/**
 * decode gzip member.
 */
Zlib.Gunzip.prototype.decodeMember = function() {
  /** @type {number} signature first byte. */
  var id1;
  /** @type {number} signature second byte. */
  var id2;
  /** @type {number} compression method. */
  var cm;
  /** @type {number} flags. */
  var flg;
  /** @type {number} modification time. */
  var mtime;
  /** @type {number} extra flags. */
  var xfl;
  /** @type {number} operating system number. */
  var os;
  /** @type {number} CRC-16 value for FHCRC flag. */
  var crc16;
  /** @type {number} extra length. */
  var xlen;
  /** @type {number} CRC-32 value for verification. */
  var crc32;
  /** @type {number} input size modulo 32 value. */
  var isize;
  /** @type {Zlib.RawInflate} RawInflate implementation. */
  var rawinflate;
  /** @type {!(Array.<number>|Uint8Array)} inflated data. */
  var inflated;
  /** @type {number} inflate size */
  var inflen;

  /** @type {number} character code */
  var c;
  /** @type {number} character index in string. */
  var ci;
  /** @type {Array.<string>} character array. */
  var str;
  /** @type {number} loop counter. */
  var i;
  /** @type {number} loop limiter. */
  var il;

  var input = this.input;
  var ip = this.ip;

  id1 = input[ip++];
  id2 = input[ip++];

  // check signature
  if (id1 !== 0x1f || id2 !== 0x8b) {
    throw new Error('invalid file signature:', id1, id2);
  }

  // check compression method
  cm = input[ip++];
  switch (cm) {
    case 8: /* XXX: use Zlib const */
      break;
    default:
      throw new Error('unknown compression method: ' + cm);
  }

  // flags
  flg = input[ip++];

  // modification time
  mtime = (input[ip++])       |
          (input[ip++] << 8)  |
          (input[ip++] << 16) |
          (input[ip++] << 24);
  this.mtime = new Date(mtime * 1000);

  // extra flags
  xfl = input[ip++];

  // operating system
  os = input[ip++];

  // extra
  if ((flg & Zlib.Gzip.FlagsMask.FEXTRA) > 0) {
    xlen = input[ip++] | (input[ip++] << 8);
    ip = this.decodeSubField(ip, xlen);
  }

  // fname
  if ((flg & Zlib.Gzip.FlagsMask.FNAME) > 0) {
    for(str = [], ci = 0; (c = input[ip++]) > 0;) {
      str[ci++] = String.fromCharCode(c);
    }
    this.name = str.join('');
  }

  // fcomment
  if ((flg & Zlib.Gzip.FlagsMask.FCOMMENT) > 0) {
    for(str = [], ci = 0; (c = input[ip++]) > 0;) {
      str[ci++] = String.fromCharCode(c);
    }
    this.comment = str.join('');
  }

  // fhcrc
  if ((flg & Zlib.Gzip.FlagsMask.FHCRC) > 0) {
    crc16 = Zlib.CRC32.calc(input, 0, ip) & 0xffff;
    if (crc16 !== (input[ip++] | (input[ip++] << 8))) {
      throw new Error('invalid header crc16');
    }
  }

  // isize を事前に取得すると展開後のサイズが分かるため、
  // inflate処理のバッファサイズが事前に分かり、高速になる
  isize = (input[input.length - 4])       | (input[input.length - 3] << 8) |
          (input[input.length - 2] << 16) | (input[input.length - 1] << 24);

  // isize の妥当性チェック
  // ハフマン符号では最小 2-bit のため、最大で 1/4 になる
  // LZ77 符号では 長さと距離 2-Byte で最大 258-Byte を表現できるため、
  // 1/128 になるとする
  // ここから入力バッファの残りが isize の 512 倍以上だったら
  // サイズ指定のバッファ確保は行わない事とする
  if (this.input.length - ip - /* CRC-32 */4 - /* ISIZE */4  > isize * 512) {
    inflen = isize;
  }

  // compressed block
  rawinflate = typeof inflen === 'number' ?
    new Zlib.RawInflate(input, ip, inflen) : new Zlib.RawInflate(input, ip);
  inflated = rawinflate.inflate();
  ip = rawinflate.ip;

  if (USE_TYPEDARRAY) {
    this.output = new Uint8Array(inflated.length);
    this.output.set(inflated, this.op);
    this.op += inflated.length;
  } else {
    this.output = new Array(inflated.length);
    // XXX: unrolling
    for (i = 0, il = inflated.length; i < il; ++i) {
      this.output[this.op++] = inflated[i];
    }
  }

  // crc32
  crc32 = ((input[ip++])       | (input[ip++] << 8) |
           (input[ip++] << 16) | (input[ip++] << 24)) >>> 0;
  if (Zlib.CRC32.calc(inflated) !== crc32) {
    throw new Error('invalid CRC-32 checksum: 0x' +
        Zlib.CRC32.calc(inflated).toString(16) + ' / 0x' + crc32.toString(16));
  }

  // input size
  isize = ((input[ip++])       | (input[ip++] << 8) |
           (input[ip++] << 16) | (input[ip++] << 24)) >>> 0;
  if ((this.output.length & 0xffffffff) !== isize) {
    throw new Error('invalid input size: ' +
        (this.output.length & 0xffffffff) + ' / ' + isize);
  }

  this.ip = ip;
};

/**
 * サブフィールドのデコード
 * XXX: 現在は何もせずスキップする
 */
Zlib.Gunzip.prototype.decodeSubField = function(ip, length) {
  return ip + length;
};



//*****************************************************************************
// export
//*****************************************************************************
if (ZLIB_GUNZIP_EXPORT) {
  goog.exportSymbol('Zlib.Gunzip', Zlib.Gunzip);
  goog.exportSymbol(
    'Zlib.Gunzip.prototype.decompress',
    Zlib.Gunzip.prototype.decompress
  );
}


});
/* vim:set expandtab ts=2 sw=2 tw=80: */
