import { createContext } from "react";

// Apenas cria o "canal" por onde os dados de login circulam.
// Quem preenche esse canal é o AuthProvider; quem lê é o hook useAuth.
export const AuthContext = createContext(null);
