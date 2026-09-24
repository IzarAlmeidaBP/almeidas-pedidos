import { describe, expect, it } from "vitest";
import { LOJA } from "../../src/config/loja";
import { calcularTotais, contarItens } from "../../src/lib/total";

describe("contarItens", () => {
  it("soma as quantidades dos sabores da config", () => {
    expect(contarItens({ branco: 2, preto: 3 }, LOJA)).toBe(5);
  });

  it("ignora sabores desconhecidos, negativos e não inteiros", () => {
    expect(contarItens({ branco: 1, pistache: 4, preto: -2 }, LOJA)).toBe(1);
    expect(contarItens({ branco: 1.5 }, LOJA)).toBe(0);
  });
});

describe("calcularTotais", () => {
  it("entrega soma a taxa fixa", () => {
    expect(calcularTotais({ branco: 2, preto: 1 }, "entrega", LOJA)).toEqual({
      itens: 3,
      subtotal: 42,
      taxaEntrega: 8,
      total: 50,
    });
  });

  it("retirada não tem taxa", () => {
    expect(calcularTotais({ branco: 2 }, "retirada", LOJA)).toEqual({
      itens: 2,
      subtotal: 28,
      taxaEntrega: 0,
      total: 28,
    });
  });

  it("sem forma escolhida ainda não soma taxa", () => {
    expect(calcularTotais({ preto: 1 }, "", LOJA).total).toBe(14);
  });

  it("sem itens não cobra taxa de entrega", () => {
    expect(calcularTotais({}, "entrega", LOJA).total).toBe(0);
  });

  it("não acumula erro de ponto flutuante", () => {
    const config = { ...LOJA, precoUnidade: 0.1, taxaEntrega: 0.2 };
    expect(calcularTotais({ branco: 3 }, "entrega", config)).toMatchObject({
      subtotal: 0.3,
      total: 0.5,
    });
  });
});
