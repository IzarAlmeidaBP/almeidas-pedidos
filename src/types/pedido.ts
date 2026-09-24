export type FormaRecebimento = "entrega" | "retirada";

/** Quantidade por id de sabor. Sabores ausentes contam como 0. */
export type Quantidades = Record<string, number>;

export interface DadosCliente {
  nome: string;
  /** Vazio enquanto o cliente não escolheu. */
  forma: FormaRecebimento | "";
  endereco: string;
  referencia: string;
  /** Formato do input date: AAAA-MM-DD */
  data: string;
  /** Formato do input time: HH:MM */
  horario: string;
  observacoes: string;
}

export type CampoDados = keyof DadosCliente;

export interface Pedido {
  quantidades: Quantidades;
  dados: DadosCliente;
}

export interface Totais {
  itens: number;
  subtotal: number;
  taxaEntrega: number;
  total: number;
}
