// src/processar.js
import sharp from "sharp";

export async function redimensionar(buffer, largura) {
  return await sharp(buffer)
    .resize(largura, largura, { fit: "inside" })
    .toBuffer();
}

export async function aplicarWatermark(buffer) {
  // Pega as dimensões da imagem
  const metadata = await sharp(buffer).metadata();
  const largura = metadata.width;
  const altura = metadata.height;

  // Cria o SVG com o texto da marca d'água
  const fontSize = Math.max(20, Math.round(largura / 15));
  const svg = `
    <svg width="${largura}" height="${altura}">
      <text
        x="50%"
        y="50%"
        font-family="DejaVu Sans, sans-serif"
        font-size="${fontSize}"
        fill="rgba(255, 255, 255, 0.5)"
        stroke="rgba(0, 0, 0, 0.3)"
        stroke-width="2"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-30 ${largura / 2} ${altura / 2})"
      >
        BRECHÓ ONLINE
      </text>
    </svg>
  `;

  // Sobrepõe o SVG na imagem
  return await sharp(buffer)
    .composite([
      {
        input: Buffer.from(svg),
        gravity: "center",
      },
    ])
    .toBuffer();
}