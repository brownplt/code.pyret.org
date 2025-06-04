({
    requires: [],
    nativeRequires: [],
    provides: {
        values: {
            styled: ["arrow", [["RawArray", "Any"], "String"], "Any"]
        }
    },
    theModule: function(runtime, namespace, uri) {

        // TODO: Write a variant of this to make 
        // things work.
        function styled(nodes, style) {
            const container = document.createElement("div");
            for(let i = 0; i < nodes.length; i += 1) {
                container.appendChild(nodes[i]);
            }
            console.log("Setting style", style);
            container.style = style;
            return container;
        }
        return runtime.makeModuleReturn({
            styled: runtime.makeFunction(styled)
        }, {});
    }
    
})
