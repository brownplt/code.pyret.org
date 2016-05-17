({
  requires: [],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, _, uri) {
    return runtime.makeJSModuleReturn({"check-ui": true});
  }
})
