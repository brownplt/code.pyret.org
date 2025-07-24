
import valueskeleton as VS
import dom-render as DR

fun render(args):
  
  for raw-array-fold(str from "", elt from args, i from 0):
    str + elt + "cli"
  end
end




data RBNod:
  | Black(value, left, right)
  | Red(value, left, right)
  | Leaf(value)
 sharing:
    method _output(self):
    ## Ahh, we should collect the CnD specs of the children here?
    ## and compose them?
    x = DR.genlayout( self, self._cndspec())
    VS.vs-constr-render("RBNod", [list: ], { cli: render, cpo: lam(a): x end })
  end,
  method _cndspec(self):
    ```
constraints:
  - orientation:
      selector: right
      directions:
        - right
        - below
  - orientation:
      directions:
        - left
        - below
      selector: left
directives:
  - attribute:
      field: value
  - atomColor:
      selector: Black
      value: black
  - atomColor:
      selector: Red
      value: '#fa0000'
  - flag: hideDisconnected
              ```
  end
end

rbt = Black( 5, Black( 1, Red( 2, Red( 1, Leaf(0), Leaf(0)), Leaf(0)), Leaf(0)), Red( 6, Leaf(0), Leaf(0)))




# window.attachToCM("Ctrl-Alt-I", async () => {
#   try {
#     const cmEl = document.activeElement.closest(".CodeMirror") || document.querySelector(".CodeMirror");
#     const cm = cmEl?.CodeMirror;
#     if (!cm) throw new Error("No active CodeMirror instance");
# 
#     const cursorCoords = cm.cursorCoords(true, "page");
# 
#     const value = {
#       "dict": { "value": 1 },
#       "brands": {
#         "$brandRBNod933": true,
#         "$brandLeaf936": true
#       }
#     };
# 
#     const cndSpec = ""; // or dynamically derive
# 
#     const result = await window.geninput(value, cndSpec, cursorCoords);
# 
#     return JSON.stringify(result, null, 2);
#   } catch (err) {
#     console.error("Error invoking geninput:", err);
#     return "// Error: " + (err.message || err);
#   }
# });