import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Escala de espaçamento fixa (src/index.css): 4, 8, 12, 16, 24, 32, 48 e 64px, ou seja,
 * os passos 1, 2, 3, 4, 6, 8, 12 e 16 do Tailwind. Margens, paddings, gaps e space-*
 * só podem usar esses passos (ou 0, px, auto). Valores entre colchetes só para a área
 * segura do iPhone (env(...)), sem medida solta: a combinação usa --spacing(n).
 */
const PASSOS = new Set(["0", "px", "1", "2", "3", "4", "6", "8", "12", "16", "auto"]);
const ESPACAMENTO =
  /^-?(p[xytblrse]?|m[xytblrse]?|gap(?:-[xy])?|space-[xy])-(\[.+\]|[a-z0-9.]+)$/;

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return /\.(tsx|ts)$/.test(nome) ? [caminho] : [];
  });
}

/** Tira variantes ("md:", "min-[360px]:", "has-[:focus]:") e o "!" de importante. */
function semVariantes(classe: string): string {
  let profundidade = 0;
  let inicio = 0;
  for (let i = 0; i < classe.length; i++) {
    const c = classe[i];
    if (c === "[") profundidade++;
    else if (c === "]") profundidade--;
    else if (c === ":" && profundidade === 0) inicio = i + 1;
  }
  return classe.slice(inicio).replace(/^!|!$/g, "");
}

export function valoresForaDaEscala(codigo: string): string[] {
  const fora: string[] = [];
  for (const classe of codigo.split(/[\s"'`{}]+/)) {
    const m = ESPACAMENTO.exec(semVariantes(classe));
    if (!m) continue;
    const valor = m[2] ?? "";
    // Colchetes só com a área segura (env) e sem medida solta (rem, px, em).
    if (valor.startsWith("["))
      if (/env\(/.test(valor) && !/\d(\.\d+)?(rem|px|em)/.test(valor)) continue;
    if (!PASSOS.has(valor)) fora.push(classe);
  }
  return fora;
}

describe("escala de espaçamento", () => {
  it("reconhece valores fora da escala", () => {
    expect(valoresForaDaEscala('className="p-4 md:px-6 gap-1.5 mt-5 -m-2"')).toEqual([
      "gap-1.5",
      "mt-5",
    ]);
    expect(
      valoresForaDaEscala("pt-[max(--spacing(3),env(safe-area-inset-top))]"),
    ).toEqual([]);
    expect(valoresForaDaEscala("pb-[0.75rem]")).toEqual(["pb-[0.75rem]"]);
    expect(
      valoresForaDaEscala("pb-[max(0.75rem,env(safe-area-inset-bottom))]"),
    ).toHaveLength(1);
  });

  it("nenhum componente usa espaçamento fora da escala", () => {
    const fora = arquivos("src").flatMap((arquivo) =>
      valoresForaDaEscala(readFileSync(arquivo, "utf-8")).map((c) => `${arquivo}: ${c}`),
    );
    expect(fora).toEqual([]);
  });
});
