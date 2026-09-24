import { describe, expect, it } from "vitest";
import { DADOS_VAZIOS } from "../../src/lib/pedidoReducer";
import { validarPedido } from "../../src/lib/validacao";
import type { DadosCliente, Pedido } from "../../src/types/pedido";

const HOJE = "2026-09-24";

function pedido(dados: Partial<DadosCliente>): Pedido {
  return {
    quantidades: { branco: 1 },
    dados: {
      ...DADOS_VAZIOS,
      nome: "Maria",
      forma: "retirada",
      data: "2026-09-26",
      horario: "15:00",
      ...dados,
    },
  };
}

describe("validarPedido", () => {
  it("retirada completa é válida", () => {
    expect(validarPedido(pedido({}), 1, HOJE)).toEqual({});
  });

  it("exige pelo menos 1 morango", () => {
    expect(validarPedido(pedido({}), 0, HOJE)).toHaveProperty("itens");
  });

  it("exige nome (espaços não contam) e forma de recebimento", () => {
    const erros = validarPedido(pedido({ nome: "   ", forma: "" }), 1, HOJE);
    expect(erros).toHaveProperty("nome");
    expect(erros).toHaveProperty("forma");
  });

  it("entrega exige endereço e referência", () => {
    const erros = validarPedido(pedido({ forma: "entrega" }), 1, HOJE);
    expect(Object.keys(erros).sort()).toEqual(["endereco", "referencia"]);
    expect(
      validarPedido(
        pedido({ forma: "entrega", endereco: "Rua X", referencia: "Padaria" }),
        1,
        HOJE,
      ),
    ).toEqual({});
  });

  it("retirada não exige endereço", () => {
    expect(validarPedido(pedido({ endereco: "", referencia: "" }), 1, HOJE)).toEqual({});
  });

  it("exige data a partir de hoje e horário", () => {
    expect(validarPedido(pedido({ data: "2026-09-23" }), 1, HOJE)).toHaveProperty("data");
    expect(validarPedido(pedido({ data: HOJE }), 1, HOJE)).toEqual({});
    expect(validarPedido(pedido({ horario: "" }), 1, HOJE)).toHaveProperty("horario");
  });

  it("observações são opcionais", () => {
    expect(validarPedido(pedido({ observacoes: "" }), 1, HOJE)).toEqual({});
  });
});
