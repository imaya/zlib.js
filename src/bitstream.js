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

goog.scope(function() {

/**
 * ビットストリーム
 * @constructor
 */
Zlib.BitStream = function() {
  this.index = 0;
  this.bitindex = 0;
  this.buffer = [];
};

/**
 * 数値をビットで指定した数だけ書き込む.
 * @param {!number} number 書き込む数値.
 * @param {!number} n 書き込むビット数.
 * @param {!boolean=} reverse 逆順に書き込むならば true.
 */
Zlib.BitStream.prototype.writeBits = function(number, n, reverse) {
  var i,
      buffer = this.buffer,
      bufferIndex = this.index,
      bitindex = this.bitindex;

  if (reverse && n > 1) {
    number = n > 8 ?
      rev32_(number) >> (32 - n) :
      Zlib.BitStream.ReverseTable[number] >> (8 - n);
  }

  // Byte 境界を超えないとき
  if (n + bitindex < 8) {
    buffer[bufferIndex] = (buffer[bufferIndex] << n) | number;
    bitindex += n;
  // Byte 境界を超えるとき
  } else {
    for (i = 0; i < n; i++) {
      buffer[bufferIndex] = (buffer[bufferIndex] << 1) |
                            ((number >> n - i - 1) & 1);
      ++bitindex
      if (bitindex === 8) {
        bitindex = 0;
        buffer[bufferIndex] = Zlib.BitStream.ReverseTable[buffer[bufferIndex]];
        buffer[++bufferIndex] = 0;
      }
    }
  }

  this.bitindex = bitindex;
  this.index = bufferIndex;
};

/**
 * 32-bit 整数のビット順を逆にする
 * @param {number} n 32-bit integer.
 * @return {number} reversed 32-bit integer.
 * @private
 */
function rev32_(n) {
  return (Zlib.BitStream.ReverseTable[n        & 0xFF] << 24) |
         (Zlib.BitStream.ReverseTable[n >>>  8 & 0xFF] << 16) |
         (Zlib.BitStream.ReverseTable[n >>> 16 & 0xFF] <<  8) |
          Zlib.BitStream.ReverseTable[n >>> 24 & 0xFF];
}

/**
 * ストリームの終端処理を行う
 * @return {!Array} 終端処理後のバッファを byte array で返す.
 */
Zlib.BitStream.prototype.finish = function() {
  var buffer = this.buffer,
      index = this.index;

  if (this.bitindex > 0) {
    buffer[index] <<= 8 - this.bitindex;
  }

  buffer[index] = Zlib.BitStream.ReverseTable[buffer[index]];

  if (this.bitindex === 0) {
    buffer.pop();
  }

  return buffer;
};

/**
 * 0-255 のビット順を反転したテーブル
 * @const {Array.<number>}
 */
Zlib.BitStream.ReverseTable = [
  0, 128,  64, 192,  32, 160,  96, 224,  16, 144,  80, 208,  48, 176, 112, 240,
  8, 136,  72, 200,  40, 168, 104, 232,  24, 152,  88, 216,  56, 184, 120, 248,
  4, 132,  68, 196,  36, 164, 100, 228,  20, 148,  84, 212,  52, 180, 116, 244,
 12, 140,  76, 204,  44, 172, 108, 236,  28, 156,  92, 220,  60, 188, 124, 252,
  2, 130,  66, 194,  34, 162,  98, 226,  18, 146,  82, 210,  50, 178, 114, 242,
 10, 138,  74, 202,  42, 170, 106, 234,  26, 154,  90, 218,  58, 186, 122, 250,
  6, 134,  70, 198,  38, 166, 102, 230,  22, 150,  86, 214,  54, 182, 118, 246,
 14, 142,  78, 206,  46, 174, 110, 238,  30, 158,  94, 222,  62, 190, 126, 254,
  1, 129,  65, 193,  33, 161,  97, 225,  17, 145,  81, 209,  49, 177, 113, 241,
  9, 137,  73, 201,  41, 169, 105, 233,  25, 153,  89, 217,  57, 185, 121, 249,
  5, 133,  69, 197,  37, 165, 101, 229,  21, 149,  85, 213,  53, 181, 117, 245,
 13, 141,  77, 205,  45, 173, 109, 237,  29, 157,  93, 221,  61, 189, 125, 253,
  3, 131,  67, 195,  35, 163,  99, 227,  19, 147,  83, 211,  51, 179, 115, 243,
 11, 139,  75, 203,  43, 171, 107, 235,  27, 155,  91, 219,  59, 187, 123, 251,
  7, 135,  71, 199,  39, 167, 103, 231,  23, 151,  87, 215,  55, 183, 119, 247,
 15, 143,  79, 207,  47, 175, 111, 239,  31, 159,  95, 223,  63, 191, 127, 255
];

/*
 * ビット順の反転テーブルは下記で作ることができる
 */
/*
console.log(
  JSON.stringify(
    (function() {
      var r = [], i;

      for (i = 0; i < 256; i++) {
        r[i] = reverseBit(i);
      }

      return r;
    })()
  )
);

function reverseBit(n) {
  var r = n,
      s = 7;

  for (n >>= 1; n; n >>= 1) {
    r <<= 1;
    r |= n & 1;
    --s;
  }

  return (r << s & 0xff) >>> 0;
}
*/

// end of scope
});

/* vim:set expandtab ts=2 sw=2 tw=80: */
