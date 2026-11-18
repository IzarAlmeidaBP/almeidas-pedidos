import { fireEvent, render, screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { App } from "../../src/App";
import { NATAL } from "../../src/config/natal";
import type { RegrasPrazo } from "../../src/lib/prazos";
import { PedidoProvider } from "../../src/state/PedidoContext";

/** 18/11/2026 ao meio-dia em Campina Grande: primeira entrega em 20/11/2026. */
export const AGORA = new Date("2026-11-18T12:00:00-03:00");
export const DATA_ENTREGA = "2026-11-20";

/** Horário de Campina Grande (UTC-3) → instante. */
export const emCG = (dataHora: string) => new Date(`${dataHora}:00-03:00`);

/** Relógio que o teste pode adiantar (ex.: virar o dia com a página aberta). */
export function relogioDe(inicio: Date) {
  let atual = inicio;
  return {
    ler: () => atual,
    ajustar: (novo: Date) => {
      atual = novo;
    },
  };
}

export function renderizar(opcoes: { relogio?: () => Date; regras?: RegrasPrazo } = {}) {
  const { relogio = () => AGORA, regras = NATAL } = opcoes;
  return render(
    <PedidoProvider relogio={relogio} regras={regras}>
      <App />
    </PedidoProvider>,
  );
}

/** O resumo do computador também tem "Finalizar pedido"; aqui é o do formulário. */
export function botaoFinalizar() {
  return within(screen.getByRole("region", { name: "Seus dados" })).getByRole("button", {
    name: "Finalizar pedido",
  });
}

/** Busca o bairro e marca a opção (o nome acessível traz a taxa ao lado). */
export async function escolherBairro(user: UserEvent, busca: string, opcao: string) {
  const campo = screen.getByRole("searchbox", { name: "Buscar bairro" });
  await user.clear(campo);
  await user.type(campo, busca);
  await user.click(screen.getByRole("radio", { name: opcao }));
}

export function linkWhatsApp(nome: string): URL {
  return new URL(screen.getByRole("link", { name: nome }).getAttribute("href") ?? "");
}

export function escolherData(data: string) {
  fireEvent.change(screen.getByLabelText(/^Data da entrega/), {
    target: { value: data },
  });
}

/** Preenche todos os campos obrigatórios (sem observações), bairro Catolé. */
export async function preencherDados(
  user: UserEvent,
  { nome = "Ana", data = DATA_ENTREGA, periodo = "Manhã" } = {},
) {
  await user.type(screen.getByLabelText(/^Nome/), nome);
  await escolherBairro(user, "Catolé", "Catolé R$ 8,00");
  await user.type(screen.getByLabelText(/^Endereço completo/), "Rua X, 123");
  await user.type(screen.getByLabelText(/^Ponto de referência/), "perto da padaria");
  escolherData(data);
  await user.click(screen.getByRole("radio", { name: periodo }));
}

export const card = (nome: string) => screen.getByRole("article", { name: nome });
