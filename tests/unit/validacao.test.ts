import { describe, expect, it } from "vitest";
import { NATAL } from "../../src/config/natal";
import type { Entrega } from "../../src/lib/entrega";
import { DADOS_VAZIOS } from "../../src/lib/pedidoReducer";
import { validarPedido, type ContextoValidacao } from "../../src/lib/validacao";
import type { DadosCliente } from "../../src/types/pedido";

const CATOLE: Entrega = { tipo: "com-taxa", bairro: "Catolé", taxa: 8 };
/** 18/11/2026 ao meio-dia em Campina Grande: primeira entrega em 20/11. */
const AGORA = new Date("2026-11-18T12:00:00-03:00");

const CTX: ContextoValidacao = {
  itens: 1,
  entrega: CATOLE,
  temNatal: true,
  agora: AGORA,
  regras: NATAL,
};

function dados(parcial: Partial<DadosCliente> = {}): DadosCliente {
  return {
    ...DADOS_VAZIOS,
    nome: "Maria",
    bairro: "Catolé",
    endereco: "Rua X, 123",
    referencia: "Padaria",
    data: "2026-11-20",
    periodo: "Tarde",
    ...parcial,
  };
}

describe("validarPedido", () => {
  it("pedido completo é válido", () => {
    expect(validarPedido(dados(), CTX)).toEqual({});
  });

  it("exige pelo menos 1 item", () => {
    expect(validarPedido(dados(), { ...CTX, itens: 0 })).toEqual({
      itens: "Escolha pelo menos 1 item.",
    });
  });

  it("exige nome (espaços não contam)", () => {
    expect(validarPedido(dados({ nome: "   " }), CTX)).toHaveProperty("nome");
  });

  it("endereço e referência são sempre obrigatórios", () => {
    const erros = validarPedido(dados({ endereco: " ", referencia: "" }), CTX);
    expect(Object.keys(erros).sort()).toEqual(["endereco", "referencia"]);
  });

  it("data a partir de hoje + 2 dias, com a primeira data na mensagem", () => {
    expect(validarPedido(dados({ data: "" }), CTX).data).toBe(
      "Escolha a data da entrega.",
    );
    expect(validarPedido(dados({ data: "2026-11-19" }), CTX).data).toBe(
      "Os pedidos precisam de 2 dias de antecedência: escolha a partir de 20/11/2026.",
    );
    // Vale também para pedido só de morangos (P6).
    expect(
      validarPedido(dados({ data: "2026-11-19" }), { ...CTX, temNatal: false }),
    ).toHaveProperty("data");
  });

  it("limite final e datas sem entrega, quando a dona configurar (P3)", () => {
    const regras = {
      ...NATAL,
      ultimaDataEntrega: "2026-12-24",
      datasSemEntrega: ["2026-12-23"],
    };
    expect(validarPedido(dados({ data: "2026-12-26" }), { ...CTX, regras }).data).toBe(
      "A última data de entrega é 24/12/2026.",
    );
    expect(validarPedido(dados({ data: "2026-12-23" }), { ...CTX, regras }).data).toBe(
      "Não há entrega nessa data. Escolha outra.",
    );
  });

  it("exige o horário preferido (Manhã/Tarde/Noite)", () => {
    expect(validarPedido(dados({ periodo: "" }), CTX)).toEqual({
      periodo: "Escolha o horário preferido.",
    });
  });

  it("sem bairro, ou bairro de consulta, não valida", () => {
    expect(validarPedido(dados(), { ...CTX, entrega: { tipo: "sem-bairro" } })).toEqual({
      bairro: "Escolha seu bairro.",
    });
    expect(
      validarPedido(dados(), {
        ...CTX,
        entrega: { tipo: "consultar", bairro: "Cidades" },
      }),
    ).toEqual({ bairro: "Consulte a taxa de entrega do seu bairro no WhatsApp." });
  });

  it("observações são opcionais", () => {
    expect(validarPedido(dados({ observacoes: "" }), CTX)).toEqual({});
  });
});
