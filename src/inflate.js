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

goog.provide('Zlib.Inflate');

//-----------------------------------------------------------------------------

/** @define {boolean} export symbols. */
var ZLIB_INFLATE_EXPORT = false;

//-----------------------------------------------------------------------------

goog.require('Zlib.Adler32');
goog.require('Zlib.RawInflate');

goog.scope(function() {

/**
 * @param {!(Uint8Array|Array)} input deflated buffer.
 * @param {number=} opt_blocksize buffer blocksize.
 * @param {boolean=} opt_verify verify adler-32 checksum.
 * @constructor
 */
Zlib.Inflate = function(input, opt_blocksize, opt_verify) {
  /** @type {!(Uint8Array|Array)} */
  this.input = input;
  /** @type {number} */
  this.ip = 0;
  /** @type {Zlib.RawInflate} */
  this.rawinflate;
  /** @type {(boolean|undefined)} verify flag. */
  this.verify = opt_verify;

 // Compression Method and Flags
  var cmf = input[this.ip++];
  var flg = input[this.ip++];

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

  // RawInflate
  this.rawinflate = new Zlib.RawInflate(input, this.ip, opt_blocksize);
}

/**
 * decompress.
 * @return {!(Uint8Array|Array)} inflated buffer.
 */
Zlib.Inflate.prototype.decompress = function() {
  /** @type {!(Array|Uint8Array)} input buffer. */
  var input = this.input;
  /** @type {!(Uint8Array|Array)} inflated buffer. */
  var buffer;
  /** @type {number} adler-32 checksum */
  var adler32;

  buffer = this.rawinflate.decompress();

  // verify adler-32
  if (this.verify) {
    adler32 =
      input[this.ip++] << 24 | input[this.ip++] << 16 |
      input[this.ip++] << 8 | input[this.ip++];

    if (adler32 !== Zlib.Adler32(buffer)) {
      throw new Error('invalid adler-32 checksum');
    }
  }

  return buffer;
};

//*****************************************************************************
// export
//*****************************************************************************
if (ZLIB_INFLATE_EXPORT) {
  goog.exportSymbol('Zlib.Inflate', Zlib.Inflate);
  goog.exportSymbol(
    'Zlib.Inflate.prototype.decompress',
    Zlib.Inflate.prototype.decompress
  );
}


// end of scope
});

/* vim:set expandtab ts=2 sw=2 tw=80: */
