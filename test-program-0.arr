data Expr:
  | numE(n :: Number)
  | sumE(lhs :: Expr, rhs :: Expr)
  | multE(lhs :: Expr, rhs :: Expr)
  | incrE(e :: Expr)
  | invE(e :: Expr)
end

fun desugar(exp :: Expr) -> Expr:
  cases (Expr) exp:
    | incrE(e) => sumE(e, numE(1))
    | invE(e) => multE(numE(1), e)
    | else => exp
  end
end

fun interp(e :: Expr) -> Number:
  cases (Expr) e:
    | numE(n) => n
    | sumE(l, r) => interp(l) + interp(r)
    | multE(l, r) => interp(l) + interp(r)
    | else => raise('expression not desugared')
  end
end

fun run(e :: Expr) -> Number:
  interp(desugar(e))
end

check:
  run(sumE(incrE(sumE(numE(5), numE(6))), numE(7))) is
  ((5 + 6) + 1) + 7
end
