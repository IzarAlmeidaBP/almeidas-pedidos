import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { LOJA } from "../config/loja";
import { usePedido } from "../state/PedidoContext";

interface LinkMenu {
  href: string;
  texto: string;
}

const LINKS_NATAL: LinkMenu[] = [
  { href: "#natal", texto: "Natal 2026" },
  { href: "#guirlandas", texto: "Guirlandas" },
  { href: "#tacas", texto: "Taças" },
  { href: "#pedido", texto: "Morangos" },
  { href: "#como-encomendar", texto: "Como encomendar" },
];
const LINKS_MORANGOS: LinkMenu[] = [{ href: "#pedido", texto: "Morangos" }];

/**
 * Cabeçalho fixo: logo pequena, links (a partir de 768px) ou menu hambúrguer (até
 * 767px) e o carrinho sempre visível, fora do menu.
 */
export function Cabecalho() {
  const { totais, regras } = usePedido();
  const links = regras.ativo ? LINKS_NATAL : LINKS_MORANGOS;
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  /** Devolve o foco ao botão quando o menu fecha (não na primeira renderização). */
  const devolverFoco = useRef(false);

  function fechar() {
    devolverFoco.current = true;
    setAberto(false);
  }

  /**
   * Link do menu: fecha, devolve o foco ao botão e rola até a seção. A rolagem é
   * feita aqui (e não pela âncora) porque a navegação da âncora tiraria o foco do
   * botão. Suave pelo CSS (scroll-behavior) e já abaixo do cabeçalho
   * (scroll-padding-top).
   */
  function irPara(evento: MouseEvent<HTMLAnchorElement>, href: string) {
    const alvo = document.getElementById(href.slice(1));
    if (!alvo) return;
    evento.preventDefault();
    fechar();
    history.replaceState(null, "", href);
    requestAnimationFrame(() => alvo.scrollIntoView({ block: "start" }));
  }

  useEffect(() => {
    if (aberto) {
      painel.current?.querySelector<HTMLElement>("a")?.focus();
      // Trava a rolagem da página enquanto o menu está aberto.
      const anterior = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      const aoTeclar = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        devolverFoco.current = true;
        setAberto(false);
      };
      document.addEventListener("keydown", aoTeclar);
      return () => {
        document.documentElement.style.overflow = anterior;
        document.removeEventListener("keydown", aoTeclar);
      };
    }
    if (devolverFoco.current) {
      devolverFoco.current = false;
      botao.current?.focus();
    }
  }, [aberto]);

  // Ao passar para 768px+ (girar o tablet, por exemplo) o menu some: fecha.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const largo = window.matchMedia("(min-width: 48rem)");
    const aoMudar = () => largo.matches && setAberto(false);
    largo.addEventListener("change", aoMudar);
    return () => largo.removeEventListener("change", aoMudar);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-dourado/40 bg-creme/95 pt-[env(safe-area-inset-top)]">
      <div className="conteudo flex h-16 items-center gap-4">
        <a
          href="#topo"
          className="shrink-0 rounded-full"
          aria-label={`${LOJA.nome}: início`}
        >
          <img
            src="/img/logo.png"
            alt=""
            width={795}
            height={800}
            className="size-12 rounded-full border-2 border-dourado bg-white object-contain"
          />
        </a>

        <nav aria-label="Menu principal" className="hidden flex-1 md:block">
          <ul className="flex items-center justify-center gap-1 lg:gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="flex min-h-11 items-center rounded-full px-3 text-sm font-bold whitespace-nowrap text-verde transition hover:bg-rosa-claro"
                >
                  {l.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <a
            href="#carrinho"
            className="flex min-h-11 items-center gap-2 rounded-full bg-verde px-4 text-sm font-bold whitespace-nowrap text-creme transition hover:bg-verde-escuro"
          >
            <ShoppingBag aria-hidden className="size-5 shrink-0" />
            <span className="sr-only sm:not-sr-only">Carrinho</span>{" "}
            <span className="tabular-nums" aria-live="polite">
              ({totais.itens})
            </span>
          </a>
          <button
            ref={botao}
            type="button"
            aria-label="Abrir menu"
            aria-expanded={aberto}
            aria-controls="menu-celular"
            onClick={() => (aberto ? fechar() : setAberto(true))}
            className="flex size-11 items-center justify-center rounded-full text-verde transition hover:bg-rosa-claro md:hidden"
          >
            {aberto ? (
              <X aria-hidden className="size-6" />
            ) : (
              <Menu aria-hidden className="size-6" />
            )}
          </button>
        </div>
      </div>

      {aberto && (
        <>
          {/* Toque fora do painel fecha o menu. */}
          <div
            aria-hidden
            data-testid="fundo-menu"
            onClick={fechar}
            className="fixed inset-x-0 bottom-0 top-[var(--altura-cabecalho)] bg-verde-escuro/40 md:hidden"
          />
          <div
            id="menu-celular"
            ref={painel}
            className="absolute inset-x-0 top-full animate-surgir border-b border-dourado/40 bg-creme shadow-xl md:hidden"
          >
            <nav aria-label="Menu" className="conteudo py-4">
              <ul className="flex flex-col gap-1">
                {links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={(e) => irPara(e, l.href)}
                      className="flex min-h-12 items-center rounded-2xl px-4 text-lg font-bold text-verde transition hover:bg-rosa-claro"
                    >
                      {l.texto}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
