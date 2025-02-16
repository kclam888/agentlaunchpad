provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "copycoder-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

module "eks" {
  source = "terraform-aws-modules/eks/aws"

  cluster_name    = "copycoder-cluster"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    main = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      instance_types = ["t3.medium"]
    }
  }
}

module "rds" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "copycoder-db"

  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.medium"
  allocated_storage = 20

  db_name  = "copycoder"
  username = var.db_username
  password = var.db_password
  port     = "5432"

  vpc_security_group_ids = [aws_security_group.rds.id]
  subnet_ids             = module.vpc.private_subnets

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
}

module "redis" {
  source = "terraform-aws-modules/elasticache/aws"

  cluster_id           = "copycoder-redis"
  engine              = "redis"
  engine_version      = "6.x"
  node_type           = "cache.t3.micro"
  num_cache_nodes     = 1
  parameter_group_family = "redis6.x"

  subnet_ids = module.vpc.private_subnets
  vpc_id     = module.vpc.vpc_id
}

resource "aws_s3_bucket" "backups" {
  bucket = "copycoder-backups-${var.environment}"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    enabled = true

    expiration {
      days = 90
    }
  }
} 