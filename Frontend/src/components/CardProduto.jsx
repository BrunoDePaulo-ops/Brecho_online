
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CardProduto({ produto }) {
  const [imagemAtual, setImagemAtual] = useState(0);

  const imagens = produto.imagens ?? [];
  const totalImagens = imagens.length;

  function anterior(e) {
    e.preventDefault();
    e.stopPropagation();

    setImagemAtual((atual) =>
      atual === 0 ? totalImagens - 1 : atual - 1
    );
  }

  function proxima(e) {
    e.preventDefault();
    e.stopPropagation();

    setImagemAtual((atual) =>
      atual === totalImagens - 1 ? 0 : atual + 1
    );
  }

  function selecionarImagem(e, indice) {
    e.preventDefault();
    e.stopPropagation();
    setImagemAtual(indice);
  }

  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Carrossel de imagens */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {totalImagens > 0 ? (
          <>
            <Link
              to={`/produto/${produto.id}`}
              className="block w-full h-full"
            >
              <img
                src={imagens[imagemAtual]}
                alt={`${produto.titulo} - imagem ${imagemAtual + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />
            </Link>

            {/* Setas: aparecem somente quando há várias imagens */}
            {totalImagens > 1 && (
              <>
                <button
                  type="button"
                  onClick={anterior}
                  aria-label="Imagem anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-1.5 shadow hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>

                <button
                  type="button"
                  onClick={proxima}
                  aria-label="Próxima imagem"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-1.5 shadow hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>

                {/* Indicadores clicáveis */}
                <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
                  {imagens.map((_, indice) => (
                    <button
                      key={indice}
                      type="button"
                      onClick={(e) => selecionarImagem(e, indice)}
                      aria-label={`Ver imagem ${indice + 1}`}
                      aria-current={
                        imagemAtual === indice ? "true" : undefined
                      }
                      className={`h-2 rounded-full transition-all ${
                        imagemAtual === indice
                          ? "bg-purple-600 w-5"
                          : "bg-white/90 w-2 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>

                {/* Contador de imagens */}
                <span className="absolute top-2 right-2 z-10 rounded-full bg-black/55 text-white text-xs px-2 py-1">
                  {imagemAtual + 1}/{totalImagens}
                </span>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Sem imagens
          </div>
        )}
      </div>

      {/* Informações do produto */}
      <Link
        to={`/produto/${produto.id}`}
        className="block p-4"
      >
        <span className="text-xs text-purple-600 font-medium">
          {produto.categoriaNome || produto.categoria}
        </span>

        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">
          {produto.titulo}
        </h3>

        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
          {produto.descricao}
        </p>

        <p className="text-lg font-bold text-gray-900 mt-2">
          R$ {produto.preco.toFixed(2).replace(".", ",")}
        </p>
      </Link>
    </article>
  );
}
