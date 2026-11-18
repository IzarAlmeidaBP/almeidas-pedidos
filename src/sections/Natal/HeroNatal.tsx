import { Logo } from "../../components/Logo";
import { LOJA } from "../../config/loja";
import { TEXTOS_NATAL } from "../../config/natal";

/** Topo da campanha: verde com borda dourada e logo com anel dourado. */
export function HeroNatal() {
  return (
    <section
      id="natal"
      aria-labelledby="titulo-natal"
      className="secao relative overflow-hidden bg-[radial-gradient(circle_at_50%_28%,#1d6b37_0,var(--color-verde)_55%,var(--color-verde-escuro)_100%)] text-center text-creme"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-3xl border border-dourado/60 md:inset-4"
      />
      <div className="conteudo relative">
        <Logo
          nome={LOJA.nome}
          className="mx-auto size-36 rounded-full border-[3px] border-dourado bg-white object-contain p-1 shadow-[0_0_0_8px_rgba(184,151,90,0.18),0_10px_30px_rgba(0,0,0,0.35)] md:size-44 deitado:size-24"
        />
        <h1
          id="titulo-natal"
          className="mt-6 font-titulo text-5xl leading-tight text-creme sm:text-6xl deitado:mt-3 deitado:text-4xl"
        >
          {TEXTOS_NATAL.titulo}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-lg text-rosa-claro/90">
          {TEXTOS_NATAL.subtitulo}
        </p>
        <p className="mt-6 text-xs font-bold tracking-[0.12em] text-dourado-claro uppercase min-[375px]:text-sm sm:tracking-[0.18em]">
          {/* As estrelas ficam presas à primeira e à última palavra. */}
          {TEXTOS_NATAL.selo.replace(/^(\S+) /, "$1 ").replace(/ (\S+)$/, " $1")}
        </p>
      </div>
    </section>
  );
}
