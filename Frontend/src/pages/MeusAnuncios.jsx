import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Package, ArrowLeft } from "lucide-react";
import { listarMeusProdutos, excluirProduto } from "../services/api";

export default function MeusAnuncios() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    setCarregando(true);
    const p = await listarMeusProdutos();
    setProdutos(p);
    setCarregando(false);
  }

  async function handleExcluir(id) {
    try {
      await excluirProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Anúncio excluído! (mock)");
      setConfirmandoExclusao(null);
    } catch (erro) {
      toast.error("Erro ao excluir anúncio.");
    }
  }

  function handleEditar(id) {
    // No futuro: navigate(`/anunciar/${id}`) — tela de edição
    navigate(`/anunciar/${id}`);
  }

  if (carregando) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Carregando seus anúncios...
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Voltar */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus anúncios</h1>
          <p className="text-gray-500 mt-1">
            {produtos.length}{" "}
            {produtos.length === 1 ? "anúncio publicado" : "anúncios publicados"}
          </p>
        </div>
        <Link
          to="/anunciar"
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo anúncio
        </Link>
      </div>

      {/* Estado vazio */}
      {produtos.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Você ainda não tem anúncios
          </h3>
          <p className="text-gray-500 mb-6">
            Comece publicando seu primeiro produto.
          </p>
          <Link
            to="/anunciar"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Criar meu primeiro anúncio
          </Link>
        </div>
      )}

      {/* Lista */}
      {produtos.length > 0 && (
        <div className="space-y-3">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition"
            >
              {/* Imagem */}
              <img
                src={produto.imagens[0]}
                alt={produto.titulo}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-gray-100"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-purple-600 font-medium">
                  {produto.categoria}
                </span>
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {produto.titulo}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {produto.descricao}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  R$ {produto.preco.toFixed(2).replace(".", ",")}
                </p>
              </div>

              {/* Ações */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEditar(produto.id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  title="Editar"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setConfirmandoExclusao(produto.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmação */}
      {confirmandoExclusao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Excluir anúncio?
            </h3>
            <p className="text-gray-600 mb-6">
              Essa ação não pode ser desfeita. O anúncio será removido
              permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmandoExclusao(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExcluir(confirmandoExclusao)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}