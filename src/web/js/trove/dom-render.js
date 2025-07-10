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

            // Create error message mount point
            const errorDiv = document.createElement("div");
            errorDiv.id = "error-message-container-" + Math.random().toString(36).slice(2);
            container.appendChild(errorDiv); // <-- Attach to DOM first

            // Create React CnD Layout Interface mount point
            const reactMountDiv = document.createElement("div");
            reactMountDiv.id = "cnd-react-mount-" + Math.random().toString(36).slice(2);
            container.appendChild(reactMountDiv); // <-- Attach to DOM first



            try {
                // CnDCore logic
                const dataInstance = new window.CndCore.PyretDataInstance(v);
                const evaluationContext = { sourceData: dataInstance };
                const evaluator = new CndCore.Evaluators.SGraphQueryEvaluator();
                evaluator.initialize(evaluationContext);
                const r = dataInstance.reify();
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

                // String view
                const stringView = document.createElement("pre");
                stringView.textContent = String(r);
                stringView.style.marginBottom = "10px";

                // Graph element
                const graphElement = document.createElement("webcola-cnd-graph");
                graphElement.setAttribute("width", "800");
                graphElement.setAttribute("height", "600");
                graphElement.renderLayout(currentInstanceLayout).then(() => {
                    // After rendering, set the layout result on the graph element
                    // Now mount React components
                    // console.log("Mounting React components");
                    // if (window.mountErrorMessageModal) {
                    //     console.log("Mounting Error Message Modal");
                    //     window.mountErrorMessageModal(errorDiv.id);
                    // }
                    if (window.mountCndLayoutInterface) {
                        console.log("Mounting CnD Layout Interface");
                        window.mountCndLayoutInterface(reactMountDiv.id);
                    }
                });

                // Add all elements to container
                container.appendChild(errorDiv);
                container.appendChild(stringView);
                container.appendChild(reactMountDiv);
                container.appendChild(graphElement);

            } catch (error) {
                console.error("Error in genlayout:", error);
                const fallbackErrorDiv = document.createElement("div");
                fallbackErrorDiv.style.color = "red";
                fallbackErrorDiv.style.padding = "10px";
                fallbackErrorDiv.style.border = "1px solid red";
                fallbackErrorDiv.style.marginBottom = "10px";
                fallbackErrorDiv.textContent = `Error: ${error.message || error}`;
                container.appendChild(fallbackErrorDiv);
            }

            return container;
        }

        return runtime.makeModuleReturn({
            genlayout: runtime.makeFunction(genlayout)
        }, {});
    }
})