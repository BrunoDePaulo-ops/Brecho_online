import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import DetalheProduto from "../pages/DetalheProduto";
import CriarAnuncio from "../pages/CriarAnuncio";
import MeusAnuncios from "../pages/MeusAnuncios";
import Login from "../pages/Login";
import RotaProtegida from "../components/RotaProtegida";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/produto/:id" element={<DetalheProduto />} />
      <Route path="/login" element={<Login />} />

      {/* Exigem login */}
      <Route
        path="/anunciar"
        element={
          <RotaProtegida>
            <CriarAnuncio />
          </RotaProtegida>
        }
      />
      <Route
        path="/meus-anuncios"
        element={
          <RotaProtegida>
            <MeusAnuncios />
          </RotaProtegida>
        }
      />
    </Routes>
  );
}

/* Rotas para adicionar:
    <Route path="/produto/:id" element={<DetalheProduto />} />
    <Route path="/anunciar" element={<CriarAnuncio />} />
*/