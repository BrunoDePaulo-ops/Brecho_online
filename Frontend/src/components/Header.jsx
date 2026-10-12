import { Link } from "react-router-dom";
import { ShoppingBag, Search, User, Plus, LogOut, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const {autenticado, sair} = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <ShoppingBag className="w-7 h-7 text-purple-600" />
          <span className="text-xl font-bold text-gray-900">Brechó</span>
        </Link>

        <div
          className="flex-1 max-w-xl hidden md:block"
          aria-hidden="true"
        />

        {/* Ações */} 
        <div className="flex items-center gap-3">
          {autenticado ? (
            /* O que aparece se o usuário estiver logado */
            <>
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
            
            {/* Botão de sair chamando a função hook*/}
            <button
              onClick={sair}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
              title="Sair"
            >
              <LogOut className="w-5 h-5 text-gray-700 hover:text-red-600" />
            </button>
          </>
          ):(
            /* O que aparece se o usuário não estiver logado */
            <Link
              to="/login"
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}





