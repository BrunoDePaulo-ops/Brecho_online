data "aws_ami" "amazon_linux" {
  most_recent = true

  owners = ["amazon"]

  filter {
    name   = "name" # TODO: Testar outros  filtros
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "free-tier-eligible"
    values = ["true"]
  }
}

resource "aws_instance" "main" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  subnet_id = var.subnet_id

  vpc_security_group_ids = [
    var.security_group_id
  ]

  associate_public_ip_address = true

  iam_instance_profile = "LabInstanceProfile"
  key_name             = "vockey"
  user_data            = templatefile("${path.module}/user-data.sh", {
    github_user  = "BrunoDePaulo-ops"
    github_token = var.github_token
  })

  tags = {
    Name = "${var.project_name}-${var.role}"
  }
}

