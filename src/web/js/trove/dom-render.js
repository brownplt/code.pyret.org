({
    requires: [],
    nativeRequires: ["smtidy"],
    provides: {
        values: {
            styled: ["arrow", [["RawArray", "Any"], "String"], "Any"],
            layout: ["arrow", [["RawArray", "Any"], "Any"], "Any"] // Ideally this should be an Object of some kind, and then a Promise (or resolution of a Promise).
        }
    },
    theModule: function (runtime, namespace, uri, smtidy) { // TODO: Is this the right way to get cndjs? I'm currently just getting an empty object.


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


            let { orientationConstraints, groupConstraints, cyclicConstraints } = pyretRecordListToConstraints(spec);

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





        function pyretRecordListToConstraints(recordList) {

            let orientationConstraints = [];
            let groupConstraints = [];
            let cyclicConstraints = [];
            const CONSTRAINT_TYPE_KEY = "c";
            const CONSTRAINED_NODES_KEY = "es";


            let current = recordList?.dict?.first;
            while (current) {

                let current_constraint = current && current.dict ? current.dict : null;

                let constraintType = current_constraint[CONSTRAINT_TYPE_KEY];
                let constrainedNodes = current_constraint[CONSTRAINED_NODES_KEY] || [];

                if (constraintType === "left") {
                    // Create a left constraint for the first two nodes.
                    if (constrainedNodes.length >= 2) {
                        let leftConstraint = smtidy.constraints.left(
                            nodes[constrainedNodes[0]],
                            nodes[constrainedNodes[1]]
                        );
                        orientationConstraints.push(leftConstraint);
                    }
                } else if (constraintType === "right") {
                    // Create a right constraint for the first two nodes.
                    if (constrainedNodes.length >= 2) {
                        let rightConstraint = smtidy.constraints.right(
                            nodes[constrainedNodes[0]],
                            nodes[constrainedNodes[1]]
                        );
                        orientationConstraints.push(rightConstraint);
                    }
                }
                else if (constraintType === "above") {
                    // Create an above constraint for the first two nodes.
                    if (constrainedNodes.length >= 2) {
                        let aboveConstraint = smtidy.constraints.above(
                            nodes[constrainedNodes[0]],
                            nodes[constrainedNodes[1]]
                        );
                        orientationConstraints.push(aboveConstraint);
                    }
                }
                else if (constraintType === "below") {
                    // Create a below constraint for the first two nodes.
                    if (constrainedNodes.length >= 2) {
                        let belowConstraint = smtidy.constraints.below(
                            nodes[constrainedNodes[0]],
                            nodes[constrainedNodes[1]]
                        );
                        orientationConstraints.push(belowConstraint);
                    }
                }
                else if (constraintType === "clockwise") {
                    let clockwiseConstraint = smtidy.constraints.clockwise(nodes);
                    cyclicConstraints.push(clockwiseConstraint);
                }
                else if (constraintType === "counterClockwise") {
                    let counterclockwiseConstraint = smtidy.constraints.counterClockwise(nodes);
                    cyclicConstraints.push(counterclockwiseConstraint);
                }
                else if (constraintType === "group") {
                    // Create a group constraint for the specified nodes.
                    let groupName = spec_record["group-name"] || "default-group";
                    let groupConstraint = smtidy.constraints.group(groupName, constrainedNodes, []);
                    groupConstraints.push(groupConstraint);
                }
                else {
                    console.warn("Unknown constraint type:", constraintType);
                }

                current = current.rest || null;
            }

            console.log("Orientation Constraints:", orientationConstraints);
            console.log("Group Constraints:", groupConstraints);
            console.log("Cyclic Constraints:", cyclicConstraints);

            return {
                orientationConstraints: orientationConstraints,
                groupConstraints: groupConstraints,
                cyclicConstraints: cyclicConstraints
            };
        }



        return runtime.makeModuleReturn({
            styled: runtime.makeFunction(styled),
            layout: runtime.makeFunction(layout)
        }, {});
    }
})
