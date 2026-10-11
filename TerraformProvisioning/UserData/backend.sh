#!/bin/bash
set -euxo pipefail
exec > >(tee /var/log/userdata.log) 2>&1

# ============ 1. Dependências ============
dnf install -y git python3.12 python3.12-pip python3.12-devel gcc libpq-devel

# ============ 2. Clona o repositório ============
git clone -b feat/provisioning https://${github_user}:${github_token}@github.com/BrunoDePaulo-ops/Brecho_online.git /app

# ============ 3. Virtualenv + dependências ============
cd /app/Backend
python3.12 -m venv /app/.venv
/app/.venv/bin/pip install --upgrade pip
/app/.venv/bin/pip install -r requirements.txt gunicorn

# ============ 4. Variáveis de ambiente ============
cat > /etc/app.env <<'EOF'
DEBUG=False
ALLOWED_HOSTS=*
SECRET_KEY="${secret_key}"

AWS_REGION=${aws_region}

DB_HOST=${db_host}
DB_PORT=5432
DB_NAME=marketplace
DB_USER=marketplace
DB_PASSWORD="${db_password}"

S3_BUCKET=${s3_bucket}
DYNAMODB_TABLE=${dynamodb_table}
SQS_IMAGE_PROCESSING_QUEUE_URL=${sqs_queue_url}

VALKEY_HOST=${redis_host}
VALKEY_PORT=6379
VALKEY_DB=0
REDIS_URL=redis://${redis_host}:6379/1
EOF
chmod 600 /etc/app.env

# ============ 5. Serviço web (gunicorn) ============
cat > /etc/systemd/system/app.service <<'EOF'
[Unit]
Description=Django backend
After=network.target

[Service]
WorkingDirectory=/app/Backend
EnvironmentFile=/etc/app.env
ExecStart=/app/.venv/bin/gunicorn brecho.wsgi:application --bind 0.0.0.0:8080 --workers 2 --threads 4 --timeout 60 --keep-alive 75
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now app