import type { DadosCliente } from "./pedido";

export interface OpcaoProduto {
  id: string;
  nome: string;
  /** Valor somado ao preço do produto (0 = sem acréscimo). */
  acrescimo: number;
}

export interface GrupoOpcoes {
  id: string;
  /** Título na tela (ex.: "Recheio de cima"). */
  titulo: string;
  /** Rótulo na mensagem do WhatsApp (ex.: "Recheio"). */
  rotulo: string;
  tipo: "unica" | "multipla";
  /** Mínimo de opções escolhidas (0 = opcional). */
  min: number;
  max: number;
  opcoes: readonly OpcaoProduto[];
}

export type CategoriaProduto = "guirlandas" | "mini-guirlandas" | "tacas" | "morangos";

export interface Produto {
  id: string;
  nome: string;
  categoria: CategoriaProduto;
  preco: number;
  descricao: string;
  /** Caminho da foto em /public/img (registrada em src/config/imagens.ts). */
  foto: string;
  /** Selo de destaque no card (ex.: caixinha para presente). */
  selo?: string;
  /** Produto da campanha de Natal (bloqueado a partir de 19/12). */
  natal: boolean;
  grupos: readonly GrupoOpcoes[];
}

/** Opções escolhidas por id de grupo, na ordem em que o cliente escolheu. */
export type Escolhas = Readonly<Record<string, readonly string[]>>;

export interface ItemCarrinho {
  /** Produto + combinação de opções. A mesma combinação vira a mesma linha. */
  chave: string;
  produtoId: string;
  escolhas: Escolhas;
  quantidade: number;
}

export type Carrinho = readonly ItemCarrinho[];

export type PeriodoEntrega = "Manhã" | "Tarde" | "Noite";

/** Dados do checkout novo: o horário vira período (Manhã/Tarde/Noite). */
export interface DadosEntrega extends Omit<DadosCliente, "horario"> {
  /** "" = não escolhido. */
  periodo: PeriodoEntrega | "";
}
