import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  botaoFinalizar,
  escolherBairro,
  escolherData,
  linkWhatsApp,
  preencherDados,
  renderizar,
} from "./utils";

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

const CHOCOLATE = "Bombom de morango chocolate ao leite";

describe("fluxo completo do pedido (morangos)", () => {
  it("monta o pedido, vai para o pagamento e gera o link do WhatsApp", async () => {
    const user = userEvent.setup();
    renderizar();

    const finalizar = botaoFinalizar();
    expect(finalizar).toBeDisabled();
    expect(screen.getByText("Escolha pelo menos 1 item.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await user.click(screen.getByRole("button", { name: `Adicionar 1 ${CHOCOLATE}` }));

    // Sem bairro ainda não há taxa: o total é só dos morangos.
    const barra = screen.getByRole("region", { name: "Resumo do pedido" });
    expect(within(barra).getByRole("link")).toHaveTextContent("Ver carrinho (3)R$ 42,00");
    expect(within(barra).getByRole("link")).toHaveAttribute("href", "#carrinho");

    // Os morangos entram no carrinho como linhas.
    const itens = screen.getByRole("list", { name: "Itens do carrinho" });
    expect(within(itens).getAllByRole("listitem")).toHaveLength(2);

    await user.type(screen.getByLabelText(/^Nome/), "Maria");
    await escolherBairro(user, "catole", "Catolé R$ 8,00");
    await user.type(screen.getByLabelText(/^Endereço completo/), "Rua X, 123");
    await user.type(screen.getByLabelText(/^Ponto de referência/), "perto da padaria");
    escolherData("2026-11-20");
    await user.click(screen.getByRole("radio", { name: "Tarde" }));
    await user.type(screen.getByLabelText(/^Observações/), "é presente");

    // A taxa do bairro entra no total.
    expect(within(barra).getByText("R$ 50,00")).toBeInTheDocument();
    expect(finalizar).toBeEnabled();
    await user.click(finalizar);

    expect(screen.getByRole("heading", { name: "Quase lá!" })).toBeInTheDocument();
    expect(screen.getByText("R$ 50,00")).toBeInTheDocument();
    expect(screen.getByText("Sofia Almeida dos Santos")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Faça o Pix, tire o print do comprovante e envie pelo WhatsApp no botão abaixo.",
      ),
    ).toBeInTheDocument();
    // Pedido só de morangos não mostra a mensagem de Natal na tela de pagamento.
    expect(screen.queryByText(/^Feliz Natal!/)).not.toBeInTheDocument();

    const whatsapp = screen.getByRole("link", { name: "Enviar pedido no WhatsApp" });
    const url = new URL(whatsapp.getAttribute("href") ?? "");
    expect(url.origin + url.pathname).toBe("https://wa.me/558382025788");
    expect(url.searchParams.get("text")).toBe(
      [
        "🍓 NOVO PEDIDO – ENTREGA",
        "",
        "2x Morango branco",
        `1x ${CHOCOLATE}`,
        "Subtotal: R$ 42,00",
        "Entrega: R$ 8,00",
        "*Total: R$ 50,00*",
        "",
        "Nome: Maria",
        "Bairro: Catolé",
        "Endereço: Rua X, 123",
        "Referência: perto da padaria",
        "Entrega: 20/11/2026 – Tarde",
        "Pedido feito em: 18/11/2026",
        "Obs: é presente",
        "",
        "Segue o comprovante do Pix 👇",
      ].join("\n"),
    );
    expect(whatsapp).toHaveAttribute("target", "_blank");
  });

  it("card de morango: o − até 0 tira a linha do carrinho", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    expect(screen.getByRole("list", { name: "Itens do carrinho" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remover 1 Morango branco" }));
    expect(screen.queryByRole("list", { name: "Itens do carrinho" })).toBeNull();
    expect(screen.getByText(/Seu carrinho está vazio/)).toBeInTheDocument();
  });

  it("não há escolha de retirada: endereço e referência aparecem sempre", () => {
    renderizar();
    expect(screen.queryByRole("radio", { name: /retirada/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Endereço completo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Ponto de referência/)).toBeInTheDocument();
    expect(screen.getByText(/taxa conforme o bairro/)).toHaveTextContent(
      "Entrega com taxa conforme o bairro.",
    );
  });

  it("lista de bairros em ordem alfabética, com a taxa ao lado e opção final", () => {
    renderizar();
    const lista = screen.getByRole("list", { name: "Bairros atendidos" });
    const nomes = within(lista)
      .getAllByRole("radio")
      .map((r) => r.parentElement?.textContent ?? "");
    expect(nomes[0]).toBe("Acácio Figueiredo R$ 8,00");
    expect(nomes).toContain("Bodocongó R$ 10,00");
    expect(nomes).toContain("Cidades Consultar");
    expect(nomes.at(-1)).toBe("Meu bairro não está na lista");
  });

  it("bairro de R$ 10,00 soma a taxa certa no resumo e na mensagem", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: `Adicionar 1 ${CHOCOLATE}` }));
    await preencherDados(user);
    await escolherBairro(user, "Bodocongo", "Bodocongó R$ 10,00");

    const resumo = screen.getByRole("region", { name: "Seu pedido" });
    expect(within(resumo).getByText("Bodocongó")).toBeInTheDocument();
    expect(within(resumo).getByText("R$ 10,00")).toBeInTheDocument();
    expect(within(resumo).getByText("R$ 24,00")).toBeInTheDocument();

    await user.click(botaoFinalizar());
    const texto = linkWhatsApp("Enviar pedido no WhatsApp").searchParams.get("text");
    expect(texto).toContain("Entrega: R$ 10,00\n*Total: R$ 24,00*");
    expect(texto).toContain("Bairro: Bodocongó\nEndereço: Rua X, 123");
  });

  it("busca sem diferenciar acento nem maiúscula", async () => {
    const user = userEvent.setup();
    renderizar();
    const busca = screen.getByRole("searchbox", { name: "Buscar bairro" });
    const lista = screen.getByRole("list", { name: "Bairros atendidos" });
    const valores = () =>
      within(lista)
        .getAllByRole("radio")
        .map((r) => r.getAttribute("value"));

    await user.type(busca, "SAO JOSE");
    expect(valores()).toEqual(["São José", "São José da Mata", "fora-da-lista"]);

    await user.clear(busca);
    await user.type(busca, "três");
    expect(valores()).toEqual(["Três Irmãs", "fora-da-lista"]);

    await user.clear(busca);
    await user.type(busca, "Velame");
    expect(within(lista).getByText("Nenhum bairro encontrado.")).toBeInTheDocument();
    expect(valores()).toEqual(["fora-da-lista"]);
  });

  it("bairro fora da lista: sem taxa, bloqueia o pagamento e oferece consulta", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: `Adicionar 1 ${CHOCOLATE}` }));
    await preencherDados(user);
    expect(botaoFinalizar()).toBeEnabled();

    await escolherBairro(user, "Velame", "Meu bairro não está na lista");
    // O que foi buscado já vira o nome do bairro.
    expect(screen.getByLabelText("Qual é o seu bairro?")).toHaveValue("Velame");
    expect(botaoFinalizar()).toBeDisabled();
    expect(
      screen.getByText("Consulte a taxa de entrega do seu bairro no WhatsApp."),
    ).toBeInTheDocument();

    const resumo = screen.getByRole("region", { name: "Seu pedido" });
    expect(within(resumo).getByText("A consultar")).toBeInTheDocument();
    // Item, subtotal e total: nenhuma taxa somada.
    expect(within(resumo).getAllByText("R$ 14,00")).toHaveLength(3);
    expect(within(resumo).queryByRole("button", { name: "Finalizar pedido" })).toBeNull();

    const consulta = linkWhatsApp("Consultar entrega no WhatsApp");
    expect(consulta.origin + consulta.pathname).toBe("https://wa.me/558382025788");
    expect(consulta.searchParams.get("text")).toBe(
      "Olá! Moro no bairro Velame e gostaria de saber a taxa de entrega.",
    );

    // Sem nome digitado não há o que consultar.
    await user.clear(screen.getByLabelText("Qual é o seu bairro?"));
    expect(
      screen.queryByRole("link", { name: "Consultar entrega no WhatsApp" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Digite o nome do seu bairro para consultar.")).toBeVisible();
  });

  it("Cidades também não calcula taxa e manda consultar", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: `Adicionar 1 ${CHOCOLATE}` }));
    await preencherDados(user);
    await escolherBairro(user, "cidades", "Cidades Consultar");

    expect(botaoFinalizar()).toBeDisabled();
    expect(linkWhatsApp("Consultar entrega no WhatsApp").searchParams.get("text")).toBe(
      "Olá! Moro no bairro Cidades e gostaria de saber a taxa de entrega.",
    );
  });

  it("sem bairro, endereço, referência e horário não deixa finalizar", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: `Adicionar 1 ${CHOCOLATE}` }));
    await user.type(screen.getByLabelText(/^Nome/), "Ana");
    escolherData("2026-11-20");

    expect(botaoFinalizar()).toBeDisabled();
    const falta = within(screen.getByText("Para finalizar, falta:").parentElement!);
    expect(falta.getByText("Escolha seu bairro.")).toBeInTheDocument();
    expect(falta.getByText("Informe o endereço completo.")).toBeInTheDocument();
    expect(falta.getByText("Informe um ponto de referência.")).toBeInTheDocument();
    expect(falta.getByText("Escolha o horário preferido.")).toBeInTheDocument();
  });

  it("copia a chave Pix aleatória exatamente como é (com hífens)", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: `Adicionar 1 ${CHOCOLATE}` }));
    await preencherDados(user);
    await user.click(botaoFinalizar());

    await user.click(screen.getByRole("button", { name: "Copiar chave Pix" }));
    expect(await screen.findByRole("button", { name: "Copiado!" })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(
      "1fc14c73-dc2a-4454-b933-ce1c0c8f8131",
    );
    expect(screen.getByText("Chave Pix (Aleatória)")).toBeInTheDocument();
  });

  it("plano B: depois de enviar, mostra o texto do pedido para copiar", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await preencherDados(user);
    await user.click(botaoFinalizar());
    expect(screen.queryByText("O WhatsApp não abriu?")).toBeNull();

    const link = screen.getByRole("link", { name: "Enviar pedido no WhatsApp" });
    link.addEventListener("click", (e) => e.preventDefault()); // jsdom não navega
    await user.click(link);

    expect(screen.getByText("O WhatsApp não abriu?")).toBeInTheDocument();
    expect(screen.getByText("(83) 8202-5788")).toBeInTheDocument();
    const texto = screen.getByLabelText("Texto do pedido");
    expect(texto).toHaveValue(
      new URL(link.getAttribute("href") ?? "").searchParams.get("text"),
    );
    await user.click(screen.getByRole("button", { name: "Copiar pedido" }));
    expect(await navigator.clipboard.readText()).toContain("1x Morango branco");
  });

  it("volta para edição mantendo o que foi preenchido", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await preencherDados(user);
    await user.click(botaoFinalizar());

    await user.click(screen.getByRole("button", { name: "Voltar e editar pedido" }));
    expect(screen.getByLabelText(/^Nome/)).toHaveValue("Ana");
    expect(screen.getByLabelText(/^Endereço completo/)).toHaveValue("Rua X, 123");
    expect(screen.getByRole("radio", { name: "Catolé R$ 8,00" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Manhã" })).toBeChecked();
    expect(screen.getByText("Ver carrinho (1)")).toBeInTheDocument();
  });

  it("mostra o erro ao lado do campo depois que o cliente sai dele", async () => {
    const user = userEvent.setup();
    renderizar();
    const nome = screen.getByLabelText(/^Nome/);
    await user.click(nome);
    await user.tab();
    expect(nome).toHaveAttribute("aria-invalid", "true");
    expect(nome).toHaveAccessibleDescription("Informe seu nome.");
  });

  it("resumo lateral acompanha o pedido e só finaliza quando tudo está válido", async () => {
    const user = userEvent.setup();
    renderizar();
    const resumo = screen.getByRole("region", { name: "Seu pedido" });
    expect(
      within(resumo).getByRole("link", { name: "Escolher produtos" }),
    ).toHaveAttribute("href", "#guirlandas");

    await user.click(screen.getByRole("button", { name: `Adicionar 1 ${CHOCOLATE}` }));
    expect(within(resumo).getByText(`1x ${CHOCOLATE}`)).toBeInTheDocument();
    expect(within(resumo).getByText("Escolha o bairro")).toBeInTheDocument();
    expect(
      within(resumo).getByRole("link", { name: "Preencher seus dados" }),
    ).toBeVisible();

    await preencherDados(user);
    expect(within(resumo).getByText("Catolé")).toBeInTheDocument();
    expect(within(resumo).getByText("R$ 8,00")).toBeInTheDocument();
    expect(within(resumo).getByText("R$ 22,00")).toBeInTheDocument();
    await user.click(within(resumo).getByRole("button", { name: "Finalizar pedido" }));
    expect(screen.getByRole("heading", { name: "Quase lá!" })).toBeInTheDocument();
  });
});
