interface TituloSecaoProps {
  id?: string;
  titulo: string;
  subtitulo?: string;
  /** Linha pequena em maiúsculas acima do título (ex.: "Monte do seu jeito"). */
  chamada?: string;
  /** Cada seção mantém a cor de título que já tinha. */
  cor?: "vinho" | "verde";
}

/** Título de seção: mesmo estilo, tamanho, alinhamento e espaçamento em todo o site. */
export function TituloSecao({
  id,
  titulo,
  subtitulo,
  chamada,
  cor = "vinho",
}: TituloSecaoProps) {
  return (
    <header className="mb-8 text-center">
      {chamada && (
        <p className="mb-1 text-xs font-bold tracking-[0.25em] text-vinho uppercase">
          {chamada}
        </p>
      )}
      <h2
        id={id}
        className={`font-titulo text-4xl leading-tight sm:text-5xl ${
          cor === "verde" ? "text-verde" : "text-vinho"
        }`}
      >
        {titulo}
      </h2>
      <div aria-hidden className="mx-auto mt-3 h-px w-16 bg-dourado" />
      {subtitulo && <p className="mx-auto mt-4 max-w-xl text-tinta/75">{subtitulo}</p>}
    </header>
  );
}
