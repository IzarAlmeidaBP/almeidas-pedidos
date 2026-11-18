import type { GrupoOpcoes, PeriodoEntrega, Produto } from "../types/carrinho";

/**
 * Campanha de Natal 2026: regras de prazo, textos e catálogo.
 * Fonte: catálogo enviado pela dona em 16/11/2026
 * (docs/planejamento-atualizacao-natal.md, seções 3 e 4).
 */
export const NATAL = {
  /** false esconde a campanha inteira do site. */
  ativo: true,
  /** Último dia para fazer pedidos de Natal (inclusive). */
  ultimoDiaPedidos: "2026-12-18",
  /** Dias corridos entre o pedido e a primeira data de entrega. */
  antecedenciaDias: 2,
  /** P3: último dia com entrega (ex.: "2026-12-24"); null = sem limite. */
  ultimaDataEntrega: null as string | null,
  /** P3: dias sem entrega (ex.: ["2026-12-25"]). */
  datasSemEntrega: [] as string[],
  /** Campina Grande: UTC-3, sem horário de verão. */
  fusoHorario: "America/Fortaleza",
} as const;

export const PERIODOS_ENTREGA: readonly PeriodoEntrega[] = ["Manhã", "Tarde", "Noite"];

export const TEXTOS_NATAL = {
  titulo: "Natal 2026",
  subtitulo: "Sobremesas feitas com carinho para adoçar a sua ceia.",
  selo: "✦ Encomendas até 18 de dezembro ✦",
  comoEncomendar: [
    {
      titulo: "Faça seu pedido!",
      texto:
        "Escolha seus produtos favoritos e faça sua encomenda diretamente pelo nosso site.",
    },
    {
      titulo: "Encomendas de Natal até 18 de dezembro de 2026.",
      texto: "Garanta seu Natal doce fazendo seu pedido com antecedência!",
    },
    {
      titulo: "Somente entrega.",
      texto:
        "Não trabalhamos com retirada. A entrega é realizada mediante taxa fixa por bairro, com os valores apresentados durante a compra no site.",
    },
    {
      titulo: "Pagamento antecipado.",
      texto:
        "O pagamento deverá ser realizado antecipadamente para confirmar a encomenda.",
    },
  ],
  mensagemFinal:
    "Feliz Natal! A Almeida's agradece por fazer parte dos seus momentos especiais. Que seu Natal seja ainda mais doce!",
  encerrado: "Encomendas de Natal encerradas 🎄 Obrigada pelo carinho!",
  categorias: {
    guirlandas: { titulo: "Guirlandas de Natal" },
    "mini-guirlandas": { titulo: "Mini Guirlandas" },
    tacas: {
      titulo: "Sobremesas na Taça",
      descricao:
        "Nossas sobremesas na taça são preparadas com muito capricho, combinando cremes, chocolates e ingredientes selecionados para deixar seu Natal ainda mais especial.",
    },
  },
} as const;

function opcoes(...nomes: string[]) {
  return nomes.map((nome) => ({ id: slug(nome), nome, acrescimo: 0 }));
}

function slug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const GRUPOS_GUIRLANDA: readonly GrupoOpcoes[] = [
  {
    id: "recheio",
    titulo: "Recheio de cima",
    rotulo: "Recheio",
    tipo: "unica",
    min: 1,
    max: 1,
    opcoes: opcoes("Leite Ninho", "Oreo", "Chocolate ao leite", "Chocolate meio amargo"),
  },
  {
    id: "toppings",
    titulo: "Toppings",
    rotulo: "Toppings",
    tipo: "multipla",
    // P4: exatamente 2 (padrão até a dona confirmar).
    min: 2,
    max: 2,
    opcoes: opcoes("Oreo", "Docinho de Ninho", "Docinho de Brigadeiro", "Morango"),
  },
  {
    id: "adicionais",
    titulo: "Adicionais especiais",
    rotulo: "Adicionais",
    tipo: "multipla",
    min: 0,
    max: 2,
    opcoes: [
      { id: "kinder-bueno", nome: "Kinder Bueno", acrescimo: 10.0 },
      { id: "ferrero-rocher", nome: "Ferrero Rocher", acrescimo: 10.0 },
    ],
  },
];

const GRUPOS_MINI: readonly GrupoOpcoes[] = [
  {
    id: "recheio",
    titulo: "Recheio de cima",
    rotulo: "Recheio",
    tipo: "unica",
    min: 1,
    max: 1,
    opcoes: opcoes("Oreo", "Chocolate branco", "Chocolate preto"),
  },
];

function taca(id: string, nome: string, preco: number, descricao: string): Produto {
  return {
    id,
    nome,
    categoria: "tacas",
    preco,
    descricao,
    foto: `/img/natal/${id}-900.webp`,
    natal: true,
    grupos: [],
  };
}

export const PRODUTOS_NATAL: readonly Produto[] = [
  {
    id: "guirlanda-natal",
    nome: "Guirlanda de Natal",
    categoria: "guirlandas",
    preco: 135.0,
    descricao:
      "Uma deliciosa guirlanda natalina feita com massa de brownie, molhadinha por dentro e com uma casquinha por cima. Personalize escolhendo seu recheio e seus toppings favoritos.",
    foto: "/img/natal/guirlanda-natal-900.webp",
    natal: true,
    grupos: GRUPOS_GUIRLANDA,
  },
  {
    id: "mini-guirlanda",
    nome: "Mini Guirlanda",
    categoria: "mini-guirlandas",
    preco: 35.0,
    descricao:
      "Uma versão delicada da nossa guirlanda natalina, perfeita para presentear alguém especial! Feita com massa de brownie, molhadinha por dentro e com uma casquinha por cima.",
    foto: "/img/natal/mini-guirlanda-900.webp",
    selo: "🎁 Acompanha uma caixinha linda para presentear",
    natal: true,
    grupos: GRUPOS_MINI,
  },
  taca(
    "taca-brownie",
    "Taça Brownie",
    105.0,
    "Camada de creme de chocolate branco, camada de creme de chocolate preto, camada de brownie e pedaços de brownie.",
  ),
  taca(
    "taca-uva",
    "Taça Uva",
    95.0,
    "Creme de Ninho com uvas e uma leve camada de creme de chocolate, coberta com uvas.",
  ),
  taca(
    "taca-oreo",
    "Taça Oreo",
    105.0,
    "Creme de Oreo, camada de chocolate, camada de creme de chocolate branco e camada do biscoito Oreo.",
  ),
  taca(
    "taca-dois-amores",
    "Taça Dois Amores",
    100.0,
    "Uma combinação deliciosa de creme de chocolate branco com creme de chocolate preto.",
  ),
  taca(
    "taca-surpresa-nutella",
    "Taça Surpresa de Nutella",
    135.0,
    "Camada de creme de Ninho, camada de chantilly, camada de Nutella, camada de creme de chocolate e camada de morango.",
  ),
  taca(
    "taca-ninho-morango",
    "Taça Ninho com Morango",
    110.0,
    "Camada de creme de Ninho, camada de chantilly e morangos.",
  ),
  taca(
    "taca-encanto-morango",
    "Taça Encanto de Morango",
    125.0,
    "Creme de chocolate preto, creme de chocolate branco, camada de chantilly e morangos.",
  ),
];
