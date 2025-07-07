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
            //console.log("CnD Spec", cndSpec);
            //console.log("Data Instance", dataInstance);

            const idatainst = pyretADTToGraph(dataInstance);
            console.log("Extracted IData", idatainst);




            // Data Instance -> IDataINstance

            // Now we use the CnDCore to create a svg element
            // Attach it as a child of the container, and return it.



            return container;
        }




        return runtime.makeModuleReturn({
            genlayout: runtime.makeFunction(genlayout)
        }, {});
    }
})
