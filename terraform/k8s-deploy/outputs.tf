output "namespace" {
  description = "Namespace Kubernetes"
  value       = kubernetes_namespace.portfolio.metadata[0].name
}

output "backend_service" {
  description = "Service Backend"
  value       = kubernetes_service.backend.metadata[0].name
}

output "frontend_service" {
  description = "Service Frontend"
  value       = kubernetes_service.frontend.metadata[0].name
}
