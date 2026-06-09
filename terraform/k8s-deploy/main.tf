#Provider Kubernetes
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "minikube"
}

# Namespace
resource "kubernetes_namespace" "portfolio" {
  metadata {
    name = "portfolio"
    labels = {
      environment = "production"
      project     = "portfolio-fullstack"
    }
  }
}

# ConfigMap
resource "kubernetes_config_map" "backend" {
  metadata {
    name      = "backend-config"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  data = {
    PORT     = "5001"
    NODE_ENV = "production"
  }
}

# Secret MongoDB
resource "kubernetes_secret" "backend" {
  metadata {
    name      = "backend-secret"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  data = {
    MONGO_URI = var.mongo_uri
  }
}

# Deployment Backend
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend-deployment"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        container {
          name  = "backend"
          image = "khadim12/portfolio-backend:latest"

          port {
            container_port = 5001
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.backend.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.backend.metadata[0].name
            }
          }
        }
      }
    }
  }
}

# Service Backend
resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend-service"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    selector = {
      app = "backend"
    }

    port {
      port        = 5001
      target_port = 5001
    }

    type = "ClusterIP"
  }
}

# Deployment Frontend
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend-deployment"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        container {
          name  = "frontend"
          image = "khadim12/portfolio-frontend:latest"

          port {
            container_port = 80
          }
        }
      }
    }
  }
}

# Service Frontend
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend-service"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      port        = 80
      target_port = 80
    }

    type = "ClusterIP"
  }
}
