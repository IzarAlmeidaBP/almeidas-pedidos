import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/App";
import { hojeISO } from "../../src/lib/dataHora";
import { PedidoProvider } from "../../src/state/PedidoContext";

function renderizar() {
  return render(
    <PedidoProvider>
      <App />
    </PedidoProvider>,
  );
}

/** O resumo do computador também tem "Finalizar pedido"; aqui é o do formulário. */
function botaoFinalizar() {
  return within(screen.getByRole("region", { name: "Seus dados" })).getByRole("button", {
    name: "Finalizar pedido",
  });
}

const depoisDeAmanha = hojeISO(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
const [, mes, dia] = depoisDeAmanha.split("-");

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe("fluxo completo do pedido", () => {
  it("monta o pedido, vai para o pagamento e gera o link do WhatsApp", async () => {
    const user = userEvent.setup();
    renderizar();

    const finalizar = botaoFinalizar();
    expect(finalizar).toBeDisabled();
    expect(screen.getByText("Escolha pelo menos 1 morango.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango preto" }));

    const barra = screen.getByRole("region", { name: "Resumo do pedido" });
    expect(within(barra).getByText("3 morangos")).toBeInTheDocument();
    expect(within(barra).getByText("R$ 42,00")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Nome/), "Maria");
    await user.click(screen.getByRole("radio", { name: /Entrega/ }));
    expect(within(barra).getByText("R$ 50,00")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Endereço completo/), "Rua X, 123 – Bairro");
    await user.type(screen.getByLabelText(/^Ponto de referência/), "perto da padaria");
    fireEvent.change(screen.getByLabelText(/^Data/), {
      target: { value: depoisDeAmanha },
    });
    fireEvent.change(screen.getByLabelText(/^Horário/), { target: { value: "15:00" } });
    await user.type(screen.getByLabelText(/^Observações/), "é presente");

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

    const whatsapp = screen.getByRole("link", { name: "Enviar pedido no WhatsApp" });
    const url = new URL(whatsapp.getAttribute("href") ?? "");
    expect(url.origin + url.pathname).toBe("https://wa.me/558382025788");
    expect(url.searchParams.get("text")).toBe(
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
        "Endereço: Rua X, 123 – Bairro",
        "Referência: perto da padaria",
        `Data/horário: ${dia}/${mes} às 15h`,
        "Obs: é presente",
        "",
        "Segue o comprovante do Pix 👇",
      ].join("\n"),
    );
    expect(whatsapp).toHaveAttribute("target", "_blank");
  });

  it("copia a chave Pix aleatória exatamente como é (com hífens)", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango preto" }));
    await user.type(screen.getByLabelText(/^Nome/), "Ana");
    await user.click(screen.getByRole("radio", { name: /Retirada/ }));
    fireEvent.change(screen.getByLabelText(/^Data/), {
      target: { value: depoisDeAmanha },
    });
    fireEvent.change(screen.getByLabelText(/^Horário/), { target: { value: "10:30" } });
    await user.click(botaoFinalizar());

    await user.click(screen.getByRole("button", { name: "Copiar chave Pix" }));
    expect(await screen.findByRole("button", { name: "Copiado!" })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(
      "c8f5c461-ed0b-4566-b39c-7215aa9216b6",
    );
    expect(screen.getByText("Chave Pix (Aleatória)")).toBeInTheDocument();
  });

  it("volta para edição mantendo o que foi preenchido", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await user.type(screen.getByLabelText(/^Nome/), "Ana");
    await user.click(screen.getByRole("radio", { name: /Retirada/ }));
    fireEvent.change(screen.getByLabelText(/^Data/), {
      target: { value: depoisDeAmanha },
    });
    fireEvent.change(screen.getByLabelText(/^Horário/), { target: { value: "10:30" } });
    await user.click(botaoFinalizar());

    await user.click(screen.getByRole("button", { name: "Voltar e editar pedido" }));
    expect(screen.getByLabelText(/^Nome/)).toHaveValue("Ana");
    expect(screen.getByRole("radio", { name: /Retirada/ })).toBeChecked();
    expect(screen.getByText("1 morango")).toBeInTheDocument();
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
      within(resumo).getByRole("link", { name: "Escolher sabores" }),
    ).toHaveAttribute("href", "#pedido");

    await user.click(screen.getByRole("button", { name: "Adicionar 1 Morango preto" }));
    expect(within(resumo).getByText("1x Morango preto")).toBeInTheDocument();
    expect(
      within(resumo).getByRole("link", { name: "Preencher seus dados" }),
    ).toBeVisible();

    await user.type(screen.getByLabelText(/^Nome/), "Ana");
    await user.click(screen.getByRole("radio", { name: /Retirada/ }));
    fireEvent.change(screen.getByLabelText(/^Data/), {
      target: { value: depoisDeAmanha },
    });
    fireEvent.change(screen.getByLabelText(/^Horário/), { target: { value: "10:30" } });
    expect(within(resumo).getByText("Sem taxa")).toBeInTheDocument();

    await user.click(within(resumo).getByRole("button", { name: "Finalizar pedido" }));
    expect(screen.getByRole("heading", { name: "Quase lá!" })).toBeInTheDocument();
  });

  it("retirada avisa que o endereço vai pelo WhatsApp e não pede endereço", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("radio", { name: /Retirada/ }));
    expect(
      screen.getByText(/endereço de retirada é enviado pelo WhatsApp/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Endereço completo/)).not.toBeInTheDocument();
  });
});
