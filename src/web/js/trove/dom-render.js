({
    requires: [],
    nativeRequires: [],
    provides: {
        values: {
            styled: ["arrow", [["RawArray", "Any"], "String"], "Any"]
        }
    },
    theModule: function(runtime, namespace, uri) {
        function styled(nodes, style) {
            const container = document.createElementByTagName("div");
            for(let i = 0; i < nodes.length; i += 1) {
                container.appendChild(nodes[i]);
            }
            container.style = style;
            return container;
        }
        return runtime.makeModuleReturn({
            styled: runtime.makeFunction(styled)
        }, {});
    }
    
})