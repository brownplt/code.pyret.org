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

fun render-dom-bt(args):
  # args is always [list: val-v, val-l, val-r] for Black/Red, [list: val-v] for Leaf
  if (raw-array-length(args) == 3):
    val-v = args[0]
    val-l = args[1]
    val-r = args[2]
    DR.layout(
      args,
      [list:
        {c: "left", es: [list: val-v, val-l]},
        {c: "below", es: [list: val-v, val-l]},
        {c: "right", es: [list: val-v, val-r]},
        {c: "below", es: [list: val-v, val-r]}
      ]
    )
  else:
    # Leaf case: just one node, no constraints
    DR.layout(args, [list:])
  end
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
          VS.vs-constr-render(
            "Black",
            [list: VS.vs-value(v), VS.vs-value(l), VS.vs-value(r)],
            { cli: render, cpo: render-dom-bt }
          )
      | Red(v, l, r) =>
          VS.vs-constr-render(
            "Red",
            [list: VS.vs-value(v), VS.vs-value(l), VS.vs-value(r)],
            { cli: render, cpo: render-dom-bt }
          )
      | Leaf(v) =>
          VS.vs-constr-render(
            "Leaf",
            [list: VS.vs-value(v)],
            { cli: render, cpo: render-dom-bt }
          )
    end
  end
end

rbt = Black( 5, Black( 1, Red( 2, Red( 1, Leaf(0), Leaf(0)), Leaf(0)), Leaf(0)), Red( 6, Leaf(0), Leaf(0)))

xpoint(4,5)
print(xpoint(4, 5))

