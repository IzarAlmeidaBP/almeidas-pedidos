import type { CampoDados, DadosCliente, Pedido } from "../types/pedido";

export const QUANTIDADE_MAXIMA = 99;

export type Etapa = "montando" | "pagamento";

export interface EstadoPedido extends Pedido {
  etapa: Etapa;
}

export type AcaoPedido =
  | { type: "alterarQuantidade"; id: string; delta: number }
  | { type: "atualizarDado"; campo: CampoDados; valor: string }
  | { type: "irParaPagamento" }
  | { type: "voltarParaEdicao" };

export const DADOS_VAZIOS: DadosCliente = {
  nome: "",
  bairro: "",
  bairroOutro: "",
  endereco: "",
  referencia: "",
  data: "",
  horario: "",
  observacoes: "",
};

export const ESTADO_INICIAL: EstadoPedido = {
  quantidades: {},
  dados: DADOS_VAZIOS,
  etapa: "montando",
};

export function pedidoReducer(estado: EstadoPedido, acao: AcaoPedido): EstadoPedido {
  switch (acao.type) {
    case "alterarQuantidade": {
      const atual = estado.quantidades[acao.id] ?? 0;
      const nova = Math.min(QUANTIDADE_MAXIMA, Math.max(0, atual + acao.delta));
      if (nova === atual) return estado;
      return { ...estado, quantidades: { ...estado.quantidades, [acao.id]: nova } };
    }
    case "atualizarDado":
      return { ...estado, dados: { ...estado.dados, [acao.campo]: acao.valor } };
    case "irParaPagamento":
      return { ...estado, etapa: "pagamento" };
    case "voltarParaEdicao":
      return { ...estado, etapa: "montando" };
  }
}
