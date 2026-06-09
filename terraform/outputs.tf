output "region" {
  description = "Region AWS utilisée"
  value       = var.region
}

output "project_name" {
  description = "Nom du projet"
  value       = var.project_name
}

output "environment" {
  description = "Environnement"
  value       = var.environment
}

output "vpc_id" {
  description = "ID du VPC créé"
  value       = module.vpc.vpc_id
}

output "subnet_id" {
  description = "ID du Subnet public"
  value       = module.vpc.subnet_id
}

output "ec2_instance_id" {
  description = "ID de l'instance EC2"
  value       = module.ec2.instance_id
}

output "ec2_public_ip" {
  description = "IP publique de l'EC2"
  value       = module.ec2.public_ip
}
