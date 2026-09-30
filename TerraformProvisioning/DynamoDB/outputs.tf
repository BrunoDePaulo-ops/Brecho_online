output "table_name" {
  description = "Nome da tabela DynamoDB"
  value       = aws_dynamodb_table.audit.name
}

output "table_arn" {
  description = "ARN da tabela DynamoDB"
  value       = aws_dynamodb_table.audit.arn
}