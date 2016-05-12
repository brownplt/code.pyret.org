{
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
      args: ["../../../pyret/src/arr/compiler/locators/builtin.arr"]
    },
    { "import-type": "builtin",
      name: "runtime-lib"
    }
  ],
  nativeRequires: [
    "cpo/repl-ui.js",
    "cpo/cpo-builtins",
    "cpo/gdrive-locators",
    "cpo/http-imports",
    "pyret-base/js/runtime"
  ],
  provides: {},
  theModule: function(runtime, namespace, uri,
                      compileLib, compileStructs, pyRepl, builtin,
                      replUI, cpoBuiltin, gdriveLocators, http, rtLib) {

    console.log("Loaded");

  }
}
