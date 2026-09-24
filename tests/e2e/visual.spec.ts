import { expect, test } from "@playwright/test";
import { esperarSemVazamento, montarPedidoCompleto } from "./utils";

/**
 * Checagem visual: sem vazamento e capturas de tela para revisão humana
 * (ficam em test-results/ e no relatório HTML).
 */
const TELAS = [
  { nome: "320-iphone-se", width: 320, height: 568, celular: true },
  { nome: "1920-computador", width: 1920, height: 1080, celular: false },
  { nome: "844x390-celular-deitado", width: 844, height: 390, celular: true },
  { nome: "568x320-iphone-se-deitado", width: 568, height: 320, celular: true },
];

for (const tela of TELAS) {
  test.describe(tela.nome, () => {
    test.use({
      viewport: { width: tela.width, height: tela.height },
      isMobile: tela.celular,
      hasTouch: tela.celular,
    });

    test(`página e pagamento em ${tela.nome}`, async ({ page }, info) => {
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await esperarSemVazamento(page);
      await page.screenshot({ path: info.outputPath(`${tela.nome}-inicio.png`) });

      await montarPedidoCompleto(page);
      await esperarSemVazamento(page);
      // Rola a página toda para carregar as fotos lazy antes da captura.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 300) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
      });
      await page.screenshot({
        path: info.outputPath(`${tela.nome}-pagina.png`),
        fullPage: true,
      });

      const pedido = page.locator("#pedido");
      await pedido.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`${tela.nome}-pedido.png`) });

      await page
        .getByRole("region", { name: "Seus dados" })
        .getByRole("button", { name: "Finalizar pedido" })
        .click();
      await expect(page.getByRole("heading", { name: "Quase lá!" })).toBeVisible();
      await esperarSemVazamento(page);
      // Espera o fade de entrada da tela terminar.
      await page.waitForTimeout(600);
      const whatsapp = page.getByRole("link", { name: "Enviar pedido no WhatsApp" });
      expect((await whatsapp.boundingBox())?.height ?? 0).toBeLessThan(80);
      await page.screenshot({
        path: info.outputPath(`${tela.nome}-pagamento.png`),
        fullPage: true,
      });
    });
  });
}
