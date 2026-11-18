import { TituloSecao } from "../../components/TituloSecao";
import { TEXTOS_NATAL } from "../../config/natal";

const PASSOS = ["Escolha seus doces", "Preencha a entrega", "Envie pelo WhatsApp"];

/** Passos "1 Escolha · 2 Preencha · 3 Envie" e os textos de "Como encomendar". */
export function ComoEncomendar() {
  return (
    <section
      id="como-encomendar"
      aria-labelledby="titulo-como-encomendar"
      className="secao conteudo"
    >
      <TituloSecao id="titulo-como-encomendar" titulo="Como encomendar" cor="verde" />
      <ol className="mx-auto grid max-w-lg grid-cols-3 gap-2 text-center text-sm text-tinta/85">
        {PASSOS.map((passo, i) => (
          <li key={passo} className="flex flex-col items-center gap-2">
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-full border border-dourado font-titulo text-xl text-vinho"
            >
              {i + 1}
            </span>
            {passo}
          </li>
        ))}
      </ol>
      {/* Mesma altura em cada linha (a grade estica os itens). */}
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {TEXTOS_NATAL.comoEncomendar.map((item) => (
          <li
            key={item.titulo}
            className="rounded-2xl border-l-4 border-dourado bg-white px-4 py-3 shadow-sm"
          >
            <p className="font-extrabold text-verde">{item.titulo}</p>
            <p className="mt-1 text-tinta/80">{item.texto}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
