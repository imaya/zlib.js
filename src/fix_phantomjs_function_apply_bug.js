goog.provide('FixPhantomJSFunctionApplyBug_StringFromCharCode');

if (goog.global['Uint8Array'] !== void 0) {
  try {
    // anti-optimization
    eval("String.fromCharCode.apply(null, new Uint8Array([0]));");
  } catch(e) {
    String.fromCharCode.apply = (function(fromCharCodeApply) {
      return function(thisobj, args) {
        return fromCharCodeApply.call(String.fromCharCode, thisobj, Array.prototype.slice.call(args));
      }
    })(String.fromCharCode.apply);
  }
}