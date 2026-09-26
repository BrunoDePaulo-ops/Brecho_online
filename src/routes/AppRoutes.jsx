import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import DetalheProduto from "../pages/DetalheProduto";
import CriarAnuncio from "../pages/CriarAnuncio";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/produto/:id" element={<DetalheProduto />} />
      <Route path="/anunciar" element={<CriarAnuncio />} />
      {/* Próximas rotas virão aqui:
          <Route path="/produto/:id" element={<DetalheProduto />} />
          <Route path="/anunciar" element={<CriarAnuncio />} />
      */}
    </Routes>
  );
}