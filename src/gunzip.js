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
goog.require('Zlib.GunzipMember');

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
  /** @expose @type {Array.<Zlib.GunzipMember>} */
  this.member = [];
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

  return this.concatMember();
};

/**
 * decode gzip member.
 */
Zlib.Gunzip.prototype.decodeMember = function() {
  /** @type {Zlib.GunzipMember} */
  var member = new Zlib.GunzipMember();
  /** @type {number} */
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
  /** @type {number} modification time. */
  var mtime;
  /** @type {number} */
  var crc32;

  var input = this.input;
  var ip = this.ip;

  member.id1 = input[ip++];
  member.id2 = input[ip++];

  // check signature
  if (member.id1 !== 0x1f || member.id2 !== 0x8b) {
    throw new Error('invalid file signature:', member.id1, member.id2);
  }

  // check compression method
  member.cm = input[ip++];
  switch (member.cm) {
    case 8: /* XXX: use Zlib const */
      break;
    default:
      throw new Error('unknown compression method: ' + member.cm);
  }

  // flags
  member.flg = input[ip++];

  // modification time
  mtime = (input[ip++])       |
          (input[ip++] << 8)  |
          (input[ip++] << 16) |
          (input[ip++] << 24);
  member.mtime = new Date(mtime * 1000);

  // extra flags
  member.xfl = input[ip++];

  // operating system
  member.os = input[ip++];

  // extra
  if ((member.flg & Zlib.Gzip.FlagsMask.FEXTRA) > 0) {
    member.xlen = input[ip++] | (input[ip++] << 8);
    ip = this.decodeSubField(ip, member.xlen);
  }

  // fname
  if ((member.flg & Zlib.Gzip.FlagsMask.FNAME) > 0) {
    for(str = [], ci = 0; (c = input[ip++]) > 0;) {
      str[ci++] = String.fromCharCode(c);
    }
    /** @expose @type {string} */
    member.name = str.join('');
  }

  // fcomment
  if ((member.flg & Zlib.Gzip.FlagsMask.FCOMMENT) > 0) {
    for(str = [], ci = 0; (c = input[ip++]) > 0;) {
      str[ci++] = String.fromCharCode(c);
    }
    /** @expose @type {string} */
    member.comment = str.join('');
  }

  // fhcrc
  if ((member.flg & Zlib.Gzip.FlagsMask.FHCRC) > 0) {
    member.crc16 = Zlib.CRC32.calc(input, 0, ip) & 0xffff;
    if (member.crc16 !== (input[ip++] | (input[ip++] << 8))) {
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
  if (input.length - ip - /* CRC-32 */4 - /* ISIZE */4 < isize * 512) {
    inflen = isize;
  }

  // compressed block
  rawinflate = new Zlib.RawInflate(input, {'index': ip, 'bufferSize': inflen});
  member.data = inflated = rawinflate.decompress();
  ip = rawinflate.ip;

  // crc32
  member.crc32 = crc32 =
    ((input[ip++])       | (input[ip++] << 8) |
     (input[ip++] << 16) | (input[ip++] << 24)) >>> 0;
  if (Zlib.CRC32.calc(inflated) !== crc32) {
    throw new Error('invalid CRC-32 checksum: 0x' +
        Zlib.CRC32.calc(inflated).toString(16) + ' / 0x' + crc32.toString(16));
  }

  // input size
  member.isize = isize =
    ((input[ip++])       | (input[ip++] << 8) |
     (input[ip++] << 16) | (input[ip++] << 24)) >>> 0;
  if ((inflated.length & 0xffffffff) !== isize) {
    throw new Error('invalid input size: ' +
        (inflated.length & 0xffffffff) + ' / ' + isize);
  }

  this.member.push(member);
  this.ip = ip;
};

/**
 * サブフィールドのデコード
 * XXX: 現在は何もせずスキップする
 */
Zlib.Gunzip.prototype.decodeSubField = function(ip, length) {
  return ip + length;
};

/**
 * @return {!(Array.<Number>|Uint8Array)}
 */
Zlib.Gunzip.prototype.concatMember = function() {
  /** @type {Array.<Zlib.GunzipMember>} */
  var member = this.member;
  /** @type {number} */
  var i;
  /** @type {number} */
  var il;
  /** @type {number} */
  var p = 0;
  /** @type {number} */
  var size = 0;
  /** @type {!(Array.<number>|Uint8Array)} */
  var buffer;

  for (i = 0, il = member.length; i < il; ++i) {
    size += member[i].data.length;
  }

  if (USE_TYPEDARRAY) {
    buffer = new Uint8Array(size);
    for (i = 0; i < il; ++i) {
      buffer.set(member[i].data, p);
      p += member[i].data.length;
    }
  } else {
    buffer = [];
    for (i = 0; i < il; ++i) {
      buffer[i] = member[i].data;
    }
    buffer = Array.prototype.concat.apply([], buffer);
  }

  return buffer;
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
