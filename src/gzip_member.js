/**
 * gzip_member.js
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
goog.provide('Zlib.GunzipMember');

goog.scope(function() {

/**
 * @constructor
 */
Zlib.GunzipMember = function() {
  /** @expose @type {number} signature first byte. */
  this.id1;
  /** @expose @type {number} signature second byte. */
  this.id2;
  /** @expose @type {number} compression method. */
  this.cm;
  /** @expose @type {number} flags. */
  this.flg;
  /** @expose @type {Date} modification time. */
  this.mtime;
  /** @expose @type {number} extra flags. */
  this.xfl;
  /** @expose @type {number} operating system number. */
  this.os;
  /** @expose @type {number} CRC-16 value for FHCRC flag. */
  this.crc16;
  /** @expose @type {number} extra length. */
  this.xlen;
  /** @expose @type {number} CRC-32 value for verification. */
  this.crc32;
  /** @expose @type {number} input size modulo 32 value. */
  this.isize;
};

});