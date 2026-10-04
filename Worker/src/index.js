// src/index.js
import "dotenv/config";
import { lerMensagem, deletarMensagem } from "./sqs.js";
import { baixarDoS3, subirParaS3 } from "./s3.js";
import { redimensionar, aplicarWatermark } from "./processar.js";

async function processarMensagem(mensagem) {
  const corpo = JSON.parse(mensagem.Body);
  console.log("Mensagem recebida:", corpo);
  
  // Baixa do S3 (função do s3.js)
  console.log("Baixando do S3...");
  const buffer = await baixarDoS3(corpo.s3_key);
  console.log(`Baixado: ${buffer.length} bytes`);
  
  // Processa (função do processar.js)
  console.log("Redimensionando...");
  const thumb300 = await redimensionar(buffer, 300);
  const thumb600 = await redimensionar(buffer, 600);
  const comMarca = await aplicarWatermark(thumb600);
  console.log(`Resize: 300px = ${thumb300.length} bytes | 600px = ${comMarca.length} bytes`);
  
  // Sobe pro S3 (função do s3.js)
  console.log("Subindo pro S3...");
  await subirParaS3(`produtos/${corpo.produto_id}/thumb_300.jpg`, thumb300);
  await subirParaS3(`produtos/${corpo.produto_id}/thumb_600.jpg`, comMarca);
  console.log("Thumbnails salvas no S3");
  
  // Deleta do SQS (função do sqs.js)
  console.log("Deletando do SQS...");
  await deletarMensagem(mensagem.ReceiptHandle);
  console.log("Mensagem deletada do SQS");
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