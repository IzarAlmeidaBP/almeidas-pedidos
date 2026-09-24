import type { InfoImagem } from "../types/imagem";

/**
 * Tamanho real de cada imagem de /public/img, usado no srcset e para reservar o
 * espaço da foto antes de ela carregar (evita a página "pular").
 *
 * `menores` lista as versões reduzidas da mesma foto (arquivos `-480.webp` e
 * `-900.webp`): o navegador baixa a menor que servir para a tela.
 */
export const IMAGENS: Record<string, InfoImagem> = {
  "/img/morango-branco.webp": {
    largura: 900,
    altura: 1600,
    menores: [{ src: "/img/morango-branco-480.webp", largura: 480 }],
  },
  "/img/morango-preto.webp": {
    largura: 1179,
    altura: 1370,
    menores: [
      { src: "/img/morango-preto-480.webp", largura: 480 },
      { src: "/img/morango-preto-900.webp", largura: 900 },
    ],
  },
  "/img/morango-cortado.webp": {
    largura: 900,
    altura: 1600,
    menores: [{ src: "/img/morango-cortado-480.webp", largura: 480 }],
  },
  "/img/morango-branco-pote.webp": {
    largura: 900,
    altura: 1600,
    menores: [{ src: "/img/morango-branco-pote-480.webp", largura: 480 }],
  },
  "/img/morangos-brancos-entrega.webp": {
    largura: 1150,
    altura: 1600,
    menores: [
      { src: "/img/morangos-brancos-entrega-480.webp", largura: 480 },
      { src: "/img/morangos-brancos-entrega-900.webp", largura: 900 },
    ],
  },
  "/img/potes-com-selo.webp": {
    largura: 900,
    altura: 1600,
    menores: [{ src: "/img/potes-com-selo-480.webp", largura: 480 }],
  },
};
