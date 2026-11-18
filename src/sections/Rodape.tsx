import { MapPin } from "lucide-react";
import { IconeInstagram } from "../components/IconeInstagram";
import { LOJA } from "../config/loja";
import { TEXTOS_NATAL } from "../config/natal";

function usuarioInstagram(url: string): string {
  const usuario = url.replace(/\/+$/, "").split("/").pop();
  return usuario ? `@${usuario}` : "Instagram";
}

/**
 * `espacoBarra` deixa espaço para a barra fixa de total (só existe abaixo de 1280px)
 * não cobrir o rodapé. Sem a barra, respeita a área segura de baixo do iPhone.
 */
export function Rodape({
  espacoBarra = false,
  natal = false,
}: {
  espacoBarra?: boolean;
  /** Campanha de Natal no ar: mostra a mensagem final de Natal. */
  natal?: boolean;
}) {
  return (
    <footer
      className={`bg-verde pt-12 text-center text-creme ${
        espacoBarra
          ? "pb-[calc(--spacing(16)*2+env(safe-area-inset-bottom))] xl:pb-[max(--spacing(12),env(safe-area-inset-bottom))]"
          : "pb-[max(--spacing(12),env(safe-area-inset-bottom))]"
      }`}
    >
      <div className="conteudo">
        {natal && (
          <p className="mx-auto mb-8 max-w-md border-b border-dourado/50 pb-8 font-titulo text-2xl leading-snug text-dourado-claro">
            {TEXTOS_NATAL.mensagemFinal}
          </p>
        )}
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
        <p className="mt-1 flex items-center justify-center gap-2 text-creme/85">
          <MapPin aria-hidden className="size-4" />
          {LOJA.cidade}
        </p>
        <p className="mt-4 text-sm text-creme/70">Pedidos sujeitos à disponibilidade.</p>
      </div>
    </footer>
  );
}
