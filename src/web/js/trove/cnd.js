({
    requires: [],
    nativeRequires: [],
    provides: {
        values: {
            genlayout: ["arrow", [["RawArray", "Any"], "String"], "Any"],
        }
    },
    theModule: function (runtime, namespace, uri) {


        function genlayout(v, cndSpec) {
            const container = document.createElement("div");

            // HACK. We should not be doing this, but the 
            // correct D3 version is KEY.
            const script = document.createElement("script");
                script.src = "/js/cndeps/vendor/d3.v4.min.js";
                script.onload = () => {
                console.log("D3 loaded successfully");
                window.d3 = window.d3 || {}; // Ensure `window.d3` is set
                };
                script.onerror = () => {
                console.error("Failed to load D3");
                };
                document.head.appendChild(script);

            console.log("CnD Core", window.CndCore);
            console.log("Pyret Value", v);

            // Create a CnDCore data instance
            const dataInstance = new window.CndCore.PyretDataInstance(v);

            const evaluationContext = {
                sourceData: dataInstance
            };

            const evaluator = new CndCore.Evaluators.SGraphQueryEvaluator();
            evaluator.initialize(evaluationContext);

            const layoutSpec = CndCore.parseLayoutSpec(cndSpec);

            const ENABLE_ALIGNMENT_EDGES = true;
            const instanceNumber = 0;
            const layoutInstance = new CndCore.LayoutInstance(
                layoutSpec,
                evaluator,
                instanceNumber,
                ENABLE_ALIGNMENT_EDGES
            );

            // No projection support for now.
            const projections = {};
            const layoutResult = layoutInstance.generateLayout(dataInstance, projections);
            const currentInstanceLayout = layoutResult.layout;

            // Create the custom element using CnDCore
            const graphElement = document.createElement("webcola-cnd-graph");
            graphElement.setAttribute("width", "800");
            graphElement.setAttribute("height", "600");

            // Attach the layout result to the custom element
            //graphElement.layoutResult = layoutResult;

            // Render the layout using the custom element's method
            graphElement.renderLayout(currentInstanceLayout).then(() => {
                console.log("Layout rendered successfully");
                container.appendChild(graphElement);
            }).catch((error) => {
                console.error("Error rendering layout:", error);
            });


            return container;
        }




        return runtime.makeModuleReturn({
            genlayout: runtime.makeFunction(genlayout)
        }, {});
    }
})
