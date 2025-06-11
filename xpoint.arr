
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


data RBNod:
  | Black(value, left, right)
  | Red(value, left, right)
  | Leaf(value)
sharing:
  method _output(self):
    cases (RBNod) self:
      | Black(v, l, r) =>
          VS.vs-constr-render("Black", [list: VS.vs-value(v), VS.vs-value(l), VS.vs-value(r)], {cli: render, cpo: render-dom})
      | Red(v, l, r) =>
          VS.vs-constr-render("Red", [list: VS.vs-value(v), VS.vs-value(l), VS.vs-value(r)], {cli: render, cpo: render-dom})
      | Leaf(v) =>
          VS.vs-constr-render("Leaf", [list: VS.vs-value(v)], {cli: render, cpo: render-dom})
    end
  end
end

rbt = Black( 5, Black( 1, Red( 2, Red( 1, Leaf(0), Leaf(0)), Leaf(0)), Leaf(0)), Red( 6, Leaf(0), Leaf(0)))

xpoint(4,5)
print(xpoint(4, 5))

