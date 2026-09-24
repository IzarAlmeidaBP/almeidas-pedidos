import { MapPin } from "lucide-react";
import { IconeInstagram } from "../components/IconeInstagram";
import { LOJA } from "../config/loja";

function usuarioInstagram(url: string): string {
  const usuario = url.replace(/\/+$/, "").split("/").pop();
  return usuario ? `@${usuario}` : "Instagram";
}

/**
 * `espacoBarra` deixa espaço para a barra fixa de total (só existe abaixo de 1280px)
 * não cobrir o rodapé. Sem a barra, respeita a área segura de baixo do iPhone.
 */
export function Rodape({ espacoBarra = false }: { espacoBarra?: boolean }) {
  return (
    <footer
      className={`bg-verde px-4 pt-10 text-center text-creme ${
        espacoBarra
          ? "pb-32 xl:pb-[max(2.5rem,env(safe-area-inset-bottom))]"
          : "pb-[max(2.5rem,env(safe-area-inset-bottom))]"
      }`}
    >
      <p className="font-titulo text-3xl text-rosa">{LOJA.nome.split(" – ")[0]}</p>
      <a
        href={LOJA.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-bold hover:text-rosa"
      >
        <IconeInstagram className="size-5" />
        {usuarioInstagram(LOJA.instagram)}
      </a>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-creme/85">
        <MapPin aria-hidden className="size-4" />
        {LOJA.cidade}
      </p>
      <p className="mt-4 text-sm text-creme/70">Pedidos sujeitos à disponibilidade.</p>
    </footer>
  );
}
