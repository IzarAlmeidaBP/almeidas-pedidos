import { expect, test } from "@playwright/test";
import {
  COMPUTADOR,
  dataFutura,
  escolherBairro,
  esperarSemVazamento,
  largura,
  montarPedidoCompleto,
} from "./utils";

test("fluxo completo: sabores → dados → pagamento → link do WhatsApp", async ({
  page,
}) => {
  await page.goto("/");
  await esperarSemVazamento(page);

  const botaoFinalizar = page
    .getByRole("region", { name: "Seus dados" })
    .getByRole("button", { name: "Finalizar pedido" });
  await expect(botaoFinalizar).toBeDisabled();

  await montarPedidoCompleto(page);

  // Total acompanha: barra fixa no celular/tablet, resumo lateral no computador.
  if (largura(page) < COMPUTADOR) {
    const barra = page.getByRole("region", { name: "Resumo do pedido" });
    await expect(barra).toBeVisible();
    await expect(barra).toContainText("3 morangos");
    await expect(barra).toContainText("R$ 50,00");
  } else {
    const resumo = page.getByRole("region", { name: "Seu pedido", exact: true });
    await expect(resumo).toBeVisible();
    await expect(resumo).toContainText("R$ 50,00");
  }

  await esperarSemVazamento(page);
  await expect(botaoFinalizar).toBeEnabled();
  await botaoFinalizar.click();

  await expect(page.getByRole("heading", { name: "Quase lá!" })).toBeVisible();
  await expect(page.getByText("R$ 50,00", { exact: true })).toBeVisible();
  await expect(page.getByText("c8f5c461-ed0b-4566-b39c-7215aa9216b6")).toBeVisible();
  await esperarSemVazamento(page);

  const whatsapp = page.getByRole("link", { name: "Enviar pedido no WhatsApp" });
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  const url = new URL((await whatsapp.getAttribute("href")) ?? "");
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
      "Bairro: Catolé",
      "Endereço: Rua X, 123",
      "Referência: perto da padaria",
      `Data/horário: ${dataFutura().ddmm} às 15h`,
      "Obs: é presente",
      "",
      "Segue o comprovante do Pix 👇",
    ].join("\n"),
  );

  await page.getByRole("button", { name: "Voltar e editar pedido" }).click();
  await expect(page.getByLabel(/^Nome/)).toHaveValue("Maria");
});

test("só entrega: endereço e referência obrigatórios e taxa sempre somada", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText(/retirada/i)).toHaveCount(0);
  await expect(page.getByRole("radio", { name: /retirada/i })).toHaveCount(0);

  await page.getByRole("button", { name: "Adicionar 1 Morango preto" }).click();
  await page.getByLabel(/^Nome/).fill("Ana");
  await page.getByLabel(/^Data/).fill(dataFutura().iso);
  await page.getByLabel(/^Horário/).fill("09:30");

  const finalizar = page
    .getByRole("region", { name: "Seus dados" })
    .getByRole("button", { name: "Finalizar pedido" });
  await expect(finalizar).toBeDisabled();

  await page.getByLabel(/^Endereço completo/).fill("Rua Y, 45");
  await page.getByLabel(/^Ponto de referência/).fill("em frente à praça");
  await expect(finalizar).toBeDisabled();
  await escolherBairro(page, "Centro", "Centro R$ 8,00");
  await expect(finalizar).toBeEnabled();
  await finalizar.click();

  const href = await page
    .getByRole("link", { name: "Enviar pedido no WhatsApp" })
    .getAttribute("href");
  const texto = new URL(href ?? "").searchParams.get("text") ?? "";
  expect(texto).toContain("🍓 NOVO PEDIDO – ENTREGA");
  expect(texto).toContain("Entrega: R$ 8,00");
  expect(texto).toContain("*Total: R$ 22,00*");
  expect(texto).toContain("Bairro: Centro");
  expect(texto).toContain("Endereço: Rua Y, 45");
  expect(texto).toContain("Referência: em frente à praça");
});

test("bairro de R$ 10,00: taxa ao lado do bairro, no total e na mensagem", async ({
  page,
}) => {
  await page.goto("/");
  await montarPedidoCompleto(page);
  // Busca sem acento e em maiúsculas.
  await escolherBairro(page, "BODOCONGO", "Bodocongó R$ 10,00");
  await expect(page.getByText("Entrega para Bodocongó: R$ 10,00")).toBeVisible();
  await esperarSemVazamento(page);

  await page
    .getByRole("region", { name: "Seus dados" })
    .getByRole("button", { name: "Finalizar pedido" })
    .click();
  await expect(page.getByText("R$ 52,00", { exact: true })).toBeVisible();
  await expect(page.getByText("Bodocongó", { exact: true })).toBeVisible();

  const href = await page
    .getByRole("link", { name: "Enviar pedido no WhatsApp" })
    .getAttribute("href");
  const texto = new URL(href ?? "").searchParams.get("text") ?? "";
  expect(texto).toContain("Entrega: R$ 10,00\n*Total: R$ 52,00*");
  expect(texto).toContain("Bairro: Bodocongó\n");
});

test("bairro fora da lista: bloqueia o pagamento e consulta no WhatsApp", async ({
  page,
}) => {
  await page.goto("/");
  await montarPedidoCompleto(page);
  const finalizar = page
    .getByRole("region", { name: "Seus dados" })
    .getByRole("button", { name: "Finalizar pedido" });
  await expect(finalizar).toBeEnabled();

  await page.getByRole("searchbox", { name: "Buscar bairro" }).fill("Velame");
  await expect(page.getByText("Nenhum bairro encontrado.")).toBeVisible();
  await escolherBairro(page, "Velame", "Meu bairro não está na lista");
  await expect(page.getByLabel("Qual é o seu bairro?")).toHaveValue("Velame");
  await expect(finalizar).toBeDisabled();
  await esperarSemVazamento(page);

  const consulta = page.getByRole("link", { name: "Consultar entrega no WhatsApp" });
  await expect(consulta).toBeVisible();
  await expect(consulta).toHaveAttribute("target", "_blank");
  const url = new URL((await consulta.getAttribute("href")) ?? "");
  expect(url.origin + url.pathname).toBe("https://wa.me/558382025788");
  expect(url.searchParams.get("text")).toBe(
    "Olá! Moro no bairro Velame e gostaria de saber a taxa de entrega.",
  );
});
