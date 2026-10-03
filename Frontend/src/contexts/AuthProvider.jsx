import { useState } from "react";
import { AuthContext } from "./auth-context";
import { login as loginApi } from "../services/api";

const CHAVE_STORAGE = "brecho_auth";

// Lê a sessão salva no navegador (se existir) quando o app abre.
function lerSessaoSalva() {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // sessao = { token, usuario } ou null (ninguém logado)
  const [sessao, setSessao] = useState(lerSessaoSalva);

  async function entrar(email, senha) {
    const dados = await loginApi(email, senha); // lança erro se as credenciais forem inválidas
    setSessao(dados);
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
  }

  function sair() {
    setSessao(null);
    localStorage.removeItem(CHAVE_STORAGE);
  }

  const valor = {
    usuario: sessao?.usuario ?? null,
    token: sessao?.token ?? null,
    autenticado: Boolean(sessao),
    entrar,
    sair,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
