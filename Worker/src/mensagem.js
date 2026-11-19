import { baixarDoS3, subirParaS3 } from "./s3.js";
import { redimensionar, aplicarWatermark } from "./processar.js";

export async function processarMensagem(corpo) {
  if (typeof corpo?.s3_key !== "string" || !corpo.s3_key.includes("/")) {
    throw new Error("Mensagem sem uma s3_key válida");
  }
  console.log("Processando imagem:", corpo.s3_key);
  const buffer = await baixarDoS3(corpo.s3_key);
  const thumb300 = await redimensionar(buffer, 300);
  const thumb600 = await redimensionar(buffer, 600);
  const comMarca = await aplicarWatermark(thumb600);
  const pasta = corpo.s3_key.substring(0, corpo.s3_key.lastIndexOf("/"));
  await subirParaS3(`${pasta}/thumb_300.jpg`, thumb300);
  await subirParaS3(`${pasta}/thumb_600.jpg`, comMarca);
  console.log("Miniaturas salvas no MinIO:", pasta);
}
