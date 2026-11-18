import { describe, expect, it } from "vitest";
import { LOJA } from "../../src/config/loja";
import { PRODUTOS_NATAL } from "../../src/config/natal";
import {
  adicionarItem,
  alterarQuantidadeItem,
  alternarOpcao,
  calcularTotaisCarrinho,
  chaveItem,
  montarLinhas,
  precoUnitario,
  produtosMorango,
  removerItem,
  removerItensNatal,
  temItensNatal,
  validarEscolhas,
} from "../../src/lib/carrinho";
import { QUANTIDADE_MAXIMA } from "../../src/lib/pedidoReducer";
import type { Carrinho, GrupoOpcoes, Produto } from "../../src/types/carrinho";

const CATALOGO = [...PRODUTOS_NATAL, ...produtosMorango(LOJA.sabores, LOJA.precoUnidade)];
const p = (id: string): Produto => {
  const produto = CATALOGO.find((x) => x.id === id);
  if (!produto) throw new Error(id);
  return produto;
};
const grupo = (produtoId: string, id: string): GrupoOpcoes => {
  const g = p(produtoId).grupos.find((x) => x.id === id);
  if (!g) throw new Error(id);
  return g;
};

const GUIRLANDA = p("guirlanda-natal");
const MINI = p("mini-guirlanda");
const ENCANTO = p("taca-encanto-morango");
const GUIRLANDA_OREO = {
  recheio: ["oreo"],
  toppings: ["morango", "docinho-de-ninho"],
  adicionais: [] as string[],
};

describe("alternarOpcao (limites dos grupos)", () => {
  it("escolha única troca a opção", () => {
    const recheio = grupo("guirlanda-natal", "recheio");
    expect(alternarOpcao(recheio, ["oreo"], "leite-ninho")).toEqual(["leite-ninho"]);
  });

  it("toppings: no máximo 2, desmarca ao tocar de novo", () => {
    const toppings = grupo("guirlanda-natal", "toppings");
    let sel = alternarOpcao(toppings, [], "oreo");
    sel = alternarOpcao(toppings, sel, "morango");
    expect(alternarOpcao(toppings, sel, "docinho-de-ninho")).toEqual(["oreo", "morango"]);
    expect(alternarOpcao(toppings, sel, "oreo")).toEqual(["morango"]);
  });

  it("ignora opção que não existe no grupo", () => {
    expect(alternarOpcao(grupo("guirlanda-natal", "toppings"), [], "nutella")).toEqual(
      [],
    );
  });
});

describe("validarEscolhas", () => {
  it("guirlanda exige recheio e exatamente 2 toppings; adicionais opcionais", () => {
    expect(validarEscolhas(GUIRLANDA, GUIRLANDA_OREO)).toEqual({});
    expect(validarEscolhas(GUIRLANDA, {})).toEqual({
      recheio: "Escolha 1 opção.",
      toppings: "Escolha 2 opções.",
    });
    expect(
      validarEscolhas(GUIRLANDA, { ...GUIRLANDA_OREO, toppings: ["oreo"] }),
    ).toHaveProperty("toppings");
    expect(
      validarEscolhas(GUIRLANDA, { ...GUIRLANDA_OREO, toppings: ["oreo", "oreo"] }),
    ).toHaveProperty("toppings");
    expect(
      validarEscolhas(GUIRLANDA, {
        ...GUIRLANDA_OREO,
        toppings: ["oreo", "morango", "docinho-de-ninho"],
      }),
    ).toHaveProperty("toppings");
    expect(
      validarEscolhas(GUIRLANDA, {
        ...GUIRLANDA_OREO,
        adicionais: ["kinder-bueno", "ferrero-rocher"],
      }),
    ).toEqual({});
  });

  it("opção inexistente não conta", () => {
    expect(validarEscolhas(MINI, { recheio: ["nutella"] })).toHaveProperty("recheio");
    expect(validarEscolhas(MINI, { recheio: ["chocolate-branco"] })).toEqual({});
  });

  it("taças não têm opções", () => {
    expect(validarEscolhas(ENCANTO, {})).toEqual({});
  });
});

describe("precoUnitario (adicionais)", () => {
  it("soma os adicionais ao preço", () => {
    expect(precoUnitario(GUIRLANDA, GUIRLANDA_OREO)).toBe(135);
    expect(
      precoUnitario(GUIRLANDA, { ...GUIRLANDA_OREO, adicionais: ["kinder-bueno"] }),
    ).toBe(145);
    expect(
      precoUnitario(GUIRLANDA, {
        ...GUIRLANDA_OREO,
        adicionais: ["kinder-bueno", "ferrero-rocher"],
      }),
    ).toBe(155);
  });
});

describe("linhas do carrinho por combinação", () => {
  it("mesma combinação soma; ordem das opções não importa", () => {
    let c: Carrinho = adicionarItem([], GUIRLANDA, GUIRLANDA_OREO);
    c = adicionarItem(c, GUIRLANDA, {
      ...GUIRLANDA_OREO,
      toppings: ["docinho-de-ninho", "morango"],
    });
    expect(c).toHaveLength(1);
    expect(c[0]?.quantidade).toBe(2);
    // a ordem da primeira escolha é a que aparece
    expect(c[0]?.escolhas.toppings).toEqual(["morango", "docinho-de-ninho"]);
  });

  it("recheios diferentes viram 2 linhas", () => {
    let c: Carrinho = adicionarItem([], MINI, { recheio: ["oreo"] });
    c = adicionarItem(c, MINI, { recheio: ["chocolate-branco"] });
    expect(c).toHaveLength(2);
    expect(chaveItem(MINI, { recheio: ["oreo"] })).not.toBe(
      chaveItem(MINI, { recheio: ["chocolate-branco"] }),
    );
  });

  it("com e sem adicional viram 2 linhas", () => {
    let c: Carrinho = adicionarItem([], GUIRLANDA, GUIRLANDA_OREO);
    c = adicionarItem(c, GUIRLANDA, { ...GUIRLANDA_OREO, adicionais: ["kinder-bueno"] });
    expect(c).toHaveLength(2);
  });

  it("não adiciona com escolhas obrigatórias faltando", () => {
    expect(adicionarItem([], GUIRLANDA, { recheio: ["oreo"] })).toEqual([]);
    expect(adicionarItem([], MINI, {})).toEqual([]);
  });

  it("descarta grupos que o produto não tem", () => {
    const c = adicionarItem([], ENCANTO, { recheio: ["oreo"] });
    expect(c[0]?.escolhas).toEqual({});
    expect(adicionarItem(c, ENCANTO, {})).toHaveLength(1);
  });
});

describe("quantidade e remoção", () => {
  const base = adicionarItem([], ENCANTO, {});
  const chave = base[0]?.chave ?? "";

  it("− / + fica entre 1 e o máximo", () => {
    expect(alterarQuantidadeItem(base, chave, -5)[0]?.quantidade).toBe(1);
    expect(alterarQuantidadeItem(base, chave, 2)[0]?.quantidade).toBe(3);
    expect(alterarQuantidadeItem(base, chave, 500)[0]?.quantidade).toBe(
      QUANTIDADE_MAXIMA,
    );
    expect(adicionarItem(base, ENCANTO, {}, 500)[0]?.quantidade).toBe(QUANTIDADE_MAXIMA);
  });

  it("remover tira a linha", () => {
    expect(removerItem(base, chave)).toEqual([]);
  });

  it("quantidade inválida não entra", () => {
    expect(adicionarItem([], ENCANTO, {}, 0)).toEqual([]);
    expect(adicionarItem([], ENCANTO, {}, 1.5)).toEqual([]);
  });
});

describe("itens de Natal (bloqueio a partir de 19/12)", () => {
  it("remove só os itens de Natal e conta as linhas removidas", () => {
    let c: Carrinho = adicionarItem([], ENCANTO, {});
    c = adicionarItem(c, p("branco"), {}, 2);
    c = adicionarItem(c, MINI, { recheio: ["oreo"] });
    expect(temItensNatal(c, CATALOGO)).toBe(true);
    const r = removerItensNatal(c, CATALOGO);
    expect(r.removidos).toBe(2);
    expect(r.carrinho.map((i) => i.produtoId)).toEqual(["branco"]);
    expect(temItensNatal(r.carrinho, CATALOGO)).toBe(false);
  });

  it("morangos não são de Natal e custam o preço da loja", () => {
    const morangos = produtosMorango(LOJA.sabores, LOJA.precoUnidade);
    expect(morangos.map((m) => [m.id, m.preco, m.natal])).toEqual([
      ["branco", 14, false],
      ["preto", 14, false],
    ]);
  });
});

describe("calcularTotaisCarrinho", () => {
  it("exemplo da seção 5.1: R$ 340,00 + entrega R$ 8,00", () => {
    let c: Carrinho = adicionarItem([], GUIRLANDA, {
      ...GUIRLANDA_OREO,
      adicionais: ["kinder-bueno"],
    });
    c = adicionarItem(c, MINI, { recheio: ["chocolate-branco"] }, 2);
    c = adicionarItem(c, ENCANTO, {});
    expect(montarLinhas(c, CATALOGO).map((l) => l.subtotal)).toEqual([145, 70, 125]);
    expect(calcularTotaisCarrinho(c, CATALOGO, 8)).toEqual({
      itens: 4,
      subtotal: 340,
      taxaEntrega: 8,
      total: 348,
    });
  });

  it("carrinho vazio não cobra entrega", () => {
    expect(calcularTotaisCarrinho([], CATALOGO, 8)).toEqual({
      itens: 0,
      subtotal: 0,
      taxaEntrega: 0,
      total: 0,
    });
  });

  it("ignora produto que saiu do catálogo", () => {
    const c: Carrinho = [
      { chave: "x", produtoId: "banoffee", escolhas: {}, quantidade: 1 },
    ];
    expect(calcularTotaisCarrinho(c, CATALOGO, 8).total).toBe(0);
  });

  it("morangos e Natal juntos", () => {
    let c: Carrinho = adicionarItem([], p("preto"), {}, 3);
    c = adicionarItem(c, p("taca-uva"), {});
    expect(calcularTotaisCarrinho(c, CATALOGO, 10)).toEqual({
      itens: 4,
      subtotal: 137,
      taxaEntrega: 10,
      total: 147,
    });
  });
});
