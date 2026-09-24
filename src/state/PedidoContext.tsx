import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { LOJA } from "../config/loja";
import {
  ESTADO_INICIAL,
  pedidoReducer,
  type AcaoPedido,
  type EstadoPedido,
} from "../lib/pedidoReducer";
import { calcularTotais } from "../lib/total";
import { validarPedido, type ErrosPedido } from "../lib/validacao";
import type { Totais } from "../types/pedido";

interface ValorContexto {
  estado: EstadoPedido;
  dispatch: (acao: AcaoPedido) => void;
  totais: Totais;
  erros: ErrosPedido;
  valido: boolean;
}

const PedidoContext = createContext<ValorContexto | null>(null);

export function PedidoProvider({
  children,
  estadoInicial = ESTADO_INICIAL,
}: {
  children: ReactNode;
  estadoInicial?: EstadoPedido;
}) {
  const [estado, dispatch] = useReducer(pedidoReducer, estadoInicial);

  const valor = useMemo(() => {
    const totais = calcularTotais(estado.quantidades, estado.dados.forma, LOJA);
    const erros = validarPedido(estado, totais.itens);
    return { estado, dispatch, totais, erros, valido: Object.keys(erros).length === 0 };
  }, [estado]);

  return <PedidoContext.Provider value={valor}>{children}</PedidoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePedido(): ValorContexto {
  const ctx = useContext(PedidoContext);
  if (!ctx) throw new Error("usePedido precisa estar dentro de <PedidoProvider>");
  return ctx;
}
