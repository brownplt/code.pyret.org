{
  requires: [
    { "import-type": "builtin", "name": "base" },
    { "import-type": "builtin", "name": "image" },
    { "import-type": "builtin", "name": "image-typed" },
    { "import-type": "builtin", "name": "world" },
    { "import-type": "builtin", "name": "gdrive-sheets" },
    { "import-type": "builtin", "name": "plot" },
    { "import-type": "builtin", "name": "plot-list" },
    { "import-type": "builtin", "name": "chart" },
    { "import-type": "builtin", "name": "str-dict" },
    { "import-type": "builtin", "name": "reactors" },
    { "import-type": "builtin", "name": "math" },
    { "import-type": "builtin", "name": "statistics" },
    { "import-type": "builtin", "name": "constants" },
    { "import-type": "builtin", "name": "empty-context" },
    { "import-type": "builtin", "name": "essentials2020" },
    { "import-type": "builtin", "name": "essentials2021" },
    { "import-type": "builtin", "name": "essentials2024" },
    { "import-type": "builtin", "name": "starter2024" }
  ],
  provides: {},
  nativeRequires: [],
  theModule: function(runtime, namespace, _ /* intentionally unused */ ) {
    return runtime.makeJSModuleReturn({cpoBuiltins: true});
  }
}
