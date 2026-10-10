# Como testar o fluxo completo

Este guia explica como testar a **integração completa** do brechó:

**Front (React) → API (Django) → PostgreSQL + S3 + SQS → Worker (Node.js) → S3**

---

## 🏗️ Fluxo

```
Front (React) → API (Django) → PostgreSQL (dados)
                            → S3 (imagem original)
                            → SQS (mensagem)
                                ↓
                            Worker (Node.js)
                                ↓
                            S3 (thumbs)
```

1. **Front** envia a imagem + dados
2. **API** salva os dados no PostgreSQL, sobe a original pro S3 e publica no SQS
3. **Worker** lê do SQS, processa (resize + watermark) e sobe as thumbs pro S3
4. **PostgreSQL** guarda os dados estruturados + referências (s3_key)

---

## Pré-requisitos

- ✅ **Node.js** 20+
- ✅ **Python** 3 + `venv`
- ✅ **PostgreSQL** rodando localmente
- ✅ **AWS CLI** configurada (credenciais do Academy)
- ✅ **Bucket S3** criado
- ✅ **Fila SQS** criada

---

## Passo 1 — Prepara a API

**Terminal 1:**

```bash
cd Backend
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # (se não tiver usuário)
python manage.py runserver
```

**A API fica em:** `http://localhost:8000/`

**O que esperar:**

```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

---

## Passo 2 — Prepara o front

**Terminal 2:**

```bash
cd Frontend
npm install
npm run dev
```

**O front fica em:** `http://localhost:5173/`

**O que esperar:**

```
  VITE v8.3.1  ready in 300 ms

  ➜  Local:   http://localhost:5173/
```

---

## Passo 3 — Prepara o Worker

**Terminal 3:**

```bash
cd Worker
npm install
NODE_NO_WARNINGS=1 node src/index.js
```

**O Worker fica ouvindo a fila SQS.**

**O que esperar:**

```
🚀 Worker iniciado
📬 Fila: https://sqs.us-east-1.amazonaws.com/...
🪣 Bucket: brechonline-products-...
```

---

## Passo 4 — Testa o fluxo completo

### 4.1 — Faz login

**No navegador:**

```
http://localhost:5173/login
```

**Preenche:**
- **E-mail:** `ana@email.com` (ou o que você criou)
- **Senha:** `Senha123!`

**O que esperar:**
- ✅ Redireciona pra Home
- ✅ Toast "Login realizado!"

### 4.2 — Cria um anúncio

**No navegador:**

```
http://localhost:5173/anunciar
```

**Preenche:**
- **Título:** `Vaso artesanal`
- **Descrição:** `Feito à mão`
- **Preço:** `89,90`
- **Categoria:** (escolhe)
- **Imagem:** (arrasta uma do PC)

**Clica em "Publicar anúncio".**

**O que esperar:**
- ✅ Toast "Anúncio publicado!"
- ✅ Redireciona pra Home
- ✅ O produto aparece na Home

### 4.3 — Vê o Worker processar

**No terminal do Worker:**

```
📦 Mensagem recebida: { produto_id: ..., s3_key: "produtos/.../foto-original.jpg" }
⬇️ Baixando do S3...
✅ Baixado: ... bytes
🖼️ Redimensionando...
✅ Resize: 300px = ... bytes | 600px = ... bytes
⬆️ Subindo pro S3...
✅ Thumbnails salvas no S3
🗑️ Deletando do SQS...
✅ Mensagem deletada do SQS
```

### 4.4 — Confirma as thumbs no S3

```bash
aws s3 ls s3://brechonline-products-692366918619/produtos/ --recursive --region us-east-1
```

**O que esperar:**

```
produtos/{uuid}/foto-original.jpg
produtos/{uuid}/thumb_300.jpg       ← criada pelo Worker
produtos/{uuid}/thumb_600.jpg       ← criada pelo Worker (com watermark)
```

### 4.5 — Confirma no PostgreSQL (Django admin)

```
http://localhost:8000/admin/
```

**Login:** `bruno` / `Senha123!`

**O que ver:**

- ✅ **Users** — os usuários criados
- ✅ **Products** — os produtos criados
- ✅ **Categories** — as categorias

---

## ✅ Checklist do fluxo

- [ ] **API** rodando em `localhost:8000`
- [ ] **Front** rodando em `localhost:5173`
- [ ] **Worker** rodando
- [ ] **Login** funcionando
- [ ] **Criar anúncio** funcionando
- [ ] **Worker** processou a mensagem
- [ ] **Thumbs** criadas no S3
- [ ] **Produto** aparece no admin do Django
- [ ] **Produto** aparece na Home

---

## ⚠️ Problemas comuns

| Problema | Solução |
|---|---|
| **`ExpiredToken`** | Renova as credenciais no Academy |
| **`QueueDoesNotExist`** | Cria a fila SQS ou corrige o `.env` do Worker |
| **`NoSuchBucket`** | Cria o bucket S3 ou corrige o `.env` |
| **`AccessDenied`** | Confere se o bucket tá certo no `.env` |
| **CORS policy** | Confere o `CORS_ALLOWED_ORIGINS` no `settings.py` |
| **`ModuleNotFoundError: boto3`** | Roda `pip install -r requirements.txt` |
| **`novoProduto is not defined`** | Confere o `onSubmit` no `CriarAnuncio.jsx` |
| **401 Unauthorized** | Token expirou. Faz login de novo |
| **415 Unsupported Media** | Confere se o `api.js` manda `multipart/form-data` |
| **500 Internal Server Error** | Olha o terminal da API (traceback) |
| **Watermark com quadrados** | Instala fontes na EC2: `sudo dnf install -y fontconfig dejavu-sans-fonts` |

---

## 🔌 Serviços AWS usados

| Serviço | O que faz | Status |
|---|---|---|
| **EC2** | Roda a API + Worker | (quando subir) |
| **RDS** | Banco relacional | (quando subir) |
| **S3** | Armazena imagens (original + thumbs) | ✅ |
| **SQS** | Fila de mensagens | ✅ |
| **DynamoDB** | Logs de CRUD | (quando subir) |
| **ElastiCache** | Cache de vitrine | (quando subir) |

---

## 📌 Requisitos atendidos

| Requisito | Como é atendido |
|---|---|
| **1. Interface Web na EC2** | Front (React) + API (Django) |
| **2. Dados no RDS** | PostgreSQL (local) / RDS (produção) |
| **3. Arquivos no S3** | Imagens (original + thumbs) |
| **4. ElastiCache (cache)** | Cache de vitrine (destaques, mais procurados) |
| **5. Log de CRUD no DynamoDB** | Logs de criar/editar/excluir |
| **6. SNS/SQS para desacoplamento** | Fila SQS + Worker |

---

## 🐛 Debug rápido

### Verificar se a API tá rodando

```bash
curl http://localhost:8000/api/products/
```

**O que esperar:** JSON com a lista de produtos (ou `[]` se vazio).

### Verificar se a fila SQS tem mensagens

```bash
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/692366918619/brechonline-image-processing \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible \
  --region us-east-1
```

**O que esperar:**

- **`Messages: 1, NotVisible: 0`** → mensagem na fila (Worker não pegou)
- **`Messages: 0, NotVisible: 0`** → fila vazia (Worker processou)
- **`Messages: 0, NotVisible: 1`** → Worker pegou, mas não terminou

### Ver o log do Worker

```bash
# No terminal do Worker
# (Ctrl + C pra parar)
NODE_NO_WARNINGS=1 node src/index.js
```

---

## 📞 Contato

Se der problema, chama no grupo do trabalho:

- **Bruno** — front + worker
- **Joélio** — backend + infra
- **Rafael** — backend + testes