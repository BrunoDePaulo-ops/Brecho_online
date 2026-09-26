import { Link } from "react-router-dom";
import { ShoppingBag, Search, User, Plus } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <ShoppingBag className="w-7 h-7 text-purple-600" />
          <span className="text-xl font-bold text-gray-900">Brechó</span>
        </Link>

        {/* Busca */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <Link
            to="/anunciar"
            className="hidden sm:flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Anunciar
          </Link>
          <Link
            to="/meus-anuncios"
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Meus anúncios"
          >
            <User className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
      </div>
    </header>
  );
}