      # Worker de imagens

O worker Node.js consome o RabbitMQ, baixa o original do MinIO e grava `thumb_300.jpg` e `thumb_600.jpg` na mesma pasta. A miniatura de 600px recebe a marca d'água “BRECHÓ ONLINE”. A imagem Docker inclui a fonte DejaVu Sans utilizada no processamento com Sharp.

Execute com o [Docker Compose na raiz](../docker-compose.yml), seguindo o [guia principal](../README.md):

```bash
docker compose up -d --build
docker compose logs -f worker
```

A configuração de MinIO e RabbitMQ vem do `.env` da raiz. O worker não precisa de credenciais AWS. Para execução manual, use Node.js 22+, instale as dependências com `npm ci`, configure as variáveis de [.env.example](./.env.example) e execute `npm start`. MinIO e RabbitMQ precisam estar acessíveis pelos endereços configurados; o Compose não publica a porta AMQP no host por padrão.

Contrato da mensagem JSON, preservado da API:

```json
{
  "produto_id": "uuid-do-produto",
  "s3_key": "produtos/uuid-da-imagem/foto-original.png"
}
```

`s3_key` é uma chave no bucket MinIO. O cliente compatível com S3 usa endpoint e credenciais locais explícitos.

A fila padrão é `image-processing`, durável e com uma mensagem em processamento por worker. O consumidor confirma a mensagem somente após os dois uploads. Falhas são rejeitadas sem reenvio imediato e encaminhadas a `image-processing.failed`, evitando um ciclo de mensagens inválidas. Mensagens interrompidas por queda da conexão são entregues novamente pelo RabbitMQ; o Compose reinicia o processo. SIGTERM cancela o consumo e espera o processamento atual antes de fechar a conexão.

Para inspecionar:

```bash
docker compose exec rabbitmq rabbitmqctl list_queues name messages_ready messages_unacknowledged
```

No painel http://localhost:15672, consulte a fila de falhas e republique a mensagem na fila principal após corrigir a causa. Reiniciar o worker preserva mensagens e arquivos nos volumes do Compose.
