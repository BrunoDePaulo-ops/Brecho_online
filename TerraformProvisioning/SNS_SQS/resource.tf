resource "aws_sns_topic" "image_processing" {
  name = "${var.project_name}-image-processing"

  tags = {
    Name = "${var.project_name}-image-processing"
  }
}

resource "aws_sqs_queue" "image_processing" {
  name = "${var.project_name}-image-processing"

  tags = {
    Name = "${var.project_name}-image-processing"
  }
}

resource "aws_sqs_queue_policy" "image_processing" {
  queue_url = aws_sqs_queue.image_processing.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "sns.amazonaws.com"
        }

        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.image_processing.arn

        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.image_processing.arn
          }
        }
      }
    ]
  })
}

resource "aws_sns_topic_subscription" "image_processing" {
  topic_arn = aws_sns_topic.image_processing.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.image_processing.arn
}