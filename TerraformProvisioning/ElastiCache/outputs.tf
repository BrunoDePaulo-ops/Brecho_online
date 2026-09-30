output "replication_group_id" {
  description = "ID do replication group do Redis"
  value       = aws_elasticache_replication_group.main.id
}

output "primary_endpoint" {
  description = "Endpoint principal do Redis"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "port" {
  description = "Porta do Redis"
  value       = aws_elasticache_replication_group.main.port
}