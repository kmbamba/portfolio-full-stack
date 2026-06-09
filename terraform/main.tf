# Concept : Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Concept : Data Source
# Récupère les AZ disponibles dans la région
data "aws_availability_zones" "available" {
  state = "available"
}

# Concept : Data Source
# Récupère la dernière AMI Amazon Linux 2
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Concept : Module VPC
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = "10.0.0.0/16"
  public_subnet_cidr = "10.0.1.0/24"
  availability_zone  = data.aws_availability_zones.available.names[0]
}

# Concept : Module EC2
module "ec2" {
  source = "./modules/ec2"

  project_name  = var.project_name
  environment   = var.environment
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.subnet_id
  instance_type = var.instance_type
  ami_id        = data.aws_ami.amazon_linux.id
}
