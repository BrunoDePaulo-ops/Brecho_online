import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ShoppingBag, Eye, EyeOff, UserPlus } from "lucide-react";
import { cadastrarUsuario } from "../services/api";

export default function Cadastro() {
  const navigate = useNavigate();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit({ email, senha, nome }) {
    setEnviando(true);
    try {
      await cadastrarUsuario({
        username: email,
        email: email,
        password: senha,
        first_name: nome,
      });
      toast.success("Conta criada! Faça login.");
      navigate("/login");
    } catch (erro) {
      toast.error(erro.message || "Erro ao cadastrar.");
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
          Criar conta
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Cadastre-se para anunciar e comprar produtos.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              {...register("nome", { required: "Nome é obrigatório" })}
              placeholder="Seu nome"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
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
                {...register("senha", {
                  required: "Senha é obrigatória",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                })}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Já tem conta?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Entrar
          </Link>
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