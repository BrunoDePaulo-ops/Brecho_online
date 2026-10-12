output "endpoint_address" {
  description = "Hostname do endpoint do banco de dados"
  value       = aws_db_instance.main.address
}
