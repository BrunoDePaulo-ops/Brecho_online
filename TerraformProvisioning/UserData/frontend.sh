#!/bin/bash
set -euo pipefail
exec > >(tee /var/log/userdata.log) 2>&1


# ============ 1. Instala git ============
dnf install -y git 

# ============ 2. Instala Node.js 22 ============
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs

node --version
npm --version

# ============ 3. Clona o repositório ============
# O token é injetado pelo Terraform via templatefile
git clone https://${github_user}:${github_token}@github.com/BrunoDePaulo-ops/Brecho_online.git /app

# ============ 4. Configura o Frontend ============
cd /app/Frontend

# URL base da API, disponível durante o build do Vite.
# O nome VITE_API_URL deve corresponder ao utilizado pelo código React.
cat > .env.production <<EOF
VITE_API_URL=${api_url}
EOF

# ============ 5. Instala dependências ============
if [ -f package-lock.json ]; then
    npm ci
else
    npm install
fi

# ============ 6. Gera o build de produção ============
npm run build

# ============ 7. Instala servidor de arquivos estáticos ============
npm install -g serve

SERVE_BIN="$(command -v serve)"

# ============ 8. Cria serviço do Frontend ============
cat > /etc/systemd/system/frontend.service <<EOF
[Unit]
Description=Brecho Online Frontend
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=/app/Frontend
Environment=NODE_ENV=production
ExecStart=$SERVE_BIN -s /app/Frontend/dist -l 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# ============ 9. Inicia o serviço ============
systemctl daemon-reload
systemctl enable --now frontend

echo "Frontend instalado e iniciado!"