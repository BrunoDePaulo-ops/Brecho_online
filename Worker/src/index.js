// src/index.js
import "dotenv/config";
import { lerMensagem, deletarMensagem } from "./sqs.js";
import { baixarDoS3, subirParaS3 } from "./s3.js";
import { redimensionar, aplicarWatermark } from "./processar.js";

async function processarMensagem(mensagem) {
  const corpo = JSON.parse(mensagem.Body);
  
  // Baixa do S3 (função do s3.js)
  const buffer = await baixarDoS3(corpo.s3_key);
  
  // Processa (função do processar.js)
  const thumb300 = await redimensionar(buffer, 300);
  const thumb600 = await redimensionar(buffer, 600);
  const comMarca = await aplicarWatermark(thumb600);
  
  // Sobe pro S3 (função do s3.js)
  await subirParaS3(`produtos/${corpo.produto_id}/thumb_300.jpg`, thumb300);
  await subirParaS3(`produtos/${corpo.produto_id}/thumb_600.jpg`, comMarca);
  
  // Deleta do SQS (função do sqs.js)
  await deletarMensagem(mensagem.ReceiptHandle);
}

async function main() {
  console.log("🚀 Worker iniciado");
  while (true) {
    const mensagem = await lerMensagem();
    if (mensagem) {
      await processarMensagem(mensagem);
    }
  }
}

main();