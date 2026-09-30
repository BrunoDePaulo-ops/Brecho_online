resource "aws_dynamodb_table" "audit" {
  name = "${var.project_name}-audit"

  billing_mode = "PAY_PER_REQUEST"

  hash_key = "id"

  attribute { # TODO: Considerar proximos indices
    name = "id"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-audit"
  }
}