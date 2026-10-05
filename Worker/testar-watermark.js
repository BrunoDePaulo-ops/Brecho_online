import fs from "fs/promises";
import { redimensionar, aplicarWatermark } from "./src/processar.js";

async function testar() {
  console.log("📖 Lendo imagem...");
  const buffer = await fs.readFile("./mock/teste.jpg");

  console.log("🖼️ Redimensionando...");
  const thumb = await redimensionar(buffer, 600);

  console.log("💧 Aplicando watermark...");
  const comMarca = await aplicarWatermark(thumb);

  console.log("💾 Salvando...");
  await fs.writeFile("./mock/teste-watermark.jpg", comMarca);

  console.log("✅ Pronto! Veja em ./mock/teste-watermark.jpg");
}

testar();