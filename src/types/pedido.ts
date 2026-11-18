/** Horário preferido de entrega (Natal 2026: só o período, sem hora exata). */
export type PeriodoEntrega = "Manhã" | "Tarde" | "Noite";

export interface DadosCliente {
  nome: string;
  /** Nome do bairro da lista, BAIRRO_FORA_DA_LISTA ou "" (não escolhido). */
  bairro: string;
  /** Bairro digitado quando o cliente escolhe "Meu bairro não está na lista". */
  bairroOutro: string;
  endereco: string;
  referencia: string;
  /** Formato do input date: AAAA-MM-DD */
  data: string;
  /** "" = não escolhido. */
  periodo: PeriodoEntrega | "";
  observacoes: string;
}

export type CampoDados = keyof DadosCliente;

export interface Totais {
  itens: number;
  subtotal: number;
  taxaEntrega: number;
  total: number;
}
