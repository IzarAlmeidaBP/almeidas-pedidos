interface TituloSecaoProps {
  id?: string;
  titulo: string;
  subtitulo?: string;
}

export function TituloSecao({ id, titulo, subtitulo }: TituloSecaoProps) {
  return (
    <header className="mb-6 text-center">
      <h2 id={id} className="font-titulo text-4xl leading-tight text-vinho sm:text-5xl">
        {titulo}
      </h2>
      {subtitulo && <p className="mx-auto mt-2 max-w-md text-tinta/75">{subtitulo}</p>}
    </header>
  );
}
