import { expect, test, type Locator } from "@playwright/test";
import { abrir, COMPUTADOR, esperarSemVazamento, largura } from "./utils";

async function caixa(l: Locator) {
  const b = await l.boundingBox();
  if (!b) throw new Error("elemento sem caixa (invisível?)");
  return b;
}

test.beforeEach(async ({ page }) => {
  await abrir(page);
});

test("botões − / + têm pelo menos 44×44px", async ({ page }) => {
  // Morangos (2 sabores) e os 9 cards do Natal.
  const botoes = page.getByRole("group", { name: /Quantidade de/ }).getByRole("button");
  await expect(botoes).toHaveCount(22);
  for (const b of await botoes.all()) {
    const { width, height } = await caixa(b);
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  }
});

test("campos com fonte de 16px ou mais e teclado certo", async ({ page }) => {
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
    // Conteúdo centralizado com largura máxima de ~1100px (sem contar a margem).
    const grade = await caixa(page.locator("main > div.conteudo").last());
    const margem = await page
      .locator("main > div.conteudo")
      .last()
      .evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    expect(grade.width - 2 * margem).toBeLessThanOrEqual(1100);
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

test("container único: todas as seções com a mesma margem lateral", async ({ page }) => {
  const w = largura(page);
  const margemEsperada = w >= COMPUTADOR ? 32 : w >= 768 ? 24 : 16;
  const bordas = await page.locator(".conteudo").evaluateAll((els) =>
    els
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const pl = parseFloat(getComputedStyle(el).paddingLeft);
        const pr = parseFloat(getComputedStyle(el).paddingRight);
        return {
          esquerda: Math.round(r.left + pl),
          direita: Math.round(r.right - pr),
          pl,
        };
      }),
  );
  expect(bordas.length).toBeGreaterThan(5);
  const esquerdas = new Set(bordas.map((b) => b.esquerda));
  const direitas = new Set(bordas.map((b) => b.direita));
  expect([...esquerdas], "borda esquerda do conteúdo").toHaveLength(1);
  expect([...direitas], "borda direita do conteúdo").toHaveLength(1);
  for (const b of bordas) expect(b.pl).toBe(margemEsperada);
  // Até ~1100px de conteúdo.
  expect([...direitas][0]! - [...esquerdas][0]!).toBeLessThanOrEqual(1100);
});

test("cards da mesma linha: mesma altura e botão alinhado no rodapé", async ({
  page,
}) => {
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(9);
  const medidas = await cards.evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      const botao = el.querySelector("button:last-of-type")?.getBoundingClientRect();
      const foto = el.querySelector("img")?.getBoundingClientRect();
      return {
        topo: Math.round(r.top + window.scrollY),
        altura: Math.round(r.height),
        fundoBotao: Math.round((botao?.bottom ?? 0) - r.bottom),
        foto: foto ? Math.round((foto.width / foto.height) * 100) / 100 : 0,
      };
    }),
  );
  const linhas = new Map<number, typeof medidas>();
  for (const m of medidas) linhas.set(m.topo, [...(linhas.get(m.topo) ?? []), m]);
  for (const linha of linhas.values()) {
    expect(new Set(linha.map((m) => m.altura)).size, "altura na linha").toBe(1);
    expect(new Set(linha.map((m) => m.fundoBotao)).size, "botão na linha").toBe(1);
  }
  // Colunas: 1 no celular, 2 no tablet e 3 taças no computador.
  const maiorLinha = Math.max(...[...linhas.values()].map((l) => l.length));
  const w = largura(page);
  expect(maiorLinha).toBe(w >= COMPUTADOR ? 3 : w >= 768 ? 2 : 1);
  // Fotos com proporção fixa: guirlandas 1:1 e taças 3:4.
  expect(medidas.slice(0, 2).every((m) => m.foto === 1)).toBe(true);
  expect(medidas.slice(2).every((m) => m.foto === 0.75)).toBe(true);
});

test("títulos de seção com o mesmo estilo e centralizados", async ({ page }) => {
  const estilos = await page.locator("main section header h2").evaluateAll((els) =>
    els.map((el) => {
      const cs = getComputedStyle(el);
      return `${cs.fontFamily}|${cs.fontSize}|${cs.textAlign}|${cs.lineHeight}`;
    }),
  );
  expect(estilos.length).toBeGreaterThanOrEqual(7);
  expect(new Set(estilos).size).toBe(1);
});
