interface LogoProps {
  /** Texto alternativo; o logo já traz o nome da loja escrito. */
  nome: string;
  className?: string;
}

export function Logo({ nome, className }: LogoProps) {
  return (
    <img
      src="/img/logo.png"
      alt={nome}
      width={795}
      height={800}
      className={className}
      decoding="async"
    />
  );
}
