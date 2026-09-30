output "bucket_id" {
  description = "ID do bucket S3"
  value       = aws_s3_bucket.products.id
}

output "bucket_arn" {
  description = "ARN do bucket S3"
  value       = aws_s3_bucket.products.arn
}

output "bucket_name" {
  description = "Nome do bucket S3"
  value       = aws_s3_bucket.products.bucket
}