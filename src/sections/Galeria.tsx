import { Foto } from "../components/Foto";
import { TituloSecao } from "../components/TituloSecao";
import { GALERIA } from "../config/galeria";

export function Galeria() {
  return (
    <section aria-labelledby="titulo-galeria" className="py-12">
      <div className="mx-auto max-w-site px-4">
        <TituloSecao
          id="titulo-galeria"
          titulo="Feitos à mão"
          subtitulo="Morango inteiro por dentro, chocolate crocante por fora."
        />
      </div>
      {/* Celular: carrossel com deslize. Tablet: 2 colunas. Computador: 4 colunas. */}
      <ul
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 md:mx-auto md:grid md:max-w-site md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 xl:grid-cols-4"
        aria-label="Fotos dos bombons"
      >
        {GALERIA.map((item) => (
          <li
            key={item.foto}
            className="w-[72%] shrink-0 snap-center sm:w-[45%] md:w-auto deitado:w-[34%]"
          >
            <Foto
              src={item.foto}
              alt={item.alt}
              sizes="(min-width: 1280px) 260px, (min-width: 768px) 45vw, (orientation: landscape) and (max-height: 500px) 34vw, 72vw"
              className="aspect-[4/5] h-auto w-full rounded-3xl object-cover shadow-md"
            />
          </li>
        ))}
      </ul>
      <p className="mt-1 text-center text-sm text-tinta/60 md:hidden" aria-hidden>
        Arraste para o lado para ver mais fotos
      </p>
    </section>
  );
}
