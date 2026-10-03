// src/sqs.js
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION });

export async function lerMensagem() {
  const resposta = await sqs.send(new ReceiveMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 5,
  }));

  if (!resposta.Messages || resposta.Messages.length === 0) {
    return null;
  }

  return resposta.Messages[0];
}

export async function deletarMensagem(receiptHandle) {
  await sqs.send(new DeleteMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle,
  }));
}