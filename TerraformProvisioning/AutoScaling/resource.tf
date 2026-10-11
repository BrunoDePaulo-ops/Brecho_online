data "aws_region" "current" {}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# ---------- Launch Template ----------
resource "aws_launch_template" "backend" {
  name_prefix   = "${var.project_name}-backend-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  key_name      = "vockey"

  iam_instance_profile {
    name = "LabInstanceProfile"
  }

  # Métricas de 1 minuto (necessário para alarmes com period = 60)
  monitoring {
    enabled = true
  }

  # IP público é necessário: suas subnets são públicas e não há NAT
  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [var.backend_security_group_id]
  }

  user_data = base64encode(var.user_data)

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-backend"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ---------- ALB ----------
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids # precisa de 2+ AZs
}

resource "aws_lb_target_group" "backend" {
  name                 = "${var.project_name}-tg"
  port                 = var.app_port
  protocol             = "HTTP"
  vpc_id               = var.vpc_id
  deregistration_delay = 30

  health_check {
    path                = "/health/"
    matcher             = "200"
    interval            = 30
    timeout             = 15
    healthy_threshold   = 2
    unhealthy_threshold = 5
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ---------- Auto Scaling Group ----------
resource "aws_autoscaling_group" "backend" {
  name                      = "${var.project_name}-backend-asg"
  min_size                  = 1
  max_size                  = 3
  desired_capacity          = 1
  vpc_zone_identifier       = var.public_subnet_ids
  target_group_arns         = [aws_lb_target_group.backend.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.backend.id
    version = aws_launch_template.backend.latest_version
  }

  instance_refresh {
    strategy = "Rolling"
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-backend"
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [desired_capacity] # o ASG controla esse valor
  }

  metrics_granularity = "1Minute"
  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances",
  ]
}

# ---------- Políticas e alarmes ----------
resource "aws_autoscaling_policy" "scale_out" {
  name                   = "${var.project_name}-scale-out"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = 1
  cooldown               = 120
}

resource "aws_autoscaling_policy" "scale_in" {
  name                   = "${var.project_name}-scale-in"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = -1
  cooldown               = 120
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.project_name}-cpu-high"
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 60
  evaluation_periods  = 2 # 2 amostras de 1 min = "mais de um minuto"
  threshold           = 70
  comparison_operator = "GreaterThanThreshold"
  dimensions          = { AutoScalingGroupName = aws_autoscaling_group.backend.name }
  alarm_actions       = [aws_autoscaling_policy.scale_out.arn]
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "${var.project_name}-cpu-low"
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 60
  evaluation_periods  = 2
  threshold           = 25
  comparison_operator = "LessThanThreshold"
  dimensions          = { AutoScalingGroupName = aws_autoscaling_group.backend.name }
  alarm_actions       = [aws_autoscaling_policy.scale_in.arn]
}


resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-elasticidade"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric", x = 0, y = 0, width = 12, height = 6
        properties = {
          title  = "CPU média do ASG (limiares 70% / 25%)"
          region = data.aws_region.current.region
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", aws_autoscaling_group.backend.name]
          ]
          annotations = {
            horizontal = [
              { label = "Scale-out", value = 70 },
              { label = "Scale-in", value = 25 }
            ]
          }
          yAxis = { left = { min = 0, max = 100 } }
        }
      },
      {
        type = "metric", x = 12, y = 0, width = 12, height = 6
        properties = {
          title  = "Instâncias do ASG"
          region = data.aws_region.current.region
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          metrics = [
            ["AWS/AutoScaling", "GroupInServiceInstances", "AutoScalingGroupName", aws_autoscaling_group.backend.name, { label = "InService" }],
            [".", "GroupDesiredCapacity", ".", ".", { label = "Desejado" }]
          ]
          yAxis = { left = { min = 0, max = 4 } }
        }
      },
      {
        type = "metric", x = 0, y = 6, width = 12, height = 6
        properties = {
          title  = "Requisições por instância (balanceamento)"
          region = data.aws_region.current.region
          period = 60
          stat   = "Sum"
          view   = "timeSeries"
          metrics = [
            ["AWS/ApplicationELB", "RequestCountPerTarget",
              "TargetGroup", aws_lb_target_group.backend.arn_suffix,
            "LoadBalancer", aws_lb.main.arn_suffix]
          ]
        }
      },
      {
        type = "metric", x = 12, y = 6, width = 12, height = 6
        properties = {
          title  = "Targets saudáveis x não saudáveis"
          region = data.aws_region.current.region
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          metrics = [
            ["AWS/ApplicationELB", "HealthyHostCount",
              "TargetGroup", aws_lb_target_group.backend.arn_suffix,
            "LoadBalancer", aws_lb.main.arn_suffix, { label = "Healthy" }],
            [".", "UnHealthyHostCount", ".", ".", ".", ".", { label = "Unhealthy" }]
          ]
        }
      },
      {
        type = "metric", x = 0, y = 12, width = 12, height = 6
        properties = {
          title  = "Tempo de resposta (s)"
          region = data.aws_region.current.region
          period = 60
          view   = "timeSeries"
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Average", label = "Média" }],
            ["...", { stat = "p95", label = "p95" }]
          ]
        }
      },
      {
        type = "metric", x = 12, y = 12, width = 12, height = 6
        properties = {
          title  = "Erros 5XX e total de requisições"
          region = data.aws_region.current.region
          period = 60
          stat   = "Sum"
          view   = "timeSeries"
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", aws_lb.main.arn_suffix, { label = "5XX do backend" }],
            [".", "HTTPCode_ELB_5XX_Count", ".", ".", { label = "5XX do ALB" }],
            [".", "RequestCount", ".", ".", { label = "Total de requisições" }]
          ]
        }
      },
      {
        type = "alarm", x = 0, y = 18, width = 24, height = 3
        properties = {
          title = "Estado dos alarmes"
          alarms = [
            aws_cloudwatch_metric_alarm.cpu_high.arn,
            aws_cloudwatch_metric_alarm.cpu_low.arn
          ]
        }
      }
    ]
  })
}