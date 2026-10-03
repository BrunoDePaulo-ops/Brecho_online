// src/s3.js
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { streamToBuffer } from "./utils.js";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function baixarDoS3(chave) {
  const resposta = await s3.send(new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: chave,
  }));
  return await streamToBuffer(resposta.Body);
}

export async function subirParaS3(chave, buffer) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: chave,
    Body: buffer,
  }));
}