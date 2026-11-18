import { expect, test, type Page } from "@playwright/test";
import { abrir, largura } from "./utils";

const CELULAR = 768;
const botaoMenu = (page: Page) => page.getByRole("button", { name: "Abrir menu" });
const menuCelular = (page: Page) =>
  page.getByRole("navigation", { name: "Menu", exact: true });

/** O título da seção está na tela e não ficou escondido atrás do cabeçalho fixo. */
async function esperarTituloVisivel(page: Page, titulo: string) {
  const h2 = page.getByRole("heading", { name: titulo, level: 2 });
  await expect(h2).toBeInViewport();
  const fundoCabecalho = async () => {
    const c = await page.getByRole("banner").boundingBox();
    return (c?.y ?? 0) + (c?.height ?? 0);
  };
  await expect
    .poll(async () => ((await h2.boundingBox())?.y ?? -1) - (await fundoCabecalho()))
    .toBeGreaterThanOrEqual(0);
}

test.describe("menu no celular (até 767px)", () => {
  test.beforeEach(({ page }) => {
    test.skip(largura(page) >= CELULAR, "só no celular");
  });

  test("abre, foca o menu, trava a rolagem, navega e fecha", async ({ page }) => {
    await abrir(page);
    // Links da barra escondidos; hambúrguer e carrinho visíveis.
    await expect(page.getByRole("navigation", { name: "Menu principal" })).toBeHidden();
    await expect(
      page.getByRole("link", { name: "Carrinho (0)", exact: true }),
    ).toBeVisible();
    const botao = botaoMenu(page);
    await expect(botao).toHaveAttribute("aria-expanded", "false");

    await botao.click();
    await expect(botao).toHaveAttribute("aria-expanded", "true");
    const menu = menuCelular(page);
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link")).toHaveText([
      "Natal 2026",
      "Guirlandas",
      "Taças",
      "Morangos",
      "Como encomendar",
    ]);
    await expect(menu.getByRole("link", { name: "Natal 2026" })).toBeFocused();
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).overflow),
    ).toBe("hidden");
    // Carrinho continua visível com o menu aberto.
    await expect(
      page.getByRole("link", { name: "Carrinho (0)", exact: true }),
    ).toBeVisible();

    await menu.getByRole("link", { name: "Taças" }).click();
    await expect(menu).toBeHidden();
    await expect(botao).toHaveAttribute("aria-expanded", "false");
    await expect(botao).toBeFocused();
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).overflow),
    ).not.toBe("hidden");
    await esperarTituloVisivel(page, "Sobremesas na Taça");
  });

  test("fecha com Esc e ao tocar fora, devolvendo o foco ao botão", async ({ page }) => {
    await abrir(page);
    const botao = botaoMenu(page);

    await botao.click();
    await expect(menuCelular(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menuCelular(page)).toBeHidden();
    await expect(botao).toHaveAttribute("aria-expanded", "false");
    await expect(botao).toBeFocused();

    await botao.click();
    await expect(menuCelular(page)).toBeVisible();
    // Toque fora do painel (no fundo escurecido, perto do fim da tela).
    const tela = page.viewportSize();
    await page.mouse.click((tela?.width ?? 0) / 2, (tela?.height ?? 0) - 20);
    await expect(menuCelular(page)).toBeHidden();
    await expect(botao).toBeFocused();
  });

  test("carrinho do cabeçalho mostra o contador e leva ao carrinho", async ({ page }) => {
    await abrir(page);
    const branco = page.getByRole("button", { name: "Adicionar 1 Morango branco" });
    await branco.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await branco.click();
    await branco.click();
    const carrinho = page.getByRole("link", { name: "Carrinho (2)", exact: true });
    await expect(carrinho).toBeInViewport();
    await carrinho.click();
    await esperarTituloVisivel(page, "Seu carrinho");
  });
});

test.describe("barra de links (768px+)", () => {
  test.beforeEach(({ page }) => {
    test.skip(largura(page) < CELULAR, "só a partir de 768px");
  });

  test("links na barra, sem hambúrguer, carrinho visível e âncoras abaixo do cabeçalho", async ({
    page,
  }) => {
    await abrir(page);
    await expect(botaoMenu(page)).toBeHidden();
    const nav = page.getByRole("navigation", { name: "Menu principal" });
    await expect(nav.getByRole("link")).toHaveText([
      "Natal 2026",
      "Guirlandas",
      "Taças",
      "Morangos",
      "Como encomendar",
    ]);
    for (const link of await nav.getByRole("link").all())
      await expect(link).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Carrinho (0)", exact: true }),
    ).toBeVisible();

    await nav.getByRole("link", { name: "Como encomendar" }).click();
    await esperarTituloVisivel(page, "Como encomendar");
    await nav.getByRole("link", { name: "Guirlandas" }).click();
    await esperarTituloVisivel(page, "Guirlandas de Natal");
    // O cabeçalho continua no topo depois de rolar.
    await expect
      .poll(async () =>
        Math.round((await page.getByRole("banner").boundingBox())?.y ?? -1),
      )
      .toBe(0);
  });
});
