import { describe, expect, it } from "vitest";
import { LOJA } from "../../src/config/loja";
import { montarLinkWhatsApp, montarMensagem } from "../../src/lib/mensagem";
import { DADOS_VAZIOS } from "../../src/lib/pedidoReducer";
import type { Pedido } from "../../src/types/pedido";

const pedidoEntrega: Pedido = {
  quantidades: { branco: 2, preto: 1 },
  dados: {
    ...DADOS_VAZIOS,
    nome: "Maria",
    bairro: "Catolé",
    endereco: "Rua X, 123",
    referencia: "perto da padaria",
    data: "2026-09-26",
    horario: "15:00",
    observacoes: "é presente",
  },
};

describe("montarMensagem (contrato com a loja)", () => {
  it("gera exatamente o formato combinado para entrega", () => {
    expect(montarMensagem(pedidoEntrega, LOJA)).toBe(
      [
        "🍓 NOVO PEDIDO – ENTREGA",
        "",
        "2x Morango branco",
        "1x Morango preto",
        "Subtotal: R$ 42,00",
        "Entrega: R$ 8,00",
        "*Total: R$ 50,00*",
        "",
        "Nome: Maria",
        "Bairro: Catolé",
        "Endereço: Rua X, 123",
        "Referência: perto da padaria",
        "Data/horário: 26/09 às 15h",
        "Obs: é presente",
        "",
        "Segue o comprovante do Pix 👇",
      ].join("\n"),
    );
  });

  it("usa a taxa do bairro escolhido (bairro de R$ 10,00)", () => {
    const pedido: Pedido = {
      quantidades: { branco: 0, preto: 3 },
      dados: {
        ...pedidoEntrega.dados,
        bairro: "Bodocongó",
        horario: "09:30",
        observacoes: "  ",
      },
    };
    expect(montarMensagem(pedido, LOJA)).toBe(
      [
        "🍓 NOVO PEDIDO – ENTREGA",
        "",
        "3x Morango preto",
        "Subtotal: R$ 42,00",
        "Entrega: R$ 10,00",
        "*Total: R$ 52,00*",
        "",
        "Nome: Maria",
        "Bairro: Bodocongó",
        "Endereço: Rua X, 123",
        "Referência: perto da padaria",
        "Data/horário: 26/09 às 9h30",
        "",
        "Segue o comprovante do Pix 👇",
      ].join("\n"),
    );
  });

  it("omite sabores com quantidade 0 e remove espaços extras dos campos", () => {
    const msg = montarMensagem(
      {
        quantidades: { branco: 1, preto: 0 },
        dados: { ...pedidoEntrega.dados, nome: "  Ana  ", observacoes: "" },
      },
      LOJA,
    );
    expect(msg).toContain("1x Morango branco");
    expect(msg).not.toContain("Morango preto");
    expect(msg).toContain("Nome: Ana\n");
    expect(msg).not.toContain("Obs:");
  });

  it("usa preço e taxas da configuração recebida", () => {
    const msg = montarMensagem(pedidoEntrega, {
      ...LOJA,
      precoUnidade: 15.5,
      entrega: {
        faixas: [{ taxa: 10, descricao: "", bairros: ["Catolé"] }],
        consultar: [],
      },
    });
    expect(msg).toContain("Subtotal: R$ 46,50");
    expect(msg).toContain("Entrega: R$ 10,00");
    expect(msg).toContain("*Total: R$ 56,50*");
  });
});

describe("montarLinkWhatsApp", () => {
  it("monta o link wa.me com a mensagem codificada", () => {
    const link = montarLinkWhatsApp("558382025788", "Oi 🍓\nTotal: R$ 14,00");
    expect(link).toBe(
      "https://wa.me/558382025788?text=Oi%20%F0%9F%8D%93%0ATotal%3A%20R%24%2014%2C00",
    );
  });

  it("remove caracteres que não são dígitos do número", () => {
    expect(montarLinkWhatsApp("+55 (83) 8202-5788", "x")).toBe(
      "https://wa.me/558382025788?text=x",
    );
  });

  it("a mensagem volta intacta ao decodificar o link", () => {
    const msg = montarMensagem(pedidoEntrega, LOJA);
    const link = new URL(montarLinkWhatsApp(LOJA.whatsapp, msg));
    expect(link.searchParams.get("text")).toBe(msg);
  });
});
