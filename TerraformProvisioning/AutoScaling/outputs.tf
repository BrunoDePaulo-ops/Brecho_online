output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "dashboard_url" {
  value = "https://${data.aws_region.current.region}.console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}