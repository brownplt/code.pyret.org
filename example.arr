
import valueskeleton as VS
import string-dict as SD
import cnd as CND
import csv as CSV

data Tree:
  | tnode(value, left, right)
  | leaf
    sharing:
    method _output(self):
    #tree-to-graph(self)
    
    #VS.vs-collection("cnd", [list:
    #VS.vs-value(tree-to-graph(self)),  # Visualize the tree structure 
    #  ])
    
    
    VS.vs-collection("cnd",[list:
        CND.genlayout( tree-to-graph(self), "")])
    
    end
end

fun asvsconstrTree(t):
  cases(Tree) t:
    | leaf => VS.vs-str("leaf")
    | tnode(v, l, r) =>
      VS.vs-constr("tnode", [list: VS.vs-value(v), asvsconstrTree(l), asvsconstrTree(r)])
  end
end

fun vs-label(vs):
  cases (VS.ValueSkeleton) vs:
    | vs-str(s) => s
    | vs-num(n) => to-string(n)
    | vs-bool(b) => to-string(b)
    | vs-constr(name, _) => name
    | else => "?"
  end
end

fun walk-vs(vs, atoms, relations):
  id = "node" + num-to-string(length(atoms))
  typ = vs-label(vs)
  label = typ
  atoms1 = atoms.push({id: id, typ: typ, label: label})
  rels1 = relations

  cases (VS.ValueSkeleton) vs:
    | vs-constr(name, args) =>
        result = foldl(
          lam(acc, i):
          sub = args.get(i)
          atoms_acc = acc.get(0)
          rels_acc = acc.get(1)
            sub_result = walk-vs(sub, atoms_acc, rels_acc)
          sub_id = sub_result.get(0)
          atoms_next = sub_result.get(1)
          rels_next = sub_result.get(2)
            new_rel = {src: id, dst: sub_id, label: name + "-" + num-to-string(i)}
          [list: atoms_next, rels_next.push(new_rel)]
          end,
        [list: atoms1, rels1],
          range(0, length(args))
        )
      atoms_final = result.get(0)
      rels_final = result.get(1)
      [list: id, atoms_final, rels_final]

    | vs-record(name, fields) =>
        result = foldl(
          lam(acc, field):
          atoms_acc = acc.get(0)
          rels_acc = acc.get(1)
            sub = fields.get(field)
            sub_result = walk-vs(sub, atoms_acc, rels_acc)
            sub_id = get(sub_result)
          atoms_next = sub_result.get(1)
          rels_next = sub_result.get(2)
            new_rel = {src: id, dst: sub_id, label: field}
            [list: atoms_next, rels_next.push(new_rel)]
          end,
          [list: atoms1, rels1],
          fields.keys()
        )
      atoms_final = result.get(0)
      rels_final = result.get(1)
        [list: id, atoms_final, rels_final]

    | else => [list: id, atoms1, rels1]
  end
end

fun tree-to-graph(t):
  vs = asvsconstrTree(t)
  result = walk-vs(vs, [list:], [list:])
  atoms = result.get(1)
  relations = result.get( 2)
  {atoms: atoms, relations: relations}
end


