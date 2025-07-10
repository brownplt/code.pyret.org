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


            console.log("CnD Core", window.CndCore);
            console.log("Pyret Value", v);

            // Create a CnDCore data instance
            const dataInstance = new window.CndCore.PyretDataInstance(v);

            const evaluationContext = {
                sourceData: dataInstance
            };

            const evaluator = new CndCore.Evaluators.SGraphQueryEvaluator();
            evaluator.initialize(evaluationContext);

            // This should, eventually, 
            // update LIVE.
            const r = dataInstance.reify();
            console.log("Reified Data Instance:", r);

            const layoutSpec = CndCore.parseLayoutSpec(cndSpec);

            const ENABLE_ALIGNMENT_EDGES = true;
            const instanceNumber = 0;
            const layoutInstance = new CndCore.LayoutInstance(
                layoutSpec,
                evaluator,
                instanceNumber,
                ENABLE_ALIGNMENT_EDGES
            );

            const projections = {};
            const layoutResult = layoutInstance.generateLayout(dataInstance, projections);
            const currentInstanceLayout = layoutResult.layout;

            // Create string view
            const stringView = document.createElement("pre");
            stringView.textContent = String(r);
            stringView.style.marginBottom = "10px";

            // Create graph element
            const graphElement = document.createElement("webcola-cnd-graph");
            graphElement.setAttribute("width", "800");
            graphElement.setAttribute("height", "600");

            // Render the layout
            graphElement.renderLayout(currentInstanceLayout);

            // Add both elements to container
            container.appendChild(stringView);
            container.appendChild(graphElement);

            return container;
        }




        return runtime.makeModuleReturn({
            genlayout: runtime.makeFunction(genlayout)
        }, {});
    }
})