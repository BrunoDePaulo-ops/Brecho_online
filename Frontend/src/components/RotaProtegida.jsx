import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Envolve páginas que exigem login. Se não houver sessão,
// redireciona para /login e guarda a página que o usuário queria acessar.
export default function RotaProtegida({ children }) {
  const { autenticado } = useAuth();
  const location = useLocation();

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  return children;
}
