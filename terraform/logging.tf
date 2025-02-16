resource "aws_cloudwatch_log_group" "copycoder" {
  name              = "/copycoder/app"
  retention_in_days = 30

  tags = {
    Environment = var.environment
    Application = "copycoder"
  }
}

resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "error-count"
  pattern        = "[timestamp, level=ERROR, ...]"
  log_group_name = aws_cloudwatch_log_group.copycoder.name

  metric_transformation {
    name          = "ErrorCount"
    namespace     = "CopyCoder/Logs"
    value         = "1"
    default_value = "0"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "copycoder-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "CopyCoder/Logs"
  period             = "300"
  statistic          = "Sum"
  threshold          = "10"
  alarm_description  = "High error rate in application logs"
  alarm_actions      = [aws_sns_topic.alerts.arn]
} 