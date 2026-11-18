import { ShoppingBag } from "lucide-react";
import { usePedido } from "../../state/PedidoContext";

const LINKS = [
  { href: "#guirlandas", texto: "Guirlandas" },
  { href: "#tacas", texto: "Taças" },
  { href: "#pedido", texto: "Morangos" },
];

/** Navegação fixa no topo: Guirlandas · Taças · Morangos · Carrinho. */
export function NavNatal() {
  const { totais } = usePedido();
  return (
    <nav
      aria-label="Categorias"
      className="sticky top-0 z-30 border-b border-dourado/40 bg-creme/95 pt-[env(safe-area-inset-top)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-site items-center justify-center gap-0.5 overflow-x-auto px-1 py-1.5 min-[360px]:px-2 min-[375px]:gap-1">
        {LINKS.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="flex min-h-11 items-center rounded-full px-1.5 text-xs min-[360px]:px-2 min-[360px]:text-[0.8125rem] font-bold text-verde uppercase transition hover:bg-rosa-claro min-[400px]:px-3 min-[400px]:text-sm min-[400px]:tracking-wide"
            >
              {l.texto}
            </a>
          </li>
        ))}
        <li>
          <a
            href="#carrinho"
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-verde px-2 text-xs min-[360px]:px-2.5 min-[360px]:text-[0.8125rem] font-bold text-creme uppercase transition hover:bg-verde-escuro min-[400px]:px-3 min-[400px]:text-sm min-[400px]:tracking-wide"
          >
            <ShoppingBag aria-hidden className="size-4 shrink-0" />
            <span className="sr-only min-[400px]:not-sr-only">Carrinho</span>{" "}
            <span className="tabular-nums">({totais.itens})</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
