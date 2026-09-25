export interface Sabor {
  id: string;
  nome: string;
  descricao: string;
  /** Caminho da foto já otimizada em /public/img. */
  foto: string;
}

/** Bairros com a mesma taxa de entrega. */
export interface FaixaEntrega {
  taxa: number;
  /** Só para quem edita a config (ex.: "até ~5 km"). */
  descricao: string;
  bairros: readonly string[];
}

export interface ConfigEntrega {
  faixas: readonly FaixaEntrega[];
  /** Bairros sem taxa automática: o cliente consulta a loja no WhatsApp. */
  consultar: readonly string[];
}

export interface ConfigLoja {
  nome: string;
  cidade: string;
  /** Somente dígitos, com DDI e DDD. Ex.: 558382025788 */
  whatsapp: string;
  pix: {
    chave: string;
    tipo: string;
    titular: string;
  };
  precoUnidade: number;
  entrega: ConfigEntrega;
  sabores: readonly Sabor[];
  instagram: string;
}
