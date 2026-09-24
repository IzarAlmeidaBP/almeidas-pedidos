import { useEffect, useRef, useState } from "react";
import { deveCarregarVideo } from "../lib/video";

interface VideoHeroProps {
  video: string;
  poster: string;
  descricao: string;
  className?: string;
}

interface ConexaoNavegador {
  saveData?: boolean;
  effectiveType?: string;
}

function condicoesAtuais() {
  const conexao = (navigator as Navigator & { connection?: ConexaoNavegador }).connection;
  return {
    reduzirMovimento:
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    economiaDeDados: conexao?.saveData,
    tipoConexao: conexao?.effectiveType,
  };
}

/**
 * Mostra o pôster na hora e só carrega o vídeo depois que a página terminou de
 * carregar, para não disputar banda com o resto no 4G fraco. Em conexão lenta,
 * economia de dados ou "reduzir movimento", fica só a foto.
 */
export function VideoHero({ video, poster, descricao, className = "" }: VideoHeroProps) {
  const [carregar, setCarregar] = useState(false);
  const [tocando, setTocando] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!deveCarregarVideo(condicoesAtuais())) return;
    const aoCarregar = () => setCarregar(true);
    if (document.readyState === "complete") {
      const t = window.setTimeout(aoCarregar, 0);
      return () => window.clearTimeout(t);
    }
    window.addEventListener("load", aoCarregar, { once: true });
    return () => window.removeEventListener("load", aoCarregar);
  }, []);

  // Pausa quando sai da tela (economiza bateria e dados).
  useEffect(() => {
    const el = ref.current;
    if (!carregar || !el || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada?.isIntersecting) el.play().catch(() => undefined);
      else el.pause();
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, [carregar]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={poster}
        alt={descricao}
        width={720}
        height={1280}
        fetchPriority="high"
        decoding="async"
        className="size-full object-cover"
      />
      {carregar && (
        <video
          ref={ref}
          src={video}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onPlaying={() => setTocando(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
            tocando ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
