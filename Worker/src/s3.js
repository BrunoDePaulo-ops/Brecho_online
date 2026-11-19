// src/s3.js
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { streamToBuffer } from "./utils.js";

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT_URL || "http://localhost:9000",
  region: process.env.MINIO_REGION || "us-east-1",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
});

export async function baixarDoS3(chave) {
  const resposta = await s3.send(new GetObjectCommand({
    Bucket: process.env.MINIO_BUCKET || "brecho-products",
    Key: chave,
  }));
  return await streamToBuffer(resposta.Body);
}

export async function subirParaS3(chave, buffer) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET || "brecho-products",
    Key: chave,
    Body: buffer,
    ContentType: "image/jpeg",
  }));
}