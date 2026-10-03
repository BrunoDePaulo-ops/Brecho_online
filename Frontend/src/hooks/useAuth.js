import { useContext } from "react";
import { AuthContext } from "../contexts/auth-context";

// Atalho para qualquer componente ler/alterar o estado de login.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>.");
  }
  return context;
}
