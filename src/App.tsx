import { AvisoPedido } from "./components/AvisoPedido";
import { BarraTotal } from "./components/BarraTotal";
import { Cabecalho } from "./components/Cabecalho";
import { ResumoPedido } from "./components/ResumoPedido";
import { Carrinho } from "./sections/Carrinho";
import { Dados } from "./sections/Dados";
import { Galeria } from "./sections/Galeria";
import { Hero } from "./sections/Hero";
import { CatalogoNatal } from "./sections/Natal/CatalogoNatal";
import { HeroNatal } from "./sections/Natal/HeroNatal";
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
      <div id="topo" />
      <Cabecalho />
      <main>
        {/* Natal em destaque no topo (P5); morangos logo abaixo. */}
        {natal && <HeroNatal />}
        {natal && <CatalogoNatal />}
        <Hero principal={!natal} />
        <Galeria />
        {/* Computador (1280px+): pedido à esquerda e resumo fixo à direita. */}
        <div className="conteudo xl:grid xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-12">
          <div>
            <Pedido />
            <Carrinho />
            <Dados />
          </div>
          <aside className="hidden xl:block">
            <div className="secao sticky top-16">
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
