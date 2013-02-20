(function() {
  for (var key in goog.dependencies_.nameToPath) {
    console.log(key);
    goog.require(key);
  }
})();
