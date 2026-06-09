# Concept : Variables
# Permettent de paramétrer le code Terraform

variable "region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "portfolio"
}

variable "environment" {
  description = "Environnement"
  type        = string
  default     = "dev"
}

variable "instance_type" {
  description = "Type instance EC2"
  type        = string
  default     = "t3.micro"
}
