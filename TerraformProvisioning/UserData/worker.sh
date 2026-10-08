#!/bin/bash
set -e

# ============ 1. Atualiza o sistema ============
dnf update -y
dnf install -y git 

# ============ 2. Instala Node.js 20 ============
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# ============ 3. Clona o repositório ============
# O token é injetado pelo Terraform via templatefile
git clone -b feat/worker https://${github_user}:${github_token}@github.com/BrunoDePaulo-ops/Brecho_online.git /app

# ============ 4. Configura o Worker ============
cd /app/Worker

# Cria o .env
cat > .env <<EOF
AWS_REGION=${aws_region}
SQS_QUEUE_URL=${sqs_queue_url}
S3_BUCKET_NAME=${s3_bucket_name}
EOF

# Instala dependências
npm install

# ============ 5. Instala pm2 e inicia o Worker ============
npm install -g pm2
pm2 start src/index.js --name worker
pm2 startup systemd -u root --hp /root
pm2 save

echo "Worker instalado e rodando!"