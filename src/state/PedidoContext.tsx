import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { montarCatalogo } from "../config/catalogo";
import { LOJA } from "../config/loja";
import { NATAL } from "../config/natal";
import {
  calcularTotaisCarrinho,
  montarLinhas,
  type LinhaCarrinho,
} from "../lib/carrinho";
import { resolverEntrega, taxaDaEntrega, type Entrega } from "../lib/entrega";
import {
  ESTADO_INICIAL,
  pedidoReducer,
  type AcaoPedido,
  type EstadoPedido,
} from "../lib/pedidoReducer";
import { podeComprarNatal, primeiraDataEntrega, type RegrasPrazo } from "../lib/prazos";
import { validarPedido, type ErrosPedido } from "../lib/validacao";
import type { Produto } from "../types/carrinho";
import type { Totais } from "../types/pedido";

interface ValorContexto {
  estado: EstadoPedido;
  dispatch: (acao: AcaoPedido) => void;
  catalogo: readonly Produto[];
  regras: RegrasPrazo;
  /** Instante atual (atualizado a cada 30 s e quando a aba volta a ficar visível). */
  agora: Date;
  /** Lê o relógio na hora (revalidar no clique de enviar) e atualiza `agora`. */
  relogio: () => Date;
  /** Ainda dá para pedir itens de Natal? (até 18/12, horário de Campina Grande) */
  natalAberto: boolean;
  linhas: LinhaCarrinho[];
  temNatal: boolean;
  totais: Totais;
  entrega: Entrega;
  /** Menor data de entrega aceita (hoje + antecedência). */
  dataMinima: string;
  /** Maior data de entrega aceita (só com Natal e se a dona definir). */
  dataMaxima: string | undefined;
  erros: ErrosPedido;
  valido: boolean;
}

const PedidoContext = createContext<ValorContexto | null>(null);

const INTERVALO_RELOGIO = 30_000;

/**
 * Mantém "agora" atualizado para o bloqueio de 19/12 valer com a página aberta.
 * Devolve também uma leitura imediata do relógio, que já atualiza a tela.
 */
function useAgora(relogio: () => Date): [Date, () => Date] {
  const [agora, setAgora] = useState(relogio);
  useEffect(() => {
    const atualizar = () => setAgora(relogio());
    const id = setInterval(atualizar, INTERVALO_RELOGIO);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, [relogio]);
  const lerAgora = useCallback(() => {
    const instante = relogio();
    setAgora(instante);
    return instante;
  }, [relogio]);
  return [agora, lerAgora];
}

const relogioPadrao = () => new Date();

export function PedidoProvider({
  children,
  estadoInicial = ESTADO_INICIAL,
  regras = NATAL,
  relogio = relogioPadrao,
}: {
  children: ReactNode;
  estadoInicial?: EstadoPedido;
  /** Regras de prazo (os testes trocam datas e `ativo`). */
  regras?: RegrasPrazo;
  /** Fonte da data/hora (os testes fixam o dia). */
  relogio?: () => Date;
}) {
  const [estado, dispatch] = useReducer(pedidoReducer, estadoInicial);
  const [agora, lerAgora] = useAgora(relogio);
  const catalogo = useMemo(() => montarCatalogo(regras.ativo), [regras.ativo]);
  const natalAberto = podeComprarNatal(agora, regras);

  const linhas = useMemo(
    () => montarLinhas(estado.carrinho, catalogo),
    [estado.carrinho, catalogo],
  );
  const temNatal = linhas.some((l) => l.produto.natal);

  // A partir de 19/12 os itens de Natal saem do carrinho (com aviso).
  useEffect(() => {
    if (!natalAberto && temNatal) dispatch({ type: "encerrarNatal", catalogo });
  }, [natalAberto, temNatal, catalogo]);

  const valor = useMemo(() => {
    const entrega = resolverEntrega(estado.dados, LOJA.entrega);
    const totais = calcularTotaisCarrinho(
      estado.carrinho,
      catalogo,
      taxaDaEntrega(entrega),
    );
    const erros = validarPedido(estado.dados, {
      itens: totais.itens,
      entrega,
      temNatal,
      agora,
      regras,
    });
    return {
      estado,
      dispatch,
      catalogo,
      regras,
      agora,
      relogio: lerAgora,
      natalAberto,
      linhas,
      temNatal,
      totais,
      entrega,
      dataMinima: primeiraDataEntrega(agora, regras),
      dataMaxima: (temNatal && regras.ultimaDataEntrega) || undefined,
      erros,
      valido: Object.keys(erros).length === 0,
    };
  }, [estado, catalogo, regras, agora, lerAgora, natalAberto, linhas, temNatal]);

  return <PedidoContext.Provider value={valor}>{children}</PedidoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePedido(): ValorContexto {
  const ctx = useContext(PedidoContext);
  if (!ctx) throw new Error("usePedido precisa estar dentro de <PedidoProvider>");
  return ctx;
}
