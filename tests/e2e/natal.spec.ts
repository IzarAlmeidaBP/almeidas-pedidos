import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  abrir,
  COMPUTADOR,
  escolherBairro,
  escolherPeriodo,
  esperarSemVazamento,
  largura,
} from "./utils";

/** Horário de Campina Grande (UTC-3) → instante. */
const emCG = (dataHora: string) => new Date(`${dataHora}-03:00`);

/** Rola o elemento para o meio da tela antes do toque (a navegação e a barra fixas cobrem as bordas). */
async function tocar(alvo: Locator) {
  await alvo
    .page()
    .evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
  await alvo.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await alvo.click();
}

const card = (page: Page, nome: string) => page.getByRole("article", { name: nome });
const botaoAdicionar = (c: Locator) =>
  c.getByRole("button", { name: /Adicionar ao pedido|Encomendas encerradas/ });

/** Marca uma opção do card (o input fica escondido atrás do rótulo). */
async function marcar(c: Locator, papel: "radio" | "checkbox", nome: string) {
  const input = c.getByRole(papel, { name: nome, exact: true });
  // O filtro "has" é relativo a cada rótulo, por isso parte da página.
  const rotulo = c
    .locator("label")
    .filter({ has: c.page().getByRole(papel, { name: nome, exact: true }) });
  await tocar(rotulo);
  await expect(input).toBeChecked();
}

async function preencherEntrega(page: Page, data: string, periodo = "Tarde") {
  await page.getByLabel(/^Nome/).fill("Maria");
  await escolherBairro(page, "catole", "Catolé R$ 8,00");
  await page.getByLabel(/^Endereço completo/).fill("Rua X, 123");
  await page.getByLabel(/^Ponto de referência/).fill("perto da padaria");
  await page.getByLabel(/^Data da entrega/).fill(data);
  await escolherPeriodo(page, periodo);
}

const finalizar = (page: Page) =>
  page.getByRole("region", { name: "Seus dados" }).getByRole("button", {
    name: "Finalizar pedido",
  });

test("Natal: Guirlanda com opções → Mini → Taça → carrinho → checkout → WhatsApp", async ({
  page,
}, info) => {
  // Fluxo longo (3 produtos, carrinho, checkout e aba nova): no WebKit do Windows,
  // com a suíte em paralelo, passa de 30 s.
  test.setTimeout(60_000);
  await abrir(page);
  await esperarSemVazamento(page);

  // Guirlanda: botão só ativa com recheio + 2 toppings; adicional soma no preço.
  const guirlanda = card(page, "Guirlanda de Natal");
  await expect(botaoAdicionar(guirlanda)).toBeDisabled();
  await marcar(guirlanda, "radio", "Oreo");
  await marcar(guirlanda, "checkbox", "Morango");
  await expect(botaoAdicionar(guirlanda)).toBeDisabled();
  await marcar(guirlanda, "checkbox", "Docinho de Ninho");
  await expect(guirlanda.getByRole("checkbox", { name: "Oreo" })).toBeDisabled();
  await marcar(guirlanda, "checkbox", "Kinder Bueno +R$ 10,00");
  await expect(guirlanda.getByText("R$ 145,00", { exact: true })).toBeVisible();
  await esperarSemVazamento(page);
  await page.screenshot({ path: info.outputPath("guirlanda.png") });
  await tocar(botaoAdicionar(guirlanda));
  await expect(guirlanda.getByText("Adicionado ao pedido!")).toBeVisible();

  // Mini: 2 unidades com chocolate branco.
  const mini = card(page, "Mini Guirlanda");
  await marcar(mini, "radio", "Chocolate branco");
  await tocar(
    mini.getByRole("button", { name: "Aumentar quantidade de Mini Guirlanda" }),
  );
  await tocar(botaoAdicionar(mini));

  // Taça: sem opções.
  await tocar(botaoAdicionar(card(page, "Taça Encanto de Morango")));

  // Total acompanha: barra fixa (celular/tablet) e link do carrinho na navegação.
  const nav = page.getByRole("navigation", { name: "Categorias" });
  await expect(nav.getByRole("link", { name: /Carrinho \(4\)/ })).toBeVisible();
  if (largura(page) < COMPUTADOR) {
    const barra = page.getByRole("region", { name: "Resumo do pedido" });
    await expect(barra).toContainText("Ver carrinho (4)");
    await expect(barra).toContainText("R$ 340,00");
  }

  // Navegação fixa: continua no topo da tela depois de rolar até as taças.
  await nav.getByRole("link", { name: "Taças" }).click();
  await expect(
    page.getByRole("heading", { name: "Sobremesas na Taça" }),
  ).toBeInViewport();
  await expect.poll(async () => Math.round((await nav.boundingBox())?.y ?? -1)).toBe(0);

  // Carrinho: 3 linhas, com as opções.
  const itens = page.getByRole("list", { name: "Itens do carrinho" });
  await itens.scrollIntoViewIfNeeded();
  await expect(itens.getByRole("listitem")).toHaveCount(3);
  await expect(itens).toContainText("Toppings: Morango, Docinho de Ninho");
  await expect(itens).toContainText("Adicionais: Kinder Bueno (+R$ 10,00)");
  await esperarSemVazamento(page);
  await page.screenshot({ path: info.outputPath("carrinho.png") });

  await preencherEntrega(page, "2026-12-20");
  await page.getByLabel(/^Observações/).fill("é presente");
  await esperarSemVazamento(page);
  await expect(finalizar(page)).toBeEnabled();
  await tocar(finalizar(page));

  await expect(page.getByRole("heading", { name: "Quase lá!" })).toBeVisible();
  await expect(page.getByText("R$ 348,00", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Feliz Natal!/)).toBeVisible();
  await esperarSemVazamento(page);
  await page.screenshot({ path: info.outputPath("pagamento.png"), fullPage: true });

  const whatsapp = page.getByRole("link", { name: "Enviar pedido no WhatsApp" });
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  const url = new URL((await whatsapp.getAttribute("href")) ?? "");
  expect(url.origin + url.pathname).toBe("https://wa.me/558382025788");
  expect(url.searchParams.get("text")).toBe(
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

  // Ao clicar, a aba do WhatsApp abre e o plano B aparece.
  // O wa.me não é acessado de verdade: a aba nova recebe uma resposta local.
  await page
    .context()
    .route(/^https:\/\/wa\.me\//, (rota) =>
      rota.fulfill({ contentType: "text/plain", body: "WhatsApp (teste)" }),
    );
  const [aba] = await Promise.all([page.waitForEvent("popup"), whatsapp.click()]);
  expect(aba.url()).toBe(url.toString());
  await aba.close();
  await expect(page.getByText("O WhatsApp não abriu?")).toBeVisible();
  await expect(page.getByLabel("Texto do pedido")).toHaveValue(
    url.searchParams.get("text") ?? "",
  );
  await esperarSemVazamento(page);
});

test.describe("relógio simulado", () => {
  test("calendário: mínimo = hoje + 2 e data anterior recusada", async ({ page }) => {
    await abrir(page); // 18/11/2026 12:00
    const data = page.getByLabel(/^Data da entrega/);
    await expect(data).toHaveAttribute("min", "2026-11-20");
    await expect(
      page.getByText("Pedidos com 2 dias de antecedência: a partir de 20/11/2026."),
    ).toBeVisible();

    await tocar(page.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await preencherEntrega(page, "2026-11-19");
    await expect(data).toHaveAttribute("aria-invalid", "true");
    await expect(finalizar(page)).toBeDisabled();
    await data.fill("2026-11-20");
    await expect(data).toHaveAttribute("aria-invalid", "false");
    await expect(finalizar(page)).toBeEnabled();
  });

  test("18/12 às 23:59: pode pedir Natal e entregar em 27/12; à 00:00 encerra", async ({
    page,
  }) => {
    await page.clock.install({ time: emCG("2026-12-18T23:59:00") });
    await page.goto("/");

    const taca = card(page, "Taça Uva");
    await expect(botaoAdicionar(taca)).toHaveText(/Adicionar ao pedido/);
    await tocar(botaoAdicionar(taca));
    await expect(page.getByLabel(/^Data da entrega/)).toHaveAttribute(
      "min",
      "2026-12-20",
    );
    await preencherEntrega(page, "2026-12-27");
    await expect(finalizar(page)).toBeEnabled();

    // A página fica aberta e vira 19/12 00:00 em Campina Grande.
    await page.clock.fastForward("01:00");
    await expect(page.getByRole("alert")).toContainText(
      "As encomendas de Natal foram encerradas. 1 item de Natal saiu do seu carrinho.",
    );
    await expect(
      page.getByText("Encomendas de Natal encerradas 🎄 Obrigada pelo carinho!"),
    ).toBeVisible();
    await expect(botaoAdicionar(taca)).toBeDisabled();
    await expect(page.getByText(/Seu carrinho está vazio/)).toBeVisible();
    await esperarSemVazamento(page);
  });

  test("19/12 às 00:00: Natal visível e bloqueado; morangos continuam", async ({
    page,
  }, info) => {
    await abrir(page, emCG("2026-12-19T00:00:00"));
    await expect(
      page.getByText("Encomendas de Natal encerradas 🎄 Obrigada pelo carinho!"),
    ).toBeVisible();
    const falar = page.getByRole("link", { name: "Falar no WhatsApp" });
    await expect(falar).toHaveAttribute("href", "https://wa.me/558382025788");

    await expect(page.getByRole("article")).toHaveCount(9);
    for (const botao of await page
      .getByRole("article")
      .getByRole("button", { name: /Encomendas encerradas/ })
      .all())
      await expect(botao).toBeDisabled();
    await expect(
      page.getByRole("article").getByRole("button", { name: /Adicionar ao pedido/ }),
    ).toHaveCount(0);
    await esperarSemVazamento(page);
    await page.screenshot({ path: info.outputPath("encerrado.png") });

    await tocar(page.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await preencherEntrega(page, "2026-12-21");
    await expect(finalizar(page)).toBeEnabled();
  });

  test("revalida no envio: virou o dia na tela de pagamento", async ({ page }) => {
    await abrir(page, emCG("2026-11-18T23:59:00"));
    await tocar(page.getByRole("button", { name: "Adicionar 1 Morango branco" }));
    await preencherEntrega(page, "2026-11-20");
    await tocar(finalizar(page));
    await expect(page.getByRole("heading", { name: "Quase lá!" })).toBeVisible();

    await page.clock.setFixedTime(emCG("2026-11-19T00:00:00"));
    let abriu = false;
    page.on("popup", () => (abriu = true));
    await page.getByRole("link", { name: "Enviar pedido no WhatsApp" }).click();

    await expect(page.getByRole("alert")).toContainText(
      "A data de entrega escolhida não está mais disponível.",
    );
    await expect(page.getByRole("heading", { name: "Quase lá!" })).toHaveCount(0);
    await expect(page.getByLabel(/^Data da entrega/)).toHaveAttribute(
      "min",
      "2026-11-21",
    );
    expect(abriu).toBe(false);
  });
});

/**
 * Conferência item a item: o que aparece na página contra o texto da seção 3 de
 * docs/planejamento-atualizacao-natal.md (lido do próprio documento).
 */
test("preços, descrições e opções da página batem com a seção 3 do planejamento", async ({
  page,
}) => {
  test.skip(largura(page) !== 1440, "conferência de conteúdo: basta uma largura");
  const doc = readFileSync("docs/planejamento-atualizacao-natal.md", "utf-8");
  const secao3 = doc.slice(doc.indexOf("## 3. Catálogo"), doc.indexOf("## 4."));

  type Esperado = { nome: string; preco: string; descricao: string; opcoes: string[] };
  const esperados: Esperado[] = [];

  // 3.1 e 3.2: "**Nome: R$ X**" seguido da descrição em citação ("> ...").
  for (const m of secao3.matchAll(/\*\*([^*:]+): (R\$ [\d.,]+)\*\*\n\n((?:> .*\n)+)/g)) {
    esperados.push({
      nome: m[1]!,
      preco: m[2]!,
      descricao: m[3]!.replace(/^> /gm, "").replace(/\n/g, " ").trim(),
      opcoes: [],
    });
  }
  // Opções da Guirlanda (tabela da 3.1) e da Mini (lista da 3.2).
  const opcoesGuirlanda = [...secao3.matchAll(/^\| \d\. [^|]+\|[^|]+\| ([^|]+) \|$/gm)]
    .flatMap((m) => m[1]!.split(" · "))
    .map((o) => o.trim());
  const opcoesMini = (
    secao3.match(/Recheio de cima \(obrigatório, 1 opção\): (.+)/)?.[1] ?? ""
  )
    .split(" · ")
    .map((o) => o.trim());
  esperados[0]!.opcoes = opcoesGuirlanda;
  esperados[1]!.opcoes = opcoesMini;
  // 3.3: linhas "| 01 | Taça ... | R$ ... | descrição |".
  for (const m of secao3.matchAll(
    /^\| \d{2}\s+\| ([^|]+?)\s+\| (R\$ [\d.,]+)\s+\| ([^|]+?)\s+\|$/gm,
  ))
    esperados.push({ nome: m[1]!, preco: m[2]!, descricao: m[3]!, opcoes: [] });

  expect(esperados.map((e) => e.nome)).toEqual([
    "Guirlanda de Natal",
    "Mini Guirlanda",
    "Taça Brownie",
    "Taça Uva",
    "Taça Oreo",
    "Taça Dois Amores",
    "Taça Surpresa de Nutella",
    "Taça Ninho com Morango",
    "Taça Encanto de Morango",
  ]);
  expect(opcoesGuirlanda).toHaveLength(10);
  expect(opcoesMini).toEqual(["Oreo", "Chocolate branco", "Chocolate preto"]);

  await abrir(page);
  await expect(page.getByRole("article")).toHaveCount(esperados.length);
  for (const e of esperados) {
    const c = card(page, e.nome);
    await expect(c.getByRole("heading", { level: 3 }), e.nome).toHaveText(e.nome);
    await expect(c.getByText(e.preco, { exact: true }), e.nome).toBeVisible();
    await expect(c.getByText(e.descricao, { exact: true }), e.nome).toBeVisible();
    const rotulos = (await c.locator("label").allInnerTexts()).map((t) =>
      t.replace(/\s+/g, " ").trim(),
    );
    // Os adicionais aparecem como na tabela: "Kinder Bueno +R$ 10,00".
    expect(rotulos, e.nome).toEqual(e.opcoes);
  }
  await expect(
    card(page, "Mini Guirlanda").getByText(
      "🎁 Acompanha uma caixinha linda para presentear",
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Nossas sobremesas na taça são preparadas com muito capricho, combinando cremes, chocolates e ingredientes selecionados para deixar seu Natal ainda mais especial.",
    ),
  ).toBeVisible();
  await expect(page.getByText(/ilustrativa/i)).toHaveCount(0);
});

test("navegação fixa cabe na tela, sem rolagem lateral", async ({ page }) => {
  await abrir(page);
  const lista = page.getByRole("navigation", { name: "Categorias" }).getByRole("list");
  const medidas = await lista.evaluate((ul) => ({
    rola: ul.scrollWidth > ul.clientWidth,
    direita: Math.max(...[...ul.children].map((li) => li.getBoundingClientRect().right)),
    tela: document.documentElement.clientWidth,
  }));
  expect(medidas.rola).toBe(false);
  expect(medidas.direita).toBeLessThanOrEqual(medidas.tela);
  for (const link of await lista.getByRole("link").all()) {
    const caixa = await link.boundingBox();
    expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});
