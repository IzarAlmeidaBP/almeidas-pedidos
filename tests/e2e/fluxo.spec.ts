import { expect, test } from "@playwright/test";
import {
  COMPUTADOR,
  dataFutura,
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
      "Endereço: Rua X, 123 – Bairro",
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

test("retirada: sem endereço e sem taxa na mensagem", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Adicionar 1 Morango preto" }).click();
  await page.getByLabel(/^Nome/).fill("Ana");
  await page.locator("label", { hasText: /^Retirada/ }).click();
  await expect(
    page.getByText(/endereço de retirada é enviado pelo WhatsApp/),
  ).toBeVisible();
  await expect(page.getByLabel(/^Endereço completo/)).toHaveCount(0);
  await page.getByLabel(/^Data/).fill(dataFutura().iso);
  await page.getByLabel(/^Horário/).fill("09:30");
  await page
    .getByRole("region", { name: "Seus dados" })
    .getByRole("button", { name: "Finalizar pedido" })
    .click();

  const href = await page
    .getByRole("link", { name: "Enviar pedido no WhatsApp" })
    .getAttribute("href");
  const texto = new URL(href ?? "").searchParams.get("text") ?? "";
  expect(texto).toContain("🍓 NOVO PEDIDO – RETIRADA");
  expect(texto).toContain("*Total: R$ 14,00*");
  expect(texto).not.toContain("Endereço:");
  expect(texto).not.toContain("Entrega:");
});
