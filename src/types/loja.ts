export interface Sabor {
  id: string;
  nome: string;
  descricao: string;
  /** Caminho da foto já otimizada em /public/img. */
  foto: string;
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
  taxaEntrega: number;
  sabores: readonly Sabor[];
  instagram: string;
}
