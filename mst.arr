
provide: 
  data Edge,
  type Graph
end

import equality as Eq
import lists as lists
import dom-render as DR
import valueskeleton as VS


include string-dict
import sets as sets
type Set = sets.Set

list-to-list-set = sets.list-to-list-set

data Edge:
  | edge(a :: String, b :: String, weight :: Number)
    with:
    method _equals(self :: Edge, other :: Edge, equal-rec :: (Any, Any -> Eq.EqualityResult))
      -> Eq.EqualityResult:
      eq = {(a, b): Eq.is-Equal(equal-rec(a, b))}
      {a1; b1; w1} = cases (Edge) self:
        | edge(a, b, weight) => {a; b; weight}
      end
      {a2; b2; w2} = cases (Edge) other:
        | edge(a, b, weight) => {a; b; weight}
      end
      ask:
        | not(eq(w1, w2)) then: Eq.NotEqual("different weights", w1, w2)
        | (eq(a1, a2) and eq(b1, b2)) or (eq(a1, b2) and eq(b1, a2)) then: Eq.Equal
        | otherwise: Eq.NotEqual("different vertices", self, other)
      end
    end
    
end





type Graph = lists.List<Edge>
data G:
  | g(Graph)
     sharing:
    method _output(self):
    
    
    
    cndspec = ```
directives:
  - inferredEdge:
      selector: >-
        { x : String, w : Number, y : String |  (some e : edge | e.a = x and e.b = y and e.weight = w)}
      name: edge
  - attribute: {field : weight}
  - attribute: {field : a}
  - attribute: {field: b}


              ```
    x = DR.genlayout( self, cndspec)
    VS.vs-constr-render("G", [list: ], { cli: lam(a) : x end, cpo: lam(a): x end })
    end
    
end