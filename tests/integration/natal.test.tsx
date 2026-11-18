import { screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NATAL } from "../../src/config/natal";
import {
  botaoFinalizar,
  card,
  emCG,
  escolherData,
  linkWhatsApp,
  preencherDados,
  relogioDe,
  renderizar,
} from "./utils";

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

const adicionar = (c: HTMLElement) =>
  within(c).getByRole("button", { name: /Adicionar ao pedido/ });

/** Guirlanda com Oreo, Morango + Docinho de Ninho e Kinder Bueno. */
async function montarGuirlanda(user: UserEvent) {
  const g = card("Guirlanda de Natal");
  await user.click(within(g).getByRole("radio", { name: "Oreo" }));
  await user.click(within(g).getByRole("checkbox", { name: "Morango" }));
  await user.click(within(g).getByRole("checkbox", { name: "Docinho de Ninho" }));
  await user.click(within(g).getByRole("checkbox", { name: "Kinder Bueno +R$ 10,00" }));
  await user.click(adicionar(g));
}

describe("Natal 2026: página", () => {
  it("mostra hero, navegação, Como encomendar e o catálogo com os preços", () => {
    renderizar();
    expect(screen.getByRole("heading", { level: 1, name: "Natal 2026" })).toBeVisible();
    expect(
      screen.getByText("Sobremesas feitas com carinho para adoçar a sua ceia."),
    ).toBeInTheDocument();
    expect(screen.getByText("✦ Encomendas até 18 de dezembro ✦")).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Menu principal" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((l) => [l.textContent, l.getAttribute("href")]),
    ).toEqual([
      ["Natal 2026", "#natal"],
      ["Guirlandas", "#guirlandas"],
      ["Taças", "#tacas"],
      ["Morangos", "#pedido"],
      ["Como encomendar", "#como-encomendar"],
    ]);
    // Cada link leva a uma seção que existe.
    for (const id of ["natal", "guirlandas", "tacas", "pedido", "como-encomendar"])
      expect(document.getElementById(id), id).not.toBeNull();
    // Carrinho fora do menu, com contador.
    expect(screen.getByRole("link", { name: "Carrinho (0)" })).toHaveAttribute(
      "href",
      "#carrinho",
    );

    expect(screen.getByText("Faça seu pedido!")).toBeInTheDocument();
    expect(screen.getByText("Somente entrega.")).toBeInTheDocument();
    expect(screen.getByText("Pagamento antecipado.")).toBeInTheDocument();

    const precos: Record<string, string> = {
      "Guirlanda de Natal": "R$ 135,00",
      "Mini Guirlanda": "R$ 35,00",
      "Taça Brownie": "R$ 105,00",
      "Taça Uva": "R$ 95,00",
      "Taça Oreo": "R$ 105,00",
      "Taça Dois Amores": "R$ 100,00",
      "Taça Surpresa de Nutella": "R$ 135,00",
      "Taça Ninho com Morango": "R$ 110,00",
      "Taça Encanto de Morango": "R$ 125,00",
    };
    for (const [nome, preco] of Object.entries(precos))
      // O primeiro é o preço do card; o botão repete o total da quantidade.
      expect(within(card(nome)).getAllByText(preco)[0]).toHaveClass("bg-vinho");
    expect(
      within(card("Mini Guirlanda")).getByText(
        "🎁 Acompanha uma caixinha linda para presentear",
      ),
    ).toBeInTheDocument();
    // Fotos confirmadas: nada de "Imagem ilustrativa".
    expect(screen.queryByText(/ilustrativa/i)).toBeNull();
    // Mensagem final no rodapé da página.
    expect(
      screen.getByText(
        "Feliz Natal! A Almeida's agradece por fazer parte dos seus momentos especiais. Que seu Natal seja ainda mais doce!",
      ),
    ).toBeInTheDocument();
  });

  it("morangos continuam como categoria, abaixo do Natal (P5)", () => {
    renderizar();
    expect(screen.getByRole("heading", { name: "Morangos cravejados" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Adicionar 1 Morango branco" }),
    ).toBeEnabled();
  });
});

describe("Natal 2026: opções do produto", () => {
  it("Guirlanda: só adiciona com recheio e exatamente 2 toppings", async () => {
    const user = userEvent.setup();
    renderizar();
    const g = card("Guirlanda de Natal");
    expect(adicionar(g)).toBeDisabled();
    expect(
      within(g).getByText("Para adicionar, escolha: recheio de cima e toppings."),
    ).toBeInTheDocument();

    await user.click(within(g).getByRole("radio", { name: "Leite Ninho" }));
    await user.click(within(g).getByRole("checkbox", { name: "Oreo" }));
    expect(adicionar(g)).toBeDisabled();
    await user.click(within(g).getByRole("checkbox", { name: "Morango" }));
    expect(adicionar(g)).toBeEnabled();

    // Com 2 toppings, os outros ficam bloqueados.
    expect(within(g).getByRole("checkbox", { name: "Docinho de Ninho" })).toBeDisabled();
    expect(within(g).getByText("Escolha 2 (2/2)")).toBeInTheDocument();
    // Desmarcar libera de novo.
    await user.click(within(g).getByRole("checkbox", { name: "Oreo" }));
    expect(within(g).getByRole("checkbox", { name: "Docinho de Ninho" })).toBeEnabled();
    expect(adicionar(g)).toBeDisabled();
  });

  it("adicionais somam no preço do card e no botão (com a quantidade)", async () => {
    const user = userEvent.setup();
    renderizar();
    const g = card("Guirlanda de Natal");
    await user.click(within(g).getByRole("checkbox", { name: "Kinder Bueno +R$ 10,00" }));
    expect(within(g).getAllByText("R$ 145,00")[0]).toHaveClass("bg-vinho");
    await user.click(
      within(g).getByRole("checkbox", { name: "Ferrero Rocher +R$ 10,00" }),
    );
    expect(within(g).getAllByText("R$ 155,00")[0]).toHaveClass("bg-vinho");
    await user.click(
      within(g).getByRole("button", {
        name: "Aumentar quantidade de Guirlanda de Natal",
      }),
    );
    expect(adicionar(g)).toHaveTextContent("Adicionar ao pedido R$ 310,00");
  });
});

describe("Natal 2026: carrinho e mensagem", () => {
  it("monta Guirlanda + Mini + Taça e envia no formato 5.1", async () => {
    const user = userEvent.setup();
    renderizar();

    await montarGuirlanda(user);
    expect(
      within(card("Guirlanda de Natal")).getByText("Adicionado ao pedido!"),
    ).toBeInTheDocument();
    // O card volta ao estado inicial.
    expect(
      within(card("Guirlanda de Natal")).getByRole("radio", { name: "Oreo" }),
    ).not.toBeChecked();

    const mini = card("Mini Guirlanda");
    await user.click(within(mini).getByRole("radio", { name: "Chocolate branco" }));
    await user.click(
      within(mini).getByRole("button", { name: "Aumentar quantidade de Mini Guirlanda" }),
    );
    await user.click(adicionar(mini));
    await user.click(adicionar(card("Taça Encanto de Morango")));

    const barra = screen.getByRole("region", { name: "Resumo do pedido" });
    expect(within(barra).getByRole("link")).toHaveTextContent(
      "Ver carrinho (4)R$ 340,00",
    );
    expect(screen.getByRole("link", { name: "Carrinho (4)" })).toBeInTheDocument();

    const itens = within(screen.getByRole("list", { name: "Itens do carrinho" }));
    expect(itens.getAllByRole("listitem")).toHaveLength(3);
    expect(itens.getByText("Toppings: Morango, Docinho de Ninho")).toBeInTheDocument();
    expect(itens.getByText("Adicionais: Kinder Bueno (+R$ 10,00)")).toBeInTheDocument();

    await preencherDados(user, { nome: "Maria", periodo: "Tarde" });
    escolherData("2026-12-20");
    await user.type(screen.getByLabelText(/^Observações/), "é presente");
    await user.click(botaoFinalizar());

    expect(
      screen.getByText(
        "Feliz Natal! A Almeida's agradece por fazer parte dos seus momentos especiais. Que seu Natal seja ainda mais doce!",
      ),
    ).toBeInTheDocument();
    expect(linkWhatsApp("Enviar pedido no WhatsApp").searchParams.get("text")).toBe(
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
        "Pedido feito em: 18/11/2026",
        "Obs: é presente",
        "",
        "Segue o comprovante do Pix 👇",
      ].join("\n"),
    );
  });

  it("mesma combinação soma na linha; combinação diferente vira outra linha", async () => {
    const user = userEvent.setup();
    renderizar();
    const mini = card("Mini Guirlanda");
    await user.click(within(mini).getByRole("radio", { name: "Oreo" }));
    await user.click(adicionar(mini));
    await user.click(within(mini).getByRole("radio", { name: "Oreo" }));
    await user.click(adicionar(mini));
    await user.click(within(mini).getByRole("radio", { name: "Chocolate preto" }));
    await user.click(adicionar(mini));

    const itens = within(screen.getByRole("list", { name: "Itens do carrinho" }));
    const linhas = itens.getAllByRole("listitem");
    expect(linhas).toHaveLength(2);
    expect(within(linhas[0]!).getByText("Recheio: Oreo")).toBeInTheDocument();
    expect(within(linhas[0]!).getByText("R$ 70,00")).toBeInTheDocument();
    expect(within(linhas[1]!).getByText("Recheio: Chocolate preto")).toBeInTheDocument();
  });

  it("linha do carrinho: − para em 1, + soma e remover tira a linha", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(adicionar(card("Taça Oreo")));
    const linha = within(screen.getByRole("list", { name: "Itens do carrinho" }));
    const menos = linha.getByRole("button", { name: "Diminuir no carrinho: Taça Oreo" });
    expect(menos).toBeDisabled();
    await user.click(
      linha.getByRole("button", { name: "Aumentar no carrinho: Taça Oreo" }),
    );
    expect(linha.getByText("R$ 210,00")).toBeInTheDocument();
    await user.click(
      linha.getByRole("button", { name: "Remover do carrinho: Taça Oreo" }),
    );
    expect(screen.getByText(/Seu carrinho está vazio/)).toBeInTheDocument();
  });
});

describe("Natal 2026: prazos", () => {
  it("calendário começa em hoje + 2 e recusa data anterior (P6)", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    const data = screen.getByLabelText(/^Data da entrega/);
    expect(data).toHaveAttribute("min", "2026-11-20");
    expect(data).not.toHaveAttribute("max");
    expect(
      screen.getByText("Pedidos com 2 dias de antecedência: a partir de 20/11/2026."),
    ).toBeInTheDocument();

    escolherData("2026-11-19");
    expect(data).toHaveAccessibleDescription(
      expect.stringContaining("escolha a partir de 20/11/2026"),
    );
  });

  it("18/12: pode pedir Natal e escolher entrega em 27/12", async () => {
    const user = userEvent.setup();
    renderizar({ relogio: () => emCG("2026-12-18T23:59") });
    await user.click(adicionar(card("Taça Uva")));
    await preencherDados(user, { data: "2026-12-27" });
    expect(screen.getByLabelText(/^Data da entrega/)).toHaveAttribute(
      "min",
      "2026-12-20",
    );
    expect(botaoFinalizar()).toBeEnabled();
  });

  it("ultimaDataEntrega da config vira o máximo do calendário com Natal (P3)", async () => {
    const user = userEvent.setup();
    renderizar({ regras: { ...NATAL, ultimaDataEntrega: "2026-12-24" } });
    const data = screen.getByLabelText(/^Data da entrega/);
    expect(data).not.toHaveAttribute("max");
    await user.click(adicionar(card("Taça Uva")));
    expect(data).toHaveAttribute("max", "2026-12-24");
  });

  it("a partir de 19/12: Natal visível, mas encerrado; morangos funcionam", async () => {
    const user = userEvent.setup();
    renderizar({ relogio: () => emCG("2026-12-19T00:00") });

    expect(
      screen.getByText("Encomendas de Natal encerradas 🎄 Obrigada pelo carinho!"),
    ).toBeInTheDocument();
    const falar = screen.getByRole("link", { name: "Falar no WhatsApp" });
    expect(falar).toHaveAttribute("href", "https://wa.me/5583982025788");
    expect(falar).toHaveAttribute("target", "_blank");

    const g = card("Guirlanda de Natal");
    expect(
      within(g).getByRole("button", { name: /Encomendas encerradas/ }),
    ).toBeDisabled();
    expect(within(g).getByRole("radio", { name: "Oreo" })).toBeDisabled();
    expect(
      within(card("Taça Oreo")).getByRole("button", { name: /Encomendas encerradas/ }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await preencherDados(user, { data: "2026-12-21" });
    expect(botaoFinalizar()).toBeEnabled();
  });

  it("virou 19/12 com a página aberta: itens de Natal saem do carrinho, com aviso", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      const relogio = relogioDe(emCG("2026-12-18T23:58"));
      renderizar({ relogio: relogio.ler });
      await user.click(adicionar(card("Taça Oreo")));
      await user.click(
        screen.getByRole("button", { name: "Adicionar 1 Morango branco" }),
      );

      relogio.ajustar(emCG("2026-12-19T00:00"));
      act(() => vi.advanceTimersByTime(30_000));

      expect(screen.getByRole("alert")).toHaveTextContent(
        "As encomendas de Natal foram encerradas. 1 item de Natal saiu do seu carrinho.",
      );
      const itens = within(screen.getByRole("list", { name: "Itens do carrinho" }));
      expect(itens.getAllByRole("listitem")).toHaveLength(1);
      expect(itens.getByText("Morango branco")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Fechar aviso" }));
      expect(screen.getByRole("alert")).toBeEmptyDOMElement();
    } finally {
      vi.useRealTimers();
    }
  });

  it("revalida no envio: Natal encerrado entre o pagamento e o clique", async () => {
    const user = userEvent.setup();
    const relogio = relogioDe(emCG("2026-12-18T23:50"));
    renderizar({ relogio: relogio.ler });
    await user.click(adicionar(card("Taça Oreo")));
    await preencherDados(user, { data: "2026-12-21" });
    await user.click(botaoFinalizar());

    relogio.ajustar(emCG("2026-12-19T00:01"));
    await user.click(screen.getByRole("link", { name: "Enviar pedido no WhatsApp" }));

    expect(screen.queryByRole("heading", { name: "Quase lá!" })).toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent("1 item de Natal saiu");
    expect(screen.getByText(/Seu carrinho está vazio/)).toBeInTheDocument();
  });

  it("revalida no envio: data que deixou de valer volta para a edição", async () => {
    const user = userEvent.setup();
    const relogio = relogioDe(emCG("2026-11-18T23:59"));
    renderizar({ relogio: relogio.ler });
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await preencherDados(user, { data: "2026-11-20" });
    await user.click(botaoFinalizar());

    relogio.ajustar(emCG("2026-11-19T00:00"));
    await user.click(screen.getByRole("link", { name: "Enviar pedido no WhatsApp" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A data de entrega escolhida não está mais disponível. Os pedidos precisam de 2 dias de antecedência: escolha a partir de 21/11/2026.",
    );
    const data = screen.getByLabelText(/^Data da entrega/);
    expect(data).toHaveAttribute("min", "2026-11-21");
    expect(data).toHaveAttribute("aria-invalid", "true");
    expect(botaoFinalizar()).toBeDisabled();
  });
});

describe("Natal 2026: campanha desligada (NATAL.ativo = false)", () => {
  it("esconde tudo do Natal e o site volta ao topo dos morangos", () => {
    renderizar({ regras: { ...NATAL, ativo: false } });
    expect(screen.queryByRole("heading", { name: "Natal 2026" })).toBeNull();
    // O cabeçalho continua, só com o link dos morangos e o carrinho.
    const nav = screen.getByRole("navigation", { name: "Menu principal" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["Morangos"]);
    expect(screen.getByRole("link", { name: "Carrinho (0)" })).toBeInTheDocument();
    expect(screen.queryByRole("article")).toBeNull();
    expect(screen.queryByText(/Feliz Natal/)).toBeNull();
    expect(
      screen.getByRole("heading", { level: 1, name: "Almeida's – Confectionery Art" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Monte seu pedido" })).toBeInTheDocument();
  });
});
