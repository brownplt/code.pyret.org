
import valueskeleton as VS
import string-dict as SD
import cnd as CND
import csv as CSV

data Tree:
  | tnode(value, left, right)
  | leaf
    sharing:
    method _output(self):

    

    CND.genlayout( self, "")
    
    end
end



exampleTree = tnode(11, leaf, tnode(-1, tnode(1, leaf, leaf), leaf))