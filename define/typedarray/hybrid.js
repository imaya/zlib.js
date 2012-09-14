/**
 * defines
 */

goog.provide('USE_TYPEDARRAY');

// Safari が typeof Uint8Array === 'object' になるため、
// 未定義か否かで Typed Array の使用を決定する

/** @const {number} use typed array flag. */
var USE_TYPEDARRAY =
  (typeof Uint8Array !== 'undefined') &&
  (typeof Uint16Array !== 'undefined') &&
  (typeof Uint32Array !== 'undefined');
