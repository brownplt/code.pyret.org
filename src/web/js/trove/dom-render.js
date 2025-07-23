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
   * 
   * [SP]: I think this should be moved up to all the other things?
   * More importantly, HOW can we get the CnD spec for the layout? It depends on the [fn right?]
   * Number two: The value might also have to be an empty string? Or an empty value? OR we parse it?
   * Like, there's no way to get the CnD spec for the particular type we're building, right?
   * OR, for a given type, we can have the C-M hook up correctly AT the time of the first output?
   * 
   * So, while we DO have to hook this up to code mirror, there's more going on here.
   * 
   */
        // SO. We need to FIRST evaluate the selected value,
        // THEN, we need to generate the input for the CnD spec?

        // OR should the CnD spec be generated AS the value takes shape?
        // Like, each time the constructor is called, we enforce the CnD spec for the value?
        // (and compose them?)
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




        // Attach geninput to the window object to make it globally accessible [SP: Perhaps we don't need this? We need
        // to figure out HOW to get the correct CnD spec though.]
        window.geninput = geninput;

        /**
         * Attaches a keybinding to the active CodeMirror instance and executes a thunk when triggered.
         *
         * @param {string} keyBinding - The keybinding to attach (e.g., "Cmd-Shift-R").
         * @param {function} thunk - A function that returns a string or a promise of a string.
         *                           The result of the thunk will replace the text at the cursor.
         *
         * @example
         * // Define a thunk that returns a string
         * function exampleThunk() {
         *     return "Hello, CodeMirror!";
         * }
         *
         * // Attach the keybinding to CodeMirror
         * attachToCM("Cmd-Shift-R", exampleThunk);
         *
         * // When "Cmd-Shift-R" is pressed, "Hello, CodeMirror!" will be inserted at the cursor.
         */
        function attachToCM(keyBinding, thunk) {
            // Step 1: Find the active CodeMirror instance
            const cmEl = document.activeElement.closest(".CodeMirror") || document.querySelector(".CodeMirror");
            const cm = cmEl?.CodeMirror;

            if (!cm) {
                console.warn("❌ No CodeMirror editor found.");
                return;
            }

            // Step 2: Add the keybinding using addKeyMap
            const keyMap = {
                [keyBinding]: async function (cmInstance) {
                    try {
                        // Call the thunk to get the result (string or promise of a string)
                        const result = await thunk();

                        // Replace the text at the cursor with the result
                        cmInstance.replaceSelection(result || "");
                    } catch (err) {
                        console.error("Error in thunk execution:", err);
                    }
                }
            };

            cm.addKeyMap(keyMap);

            console.log(`✅ Keybinding "${keyBinding}" attached to CodeMirror using addKeyMap.`);
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

            // NOW, I wonder, is the CnD spec attached to the value?
            console.log("genlayout called with value:", v);


            const container = document.createElement("div");
            container.style.border = "1px solid #ccc";
            container.style.padding = "5px";
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