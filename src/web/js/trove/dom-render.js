({
    requires: [],
    nativeRequires: ["smtidy"],
    provides: {
        values: {
            styled: ["arrow", [["RawArray", "Any"], "String"], "Any"],
            layout: ["arrow", [["RawArray", "Any"], "Any"], "Any"] // Ideally this should be an Object of some kind, and then a Promise (or resolution of a Promise).
        }
    },
    theModule: function(runtime, namespace, uri, smtidy) { // TODO: Is this the right way to get cndjs? I'm currently just getting an empty object.




        // TODO: Write a variant of this to make 
        // things work.
        function styled(nodes, style) {

            const container = document.createElement("div");
            console.log(window.MiniZinc);
            console.log("SMTIDY", smtidy);

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                container.appendChild(node);
            }

            container.style = style;
            return container;
        }

        // TODO: THis asynchronous behavior may not be 
        // a Pyret pattern, and may break things?
        function layout(nodes, spec) {

            // A passed in record might look like this:
            /*

                    {
                        "dict": {
                            "c": "left",
                            "v": [
                                {
                                    "ariaText": "4"
                                },
                                {
                                    "ariaText": "5"
                                }
                            ]
                        },
                        "brands": {
                            "brandCount": 0
                        }
                    }

            */

            let spec_record = spec && spec.dict ? spec.dict : null;
            // We should do all the necessary validation and conversion
            // to SMTidy's expected format here.

            
            console.log("Spec Record", spec_record);

             

            let orientationConstraints = [];
            let groupConstraints = [];
            let cyclicConstraints = [];

            // Let's construct a group.
            let ag = smtidy.constraints.group("groupname", nodes, []);
            groupConstraints.push(ag);

            let orientationC = smtidy.constraints.left(nodes[0], nodes[1]);
            orientationConstraints.push(orientationC);


            const model = new window.MiniZinc.Model();

            const container = document.createElement("div");
            container.innerText = "Loading...";

            smtidy.solveLayout(model, nodes, orientationConstraints, groupConstraints, cyclicConstraints)
                .then((result) => {
                    console.log("Result of smtidy.solveLayout", result);
                    let renderer = smtidy.getRenderers()["cpo"];
                    let domGrid = renderer(result.grid, result.groupData);
                    container.innerHTML = ""; // Clear the container
                    container.appendChild(domGrid);
                })
                .catch((err) => {
                    container.innerText = "Error: " + (err && err.message ? err.message : err);
                });

            return container;
        }


        return runtime.makeModuleReturn({
            styled: runtime.makeFunction(styled),
            layout: runtime.makeFunction(layout)
        }, {});
    }
    
})
