import { useEffect, useState } from "react";
import { Flame, Star, Package } from "lucide-react";
import CardProduto from "../components/CardProduto";
import {
  listarProdutos,
  listarDestaques,
  listarMaisProcurados,
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

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [d, m, t] = await Promise.all([
        listarDestaques(),
        listarMaisProcurados(),
        listarProdutos(),
      ]);
      setDestaques(d);
      setMaisProcurados(m);
      setTodos(t);
      setCarregando(false);
    }
    carregar();
  }, []);

  if (carregando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
        Carregando produtos...
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
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
      <Secao
        titulo="Todos os produtos"
        icone={Package}
        cor="text-purple-600"
        produtos={todos}
      />
    </main>
  );
}