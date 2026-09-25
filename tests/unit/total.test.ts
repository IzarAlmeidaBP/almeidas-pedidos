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
  it("soma a taxa de entrega recebida", () => {
    expect(calcularTotais({ branco: 2, preto: 1 }, 8, LOJA)).toEqual({
      itens: 3,
      subtotal: 42,
      taxaEntrega: 8,
      total: 50,
    });
    expect(calcularTotais({ preto: 1 }, 10, LOJA).total).toBe(24);
  });

  it("sem itens não cobra taxa de entrega", () => {
    expect(calcularTotais({}, 8, LOJA)).toEqual({
      itens: 0,
      subtotal: 0,
      taxaEntrega: 0,
      total: 0,
    });
  });

  it("não acumula erro de ponto flutuante", () => {
    const config = { ...LOJA, precoUnidade: 0.1 };
    expect(calcularTotais({ branco: 3 }, 0.2, config)).toMatchObject({
      subtotal: 0.3,
      total: 0.5,
    });
  });
});
