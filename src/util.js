/**
 * zlib.util.js
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
 * @fileoverview 雑多な関数群をまとめたモジュール実装.
 */

goog.provide('Zlib.Util');

goog.scope(function() {

/**
 * module Zlib.Util
 */
Zlib.Util = {};

/**
 * make network byte order byte array from integer
 * @param {!number} number source number.
 * @param {!number=} size array size.
 * @return {!Array} network byte order array.
 */
Zlib.Util.convertNetworkByteOrder = function(number, size) {
  var tmp = [], octet, nullchar;

  do {
    octet = number & 0xff;
    tmp.push(octet);
    number >>>= 8;
  } while (number > 0);

  if (typeof(size) === 'number') {
    nullchar = 0;
    while (tmp.length < size) {
      tmp.push(nullchar);
    }
  }

  return tmp.reverse();
};


/**
 * 配列風のオブジェクトの部分コピー
 * @param {!(Array|Uint8Array)} arraylike 配列風オブジェクト.
 * @param {!number} start コピー開始インデックス.
 * @param {!number} length コピーする長さ.
 * @return {!Array} 部分コピーした配列.
 */
Zlib.Util.slice = function(arraylike, start, length) {
  var result, arraylength = arraylike.length;

  if (arraylike instanceof Array) {
    return arraylike.slice(start, start + length);
  }

  result = [];

  for (var i = 0; i < length; i++) {
    if (start + i >= arraylength) {
      break;
    }
    result.push(arraylike[start + i]);
  }

  return result;
}

/**
 * 配列風のオブジェクトの結合
 * 結合先の配列に結合元の配列を追加します.
 * @param {!(Array|Uint8Array)} dst 結合先配列.
 * @param {!(Array|Uint8Array)} src 結合元配列.
 * @return {!number} 結合後の配列サイズ.
 */
Zlib.Util.push = function(dst, src) {
  var i = 0, dl = src.length, sl = src.length, pushImpl = (!!dst.push);

  if (pushImpl) {
    for (; i < sl; i++) {
      dst.push(src[i]);
    }
  } else {
    for (; i < sl; i++) {
      dst[dl + i] = src[i];
    }
  }

  return dst.length;
}

/**
 * Byte String から Byte Array に変換.
 * @param {!string} str byte string.
 * @return {!Array.<number>} byte array.
 */
Zlib.Util.stringToByteArray = function(str) {
  /** @type {!Array.<(string|number)>} */
  var tmp = str.split('');
  var i, l;

  for (i = 0, l = tmp.length; i < l; i++) {
    tmp[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
  }

  return tmp;
};

// end of scope
});

/* vim:set expandtab ts=2 sw=2 tw=80: */
