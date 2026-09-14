use context starter2024

data ListaDeNumero:
  | vazia
  | elo(primeiro :: Number,
  resto :: ListaDeNumero)
end

L1 = elo(1, elo(2, elo(3, vazia)))
L2 = elo(1, elo(7, elo(5, vazia)))

fun contem-7(l :: ListaDeNumero) -> Boolean:
  teste = 2
  TESTE = 2
  cases (ListaDeNumero) l:
    | vazia => false
    | elo(p, r) => 
      if p == 7:
        true
      else:
        contem-7(r)
      end
  end
end