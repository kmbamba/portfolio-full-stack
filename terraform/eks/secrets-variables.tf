variable "mongo_uri" {
  description = "URI MongoDB Atlas (jamais commitée — via terraform.tfvars ou TF_VAR_mongo_uri)"
  type        = string
  sensitive   = true
}

variable "smtp_password" {
  description = "Mot de passe application Gmail pour AlertManager (jamais commité)"
  type        = string
  sensitive   = true
}
