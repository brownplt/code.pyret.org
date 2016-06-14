{
  requires: [
    { "import-type": "builtin", "name": "base" },
    { "import-type": "builtin", "name": "image" },
    { "import-type": "builtin", "name": "world" },
    { "import-type": "builtin", "name": "gdrive-sheets" }
  ],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, namespace, _ /* intentionally unused */ ) {
    return runtime.makeJSModuleReturn({cpoBuiltins: true});
  }
}
