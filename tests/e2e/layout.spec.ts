import { expect, test, type Locator } from "@playwright/test";
import { COMPUTADOR, esperarSemVazamento, largura } from "./utils";

async function caixa(l: Locator) {
  const b = await l.boundingBox();
  if (!b) throw new Error("elemento sem caixa (invisível?)");
  return b;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("botões − / + têm pelo menos 44×44px", async ({ page }) => {
  const botoes = page.getByRole("group", { name: /Quantidade de/ }).getByRole("button");
  await expect(botoes).toHaveCount(4);
  for (const b of await botoes.all()) {
    const { width, height } = await caixa(b);
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  }
});

test("campos com fonte de 16px ou mais e teclado certo", async ({ page }) => {
  await page.locator("label", { hasText: /^Entrega/ }).click();
  const tamanhos = await page
    .locator("#dados input:not([type=radio]), #dados textarea")
    .evaluateAll((els) =>
      els.map((el) => ({
        id: el.id,
        fonte: parseFloat(getComputedStyle(el).fontSize),
      })),
    );
  expect(tamanhos.length).toBeGreaterThanOrEqual(6);
  for (const t of tamanhos) expect(t.fonte, t.id).toBeGreaterThanOrEqual(16);

  await expect(page.locator("#nome")).toHaveAttribute("autocomplete", "name");
  await expect(page.locator("#nome")).toHaveAttribute("inputmode", "text");
  await expect(page.locator("#endereco")).toHaveAttribute(
    "autocomplete",
    "street-address",
  );
  await expect(page.locator("#referencia")).toHaveAttribute("inputmode", "text");
});

test("imagens: srcset/sizes, lazy fora do topo e topo sem lazy", async ({ page }) => {
  const fotos = page.locator("#pedido img, [aria-label='Fotos dos bombons'] img");
  await expect(fotos).toHaveCount(6);
  for (const img of await fotos.all()) {
    await expect(img).toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("srcset", /\d+w/);
    await expect(img).toHaveAttribute("sizes", /.+/);
  }
  const topo = page.locator("#titulo-hero img, section[aria-labelledby=titulo-hero] img");
  for (const img of await topo.all()) {
    await expect(img).not.toHaveAttribute("loading", "lazy");
  }
});

test("celular baixa a versão de 480px da foto do card", async ({ page }) => {
  test.skip(largura(page) >= 768, "só se aplica ao celular");
  const foto = page.locator("#pedido img").first();
  await foto.scrollIntoViewIfNeeded();
  await expect
    .poll(() => foto.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toMatch(/-480\.webp$/);
});

test("vídeo do topo: mudo, em loop, playsinline e só depois do carregamento", async ({
  page,
}) => {
  const video = page.locator("video");
  await expect(video).toHaveCount(1);
  await expect(video).toHaveJSProperty("muted", true);
  await expect(video).toHaveAttribute("loop", "");
  await expect(video).toHaveAttribute("playsinline", "");
  // O pôster é uma imagem comum, visível desde o início.
  await expect(
    page.getByAltText("Morango sendo banhado no chocolate branco"),
  ).toBeVisible();
});

test("layout da faixa de tela", async ({ page }) => {
  const w = largura(page);
  await esperarSemVazamento(page);

  const cards = page.locator("#pedido li");
  const [c1, c2] = [await caixa(cards.nth(0)), await caixa(cards.nth(1))];
  const galeria = page.locator("[aria-label='Fotos dos bombons'] li");
  const colunasGaleria = new Set(
    await galeria.evaluateAll((lis) =>
      lis.map((li) => Math.round(li.getBoundingClientRect().left)),
    ),
  ).size;

  if (w < 768) {
    // Celular: uma coluna, galeria em carrossel.
    expect(c2.y).toBeGreaterThan(c1.y + c1.height - 1);
    const ul = page.locator("[aria-label='Fotos dos bombons']");
    const rola = await ul.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(rola).toBe(true);
  } else {
    // Tablet e computador: sabores lado a lado.
    expect(Math.abs(c1.y - c2.y)).toBeLessThan(2);
    expect(c2.x).toBeGreaterThan(c1.x);
  }

  if (w >= 768 && w < COMPUTADOR) expect(colunasGaleria).toBeGreaterThanOrEqual(2);
  if (w >= 768 && w < COMPUTADOR) expect(colunasGaleria).toBeLessThanOrEqual(3);
  if (w >= COMPUTADOR) expect(colunasGaleria).toBeGreaterThanOrEqual(3);
  if (w >= COMPUTADOR) expect(colunasGaleria).toBeLessThanOrEqual(4);
});

test("total: barra fixa no rodapé (celular/tablet) ou resumo sticky (computador)", async ({
  page,
}) => {
  const w = largura(page);
  const altura = page.viewportSize()?.height ?? 0;
  await page.getByRole("button", { name: "Adicionar 1 Morango branco" }).click();

  const barra = page.getByRole("region", { name: "Resumo do pedido" });
  const resumo = page.getByRole("region", { name: "Seu pedido", exact: true });

  if (w < COMPUTADOR) {
    await expect(barra).toBeVisible();
    await expect(resumo).toBeHidden();
    // Espera a animação de entrada terminar e confere que encosta no fim da tela.
    const fundoDaBarra = async () => {
      const b = await caixa(barra);
      return Math.round(b.y + b.height);
    };
    await expect.poll(fundoDaBarra).toBe(altura);
    // Continua fixa depois de rolar.
    await page.locator("#observacoes").scrollIntoViewIfNeeded();
    await expect.poll(fundoDaBarra).toBe(altura);
  } else {
    await expect(barra).toBeHidden();
    await expect(resumo).toBeVisible();
    // Conteúdo centralizado com largura máxima de ~1100px.
    const grade = await caixa(page.locator("main > div.max-w-site"));
    expect(grade.width).toBeLessThanOrEqual(1100);
    expect(Math.abs(grade.x - (w - grade.x - grade.width))).toBeLessThan(2);
    // Pedido e resumo lado a lado.
    const pedido = await caixa(page.locator("#pedido"));
    const r = await caixa(resumo);
    expect(r.x).toBeGreaterThan(pedido.x + pedido.width - 1);
    // Sticky: o resumo continua na tela ao rolar até o fim do formulário.
    await page.locator("#observacoes").scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 400);
    await expect(resumo).toBeInViewport();
  }
});
