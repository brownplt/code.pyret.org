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

            // Create error message mount point
            const errorDiv = document.createElement("div");
            errorDiv.id = "error-message-container-" + Math.random().toString(36).slice(2);
            container.appendChild(errorDiv); // <-- Attach to DOM first


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

                    if (window.mountErrorMessageModal) {
                        console.log("Mounting Error Message Modal");
                        window.mountErrorMessageModal(errorDiv.id);
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