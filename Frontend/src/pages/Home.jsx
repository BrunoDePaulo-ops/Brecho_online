import { useEffect, useState, useMemo } from "react";
import { Flame, Star, Package, SearchX } from "lucide-react";
import CardProduto from "../components/CardProduto";
import Filtros from "../components/Filtros";
import {
  buscarHome,
  listarCategorias,
} from "../services/api";

function Secao({ titulo, icone: Icone, cor, produtos }) {
  if (produtos.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-5">
        <Icone className={`w-6 h-6 ${cor}`} />
        <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((p) => (
          <CardProduto key={p.id} produto={p} />
        ))}
      </div>
    </section>
  );
}

  

export default function Home() {
  const [destaques, setDestaques] = useState([]);
  const [maisProcurados, setMaisProcurados] = useState([]);
  const [todos, setTodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [categorias, setCategorias] = useState([]);

  // Filtros
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");

  useEffect(() => {
  async function carregar() {
    setCarregando(true);
    const { destaques, maisProcurados, todos } = await buscarHome();
    setDestaques(destaques);
    setMaisProcurados(maisProcurados);
    setTodos(todos);
    setCarregando(false);
  }
  carregar();
}, []);

  useEffect(() => {
  async function carregarCategorias() {
    try {
      const resultado = await listarCategorias();
      setCategorias(resultado);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }

  carregarCategorias();
  }, []);

    // Aplica os filtros na lista de todos
  const produtosFiltrados = useMemo(() => {
    return todos.filter((p) => {
      // Busca por texto (título ou descrição)
      if (busca) {
        const termo = busca.toLowerCase();
        const matchTitulo = p.titulo.toLowerCase().includes(termo);
        const matchDescricao = p.descricao.toLowerCase().includes(termo);
        if (!matchTitulo && !matchDescricao) return false;
      }

      // Categoria
      if (categoria !== "Todas" && String(p.categoria) !== String(categoria)) {
        return false;
      }

      // Preço mínimo
      if (precoMin) {
        const min = parseFloat(precoMin.replace(",", "."));
        if (!isNaN(min) && p.preco < min) return false;
      }

      // Preço máximo
      if (precoMax) {
        const max = parseFloat(precoMax.replace(",", "."));
        if (!isNaN(max) && p.preco > max) return false;
      }

      return true;
    });
  }, [todos, busca, categoria, precoMin, precoMax]);

  function limparFiltros() {
    setBusca("");
    setCategoria("Todas");
    setPrecoMin("");
    setPrecoMax("");
  }

  if (carregando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
        Carregando produtos...
      </div>
    );
  }

  const temFiltroAtivo =
    busca || categoria !== "Todas" || precoMin || precoMax;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Filtros */}
      <Filtros
        busca={busca}
        setBusca={setBusca}
        categoria={categoria}
        setCategoria={setCategoria}
        precoMin={precoMin}
        setPrecoMin={setPrecoMin}
        precoMax={precoMax}
        setPrecoMax={setPrecoMax}
        onLimpar={limparFiltros}
        categorias={categorias}
      />

      {/* Se tiver filtro ativo, esconde as seções de destaque/procurados */}
      {!temFiltroAtivo && (
        <>
          <Secao
            titulo="Destaques da semana"
            icone={Star}
            cor="text-yellow-500"
            produtos={destaques}
          />
          <Secao
            titulo="Mais procurados"
            icone={Flame}
            cor="text-red-500"
            produtos={maisProcurados}
          />
        </>
      )}

      {/* Lista de produtos (filtrada ou não) */}
      {produtosFiltrados.length > 0 ? (
        <Secao
          titulo={temFiltroAtivo ? "Resultados" : "Todos os produtos"}
          icone={Package}
          cor="text-purple-600"
          produtos={produtosFiltrados}
        />
      ) : (
        <div className="text-center py-16">
          <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            Tente ajustar os filtros ou limpar a busca.
          </p>
          <button
            onClick={limparFiltros}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </main>
  );
}