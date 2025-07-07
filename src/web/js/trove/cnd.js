({
    requires: [],
    nativeRequires: [],
    provides: {
        values: {
            layout: ["arrow", [["RawArray", "Any"], "String"], "Any"],
        }
    },
    theModule: function (runtime, namespace, uri) { 

        function layout(dataInstance, cndSpec) {

            const container = document.createElement("div");
           
            console.log("CnD Core", window.CnDCore, dataInstance, cndSpec);


            // Data Instance -> IDataINstance

            // Now we use the CnDCore to create a svg element
            // Attach it as a child of the container, and return it.


           
            return container;
        }




        return runtime.makeModuleReturn({
            styled: runtime.makeFunction(layout)
        }, {});
    }
})
