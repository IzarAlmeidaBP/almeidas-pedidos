import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { IMAGENS } from "../../src/config/imagens";
import { GALERIA } from "../../src/config/galeria";
import { LOJA } from "../../src/config/loja";
import { montarSrcSet } from "../../src/lib/srcset";

describe("montarSrcSet", () => {
  it("usa a largura real da foto", () => {
    expect(montarSrcSet("/img/a.webp", { largura: 900, altura: 1600 })).toBe(
      "/img/a.webp 900w",
    );
  });

  it("ordena as versões da menor para a maior", () => {
    expect(
      montarSrcSet("/img/a.webp", {
        largura: 900,
        altura: 1600,
        menores: [
          { src: "/img/a-600.webp", largura: 600 },
          { src: "/img/a-300.webp", largura: 300 },
        ],
      }),
    ).toBe("/img/a-300.webp 300w, /img/a-600.webp 600w, /img/a.webp 900w");
  });

  it("sem informação da foto não gera srcset", () => {
    expect(montarSrcSet("/img/x.webp", undefined)).toBeUndefined();
  });

  it("todo arquivo listado no srcset existe em public/", () => {
    for (const [src, info] of Object.entries(IMAGENS)) {
      for (const v of [{ src }, ...(info.menores ?? [])]) {
        expect(existsSync(`public${v.src}`), v.src).toBe(true);
      }
    }
  });

  it("toda foto de sabor e da galeria tem tamanho registrado", () => {
    const fotos = [...LOJA.sabores.map((s) => s.foto), ...GALERIA.map((g) => g.foto)];
    for (const foto of fotos) expect(IMAGENS, foto).toHaveProperty([foto]);
  });
});
