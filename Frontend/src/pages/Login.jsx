import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ShoppingBag, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { entrar, autenticado } = useAuth();
  const location = useLocation();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Página que o usuário tentou abrir antes de ser mandado para o login.
  const destino = location.state?.de ?? "/";

  // Quem já está logado (ou acabou de logar) é redirecionado.
  if (autenticado) {
    return <Navigate to={destino} replace />;
  }

  async function onSubmit({ email, senha }) {
    setEnviando(true);
    try {
      await entrar(email, senha);
      toast.success("Login realizado!");
    } catch (erro) {
      toast.error(erro.message || "Erro ao entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShoppingBag className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">Brechó</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Entrar
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Acesse sua conta para anunciar e gerenciar produtos.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Digite um e-mail válido",
                },
              })}
              placeholder="voce@exemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                {...register("senha", { required: "Senha é obrigatória" })}
                placeholder="Sua senha"
                className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5" />
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Modo mock: use demo@brecho.com / 123456
        </p>
      </div>

      <div className="text-center mt-6">
        <Link to="/" className="text-sm text-purple-600 hover:underline">
          ← Voltar para a Home
        </Link>
      </div>
    </main>
  );
}
