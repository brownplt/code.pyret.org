{
  nativeRequires: [],
  requires: [
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-lib.arr"]
    }
  ],
  provides: {},
  theModule: function(runtime, namespace, uri, cl) {
    console.log(cl);
    return runtime.makeModuleReturn({ x: 22 }, {});
  }
}
