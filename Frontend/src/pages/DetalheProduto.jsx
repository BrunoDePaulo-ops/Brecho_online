import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, User, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { buscarProduto } from "../services/api";

export default function DetalheProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const p = await buscarProduto(id);
      setProduto(p);
      setCarregando(false);
    }
    carregar();
  }, [id]);

  function handleComprar() {
    // No futuro: isso vai gerar um log no DynamoDB (ação UPDATE)
    toast.success("Compra realizada! (mock)");
    setTimeout(() => navigate("/"), 1500);
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
        {/* Imagem */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <img
            src={produto.imagens[0]}
            alt={produto.titulo}
            className="w-full h-full object-cover aspect-square"
          />
        </div>

        {/* Informações */}
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium mb-2">
            <Tag className="w-4 h-4" />
            {produto.categoria}
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