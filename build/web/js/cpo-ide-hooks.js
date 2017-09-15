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
      name: "cpo-builtins"
    },
    {
      "import-type": "builtin",
      name: "parse-pyret"
    }
  ],
  nativeRequires: [
    "cpo/cpo-builtin-modules",
    "pyret-base/js/js-numbers",
  ],
  provides: {},
  theModule: function(runtime, namespace, uri,
                      compileLib, compileStructs, pyRepl, cpo,
                      runtimeLib, loadLib, cpoBuiltins, parsePyret,
                      cpoModules, jsnums
  ) {
    window.CPOIDEHooks = {
      runtime: runtime,
      cpo: cpo,
      parsePyret: parsePyret,
      loadLib: loadLib,
      runtimeLib: runtimeLib,
      compileStructs: compileStructs,
      compileLib: compileLib,
      cpoModules: cpoModules,
      jsnums: jsnums
    };
    return runtime.makeModuleReturn({}, {});
  }
})
