/**
 * JavaScript Inflate Library
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

goog.provide('Zlib.InflateStream');

//-----------------------------------------------------------------------------

/** @define {boolean} export symbols. */
var ZLIB_INFLATE_STREAM_EXPORT = false;

//-----------------------------------------------------------------------------

//goog.require('Zlib.Adler32');
goog.require('Zlib.RawInflateStream');

goog.scope(function() {

/**
 * @param {!(Uint8Array|Array)} input deflated buffer.
 * @constructor
 */
Zlib.InflateStream = function(input) {
  /** @type {!(Uint8Array|Array)} */
  this.input = input === void 0 ? new (USE_TYPEDARRAY ? Uint8Array : Array)() : input;
  /** @type {number} */
  this.ip = 0;
  /** @type {Zlib.RawInflateStream} */
  this.rawinflate = new Zlib.RawInflateStream(this.input, this.ip);
  /** @type {Zlib.CompressionMethod} */
  this.method;
  /** @type {!(Array|Uint8Array)} */
  this.output = this.rawinflate.output;
};

/**
 * decompress.
 * @return {!(Uint8Array|Array)} inflated buffer.
 */
Zlib.InflateStream.prototype.decompress = function(input) {
  /** @type {!(Uint8Array|Array)} inflated buffer. */
  var buffer;
  /** @type {number} adler-32 checksum */
  var adler32;

  // 新しい入力を入力バッファに結合する
  // XXX Array, Uint8Array のチェックを行うか確認する
  if (input !== void 0) {
    if (USE_TYPEDARRAY) {
      var tmp = new Uint8Array(this.input.length + input.length);
      tmp.set(this.input, 0);
      tmp.set(input, this.input.length);
      this.input = tmp;
    } else {
      this.input = this.input.concat(input);
    }
  }

  if (this.method === void 0) {
    if(this.readHeader() < 0) {
      return new (USE_TYPEDARRAY ? Uint8Array : Array)();
    }
  }

  buffer = this.rawinflate.decompress(this.input, this.ip);
  this.ip = this.rawinflate.ip;

  // verify adler-32
  /*
  if (this.verify) {
    adler32 =
      input[this.ip++] << 24 | input[this.ip++] << 16 |
      input[this.ip++] << 8 | input[this.ip++];

    if (adler32 !== Zlib.Adler32(buffer)) {
      throw new Error('invalid adler-32 checksum');
    }
  }
  */

  return buffer;
};

/**
 * @return {!(Uint8Array|Array)} current output buffer.
 */
Zlib.InflateStream.prototype.getBytes = function() {
  return this.rawinflate.getBytes();
};

Zlib.InflateStream.prototype.readHeader = function() {
  var ip = this.ip;
  var input = this.input;

  // Compression Method and Flags
  var cmf = input[ip++];
  var flg = input[ip++];

  if (cmf === void 0 || flg === void 0) {
    return -1;
  }

  // compression method
  switch (cmf & 0x0f) {
    case Zlib.CompressionMethod.DEFLATE:
      this.method = Zlib.CompressionMethod.DEFLATE;
      break;
    default:
      throw new Error('unsupported compression method');
  }

  // fcheck
  if (((cmf << 8) + flg) % 31 !== 0) {
    throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
  }

  // fdict (not supported)
  if (flg & 0x20) {
    throw new Error('fdict flag is not supported');
  }

  this.ip = ip;
};


//*****************************************************************************
// export
//*****************************************************************************
if (ZLIB_INFLATE_STREAM_EXPORT) {
  goog.exportSymbol('Zlib.InflateStream', Zlib.InflateStream);
  goog.exportSymbol(
    'Zlib.InflateStream.prototype.decompress',
    Zlib.InflateStream.prototype.decompress
  );
  goog.exportSymbol(
    'Zlib.InflateStream.prototype.getBytes',
    Zlib.InflateStream.prototype.getBytes
  );
}


// end of scope
});

/* vim:set expandtab ts=2 sw=2 tw=80: */
