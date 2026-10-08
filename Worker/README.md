# Worker — Processamento de Imagens

Worker em **Node.js** que processa imagens de forma **assíncrona** (SQS → Worker → S3).

---

## 🎯 O que ele faz

1. **Lê** uma mensagem do **SQS** (com o caminho da imagem no S3)
2. **Baixa** a imagem original do **S3**
3. **Redimensiona** pra 2 tamanhos: **300px** e **600px**
4. **Aplica watermark** ("BRECHÓ ONLINE") na imagem de 600px
5. **Sobe** as thumbnails pro **S3**
6. **Deleta** a mensagem do **SQS**

---

## 💧 Watermark

O Worker aplica uma **marca d'água** ("BRECHÓ ONLINE") na imagem de **600px**.

| Propriedade | Valor |
|---|---|
| **Texto** | "BRECHÓ ONLINE" |
| **Rotação** | -30° (diagonal) |
| **Cor** | branco com 50% de transparência |
| **Borda** | preta (stroke) |
| **Posição** | centro |
| **Fonte** | `DejaVu Sans` (disponível no Amazon Linux) |

---

## 🏗️ Arquitetura

```
Front → API (Django) → PostgreSQL (dados)
                    → S3 (imagem original)
                    → SQS (mensagem)
                        ↓
                    Worker (Node.js)
                        ↓
                    S3 (thumbs)
```

- **Front** (React): envia a imagem + dados
- **API** (Django): salva os dados no PostgreSQL, sobe a original pro S3 e publica no SQS
- **Worker** (Node.js): lê do SQS, processa e sobe as thumbs pro S3
- **S3**: armazena as imagens (original + thumbs)
- **PostgreSQL**: guarda os dados estruturados + referências (s3_key)

---

## 📁 Estrutura

```
Worker/
├── src/
│   ├── index.js           ← loop principal
│   ├── sqs.js             ← funções do SQS
│   ├── s3.js              ← funções do S3
│   ├── processar.js       ← resize + watermark
│   └── utils.js           ← helpers
├── mock/                  ← imagens de teste
├── .env                   ← variáveis de ambiente
├── package.json
└── README.md
```

---

## 🚀 Como rodar localmente

### Pré-requisitos

- **Node.js** 20+
- **AWS CLI** configurada com credenciais do Academy
- **Bucket S3** criado
- **Fila SQS** criada
- **API Django** rodando (com `boto3` instalado)

---

### 1. Instalar dependências

```bash
cd Worker
npm install
```

---

### 2. Criar o `.env`

```bash
code .env
```

**Conteúdo do `.env`:**

```
AWS_REGION=us-east-1
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/SEU_ACCOUNT_ID/NOME_DA_FILA
S3_BUCKET_NAME=NOME_DO_BUCKET
```

---

### 3. Rodar o Worker

```bash
NODE_NO_WARNINGS=1 node src/index.js
```

**O que esperar:**

```
🚀 Worker iniciado
📬 Fila: https://sqs.us-east-1.amazonaws.com/...
🪣 Bucket: brechonline-products-...
```

---

### 4. Testar o watermark (opcional)

```bash
NODE_NO_WARNINGS=1 node testar-watermark.js
xdg-open mock/teste-watermark.jpg
```

**O que vai ver:** a imagem com o texto "BRECHÓ ONLINE" em diagonal.

---

### 5. Testar com uma mensagem

**Em outro terminal:**

```bash
# Sobe uma imagem de teste
curl -L -o /tmp/teste.jpg "https://picsum.photos/1200/800"
aws s3 cp /tmp/teste.jpg s3://SEU_BUCKET/produtos/999/foto-original.jpg --region us-east-1

# Manda a mensagem no SQS
aws sqs send-message \
  --queue-url SEU_SQS_URL \
  --message-body '{"produto_id": 999, "s3_key": "produtos/999/foto-original.jpg"}' \
  --region us-east-1
```

**O Worker deve processar:**

```
📦 Mensagem recebida: { produto_id: 999, s3_key: 'produtos/999/foto-original.jpg' }
⬇️ Baixando do S3...
✅ Baixado: 120000 bytes
🖼️ Redimensionando...
✅ Resize: 300px = 13000 bytes | 600px = 45000 bytes
⬆️ Subindo pro S3...
✅ Thumbnails salvas no S3
🗑️ Deletando do SQS...
✅ Mensagem deletada do SQS
```

---

### 6. Confirmar as thumbs no S3

```bash
aws s3 ls s3://SEU_BUCKET/produtos/999/ --region us-east-1
```

**O que esperar:**

```
foto-original.jpg
thumb_300.jpg       ← criada pelo Worker
thumb_600.jpg       ← criada pelo Worker (com watermark)
```

---

## ☁️ Como rodar na EC2

O Worker roda na **EC2 do backend**, via `user-data.sh`.

### 1. Provisionar a infraestrutura

```bash
cd TerraformProvisioning
terraform apply
```

### 2. Conectar na EC2

```bash
# Pega o IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=brechonline-backend" "Name=instance-state-name,Values=running" \
  --query "Reservations[].Instances[].PublicIpAddress" \
  --output text \
  --region us-east-1

# Libera a porta 22
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=brechonline-backend-sg" \
  --query "SecurityGroups[].GroupId" \
  --output text \
  --region us-east-1)
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region us-east-1

# Conecta
ssh -i ~/.ssh/vockey.pem ec2-user@SEU_IP
```

### 3. Ver o Worker rodando

```bash
sudo pm2 list
sudo pm2 logs worker
```

---

## 📋 Logs

O Worker imprime logs detalhados durante o processamento.

**Pra ver os logs:**

```bash
# Na EC2
sudo pm2 logs worker

# Ou o log completo
sudo cat /root/.pm2/logs/worker-out.log
sudo cat /root/.pm2/logs/worker-error.log
```

---

## 🐛 Debug

### Reiniciar o Worker (na EC2)

```bash
sudo pm2 restart worker
```

### Verificar a fila SQS

```bash
aws sqs get-queue-attributes \
  --queue-url SEU_SQS_URL \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible \
  --region us-east-1
```

---

## ⚠️ Problemas comuns

| Problema | Solução |
|---|---|
| **`pm2: command not found`** | O `user-data.sh` ainda tá rodando. Espera 3 min. |
| **`Input Buffer is empty`** | A imagem não tá no S3. Confere o `s3_key`. |
| **`ExpiredToken`** | As credenciais do Academy expiraram. Renova. |
| **`AccessDenied`** | A EC2 não tem permissão. Confere o `LabInstanceProfile`. |
| **`Queue does not exist`** | A fila não existe. Cria com `aws sqs create-queue`. |
| **Watermark com quadrados** | A fonte não tá instalada. Roda `sudo dnf install -y fontconfig dejavu-sans-fonts` na EC2. |

---

## 🔌 Contrato com a API

A API (Django) precisa:

1. **Subir a imagem original** pro S3 com a chave `produtos/{id}/foto-original.jpg`
2. **Publicar uma mensagem no SQS** com o formato:

```json
{
  "produto_id": 123,
  "s3_key": "produtos/123/foto-original.jpg"
}
```

**O Worker lê essa mensagem**, baixa a imagem do S3, processa e sobe as thumbs pro S3.

---

## 📌 Requisitos atendidos

- ✅ **Processamento assíncrono** (SQS)
- ✅ **Desacoplamento** (Worker separado da API)
- ✅ **Armazenamento no S3**
- ✅ **Rescaling de imagem** (300px, 600px)
- ✅ **Watermark** (marca d'água)