import { IMAGENS } from "../config/imagens";
import { montarSrcSet } from "../lib/srcset";

interface FotoProps {
  /** Caminho da imagem já otimizada em /public/img. */
  src: string;
  alt: string;
  /** Largura em que a foto aparece em cada tela (atributo sizes). */
  sizes: string;
  className?: string;
  /** Fotos do topo carregam na hora; as demais só quando chegam perto da tela. */
  prioridade?: boolean;
}

export function Foto({ src, alt, sizes, className, prioridade = false }: FotoProps) {
  const info = IMAGENS[src];
  return (
    <img
      src={src}
      srcSet={montarSrcSet(src, info)}
      sizes={sizes}
      width={info?.largura}
      height={info?.altura}
      alt={alt}
      className={className}
      loading={prioridade ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
