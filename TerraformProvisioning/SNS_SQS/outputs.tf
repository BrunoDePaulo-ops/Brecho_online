output "sns_topic_arn" {
  description = "ARN do SNS para processamento de imagens"
  value       = aws_sns_topic.image_processing.arn
}

output "sqs_queue_url" {
  description = "URL da fila SQS"
  value       = aws_sqs_queue.image_processing.url
}

output "sqs_queue_arn" {
  description = "ARN da fila SQS"
  value       = aws_sqs_queue.image_processing.arn
}