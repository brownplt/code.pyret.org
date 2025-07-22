({
    requires: [],
    nativeRequires: [],
    provides: {
        values: {
            genlayout: ["arrow", [["RawArray", "Any"], "String"], "Any"],
        }
    },
    theModule: function (runtime, namespace, uri) {

        /**
         * 
         * TODO HERE:
         * - Should we have different commands for output vs input?
         * - For example, input could be a command like `genlayout` that takes a Pyret value and a layout spec,
         * and when interaction with the Input component ends (say with a button click), returns the value of from
         * calling re-ify on the data instance to the REPL? This would be very slick.
         * 
         */




        function genlayout(v, cndSpec) {
            const container = document.createElement("div");

            // Create a mount point for the combined input
            const combinedInputDiv = document.createElement("div");
            combinedInputDiv.id = "combined-input-container-" + Math.random().toString(36).slice(2);
            container.appendChild(combinedInputDiv);

            // Append the container to the document
            document.body.appendChild(container);

            // Observe the DOM for the container
            const observer = new MutationObserver(() => {
                if (document.body.contains(combinedInputDiv)) {
                    observer.disconnect(); // Stop observing once the container is in the DOM

                    try {
                        // Initialize the data instance and evaluator
                        const dataInstance = new CndCore.PyretDataInstance(v);
                        const evaluationContext = { sourceData: dataInstance };
                        const evaluator = new CndCore.Evaluators.SGraphQueryEvaluator();
                        evaluator.initialize(evaluationContext);

                        // Prepare the Pyret evaluator and projections
                        const pyretREPLInternal = window.__internalRepl;
                        const projections = {};

                        // Use the simplified API to mount the combined input
                        if (window.mountCombinedInput) {
                            console.log("Mounting Combined Input");
                            window.mountCombinedInput(combinedInputDiv.id, {
                                cndSpec: cndSpec,
                                dataInstance: dataInstance,
                                pyretEvaluator: pyretREPLInternal,
                                projections: projections
                            });
                        } else {
                            console.error("CndCore.mountCombinedInput is not available");
                        }
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
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            return container;
        }


        // function valueBuilder(v, cndSpec) {
        //     const container = document.createElement("div");

        //     // Create error message mount point
        //     const errorDiv = document.createElement("div");
        //     errorDiv.id = "error-message-container-" + Math.random().toString(36).slice(2);
        //     container.appendChild(errorDiv); // <-- Attach to DOM first

        //     // Create React CnD Layout Interface mount point
        //     const reactMountDiv = document.createElement("div");
        //     reactMountDiv.id = "cnd-react-mount-" + Math.random().toString(36).slice(2);
        //     container.appendChild(reactMountDiv); // <-- Attach to DOM first

        //     window.pyretREPLInternal = window.__internalRepl;

        //     try {
        //         // CnDCore logic
        //         const dataInstance = new window.CndCore.PyretDataInstance(v);
        //         const evaluationContext = { sourceData: dataInstance };
        //         const evaluator = new CndCore.Evaluators.SGraphQueryEvaluator();
        //         evaluator.initialize(evaluationContext);
        //         const layoutSpec = CndCore.parseLayoutSpec(cndSpec);
        //         const ENABLE_ALIGNMENT_EDGES = true;
        //         const instanceNumber = 0;
        //         const layoutInstance = new CndCore.LayoutInstance(
        //             layoutSpec,
        //             evaluator,
        //             instanceNumber,
        //             ENABLE_ALIGNMENT_EDGES
        //         );
        //         const projections = {};
        //         const layoutResult = layoutInstance.generateLayout(dataInstance, projections);
        //         const currentInstanceLayout = layoutResult.layout;

        //         // TODO: The re-ified view should update with the dataInstance.
        //         // I think this means we subscribe to changes in the dataInstance.
        //         const r = dataInstance.reify();
        //         const stringView = document.createElement("pre");
        //         stringView.textContent = String(r);
        //         stringView.style.marginBottom = "10px";

        //         // Graph element
        //         const graphElement = document.createElement("webcola-cnd-graph");
        //         graphElement.setAttribute("width", "800");
        //         graphElement.setAttribute("height", "600");
        //         graphElement.renderLayout(currentInstanceLayout).then(() => {
        //             // After rendering, set the layout result on the graph element
        //             // Now mount React components
        //             if (window.mountErrorMessageModal) {
        //                 console.log("Mounting Error Message Modal");
        //                 window.mountErrorMessageModal(errorDiv.id);
        //             }

        //             if (window.mountReplWithVisualization) {
        //                 console.log("Mounting REPL with Visualization");
        //                 window.mountReplWithVisualization(reactMountDiv.id, {
        //                     initialInstance: new window.CndCore.PyretDataInstance(v),
        //                     initialCndSpec: cndSpec,
        //                     showLayoutInterface: false,
        //                     replHeight: "350px",
        //                     visualizationHeight: "450px",
        //                 });
        //             }


        //         });

        //         // Add all elements to container
        //         container.appendChild(errorDiv);
        //         container.appendChild(stringView);
        //         container.appendChild(reactMountDiv);
        //         container.appendChild(graphElement);
        //         container.appendChild(pyretTerminalDiv); // Ensure the terminal is added to the container

        //     } catch (error) {
        //         console.error("Error in genlayout:", error);
        //         const fallbackErrorDiv = document.createElement("div");
        //         fallbackErrorDiv.style.color = "red";
        //         fallbackErrorDiv.style.padding = "10px";
        //         fallbackErrorDiv.style.border = "1px solid red";
        //         fallbackErrorDiv.style.marginBottom = "10px";
        //         fallbackErrorDiv.textContent = `Error: ${error.message || error}`;
        //         container.appendChild(fallbackErrorDiv);
        //     }

        //     return container;

        // }



        return runtime.makeModuleReturn({
            genlayout: runtime.makeFunction(genlayout)
        }, {});
    }
})