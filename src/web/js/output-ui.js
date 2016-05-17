({
  requires: [],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, _, uri) {
    return runtime.makeJSModuleReturn({"output-ui": true});
  }
})
