# 🛍️ Brechó Online — Front-end

Marketplace de produtos artesanais e usados (brechó online). Este repositório contém **apenas o front-end** da aplicação.

> **Trabalho acadêmico** — Computação em Nuvem  
> Stack: React + Vite + Tailwind CSS

---

## 📋 Sobre o projeto

Aplicação web onde usuários podem:
- Navegar pela vitrine de produtos (destaques, mais procurados, todos)
- Ver detalhes de um produto
- Cadastrar novos anúncios (com upload de imagens)
- (Em breve) Sistema de compra

O front-end consome uma **API REST** que será hospedada em uma instância **EC2** da AWS.  
O back-end integra: **RDS** (dados relacionais), **S3** (imagens), **ElastiCache/Redis** (cache), **DynamoDB** (logs de CRUD) e **SNS/SQS** (processamento assíncrono de imagens).

---

## 🛠️ Tecnologias

| Camada | Ferramenta |
|---|---|
| Base | React 19 |
| Build | Vite 8 |
| Estilo | Tailwind CSS 4 |
| Rotas | React Router DOM |
| HTTP | Axios |
| Formulários | React Hook Form |
| Upload | React Dropzone |
| Notificações | React Hot Toast |
| Ícones | Lucide React |

---

## 🚀 Como rodar o projeto localmente

### Pré-requisitos

- **Node.js** v18+ (recomendado v20+)
- **npm** v10+
- **Git**

Pra verificar se você tem instalado:

```bash
node -v
npm -v
git --version
```

Se não tiver o Node, instale via **NVM**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### Passo a passo

```bash
# 1. Clone o repositório
git clone git@github.com:BrunoDePaulo-ops/Brecho_online.git

# 2. Entre na pasta
cd Brecho_online

# 3. Instale as dependências
npm install

# 4. Rode o servidor de desenvolvimento
npm run dev
```

O projeto vai abrir em: **http://localhost:5173/**

---

## 📁 Estrutura de pastas

```
src/
├── components/       → componentes reutilizáveis (Header, CardProduto, etc.)
├── pages/            → telas (Home, DetalheProduto, CriarAnuncio, ...)
├── services/         → chamadas HTTP (api.js)
├── mocks/            → dados falsos enquanto o back-end não existe
├── routes/           → configuração de rotas
├── App.jsx           → componente principal
├── main.jsx          → ponto de entrada
└── index.css         → Tailwind CSS
```

---

## 🔌 Modo mock vs. API real

O arquivo `src/services/api.js` tem uma constante chamada **`USE_MOCK`**:

```js
const USE_MOCK = true; // 👈 true = usa dados falsos | false = chama API real
```

- **`USE_MOCK = true`** → o front usa dados falsos (`src/mocks/`) — **não precisa do back-end rodando**
- **`USE_MOCK = false`** → o front chama a API real na EC2

Enquanto o back-end não estiver pronto, **mantenha `USE_MOCK = true`**.

---

## 🌿 Fluxo de trabalho com Git

**Nunca commite direto na `main`.** Use branches por feature:

```bash
# 1. Antes de começar uma feature, crie uma branch
git checkout -b feat/nome-da-feature

# 2. Trabalhe, commite normalmente
git add .
git commit -m "feat: descrição do que foi feito"

# 3. Suba a branch pro GitHub
git push -u origin feat/nome-da-feature

# 4. Abra um Pull Request no GitHub
# 5. Depois do merge, apague a branch local
git checkout main
git pull
git branch -d feat/nome-da-feature
```

### Padrão de mensagens de commit

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `chore:` | Tarefas de setup/manutenção |
| `docs:` | Documentação |
| `style:` | Formatação (sem mudança de lógica) |
| `refactor:` | Refatoração (sem mudança de comportamento) |

---

## 📌 Status do desenvolvimento

### Front-end

- [x] Setup do projeto (Vite + React + Tailwind)
- [x] Estrutura de pastas
- [x] Mock de produtos
- [x] Camada de serviço (api.js com USE_MOCK)
- [x] Header
- [x] Card de produto
- [x] Home (vitrine com destaques, mais procurados e todos)
- [ ] Detalhe do produto
- [ ] Criar anúncio (formulário + upload)
- [ ] Integração com API real
- [ ] Polling do status de processamento

### Back-end / AWS

- [ ] API REST na EC2
- [ ] RDS (banco relacional)
- [ ] S3 (armazenamento de imagens)
- [ ] ElastiCache/Redis (cache de vitrine)
- [ ] DynamoDB (logs de CRUD)
- [ ] SNS/SQS + worker (processamento de imagens)

---

## 👥 Equipe

| Nome | GitHub |
|---|---|
| Bruno de Paulo | [@BrunoDePaulo-ops](https://github.com/BrunoDePaulo-ops) |


---

## 📄 Licença

Projeto acadêmico — sem fins comerciais.