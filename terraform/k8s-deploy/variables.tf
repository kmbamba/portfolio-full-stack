variable "mongo_uri" {
  description = "MongoDB Atlas URI"
  type        = string
  sensitive   = true
}
variable "k8s_token" {
  description = "Kubernetes ServiceAccount Token"
  type        = string
  sensitive   = true
}
