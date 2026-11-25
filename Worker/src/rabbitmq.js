import amqp from "amqplib";

export async function consumirMensagens(processarMensagem) {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://brecho:brecho@localhost:5672/%2F",
    { timeout: 10000 },
  );
  let encerrando = false;
  connection.on("error", (error) => console.error("Erro no RabbitMQ:", error));
  connection.on("close", () => {
    if (!encerrando) process.exit(1);
  });
  const channel = await connection.createChannel();
  channel.on("error", (error) => {
    console.error("Erro no canal RabbitMQ:", error);
    process.exit(1);
  });
  const queue = process.env.RABBITMQ_IMAGE_QUEUE || "image-processing";
  await channel.assertQueue(`${queue}.failed`, { durable: true });
  await channel.assertQueue(queue, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": `${queue}.failed`,
    },
  });
  await channel.prefetch(1);
  let processamentoAtual = Promise.resolve();
  const { consumerTag } = await channel.consume(queue, (message) => {
    if (!message) return;
    processamentoAtual = (async () => {
      try {
        await processarMensagem(JSON.parse(message.content.toString()));
        channel.ack(message);
      } catch (error) {
        console.error("Falha no processamento; mensagem enviada à fila de falhas:", error);
        channel.nack(message, false, false);
      }
    })();
  }, { noAck: false });

  const encerrar = async () => {
    if (encerrando) return;
    encerrando = true;
    try {
      await channel.cancel(consumerTag);
      await processamentoAtual;
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error("Erro ao encerrar o worker:", error);
      process.exitCode = 1;
    }
  };
  process.once("SIGTERM", encerrar);
  process.once("SIGINT", encerrar);
  console.log(`Worker ouvindo RabbitMQ: ${queue}`);
}
