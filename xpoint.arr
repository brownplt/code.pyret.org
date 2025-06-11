
import valueskeleton as VS
import dom-render as DR

fun render(args):
  
  for raw-array-fold(str from "", elt from args, i from 0):
    str + elt + "cli"
  end
end

fun render-dom(args):
  
  # Perhaps we'd bundle the spec here.
  DR.layout(args, [list: {c:"left", es:args}]) # Eventually, collect the various constraints here.

  

end

data xPoint:
  | xpoint(x, y)
sharing:
    method _output(self):
        VS.vs-constr-render("point", [list: VS.vs-value(self.x), VS.vs-value(self.y)], { cli: render, cpo: render-dom })
    end
end


# Every node is red or black
data RBNod:
  | Black(value, left, right)
  | Red(value, left, right)
  | Leaf(value) 
end

rbt = Black( 5, Black( 1, Red( 2, Red( 1, Leaf(0), Leaf(0)), Leaf(0)), Leaf(0)), Red( 6, Leaf(0), Leaf(0)))

xpoint(4,5)
print(xpoint(4, 5))

