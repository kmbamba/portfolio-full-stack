# ============================================================
# Déploiement complet de l'application via Terraform
# Plus aucune commande kubectl manuelle après "terraform apply"
# ============================================================

resource "kubernetes_namespace" "portfolio" {
  metadata {
    name = "portfolio"
  }
  depends_on = [aws_eks_node_group.main]
}

resource "kubernetes_secret" "backend_secret" {
  metadata {
    name      = "backend-secret"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }
  data = {
    MONGO_URI = var.mongo_uri
  }
  type = "Opaque"
}

resource "kubernetes_secret" "alertmanager_smtp" {
  metadata {
    name      = "alertmanager-smtp"
    namespace = "monitoring"
  }
  data = {
    password = var.smtp_password
  }
  type = "Opaque"

  depends_on = [helm_release.monitoring]
}

# Applique tous les manifests k8s/*.yaml (Deployments, Services,
# ServiceMonitors, PrometheusRule, AlertmanagerConfig, Dashboards...)
# Ne crée aucun Load Balancer supplémentaire (l'Ingress réutilise
# celui déjà créé par helm_release.ingress_nginx), donc ne bloque
# jamais "terraform destroy".
resource "null_resource" "deploy_app" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = "aws eks update-kubeconfig --region ${var.region} --name ${aws_eks_cluster.main.name} && kubectl apply -f ${path.module}/../../k8s/"
  }

  depends_on = [
    kubernetes_namespace.portfolio,
    kubernetes_secret.backend_secret,
    kubernetes_secret.alertmanager_smtp,
    helm_release.ingress_nginx,
    helm_release.monitoring,
  ]
}
