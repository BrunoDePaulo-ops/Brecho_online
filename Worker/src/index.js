import "dotenv/config";
import { consumirMensagens } from "./rabbitmq.js";
import { processarMensagem } from "./mensagem.js";

consumirMensagens(processarMensagem).catch((error) => {
  console.error("Falha ao iniciar o worker:", error);
  process.exit(1);
});
