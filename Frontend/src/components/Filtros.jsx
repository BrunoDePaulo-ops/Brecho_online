
import { Search, X } from "lucide-react";

export default function Filtros({
  busca,
  setBusca,
  categoria,
  setCategoria,
  precoMin,
  setPrecoMin,
  precoMax,
  setPrecoMax,
  onLimpar,
  categorias = [],
}) {
  const temFiltroAtivo =
    busca || categoria !== "Todas" || precoMin || precoMax;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Busca */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Categoria */}
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="Todas">Todas</option>

          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>

        {/* Faixa de preço */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Min"
            value={precoMin}
            onChange={(e) => setPrecoMin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <span className="text-gray-400 text-sm">até</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Max"
            value={precoMax}
            onChange={(e) => setPrecoMax(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>

      {/* Botão limpar */}
      {temFiltroAtivo && (
        <button
          onClick={onLimpar}
          className="mt-3 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
        >
          <X className="w-4 h-4" />
          Limpar filtros
        </button>
      )}
    </div>
  );
}