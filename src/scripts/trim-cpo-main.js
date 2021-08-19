let acorn = require("acorn");
let walk = require("acorn-walk");
let escodegen = require("escodegen");
let fs = require("fs");

/*

## Description

This script is run during the production build to reduce the size of the cpo-main bundle.

It walks the AST of the bundle looking for the compiled versions of internal modules
(like the compiler implementation) and transforms them in two ways:

1. It strips the source map (`theMap`), which can be quite large. While sourcemaps are used for some
    error messages, end-users of CPO should never get source locations pointing to compiler
    internals, so we do not need them for these modules.

2. It inlines strings containing JavaScript code (in `theModule`), parsing them and then inserting them
    into this document's AST. (Like a ,@ macro in Lisp.) The string version of the code has comments,
    unnecessarily-long variable names, whitespace, etc. By replacing the string with JS code, we allow the
    JS minifier (which runs at a later step) to reformat the code and make it ~50% smaller.

## Example

Before:

```
define("program", [deps], function() {
    return {
        "staticModules": {
            // ... lots more modules ...,
            "builtin://ast": ({
                "theMap": "{\"version\":3, /* 300kb of sourcemap... } ",
                "theModule": "function _5485(){ 200kb of function js as a string ... }",
                "nativeRequires": [],
                "provides": { ... }
            })
        }
    };
}
```

After:

```
define("program", [deps], function() {
    return {
        "staticModules": {
            // ... lots more modules ...,
            "builtin://ast": ({
                "theMap": "",
                "theModule": function _5485(){ js now inline as code ... },
                "nativeRequires": [],
                "provides": { ... }
            })
        }
    };
}
```

*/

let file = process.argv[2]

let ast = acorn.parse(fs.readFileSync(file));

walk.simple(ast, {
    Property(node) {
        // FIXME: need to only run this on internal modules by inspecting module name.

        if(node.key.value === "theModule" || node.key.name === "theModule") {
            if(node.value.type === "Literal") {
                let fnAst = acorn.parse(node.value.value);
                node.value = fnAst;
            }
        }
        if(node.key.value === "theMap" || node.key.name === "theMap") {
            if(node.value.type === "Literal") {
                node.value.value = "{}"
                node.value.raw = "\"{}\""
            }
        }
    }
});

process.stdout.write(escodegen.generate(ast));