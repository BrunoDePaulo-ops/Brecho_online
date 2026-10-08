#!/bin/bash
set -e

# ============ 1. Atualiza o sistema ============
dnf update -y
dnf install -y git 


# ============ 3. Clona o repositório ============
# O token é injetado pelo Terraform via templatefile
git clone -b feat/worker https://${github_user}:${github_token}@github.com/BrunoDePaulo-ops/Brecho_online.git /app
