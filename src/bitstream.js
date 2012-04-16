/**
 * bitstream.js
 *
 * The MIT License
 *
 * Copyright (c) 2011-2012 imaya
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
 * @fileoverview bit 単位での書き込み実装.
 */

goog.provide('Zlib.BitStream');

/** @define {boolean} */
var USE_TYPEDARRAY = true;

goog.scope(function() {

/**
 * ビットストリーム
 * @constructor
 */
Zlib.BitStream = function() {
  this.index = 0;
  this.bitindex = 0;
  this.buffer =
    new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.BitStream.DefaultBlockSize);
  this.blocks = [];
  this.totalpos = 0;
};

/**
 * デフォルトブロックサイズ.
 * @const {number}
 */
Zlib.BitStream.DefaultBlockSize = 0x8000;

/**
 * expand buffer.
 * @return {!(Array|Uint8Array)} new buffer.
 */
Zlib.BitStream.prototype.expandBuffer = function() {
  /** @type {!(Array|Uint8Array)} new buffer. */
  var buffer =
    new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.BitStream.DefaultBlockSize);

  this.totalpos += this.buffer.length;
  this.blocks.push(this.buffer);
  this.buffer = buffer;
  this.index = 0;

  return this.buffer;
};


/**
 * 数値をビットで指定した数だけ書き込む.
 * @param {number} number 書き込む数値.
 * @param {number} n 書き込むビット数.
 * @param {boolean=} reverse 逆順に書き込むならば true.
 */
Zlib.BitStream.prototype.writeBits = function(number, n, reverse) {
  var buffer = this.buffer;
  var index = this.index;
  var bitindex = this.bitindex;

  /** @type {number} current octet. */
  var current = buffer[index];
  /** @type {number} loop counter. */
  var i;

  if (reverse && n > 1) {
    number = n > 8 ?
      rev32_(number) >> (32 - n) :
      Zlib.BitStream.ReverseTable[number] >> (8 - n);
  }

  // Byte 境界を超えないとき
  if (n + bitindex < 8) {
    current = (current << n) | number;
    bitindex += n;
  // Byte 境界を超えるとき
  } else {
    for (i = 0; i < n; ++i) {
      current = (current << 1) | ((number >> n - i - 1) & 1);

      // next byte
      if (++bitindex === 8) {
        bitindex = 0;
        buffer[index++] = Zlib.BitStream.ReverseTable[current];

        // expand
        if (index === buffer.length) {
          buffer = this.expandBuffer();
          index = 0;
        }
        current = 0;
      }
    }
  }
  buffer[index] = current;

  this.buffer = buffer;
  this.bitindex = bitindex;
  this.index = index;
};

/**
 * 32-bit 整数のビット順を逆にする
 * @param {number} n 32-bit integer.
 * @return {number} reversed 32-bit integer.
 * @private
 */
function rev32_(n) {
  return (Zlib.BitStream.ReverseTable[n & 0xFF] << 24) |
         (Zlib.BitStream.ReverseTable[n >>> 8 & 0xFF] << 16) |
         (Zlib.BitStream.ReverseTable[n >>> 16 & 0xFF] << 8) |
          Zlib.BitStream.ReverseTable[n >>> 24 & 0xFF];
}

/**
 * ストリームの終端処理を行う
 * @return {!(Array|Uint8Array)} 終端処理後のバッファを byte array で返す.
 */
Zlib.BitStream.prototype.finish = function() {
  var buffer = this.buffer;
  var index = this.index;
  var limit = this.totalpos + index + 1;

  /** @type {!(Array|Uint8Array)} output buffer */
  var output = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
  /** @type {number} output buffer pointer. */
  var op;
  /** @type {!(Array|Uint8Array)} block buffer. */
  var block;
  /** @type {number} loop counter. */
  var i;
  /** @type {number} loop limiter. */
  var il;
  /** @type {number} loop counter. */
  var j;
  /** @type {number} loop limiter. */
  var jl;

  if (this.bitindex > 0) {
    buffer[index] <<= 8 - this.bitindex;
  }
  buffer[index] = Zlib.BitStream.ReverseTable[buffer[index]];

  // concat blocks
  for (i = 0, il = this.blocks.length, op = 0; i < il; ++i) {
    block = this.blocks[i];
    for (j = 0, jl = block.length; j < jl; ++j) {
      output[op++] = block[j];
    }
  }

  // current
  for (i = 0; i <= index; ++i) {
    output[op++] = buffer[i];
  }

  return output;
};



/**
 * 0-255 のビット順を反転したテーブル
 * @const {!(Uint8Array|Array.<number>)}
 */
Zlib.BitStream.ReverseTable = (function(table) {
  return table;
})((function() {
  /** @type {!(Array|Uint8Array)} reverse table. */
  var table = new (USE_TYPEDARRAY ? Uint8Array : Array)(256);
  /** @type {number} loop counter. */
  var i;
  /** @type {number} loop limiter. */
  var il;

  // generate
  for (i = 0; i < 256; ++i) {
    table[i] = (function(n) {
      var r = n;
      var s = 7;

      for (n >>>= 1; n; n >>>= 1) {
        r <<= 1;
        r |= n & 1;
        --s;
      }

      return (r << s & 0xff) >>> 0;
    })(i);
  }

  return table;
})());


// end of scope
});

/* vim:set expandtab ts=2 sw=2 tw=80: */
