({
    requires: [],
    nativeRequires: [],
    provides: {
        values: {
            genlayout: ["arrow", [["RawArray", "Any"], "String"], "Any"],
        }
    },
    theModule: function (runtime, namespace, uri) {

        function pyretADTToGraph(root) {
            let nextId = 0;
            const atoms = [];
            const relations = [];
            const seen = new WeakMap();

            function freshId() {
                return `n${nextId++}`;
            }

            function makeAtom(id, label, type) {
                atoms.push({ id, label, type });
            }

            function traverse(value) {
                if (value === null || value === undefined) return null;

                // Avoid cycles
                if (typeof value === "object" && seen.has(value)) {
                    return seen.get(value);
                }

                const id = freshId();

                // Case: primitive value (number, string, boolean)
                if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
                    makeAtom(id, String(value), typeof value);
                    return id;
                }

                // Case: ADT node
                if (typeof value === "object" && value.dict) {
                    const typ = value.$name || value.$constructor?._match?.name || "?";
                    makeAtom(id, typ, typ);
                    seen.set(value, id);

                    for (const [field, fieldVal] of Object.entries(value.dict)) {
                        if (field.startsWith("_")) continue; // skip _output, _match, etc.

                        const targetId = traverse(fieldVal);
                        if (targetId) {
                            relations.push({ source: id, target: targetId, label: field });
                        }
                    }
                    return id;
                }

                return null; // skip unknowns
            }

            traverse(root);
            return { atoms, relations };
        }

        function genlayout(dataInstance, cndSpec) {
            const container = document.createElement("div");

            console.log("CnD Core", window.CndCore);

            const idatainst = pyretADTToGraph(dataInstance);
            console.log("Extracted IData", idatainst);

            // Dump this to JSON string
            const jsonData = JSON.stringify(idatainst, null, 2);

            // Create a CnDCore data instance
            const cndDataInstance = window.CndCore.JSonDataInstance(jsonData);

            const evaluationContext = {
                sourceData: cndDataInstance
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

            // Create the custom element using CnDCore
            const graphElement = document.createElement("webcola-cnd-graph");
            graphElement.setAttribute("width", "800");
            graphElement.setAttribute("height", "600");

            // Attach the layout result to the custom element
            //graphElement.layoutResult = layoutResult;

            // Render the layout using the custom element's method
            graphElement.renderLayout(layoutResult).then(() => {
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
