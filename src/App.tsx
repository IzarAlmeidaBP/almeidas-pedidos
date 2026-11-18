import { AvisoPedido } from "./components/AvisoPedido";
import { BarraTotal } from "./components/BarraTotal";
import { ResumoPedido } from "./components/ResumoPedido";
import { Carrinho } from "./sections/Carrinho";
import { Dados } from "./sections/Dados";
import { Galeria } from "./sections/Galeria";
import { Hero } from "./sections/Hero";
import { CatalogoNatal } from "./sections/Natal/CatalogoNatal";
import { HeroNatal } from "./sections/Natal/HeroNatal";
import { NavNatal } from "./sections/Natal/NavNatal";
import { Pagamento } from "./sections/Pagamento";
import { Pedido } from "./sections/Pedido";
import { Rodape } from "./sections/Rodape";
import { usePedido } from "./state/PedidoContext";

export function App() {
  const { estado, totais, regras } = usePedido();
  const natal = regras.ativo;

  if (estado.etapa === "pagamento") {
    return (
      <>
        <main>
          <Pagamento />
        </main>
        <Rodape />
        <AvisoPedido />
      </>
    );
  }

  return (
    <>
      <main>
        {/* Natal em destaque no topo; a navegação fica fixa durante a página toda. */}
        {natal && <HeroNatal />}
        {natal && <NavNatal />}
        {natal && <CatalogoNatal />}
        <Hero principal={!natal} />
        <Galeria />
        {/* Computador (1280px+): pedido à esquerda e resumo fixo à direita. */}
        <div className="mx-auto max-w-site xl:grid xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-10 xl:px-4">
          <div>
            <Pedido />
            <Carrinho />
            <Dados />
          </div>
          <aside className="hidden xl:block">
            <div className={`sticky py-12 ${natal ? "top-16" : "top-6"}`}>
              <ResumoPedido />
            </div>
          </aside>
        </div>
      </main>
      <Rodape espacoBarra={totais.itens > 0} natal={natal} />
      <BarraTotal />
      <AvisoPedido />
    </>
  );
}
