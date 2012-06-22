/**
 * defines
 */

goog.provide('USE_TYPEDARRAY');

/** @const {number} use typed array flag. */
var USE_TYPEDARRAY =
  (typeof Uint8Array === 'function') &&
  (typeof Uint16Array === 'function') &&
  (typeof Uint32Array === 'function');
