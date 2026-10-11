resource "aws_elasticache_subnet_group" "main" {
  name = "${var.project_name}-cache-subnet-group"

  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-cache-subnet-group"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${var.project_name}-redis"

  description = "Redis do projeto ${var.project_name}"

  engine = "valkey"

  node_type          = "cache.t3.micro"
  num_cache_clusters = 1
  port               = 6379
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [
    var.security_group_id
  ]

  automatic_failover_enabled = false
  multi_az_enabled           = false

  tags = {
    Name = "${var.project_name}-redis"
  }

  transit_encryption_enabled = true
  at_rest_encryption_enabled = true
}