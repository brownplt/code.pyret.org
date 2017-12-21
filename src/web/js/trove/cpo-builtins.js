{
  requires: [
    { "import-type": "builtin", "name": "base" },
    { "import-type": "builtin", "name": "image" },
    { "import-type": "builtin", "name": "image-untyped" },
    { "import-type": "builtin", "name": "world" },
    { "import-type": "builtin", "name": "gdrive-sheets" },
    { "import-type": "builtin", "name": "plot" },
    { "import-type": "builtin", "name": "plot-list" },
    { "import-type": "builtin", "name": "chart" },
    { "import-type": "builtin", "name": "str-dict" },
    { "import-type": "builtin", "name": "reactors" },
    { "import-type": "builtin", "name": "math" },
    { "import-type": "builtin", "name": "statistics" }
  ],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, namespace, _ /* intentionally unused */ ) {
    return runtime.makeJSModuleReturn({cpoBuiltins: true});
  }
}
