import { describe, expect, it } from "vitest";
import { LOJA } from "../../src/config/loja";
import { NATAL, PRODUTOS_NATAL } from "../../src/config/natal";
import { adicionarItem, produtosMorango } from "../../src/lib/carrinho";
import {
  montarLinkWhatsApp,
  montarMensagemCarrinho,
  type ConfigMensagemCarrinho,
  type PedidoCarrinho,
} from "../../src/lib/mensagem";
import { DADOS_VAZIOS } from "../../src/lib/pedidoReducer";
import type { Carrinho, DadosEntrega, Produto } from "../../src/types/carrinho";

const CATALOGO = [...PRODUTOS_NATAL, ...produtosMorango(LOJA.sabores, LOJA.precoUnidade)];
const CONFIG_CARRINHO: ConfigMensagemCarrinho = {
  entrega: LOJA.entrega,
  catalogo: CATALOGO,
  fusoHorario: NATAL.fusoHorario,
};
const produto = (id: string): Produto => {
  const p = CATALOGO.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p;
};
const DADOS_NATAL: DadosEntrega = {
  ...DADOS_VAZIOS,
  nome: "Maria",
  bairro: "Catolé",
  endereco: "Rua X, 123",
  referencia: "perto da padaria",
  data: "2026-12-20",
  periodo: "Tarde",
  observacoes: "é presente",
};
/** 18/12/2026 às 21:30 em Campina Grande (já é 19/12 em UTC). */
const AGORA = new Date("2026-12-19T00:30:00Z");

function carrinhoExemplo(): Carrinho {
  let c: Carrinho = adicionarItem([], produto("guirlanda-natal"), {
    recheio: ["oreo"],
    toppings: ["morango", "docinho-de-ninho"],
    adicionais: ["kinder-bueno"],
  });
  c = adicionarItem(c, produto("mini-guirlanda"), { recheio: ["chocolate-branco"] }, 2);
  return adicionarItem(c, produto("taca-encanto-morango"), {});
}

describe("montarMensagemCarrinho (contrato com a loja, seção 5.1)", () => {
  it("gera exatamente o formato da encomenda de Natal", () => {
    const pedido: PedidoCarrinho = { carrinho: carrinhoExemplo(), dados: DADOS_NATAL };
    expect(montarMensagemCarrinho(pedido, CONFIG_CARRINHO, AGORA)).toBe(
      [
        "🎄 ENCOMENDA DE NATAL – ENTREGA",
        "",
        "1x Guirlanda de Natal – R$ 145,00",
        "   Recheio: Oreo",
        "   Toppings: Morango, Docinho de Ninho",
        "   Adicionais: Kinder Bueno (+R$ 10,00)",
        "2x Mini Guirlanda – R$ 70,00",
        "   Recheio: Chocolate branco",
        "1x Taça Encanto de Morango – R$ 125,00",
        "",
        "Subtotal: R$ 340,00",
        "Entrega: R$ 8,00 (Catolé)",
        "*Total: R$ 348,00*",
        "",
        "Nome: Maria",
        "Endereço: Rua X, 123 – Catolé",
        "Referência: perto da padaria",
        "Entrega: 20/12/2026 – Tarde",
        "Pedido feito em: 18/12/2026",
        "Obs: é presente",
        "",
        "Segue o comprovante do Pix 👇",
      ].join("\n"),
    );
  });

  it("Natal com morangos: morango entra com preço; sem adicionais, sem a linha", () => {
    let c: Carrinho = adicionarItem([], produto("guirlanda-natal"), {
      recheio: ["leite-ninho"],
      toppings: ["oreo", "docinho-de-brigadeiro"],
    });
    c = adicionarItem(c, produto("branco"), {}, 2);
    const msg = montarMensagemCarrinho(
      { carrinho: c, dados: { ...DADOS_NATAL, bairro: "Bodocongó", observacoes: "" } },
      CONFIG_CARRINHO,
      AGORA,
    );
    expect(msg).toContain(
      [
        "1x Guirlanda de Natal – R$ 135,00",
        "   Recheio: Leite Ninho",
        "   Toppings: Oreo, Docinho de Brigadeiro",
        "2x Morango branco – R$ 28,00",
        "",
        "Subtotal: R$ 163,00",
        "Entrega: R$ 10,00 (Bodocongó)",
        "*Total: R$ 173,00*",
      ].join("\n"),
    );
    expect(msg).not.toContain("Adicionais:");
    expect(msg).not.toContain("Obs:");
  });

  it("só morangos: formato de antes, com as linhas novas de entrega e pedido", () => {
    let c: Carrinho = adicionarItem([], produto("branco"), {}, 2);
    c = adicionarItem(c, produto("preto"), {});
    const msg = montarMensagemCarrinho(
      { carrinho: c, dados: { ...DADOS_NATAL, data: "2026-12-23", periodo: "Manhã" } },
      CONFIG_CARRINHO,
      new Date("2026-12-21T12:00:00-03:00"),
    );
    expect(msg).toBe(
      [
        "🍓 NOVO PEDIDO – ENTREGA",
        "",
        "2x Morango branco",
        "1x Bombom de morango chocolate ao leite",
        "Subtotal: R$ 42,00",
        "Entrega: R$ 8,00",
        "*Total: R$ 50,00*",
        "",
        "Nome: Maria",
        "Bairro: Catolé",
        "Endereço: Rua X, 123",
        "Referência: perto da padaria",
        "Entrega: 23/12/2026 – Manhã",
        "Pedido feito em: 21/12/2026",
        "Obs: é presente",
        "",
        "Segue o comprovante do Pix 👇",
      ].join("\n"),
    );
  });

  it('"Pedido feito em" usa o fuso da loja', () => {
    const pedido: PedidoCarrinho = { carrinho: carrinhoExemplo(), dados: DADOS_NATAL };
    // 19/12 02:59 UTC = 18/12 23:59 em Campina Grande
    expect(
      montarMensagemCarrinho(pedido, CONFIG_CARRINHO, new Date("2026-12-19T02:59:00Z")),
    ).toContain("Pedido feito em: 18/12/2026");
  });

  it("volta intacta ao decodificar o link", () => {
    const msg = montarMensagemCarrinho(
      { carrinho: carrinhoExemplo(), dados: DADOS_NATAL },
      CONFIG_CARRINHO,
      AGORA,
    );
    expect(new URL(montarLinkWhatsApp(LOJA.whatsapp, msg)).searchParams.get("text")).toBe(
      msg,
    );
  });
});

describe("montarLinkWhatsApp", () => {
  it("monta o link wa.me com a mensagem codificada", () => {
    const link = montarLinkWhatsApp("5583982025788", "Oi 🍓\nTotal: R$ 14,00");
    expect(link).toBe(
      "https://wa.me/5583982025788?text=Oi%20%F0%9F%8D%93%0ATotal%3A%20R%24%2014%2C00",
    );
  });

  it("remove caracteres que não são dígitos do número", () => {
    expect(montarLinkWhatsApp("+55 (83) 98202-5788", "x")).toBe(
      "https://wa.me/5583982025788?text=x",
    );
  });
});
