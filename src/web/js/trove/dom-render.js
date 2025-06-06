({
    requires: [],
    nativeRequires: ["cndjs"],
    provides: {
        values: {
            styled: ["arrow", [["RawArray", "Any"], "String"], "Any"],
            layout: ["arrow", [["RawArray", "Any"], "Any"], "Any"] // Ideally this should be an Object of some kind, and then a Promise (or resolution of a Promise).
        }
    },
    theModule: function(runtime, namespace, uri, cndjs) { // TODO: Is this the right way to get cndjs? I'm currently just getting an empty object.

        // TODO: Write a variant of this to make 
        // things work.
        function styled(nodes, style) {

 
            console.log("CnDJS", cndjs);

            console.log("CnDJS is empty object?", Object.keys(cndjs).length === 0);

            const container = document.createElement("div");
            for(let i = 0; i < nodes.length; i += 1) {
                container.appendChild(nodes[i]);
            }
            
            let x =  cndjs.arrangeElements(nodes, [],[],[]).then((arranged) => {
                console.log("Arranged elements", arranged);
                return arranged;
            });
            console.log("x", x);


            container.style = style;
            return container;
        }

        // TODO: THis asynchronous behavior may not be 
        // a Pyret pattern, and may break things?
        async function layout(nodes, spec) {

            // This is a placeholder for where we would actually put together the 
            // specification.
            console.log("Layout spec", spec);


            let x = await cndjs.arrangeElements(nodes, [],[],[]);
            console.log("Arranged elements", x);
            return cndjs.getRenderers("dom")(x);
        }


        return runtime.makeModuleReturn({
            styled: runtime.makeFunction(styled),
            layout: runtime.makeFunction(layout)
        }, {});
    }
    
})
