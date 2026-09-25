import { describe, expect, it } from "vitest";
import { DADOS_VAZIOS } from "../../src/lib/pedidoReducer";
import type { Entrega } from "../../src/lib/entrega";
import { validarPedido } from "../../src/lib/validacao";
import type { DadosCliente, Pedido } from "../../src/types/pedido";

const HOJE = "2026-09-24";
const CATOLE: Entrega = { tipo: "com-taxa", bairro: "Catolé", taxa: 8 };

function pedido(dados: Partial<DadosCliente>): Pedido {
  return {
    quantidades: { branco: 1 },
    dados: {
      ...DADOS_VAZIOS,
      nome: "Maria",
      endereco: "Rua X, 123",
      referencia: "Padaria",
      data: "2026-09-26",
      horario: "15:00",
      ...dados,
    },
  };
}

describe("validarPedido", () => {
  it("pedido completo é válido", () => {
    expect(validarPedido(pedido({}), 1, CATOLE, HOJE)).toEqual({});
  });

  it("exige pelo menos 1 morango", () => {
    expect(validarPedido(pedido({}), 0, CATOLE, HOJE)).toHaveProperty("itens");
  });

  it("exige nome (espaços não contam)", () => {
    expect(validarPedido(pedido({ nome: "   " }), 1, CATOLE, HOJE)).toHaveProperty(
      "nome",
    );
  });

  it("endereço e referência são sempre obrigatórios", () => {
    const erros = validarPedido(
      pedido({ endereco: " ", referencia: "" }),
      1,
      CATOLE,
      HOJE,
    );
    expect(Object.keys(erros).sort()).toEqual(["endereco", "referencia"]);
  });

  it("exige data a partir de hoje e horário", () => {
    expect(validarPedido(pedido({ data: "2026-09-23" }), 1, CATOLE, HOJE)).toHaveProperty(
      "data",
    );
    expect(validarPedido(pedido({ data: HOJE }), 1, CATOLE, HOJE)).toEqual({});
    expect(validarPedido(pedido({ horario: "" }), 1, CATOLE, HOJE)).toHaveProperty(
      "horario",
    );
  });

  it("exige bairro escolhido", () => {
    expect(validarPedido(pedido({}), 1, { tipo: "sem-bairro" }, HOJE)).toEqual({
      bairro: "Escolha seu bairro.",
    });
  });

  it("bairro sem taxa automática bloqueia até consultar no WhatsApp", () => {
    const erros = validarPedido(
      pedido({}),
      1,
      { tipo: "consultar", bairro: "Cidades" },
      HOJE,
    );
    expect(erros).toEqual({
      bairro: "Consulte a taxa de entrega do seu bairro no WhatsApp.",
    });
  });

  it("observações são opcionais", () => {
    expect(validarPedido(pedido({ observacoes: "" }), 1, CATOLE, HOJE)).toEqual({});
  });
});
