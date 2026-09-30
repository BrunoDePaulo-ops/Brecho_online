# Brechó Online

Marketplace de produtos artesanais e usados. O repositório contém um front-end React/Vite, um back-end Django e arquivos Terraform para provisionar recursos de desenvolvimento na AWS.

> **Trabalho acadêmico** — Computação em Nuvem  
---

## Componentes

| Componente | Tecnologia | Diretório |
|---|---|---|
| Front-end | React, Vite e Tailwind CSS | `Frontend/` |
| Back-end | Django e Django REST Framework | `Backend/` |
| Cache local | Valkey, compatível com Redis | `docker-compose.yml` |
| Infraestrutura AWS | Terraform e AWS | `TerraformProvisioning/` |

O Terraform configura VPC, sub-redes, grupos de segurança, duas instâncias EC2, RDS PostgreSQL, ElastiCache Valkey, DynamoDB e SNS/SQS. O módulo S3 está presente, mas desativado no arquivo principal. O provisionamento cria a infraestrutura, mas **não instala nem publica a aplicação nas EC2**.

## Pré-requisitos

- Git
- Node.js e npm (para o front-end)
- Python 3 e `venv` (para o back-end)
- Docker com o plugin Docker Compose (para o cache local)
- Terraform CLI 1.5 ou superior (para a AWS)
- AWS CLI v2 e acesso a uma conta AWS Academy (para a AWS)

Ferramentas instaladas:

```bash
git --version
node --version
npm --version
python3 --version
docker compose version
terraform version
aws --version
```

Clone o repositório e entre na pasta:

```bash
git clone git@github.com:BrunoDePaulo-ops/Brecho_online.git
cd Brecho_online
```

## Executar localmente

Os comandos abaixo assumem três terminais abertos na raiz do repositório: um para o cache, um para o back-end e outro para o front-end.

### 1. Iniciar o cache Valkey/Redis

O Compose inicia Valkey na porta `6379` do computador e mantém os dados no volume `valkey_data`:

```bash
docker compose up -d
docker compose ps
```

Para acompanhar os logs ou encerrar o serviço:

```bash
docker compose logs -f valkey
docker compose down
```

Para também apagar os dados persistidos, encerre com `docker compose down -v`.

### 2. Preparar e iniciar o back-end

O ambiente virtual e as dependências são locais ao diretório `Backend/`:

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

Opcionalmente, crie um usuário para acessar o admin Django:

```bash
python manage.py createsuperuser
```

Inicie o servidor:

```bash
python manage.py runserver
```

O Django fica disponível em `http://127.0.0.1:8000/`.

### 3. Iniciar o front-end

Se não tiver o Node, instale via **NVM**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

Em outro terminal, a partir da raiz:

```bash
cd Frontend
npm install
npm run dev
```

Abra o endereço (normalmente `http://localhost:5173/`). Neste momento o front-end usa dados mock (`USE_MOCK = true` em `Frontend/src/services/api.js`); a integração com a API ainda não está pronta.

## Provisionar infraestrutura na AWS

### 1. Configurar credenciais AWS

Na AWS Academy, inicie o laboratório e obtenha credenciais temporárias. Configure a AWS CLI:

```bash
aws configure
```

Informe o **Access Key ID**, **Secret Access Key**, **Aws Session Token** e a região do laboratório (o Terraform usa `us-east-1` por padrão). 

Credenciais da Academy expiram: atualize-as a configuração quando necessário.

### 2. Configurar variáveis do Terraform

Na raiz do projeto, crie `TerraformProvisioning/terraform.tfvars` (o arquivo é ignorado pelo Git) com a senha do banco e o IP público de desenvolvimento autorizado a acessar o PostgreSQL:

```hcl
aws_region     = "us-east-1"
project_name   = "brechonline"
vpc_cidr       = "10.0.0.0/16"
db_password    = "SENHA"
development_ip = "SEU_IP_PUBLICO/32"
```

Substitua `SEU_IP_PUBLICO` pelo IP público atual, por exemplo `203.0.113.10/32`. `development_ip` precisa estar em formato CIDR. Embora `aws_region` seja variável, as zonas de disponibilidade estão fixadas em `us-east-1a` e `us-east-1b`; mantenha `us-east-1` para evitar incompatibilidade.

### 3. Inicializar, validar e revisar o plano

```bash
cd TerraformProvisioning
terraform init
terraform validate
terraform plan
```

Revisar antes de aplicar. Se estiver correto:

```bash
terraform apply
```

O arquivo raiz expõe os IDs da VPC e das sub-redes como outputs:

```bash
terraform output
```

Os outputs de IP público das EC2 e endpoint do ElastiCache existem nos respectivos módulos, mas não são expostos como outputs raiz. A criação das EC2 também não configura SSH, não instala dependências e não inicia o front-end ou o back-end. A aplicação ainda deve ser configurada/publicada separadamente.

### 4. Remover os recursos

Quando terminar, confira os recursos que serão removidos e confirme a destruição:

```bash
terraform plan -destroy
terraform destroy
```

## Estrutura do repositório

```text
Backend/                  Projeto Django e requirements.txt
Frontend/                 Aplicação React/Vite
TerraformProvisioning/    Configuração e módulos Terraform da AWS
docker-compose.yml        Serviço Valkey local
.env.example              Exemplo de variáveis de ambiente (referência)
```

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

- [x] Provisionamento da Arquitetura
- [ ] API REST na EC2
- [x] RDS (banco relacional)
- [ ] S3 (armazenamento de imagens)
- [x] ElastiCache/Redis (cache de vitrine)
- [x] DynamoDB (logs de CRUD)
- [ ] SNS/SQS + worker (processamento de imagens)
- [ ] de LoadBalancing (ALS) e Auto Scaling Groups

---

## 👥 Equipe

| Nome | GitHub |
|---|---|
| Bruno de Paulo  | [@BrunoDePaulo-ops](https://github.com/BrunoDePaulo-ops) |
| Joélio Pinheiro | [@Joelio-Pinheiro](https://github.com/Joelio-Pinheiro)   |


---

## 📄 Licença

Projeto acadêmico — sem fins comerciais.