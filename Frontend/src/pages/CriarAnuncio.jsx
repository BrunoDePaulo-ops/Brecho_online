import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X, Plus, Save } from "lucide-react";
import {
  criarProduto,
  atualizarProduto,
  buscarProduto,
  listarCategorias,
} from "../services/api";

export default function CriarAnuncio() {
  const navigate = useNavigate();
  const { id } = useParams();          // ← pega o :id da URL (se existir)
  const editando = Boolean(id);        // ← true = edição, false = criação

  const [imagens, setImagens] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(editando);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Carrega as categorias
  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => toast.error("Erro ao carregar categorias."));
  }, []);

  // Se for edição, carrega o produto e preenche o form
  useEffect(() => {
    if (!editando) return;

    buscarProduto(id)
      .then((produto) => {
        if (!produto) {
          toast.error("Produto não encontrado.");
          navigate("/meus-anuncios");
          return;
        }
        reset({
          titulo: produto.titulo,
          descricao: produto.descricao,
          preco: String(produto.preco).replace(".", ","),
          categoria: produto.categoria,
        });
      })
      .catch(() => toast.error("Erro ao carregar produto."))
      .finally(() => setCarregando(false));
  }, [editando, id, reset, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 5,
    onDrop: (arquivosAceitos) => {
      const novasImagens = arquivosAceitos.map((arquivo) => ({
        arquivo,
        preview: URL.createObjectURL(arquivo),
      }));
      setImagens((prev) => [...prev, ...novasImagens].slice(0, 5));
    },
  });

  function removerImagem(index) {
    setImagens((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(dados) {
    // No modo criação, exige pelo menos 1 imagem
    if (!editando && imagens.length === 0) {
      toast.error("Adicione pelo menos uma imagem.");
      return;
    }

    setEnviando(true);
    try {
      const precoNumerico = parseFloat(
        dados.preco.replace(/\./g, "").replace(",", ".")
      );

      const produto = {
        title: dados.titulo,
        description: dados.descricao,
        price: String(precoNumerico),
        category: Number(dados.categoria),
        status: "ACTIVE",
      };

      if (editando) {
        await atualizarProduto(id, produto);
        toast.success("Anúncio atualizado!");
      } else {
        await criarProduto(produto);
        toast.success("Anúncio publicado!");
      }

      reset();
      setImagens([]);
      setTimeout(() => navigate("/meus-anuncios"), 1500);
    } catch (erro) {
      console.error(erro);
      toast.error(editando ? "Erro ao atualizar anúncio." : "Erro ao publicar anúncio.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
        Carregando anúncio...
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/meus-anuncios"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {editando ? "Editar anúncio" : "Publicar anúncio"}
      </h1>
      <p className="text-gray-500 mb-8">
        {editando
          ? "Atualize os dados do produto."
          : "Preencha os dados do produto e adicione até 5 imagens."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            {...register("titulo", { required: "Título é obrigatório" })}
            placeholder="Ex: Vaso artesanal de cerâmica"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.titulo && (
            <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição *
          </label>
          <textarea
            rows={4}
            {...register("descricao", { required: "Descrição é obrigatória" })}
            placeholder="Descreva o produto, estado de conservação, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          {errors.descricao && (
            <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>
          )}
        </div>

        {/* Preço e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço (R$) *
            </label>
            <input
              type="text"
              inputMode="decimal"
              {...register("preco", {
                required: "Preço é obrigatório",
                pattern: {
                  value: /^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/,
                  message: "Use formato com vírgula ou ponto",
                },
              })}
              placeholder="Ex: 89,90"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.preco && (
              <p className="text-red-500 text-sm mt-1">{errors.preco.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              {...register("categoria", { required: "Escolha uma categoria" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Selecione...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="text-red-500 text-sm mt-1">{errors.categoria.message}</p>
            )}
          </div>
        </div>

        {/* Upload de imagens (só no modo criação) */}
        {!editando && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens * (até 5)
            </label>

            {imagens.length < 5 && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  isDragActive
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {isDragActive
                    ? "Solte as imagens aqui..."
                    : "Arraste imagens ou clique para selecionar"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG • Máximo 5MB cada
                </p>
              </div>
            )}

            {imagens.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                {imagens.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removerImagem(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botão */}
        <button
          type="submit"
          disabled={enviando}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editando ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {enviando
            ? editando
              ? "Salvando..."
              : "Publicando..."
            : editando
              ? "Salvar alterações"
              : "Publicar anúncio"}
        </button>
      </form>
    </main>
  );
}