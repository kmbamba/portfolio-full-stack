# ============================================================
# Providers Kubernetes + Helm — connectés au cluster EKS créé
# ci-dessus. Permet à Terraform de gérer aussi l'Ingress
# Controller et la stack monitoring, et donc de les détruire
# proprement (LoadBalancers AWS) AVANT de supprimer le VPC.
# ============================================================

data "aws_eks_cluster_auth" "main" {
  name = aws_eks_cluster.main.name
}

provider "kubernetes" {
  host                   = aws_eks_cluster.main.endpoint
  cluster_ca_certificate  = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
  token                   = data.aws_eks_cluster_auth.main.token
}

provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.main.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.main.token
  }
}

# ------------------------------------------------------------
# Ingress Controller (nginx) — crée 1 seul Load Balancer public
# pour router / vers le frontend et /api vers le backend
# ------------------------------------------------------------
resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true
  version          = "4.10.0"

  depends_on = [aws_eks_node_group.main]
}

# ------------------------------------------------------------
# Monitoring — Prometheus + Grafana + AlertManager
# ------------------------------------------------------------
resource "helm_release" "monitoring" {
  name             = "monitoring"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = "monitoring"
  create_namespace = true

  values = [file("${path.module}/../../monitoring/values.yaml")]

  depends_on = [aws_eks_node_group.main]
}
