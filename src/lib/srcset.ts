import type { InfoImagem } from "../types/imagem";

/** Monta o atributo srcset, da menor para a maior versão da foto. */
export function montarSrcSet(
  src: string,
  info: InfoImagem | undefined,
): string | undefined {
  if (!info) return undefined;
  return [...(info.menores ?? []), { src, largura: info.largura }]
    .sort((a, b) => a.largura - b.largura)
    .map((v) => `${v.src} ${v.largura}w`)
    .join(", ");
}
