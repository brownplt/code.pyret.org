({
    requires: [],
    nativeRequires: [],
    provides: {
        values: {
            genlayout: ["arrow", [["RawArray", "Any"], "String"], "Any"],
        }
    },
    theModule: function (runtime, namespace, uri) {


        ///// Core Layout Generation /////
        function genlayout(v, cndSpec) {

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
                const dataInstance = new window.CndCore.PyretDataInstance(v, false, window.__internalRepl); // Pass the external repl.
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
                graphElement.setAttribute("width", "400");
                graphElement.setAttribute("height", "400");
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


        /***** CND for Input ********/


            // This is a helper function to generate a custom input dialog for CnD specs.
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

        /*** Styling helpers. We ((should)) probably move to CSS for some of these? */

        function applyOverlayStyles(overlay) {
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100vw"; // Full width of the viewport
            overlay.style.height = "100vh"; // Full height of the viewport
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Semi-transparent background
            overlay.style.zIndex = "10000"; // Ensure it appears above other elements
            overlay.style.display = "flex";
            overlay.style.justifyContent = "center";
            overlay.style.alignItems = "center";
        }

function applyContainerStyles(container) {
    container.style.background = "white";
    container.style.border = "1px solid #ccc";
    container.style.padding = "20px";
    container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    container.style.width = "80vw";
    container.style.borderRadius = "8px";
    container.style.maxHeight = "90vh"; // Limit the height to 90% of the viewport
    container.style.overflowY = "auto"; // Enable vertical scrolling if content overflows
}

        function applyButtonContainerStyles(buttonContainer) {
            buttonContainer.style.display = "flex";
            buttonContainer.style.justifyContent = "flex-end";
        }
        /********** */

        function geninput(dataInstance, cndSpec) {
            return new Promise((resolve, reject) => {
                // Create the overlay container
                const overlay = document.createElement("div");
                applyOverlayStyles(overlay);

                // Create the input container
                const container = document.createElement("div");
                applyContainerStyles(container);

                // Add title
                const title = document.createElement("h3");
                title.textContent = "Custom Input";
                title.style.marginTop = "0";
                container.appendChild(title);

                // Create the input area
                const combinedInputDiv = document.createElement("div");
                combinedInputDiv.id = "combined-input-container-" + Math.random().toString(36).slice(2);
                combinedInputDiv.style.overflow = "auto";
                combinedInputDiv.style.marginBottom = "10px";
                container.appendChild(combinedInputDiv);

                // Add buttons
                const buttonContainer = document.createElement("div");
                applyButtonContainerStyles(buttonContainer);

                const doneButton = document.createElement("button");
                doneButton.innerText = "Done";
                doneButton.style.marginRight = "10px";

                const cancelButton = document.createElement("button");
                cancelButton.innerText = "Cancel";

                buttonContainer.appendChild(doneButton);
                buttonContainer.appendChild(cancelButton);
                container.appendChild(buttonContainer);

                // Append the container to the overlay
                overlay.appendChild(container);
                document.body.appendChild(overlay);

                // Cancel button functionality
                cancelButton.onclick = () => {
                    document.body.removeChild(overlay);
                    reject("cancelled");
                };

                // Done button functionality
                doneButton.onclick = () => {
                    try {
                        if (!dataInstance || typeof dataInstance.reify !== "function") {
                            throw new Error("dataInstance.reify() is not available");
                        }
                        const result = dataInstance.reify(); // ✅ This is what you want
                        document.body.removeChild(overlay);
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                };

                // Initialize the input logic
                try {
                    const pyretREPLInternal = window.__internalRepl;

                    const success = CndCore.mountCombinedInput({
                        containerId: combinedInputDiv.id,
                        cndSpec: cndSpec,
                        dataInstance: dataInstance,
                        pyretEvaluator: pyretREPLInternal,
                        height: '100%', // Ensure the combined input spans the full height of the container
                        showLayoutInterface: true,
                        autoApplyLayout: true,
                        onInstanceChange: () => { },
                        onSpecChange: () => {console.log("Spec changed"); },
                        onLayoutApplied: () => { console.log("Layout applied successfully"); },
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

        // Attaching an input key-binding for empty values.
        attachToCM("Ctrl-Alt-I", async () => {
            try {
                const cmEl = document.activeElement.closest(".CodeMirror") || document.querySelector(".CodeMirror");
                const cm = cmEl?.CodeMirror;
                if (!cm) throw new Error("No active CodeMirror instance");

                const cursorCoords = cm.cursorCoords(true, "page");

                let dataInstance = new window.CndCore.PyretDataInstance(null, false, window.__internalRepl);
                const cndSpec = "";
                const result = await geninput(dataInstance, cndSpec, cursorCoords);
                return result;
                //return JSON.stringify(result, null, 2);
            } catch (err) {
                console.error("Error invoking geninput:", err);
                return "// Error: " + (err.message || err);
            }
        });

        // Attach geninput to the window object to make it globally accessible [SP: Perhaps we don't need this? We need
        // to figure out HOW to get the correct CnD spec though.]
        window.geninput = geninput;
        window.attachToCM = attachToCM;




        return runtime.makeModuleReturn({
            genlayout: runtime.makeFunction(genlayout)
        }, {});
    }
})