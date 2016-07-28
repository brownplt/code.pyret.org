{
  requires: [
    { "import-type": "builtin", "name": "base" },
    { "import-type": "builtin", "name": "image" },
    { "import-type": "builtin", "name": "world" },
    { "import-type": "builtin", "name": "gdrive-sheets" },
    { "import-type": "builtin", "name": "plot" },
    { "import-type": "builtin", "name": "str-dict" },
    { "import-type": "builtin", "name": "reactor" }
  ],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, namespace, _ /* intentionally unused */ ) {
    return runtime.makeJSModuleReturn({cpoBuiltins: true});
  }
}
