({
  requires: [
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-lib.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-structs.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/repl.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../arr/cpo.arr"]
    },
    { "import-type": "builtin",
      name: "runtime-lib"
    },
    { "import-type": "builtin",
      name: "load-lib"
    },
    { "import-type": "builtin",
      name: "builtin-modules"
    },
    { "import-type": "builtin",
      name: "cpo-builtins"
    }
  ],
  nativeRequires: [
    "cpo/cpo-builtin-modules"
  ],
  provides: {},
  theModule: function(runtime, namespace, uri,
                      compileLib, compileStructs, pyRepl, cpo,
                      runtimeLib, loadLib, builtinModules, cpoBuiltins,
                      cpoModules
  ) {
    window.CPOIDEHooks = {
      runtime: runtime,
      namespace: namespace,
      uri: uri,
      compileLib: compileLib,
      compileStructs: compileStructs,
      pyRepl: pyRepl,
      cpo: cpo,
      runtimeLib: runtimeLib,
      loadLib: loadLib,
      builtinModules: builtinModules,
      cpoBuiltins: cpoBuiltins,
      cpoModules: cpoModules,
    };
    return runtime.makeModuleReturn({}, {});
  }
})
