export interface InfoImagem {
  largura: number;
  altura: number;
  /** Versões menores da mesma foto, para o srcset. */
  menores?: readonly { src: string; largura: number }[];
}
