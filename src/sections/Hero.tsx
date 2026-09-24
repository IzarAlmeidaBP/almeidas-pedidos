import { ChevronDown } from "lucide-react";
import { Logo } from "../components/Logo";
import { VideoHero } from "../components/VideoHero";
import { LOJA } from "../config/loja";

export function Hero() {
  return (
    <section
      aria-labelledby="titulo-hero"
      className="relative overflow-hidden bg-gradient-to-b from-rosa-claro to-creme"
    >
      <div className="mx-auto grid max-w-site items-center gap-8 px-4 pt-8 pb-12 md:grid-cols-2 md:gap-12 md:pt-16 md:pb-20 deitado:grid-cols-[1fr_auto] deitado:gap-6 deitado:pt-6 deitado:pb-8">
        <div className="text-center md:text-left deitado:text-left">
          <h1 id="titulo-hero">
            <Logo
              nome={LOJA.nome}
              className="mx-auto h-auto w-40 drop-shadow-sm min-[375px]:w-44 sm:w-52 md:mx-0 md:w-60 deitado:mx-0 deitado:w-28"
            />
          </h1>
          <p className="mt-6 text-2xl font-extrabold leading-snug text-verde sm:text-3xl deitado:mt-3 deitado:text-xl">
            Bombons de morango GIGANTES{" "}
            <span role="img" aria-label="morango">
              🍓
            </span>
          </p>
          <p className="mx-auto mt-3 max-w-sm text-tinta/80 md:mx-0 deitado:mx-0">
            Um morango inteiro envolto em uma camada grossa de chocolate cravejado. Feito
            à mão em {LOJA.cidade}.
          </p>
          <a
            href="#pedido"
            className="mt-7 inline-flex min-h-14 items-center gap-2 rounded-full bg-vinho px-8 text-lg font-extrabold text-creme shadow-md transition hover:bg-vinho-escuro active:scale-95 deitado:mt-4"
          >
            Fazer meu pedido
            <ChevronDown aria-hidden className="size-5" />
          </a>
        </div>

        <VideoHero
          video="/img/morango-banhando.mp4"
          poster="/img/morango-banhando-poster.jpg"
          descricao="Morango sendo banhado no chocolate branco"
          className="mx-auto aspect-[9/16] w-full max-w-56 overflow-hidden rounded-[2rem] border-4 border-white bg-creme-escuro shadow-xl min-[375px]:max-w-60 sm:max-w-xs md:max-w-sm deitado:w-36 deitado:max-w-none"
        />
      </div>
    </section>
  );
}
