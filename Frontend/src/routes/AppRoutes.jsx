import { Routes, Route } from "react-router-dom";
import Cadastro from "../pages/Cadastro";
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
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={<Home />} />
      <Route path="/produto/:id" element={<DetalheProduto />} />
      <Route path="/login" element={<Login />} />
      <Route path="/anunciar/:id" element={<CriarAnuncio />} />

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
        path="/anunciar/:id"
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