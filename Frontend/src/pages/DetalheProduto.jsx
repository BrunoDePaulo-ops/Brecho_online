import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { buscarProduto, comprarProduto } from "../services/api";

export default function DetalheProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const p = await buscarProduto(id);
      setProduto(p);
      setImagemAtual(0);
      setCarregando(false);
    }
    carregar();
  }, [id]);

  const imagens = produto?.imagens ?? [];

  function imagemAnterior() {
    setImagemAtual((atual) =>
      atual === 0 ? imagens.length - 1 : atual - 1
    );
  }

  function proximaImagem() {
    setImagemAtual((atual) =>
      atual === imagens.length - 1 ? 0 : atual + 1
    );
  }

  async function handleComprar() {
  try {
    const resultado = await comprarProduto(produto.id);

    toast.success(
      resultado.detail || "Compra registrada com sucesso!"
    );

    setTimeout(() => navigate("/"), 1500);
  } catch (error) {
    const mensagem =
      error.response?.data?.detail ||
      "Não foi possível concluir a compra.";

    toast.error(mensagem);
  }
}

  if (carregando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
        Carregando produto...
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Produto não encontrado.</p>
        <Link to="/" className="text-purple-600 hover:underline">
          ← Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Botão voltar */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
      {/* Carrossel de imagens */}
      <div className="min-w-0">
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm">
          {imagens.length > 0 ? (
            <>
              <img
                src={imagens[imagemAtual]}
                alt={`${produto.titulo} - imagem ${imagemAtual + 1}`}
                className="w-full h-full object-contain"
              />

              {imagens.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={imagemAnterior}
                    aria-label="Imagem anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow hover:bg-white transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>

                  <button
                    type="button"
                    onClick={proximaImagem}
                    aria-label="Próxima imagem"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow hover:bg-white transition"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>

                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                    {imagemAtual + 1} / {imagens.length}
                  </span>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Nenhuma imagem disponível
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {imagens.length > 1 && (
          <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
            {imagens.map((imagem, indice) => (
              <button
                key={indice}
                type="button"
                onClick={() => setImagemAtual(indice)}
                aria-label={`Selecionar imagem ${indice + 1}`}
                aria-pressed={imagemAtual === indice}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                  imagemAtual === indice
                    ? "border-purple-600"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={imagem}
                  alt={`Miniatura ${indice + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>


        {/* Informações */}
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium mb-2">
            <Tag className="w-4 h-4" />
            {produto.categoriaNome || produto.categoria}
          </span>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {produto.titulo}
          </h1>

          <p className="text-gray-600 mb-6">{produto.descricao}</p>

          <p className="text-4xl font-bold text-gray-900 mb-2">
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <User className="w-4 h-4" />
            Vendido por <span className="font-medium">{produto.vendedor}</span>
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-auto">
            <button
              onClick={handleComprar}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              Comprar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}