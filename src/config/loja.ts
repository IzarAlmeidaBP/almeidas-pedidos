import type { ConfigLoja } from "../types/loja";

/**
 * ÚNICO lugar com os dados da loja.
 * Para trocar preço, taxa, sabores, Pix ou WhatsApp, edite só este arquivo.
 */
export const LOJA = {
  nome: "Almeida's – Confectionery Art",
  cidade: "Campina Grande/PB",
  whatsapp: "558382025788", // (83) 8202-5788
  pix: {
    chave: "c8f5c461-ed0b-4566-b39c-7215aa9216b6",
    tipo: "Aleatória",
    titular: "Sofia Almeida dos Santos",
  },
  precoUnidade: 14.0,
  taxaEntrega: 8.0,
  sabores: [
    {
      id: "branco",
      nome: "Morango branco",
      descricao: "Cravejado com chocolate branco",
      foto: "/img/morango-branco.webp",
    },
    {
      id: "preto",
      nome: "Morango preto",
      descricao: "Cravejado com chocolate preto",
      foto: "/img/morango-preto.webp",
    },
  ],
  instagram: "https://www.instagram.com/confectioneryart_/",
} as const satisfies ConfigLoja;
