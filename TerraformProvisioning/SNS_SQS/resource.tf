resource "aws_sqs_queue" "image_processing" {
  name = "${var.project_name}-image-processing"

  tags = {
    Name = "${var.project_name}-image-processing"
  }
}