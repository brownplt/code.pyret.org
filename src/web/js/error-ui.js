({
  requires: [],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, _, uri) {
    return runtime.makeJSModuleReturn({"error-ui": true});
  }
})
