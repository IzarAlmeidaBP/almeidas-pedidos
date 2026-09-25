import { expect, type Page } from "@playwright/test";

export const COMPUTADOR = 1280;

/** Data daqui a 2 dias no formato do input date (AAAA-MM-DD). */
export function dataFutura(): { iso: string; ddmm: string } {
  const d = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const aa = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return { iso: `${aa}-${mm}-${dd}`, ddmm: `${dd}/${mm}` };
}

export function largura(page: Page): number {
  return page.viewportSize()?.width ?? 0;
}

/**
 * Sem rolagem horizontal e nenhum elemento passando da borda da tela.
 * Ignora o que está dentro de um contêiner com rolagem própria (carrossel).
 */
export async function esperarSemVazamento(page: Page) {
  const resultado = await page.evaluate(() => {
    const larguraTela = document.documentElement.clientWidth;
    const dentroDeRolagem = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip")
          return true;
      }
      return false;
    };
    const vazando: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if ((r.right > larguraTela + 1 || r.left < -1) && !dentroDeRolagem(el)) {
        const id = el.id ? `#${el.id}` : "";
        const texto = (el.textContent ?? "").trim().slice(0, 30);
        vazando.push(
          `${el.tagName.toLowerCase()}${id} "${texto}" (${Math.round(r.left)}–${Math.round(r.right)})`,
        );
      }
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      larguraTela,
      vazando: vazando.slice(0, 10),
    };
  });
  expect(resultado.vazando, "elementos passando da borda").toEqual([]);
  expect(resultado.scrollWidth, "rolagem horizontal").toBeLessThanOrEqual(
    resultado.larguraTela,
  );
}

/** Busca o bairro e marca a opção (nome acessível = bairro + taxa). */
export async function escolherBairro(page: Page, busca: string, opcao: string) {
  // A página usa rolagem suave; no teste, uma rolagem ainda em andamento faz o
  // toque cair em outro lugar. Desliga só aqui.
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
  await page.getByRole("searchbox", { name: "Buscar bairro" }).fill(busca);
  const radio = page.getByRole("radio", { name: opcao, exact: true });
  const rotulo = page.locator("label", { has: radio });
  // No celular a barra fixa do total cobre o fim da tela: centraliza antes do toque.
  await rotulo.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await rotulo.click();
  await expect(radio).toBeChecked();
}

/** Preenche o pedido de exemplo (2 brancos, 1 preto, bairro Catolé). */
export async function montarPedidoCompleto(page: Page) {
  await page.getByRole("button", { name: "Adicionar 1 Morango branco" }).click();
  await page.getByRole("button", { name: "Adicionar 1 Morango branco" }).click();
  await page.getByRole("button", { name: "Adicionar 1 Morango preto" }).click();

  await page.getByLabel(/^Nome/).fill("Maria");
  await escolherBairro(page, "catole", "Catolé R$ 8,00");
  await page.getByLabel(/^Endereço completo/).fill("Rua X, 123");
  await page.getByLabel(/^Ponto de referência/).fill("perto da padaria");
  await page.getByLabel(/^Data/).fill(dataFutura().iso);
  await page.getByLabel(/^Horário/).fill("15:00");
  await page.getByLabel(/^Observações/).fill("é presente");
}
