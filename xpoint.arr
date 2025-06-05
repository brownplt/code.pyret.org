
import valueskeleton as VS
import dom-render as DR

fun render(args):
  
  for raw-array-fold(str from "", elt from args, i from 0):
    str + elt + "cli"
  end
end

fun render-dom(args):
  
  # Spec.bundle 
  
  # Spec.toJson
  
  #DR.styled(args, "color:red !important")
  DR.layout(args, "") # Eventually, collect the various constraints here.

  

end

data xPoint:
  | xpoint(x, y)
sharing:
    method _output(self):
        VS.vs-constr-render("point", [list: VS.vs-value(self.x), VS.vs-value(self.y)], { cli: render, cpo: render-dom })
    end
end

xpoint(4,5)
print(xpoint(4, 5))

