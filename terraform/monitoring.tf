resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "copycoder-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "High CPU utilization"
  alarm_actions      = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = module.eks.cluster_name
    ServiceName = "copycoder"
  }
}

resource "aws_cloudwatch_metric_alarm" "backup_age" {
  alarm_name          = "copycoder-backup-age"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BackupAge"
  namespace           = "CopyCoder/Backups"
  period             = "86400"  # 1 day
  statistic          = "Maximum"
  threshold          = "172800" # 2 days
  alarm_description  = "No recent backup detected"
  alarm_actions      = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "backup_size" {
  alarm_name          = "copycoder-backup-size"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BackupSize"
  namespace           = "CopyCoder/Backups"
  period             = "3600"
  statistic          = "Maximum"
  threshold          = "10737418240" # 10GB
  alarm_description  = "Backup size exceeds threshold"
  alarm_actions      = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "CopyCoder"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "copycoder"],
            ["AWS/ECS", "MemoryUtilization", "ServiceName", "copycoder"]
          ]
          period = 300
          region = var.aws_region
          title  = "Container Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", module.rds.db_instance_id],
            ["AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", module.rds.db_instance_id]
          ]
          period = 300
          region = var.aws_region
          title  = "Database Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["CopyCoder/Backups", "BackupAge"],
            ["CopyCoder/Backups", "BackupSize"]
          ]
          period = 3600
          region = var.aws_region
          title  = "Backup Metrics"
        }
      }
    ]
  })
} 