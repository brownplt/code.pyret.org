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
         * 
         * Aimilarly, since the REPL produces ~~ output~~, we need to turn off output-printing of graphs 
         * while the user is interacting with the input component. Can we turn off OUTPUT within 
         * the internal REPL? OR clone it?
         * 
         * 
         * Perhaps a slicker experience of collapsing BACK to the output? THIS SHOULD BE HOOKED UP TO CODE-MIRROR.
         * 
         * 
         */
        function geninput(v, cndSpec, coords) {
            return new Promise((resolve, reject) => {
                const container = document.createElement("div");
                container.style.position = "absolute";
                container.style.top = `${coords.bottom + window.scrollY}px`;
                container.style.left = `${coords.left + window.scrollX}px`;
                container.style.zIndex = "10000";
                container.style.background = "white";
                container.style.border = "1px solid #ccc";
                container.style.padding = "8px";
                container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                container.style.minWidth = "300px";

                const combinedInputDiv = document.createElement("div");
                const doneButton = document.createElement("button");
                doneButton.innerText = "Done";

                const cancelButton = document.createElement("button");
                cancelButton.innerText = "Cancel";
                cancelButton.style.marginLeft = "6px";

                combinedInputDiv.id = "combined-input-container-" + Math.random().toString(36).slice(2);
                container.appendChild(combinedInputDiv);
                container.appendChild(doneButton);
                container.appendChild(cancelButton);
                document.body.appendChild(container);

                let dataInstance = null;

                cancelButton.onclick = () => {
                    document.body.removeChild(container);
                    reject("cancelled");
                };

                doneButton.onclick = () => {
                    try {
                        if (!dataInstance || typeof dataInstance.reify !== "function") {
                            throw new Error("dataInstance.reify() is not available");
                        }
                        const result = dataInstance.reify(); // ✅ This is what you want
                        document.body.removeChild(container);
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                };

                try {
                    dataInstance = new CndCore.PyretDataInstance(v);
                    const evaluationContext = { sourceData: dataInstance };
                    const evaluator = new CndCore.Evaluators.SGraphQueryEvaluator();
                    evaluator.initialize(evaluationContext);

                    const pyretREPLInternal = window.__internalRepl;

                    const success = CndCore.mountCombinedInput({
                        containerId: combinedInputDiv.id,
                        cndSpec: cndSpec,
                        dataInstance: dataInstance,
                        pyretEvaluator: pyretREPLInternal,
                        height: '400px',
                        showLayoutInterface: false,
                        autoApplyLayout: true,
                        onInstanceChange: () => { },
                        onSpecChange: () => { },
                        onLayoutApplied: () => { }
                    });

                    if (!success) {
                        throw new Error("Failed to mount combined input");
                    }
                } catch (err) {
                    container.textContent = `Error: ${err.message || err}`;
                    reject(err);
                }
            });
        }





        // function geninput(v, cndSpec) {

        //     // IF WE ARE IN AN INPUT  CONTEXT, WE DONT WANT TO SHOW A NEW _OUTPUT_
        //     // NOT SURE HOW TO DO THIS YET.


        //     const container = document.createElement("div");

        //     // Create a mount point for the combined input
        //     const combinedInputDiv = document.createElement("div");
        //     combinedInputDiv.id = "combined-input-container-" + Math.random().toString(36).slice(2);
        //     container.appendChild(combinedInputDiv);

        //     // Append the container to the document
        //     document.body.appendChild(container);

        //     // Observe the DOM for the container
        //     const observer = new MutationObserver(() => {
        //         if (document.body.contains(combinedInputDiv)) {
        //             observer.disconnect(); // Stop observing once the container is in the DOM

        //             try {
        //                 // Initialize the data instance and evaluator
        //                 const dataInstance = new CndCore.PyretDataInstance(v);
        //                 const evaluationContext = { sourceData: dataInstance };
        //                 const evaluator = new CndCore.Evaluators.SGraphQueryEvaluator();
        //                 evaluator.initialize(evaluationContext);

        //                 // Prepare the Pyret evaluator and projections
        //                 const pyretREPLInternal = window.__internalRepl ;
        //                 const projections = {};

        //                 // Use the updated API to mount the combined input
        //                 const success = CndCore.mountCombinedInput({
        //                     containerId: combinedInputDiv.id,
        //                     cndSpec: cndSpec,
        //                     dataInstance: dataInstance,
        //                     pyretEvaluator: pyretREPLInternal,
        //                     height: '800px', // Set the height of the combined input
        //                     showLayoutInterface: true, // Show the layout interface
        //                     autoApplyLayout: true, // Automatically apply the layout
        //                     onInstanceChange: (instance) => {
        //                         console.log('🔄 Data updated:', {
        //                             atoms: instance.getAtoms().length,
        //                             relations: instance.getRelations().length
        //                         });
        //                     },
        //                     onSpecChange: (spec) => {
        //                         console.log('📐 Layout spec updated:', spec);
        //                     },
        //                     onLayoutApplied: (layout) => {
        //                         console.log('🎨 Layout applied:', layout);
        //                     }
        //                 });

        //                 if (!success) {
        //                     console.error("Failed to mount combined input");
        //                 }
        //             } catch (error) {
        //                 console.error("Error in genlayout:", error);
        //                 const fallbackErrorDiv = document.createElement("div");
        //                 fallbackErrorDiv.style.color = "red";
        //                 fallbackErrorDiv.style.padding = "10px";
        //                 fallbackErrorDiv.style.border = "1px solid red";
        //                 fallbackErrorDiv.style.marginBottom = "10px";
        //                 fallbackErrorDiv.textContent = `Error: ${error.message || error}`;
        //                 container.appendChild(fallbackErrorDiv);
        //             }
        //         }
        //     });

        //     observer.observe(document.body, { childList: true, subtree: true });

        //     return container;
        // }

        function genlayout(v, cndSpec) {
            const container = document.createElement("div");
            container.style.border = "1px solid #ccc";
            container.style.padding = "10px";
            container.style.margin = "10px 0";
            container.style.position = "relative"; // For positioning elements inside the container

            // Create error message mount point
            const errorDiv = document.createElement("div");
            errorDiv.id = "error-message-container-" + Math.random().toString(36).slice(2);
            container.appendChild(errorDiv);

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
                stringView.style.margin = "0 0 10px 0"; // Add spacing between the string view and the graph
                container.appendChild(stringView);

                // Graph container (to hold the graph and the toggle button)
                const graphContainer = document.createElement("div");
                graphContainer.style.position = "relative"; // For positioning the toggle button
                graphContainer.style.marginTop = "10px";

                // Graph element (initially visible)
                const graphElement = document.createElement("webcola-cnd-graph");
                graphElement.setAttribute("width", "600");
                graphElement.setAttribute("height", "600");
                graphElement.style.display = "block"; // Start visible
                graphElement.style.margin = "0 auto"; // Center the graph within the container

                // Add the graph element to the graph container
                graphContainer.appendChild(graphElement);

                // Collapse/Expand button (small + / - in the top-right corner of the graph container)
                const toggleButton = document.createElement("button");
                toggleButton.textContent = "-"; // Default state is expanded
                toggleButton.style.position = "absolute";
                toggleButton.style.top = "5px";
                toggleButton.style.right = "5px";
                toggleButton.style.padding = "2px 5px";
                toggleButton.style.fontSize = "12px";
                toggleButton.style.cursor = "pointer";
                toggleButton.style.border = "1px solid #007BFF"; // Blue outline for visibility
                toggleButton.style.borderRadius = "3px";
                toggleButton.style.backgroundColor = "#f0f8ff"; // Light blue background
                toggleButton.style.color = "#007BFF"; // Blue text for better contrast

                // Add the toggle button to the graph container
                graphContainer.appendChild(toggleButton);

                // Add the graph container to the main container
                container.appendChild(graphContainer);

                // Render the graph layout
                graphElement.renderLayout(currentInstanceLayout).then(() => {
                    console.log("Graph layout rendered");

                    // Mount additional React components after rendering
                    if (window.mountErrorMessageModal) {
                        console.log("Mounting Error Message Modal");
                        window.mountErrorMessageModal(errorDiv.id);
                    }
                }).catch((err) => {
                    console.error("Error rendering graph layout:", err);
                });

                // Toggle visibility of the graph element
                toggleButton.addEventListener("click", () => {
                    const isCollapsed = graphElement.style.display === "none";
                    graphElement.style.display = isCollapsed ? "block" : "none";
                    toggleButton.textContent = isCollapsed ? "-" : "+"; // Update button text
                });

            } catch (error) {
                console.error("Error in genlayout:", error);

                // Display the error in the errorDiv
                errorDiv.style.color = "red";
                errorDiv.style.padding = "10px";
                errorDiv.style.border = "1px solid red";
                errorDiv.style.marginBottom = "10px";
                errorDiv.textContent = `Error: ${error.message || error}`;
            }

            return container;
        }


        return runtime.makeModuleReturn({
            genlayout: runtime.makeFunction(genlayout)
        }, {});
    }
})