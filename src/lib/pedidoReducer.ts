import type { Carrinho, Escolhas, Produto } from "../types/carrinho";
import type { CampoDados, DadosCliente } from "../types/pedido";
import {
  QUANTIDADE_MAXIMA,
  adicionarItem,
  alterarQuantidadeItem,
  chaveItem,
  removerItem,
  removerItensNatal,
} from "./carrinho";

export { QUANTIDADE_MAXIMA };

export type Etapa = "montando" | "pagamento";

export interface EstadoPedido {
  carrinho: Carrinho;
  dados: DadosCliente;
  etapa: Etapa;
  /** Aviso para o cliente (ex.: itens de Natal removidos). null = nenhum. */
  aviso: string | null;
}

export type AcaoPedido =
  | { type: "adicionar"; produto: Produto; escolhas: Escolhas; quantidade: number }
  /** − / + de uma linha do carrinho (fica entre 1 e o máximo). */
  | { type: "alterarItem"; chave: string; delta: number }
  | { type: "removerItem"; chave: string }
  /** − / + do card de morango (produto sem opções): chegar a 0 tira a linha. */
  | { type: "alterarMorango"; produto: Produto; delta: number }
  | { type: "atualizarDado"; campo: CampoDados; valor: string }
  | { type: "irParaPagamento" }
  | { type: "voltarParaEdicao"; aviso?: string }
  /** Fim do prazo de Natal: tira os itens de Natal do carrinho e avisa. */
  | { type: "encerrarNatal"; catalogo: readonly Produto[] }
  | { type: "fecharAviso" };

export const DADOS_VAZIOS: DadosCliente = {
  nome: "",
  bairro: "",
  bairroOutro: "",
  endereco: "",
  referencia: "",
  data: "",
  periodo: "",
  observacoes: "",
};

export const ESTADO_INICIAL: EstadoPedido = {
  carrinho: [],
  dados: DADOS_VAZIOS,
  etapa: "montando",
  aviso: null,
};

/** Quantidade de um produto sem opções (morango) no carrinho. */
export function quantidadeNoCarrinho(carrinho: Carrinho, produto: Produto): number {
  const chave = chaveItem(produto, {});
  return carrinho.find((i) => i.chave === chave)?.quantidade ?? 0;
}

export function textoItensRemovidos(removidos: number): string {
  const itens =
    removidos === 1 ? "1 item de Natal saiu" : `${removidos} itens de Natal saíram`;
  return `As encomendas de Natal foram encerradas. ${itens} do seu carrinho.`;
}

export function pedidoReducer(estado: EstadoPedido, acao: AcaoPedido): EstadoPedido {
  switch (acao.type) {
    case "adicionar": {
      const carrinho = adicionarItem(
        estado.carrinho,
        acao.produto,
        acao.escolhas,
        acao.quantidade,
      );
      return carrinho === estado.carrinho ? estado : { ...estado, carrinho };
    }
    case "alterarItem":
      return {
        ...estado,
        carrinho: alterarQuantidadeItem(estado.carrinho, acao.chave, acao.delta),
      };
    case "removerItem":
      return { ...estado, carrinho: removerItem(estado.carrinho, acao.chave) };
    case "alterarMorango": {
      const atual = quantidadeNoCarrinho(estado.carrinho, acao.produto);
      const nova = Math.min(QUANTIDADE_MAXIMA, Math.max(0, atual + acao.delta));
      if (nova === atual) return estado;
      const chave = chaveItem(acao.produto, {});
      if (nova === 0) return { ...estado, carrinho: removerItem(estado.carrinho, chave) };
      if (atual === 0)
        return {
          ...estado,
          carrinho: adicionarItem(estado.carrinho, acao.produto, {}, nova),
        };
      return {
        ...estado,
        carrinho: alterarQuantidadeItem(estado.carrinho, chave, nova - atual),
      };
    }
    case "atualizarDado":
      return { ...estado, dados: { ...estado.dados, [acao.campo]: acao.valor } };
    case "irParaPagamento":
      return { ...estado, etapa: "pagamento", aviso: null };
    case "voltarParaEdicao":
      return { ...estado, etapa: "montando", aviso: acao.aviso ?? estado.aviso };
    case "encerrarNatal": {
      const { carrinho, removidos } = removerItensNatal(estado.carrinho, acao.catalogo);
      if (removidos === 0) return estado;
      return {
        ...estado,
        carrinho,
        etapa: "montando",
        aviso: textoItensRemovidos(removidos),
      };
    }
    case "fecharAviso":
      return estado.aviso === null ? estado : { ...estado, aviso: null };
  }
}
