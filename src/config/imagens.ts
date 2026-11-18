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

  // Natal 2026 (public/img/natal). Algumas versões "-900" têm largura real menor.
  ...fotoNatal("guirlanda-natal", 588, 636),
  ...fotoNatal("mini-guirlanda", 900, 1125),
  ...fotoNatal("taca-brownie", 900, 961),
  ...fotoNatal("taca-uva", 600, 776),
  ...fotoNatal("taca-oreo", 900, 1114),
  ...fotoNatal("taca-dois-amores", 900, 1118),
  ...fotoNatal("taca-surpresa-nutella", 900, 1200),
  ...fotoNatal("taca-ninho-morango", 732, 1150),
  ...fotoNatal("taca-encanto-morango", 900, 892),
};

/** Registra `<slug>-900.webp` com a versão `<slug>-480.webp` no srcset. */
function fotoNatal(
  slug: string,
  largura: number,
  altura: number,
): Record<string, InfoImagem> {
  return {
    [`/img/natal/${slug}-900.webp`]: {
      largura,
      altura,
      menores: [{ src: `/img/natal/${slug}-480.webp`, largura: 480 }],
    },
  };
}
