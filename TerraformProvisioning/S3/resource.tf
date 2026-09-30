resource "aws_s3_bucket" "products" {
  bucket = "${var.project_name}-products-947765363445"
  object_lock_enabled = false
  tags = {
    Name = "${var.project_name}-products"
  }
}

# Bloqueio de acesso publico
resource "aws_s3_bucket_public_access_block" "products" {
  bucket = aws_s3_bucket.products.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Versionamento
resource "aws_s3_bucket_versioning" "products" {
  bucket = aws_s3_bucket.products.id

  versioning_configuration {
    status = "Enabled"
  }
}