import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Meta tags de compartilhamento do index.html (prévia do link no WhatsApp). */
const html = readFileSync("index.html", "utf-8");
const meta = (propriedade: string) =>
  new RegExp(`property="${propriedade}"\\s+content="([^"]+)"`).exec(html)?.[1];

describe("compartilhamento (Open Graph)", () => {
  it("og:image é URL absoluta https, no mesmo endereço do og:url", () => {
    const url = new URL(meta("og:url") ?? "");
    const imagem = new URL(meta("og:image") ?? "");
    expect(url.protocol).toBe("https:");
    expect(imagem.protocol).toBe("https:");
    expect(imagem.origin).toBe(url.origin);
  });

  it("a imagem existe em public/ (é ela que o deploy publica)", () => {
    const caminho = new URL(meta("og:image") ?? "").pathname;
    expect(existsSync(`public${caminho}`), caminho).toBe(true);
    expect(meta("og:image:width")).toBe("1200");
    expect(meta("og:image:height")).toBe("630");
  });
});
