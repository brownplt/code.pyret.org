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
    cndspec = ```
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
    x = DR.genlayout( self, cndspec)
    VS.vs-constr-render("RBNod", [list: ], { cli: render, cpo: lam(a): x end })
    end
end

rbt = Black( 5, Black( 1, Red( 2, Red( 1, Leaf(0), Leaf(0)), Leaf(0)), Leaf(0)), Red( 6, Leaf(0), Leaf(0)))


