define([], function() {
  return function(runtime, namespace) {
    function getBaseUrl() {
      if(requirejs.isBrowser) {
        return runtime.makeString(window.location.origin);
      }
      else {
        return runtime.makeString("file://" + __dirname);
      }
    }
    return runtime.makeObject({
      "provide": runtime.makeObject({
        "get-base-url": runtime.makeFunction(getBaseUrl)
      })
    });
  }
});
