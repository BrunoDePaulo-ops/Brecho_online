// src/processar.js
import sharp from "sharp";

export async function redimensionar(buffer, largura) {
  return await sharp(buffer)
    .resize(largura, largura, { fit: "inside" })
    .toBuffer();
}

export async function aplicarWatermark(buffer) {
  // TODO: implementar
  return buffer;
}