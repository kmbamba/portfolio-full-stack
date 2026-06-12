# 🚀 Pipeline DevOps Complet — Jenkins + SonarQube + Docker + Kubernetes + Terraform + AWS EKS

## 📋 Table des matières
1. [Architecture globale](#architecture-globale)
2. [Prérequis](#prérequis)
3. [Infrastructure Docker](#infrastructure-docker)
4. [Jenkins](#jenkins)
5. [SonarQube](#sonarqube)
6. [Docker Hub](#docker-hub)
7. [Kubernetes (Minikube)](#kubernetes-minikube)
8. [Pipeline Jenkins (Jenkinsfile)](#pipeline-jenkins)
9. [Terraform — Concepts](#terraform--concepts)
10. [Terraform — VPC + EC2](#terraform--vpc--ec2)
11. [Terraform — K8s Deploy (Minikube)](#terraform--k8s-deploy-minikube)
12. [Terraform — EKS (AWS)](#terraform--eks-aws)
13. [Webhook GitHub](#webhook-github)
14. [Notifications Email](#notifications-email)
15. [Workflow complet](#workflow-complet)
16. [Commandes utiles](#commandes-utiles)
17. [Checklist redémarrage](#checklist-redémarrage)

---

## 🏗️ Architecture globale

```
GitHub Push
    ↓ (webhook)
Jenkins (port 8082)
    ↓
SonarQube Analysis + Quality Gate (port 9001)
    ↓
Docker Build & Push (Docker Hub)
    ↓
Terraform K8s Deploy (Minikube local)
    ↓
Email Notification
```

### Stack technique
| Outil | Rôle | Port |
|-------|------|------|
| Jenkins | CI/CD | 8082 |
| SonarQube | Qualité du code | 9001 |
| Docker | Build & Registry | - |
| Minikube | Kubernetes local | - |
| Terraform | Infrastructure as Code | - |
| AWS EKS | Kubernetes cloud | - |
| MongoDB Atlas | Base de données cloud | - |

---

## ✅ Prérequis

- WSL2 (Ubuntu) installé
- Docker installé dans WSL2
- Minikube installé dans WSL2
- Terraform installé dans WSL2
- AWS CLI installé et configuré
- Compte GitHub
- Compte Docker Hub
- Compte MongoDB Atlas
- Compte AWS (Free Tier)
- Compte ngrok

---

## 🐳 Infrastructure Docker

### Réseau Docker dédié
```bash
docker network create devops-network
```

### Lancer Jenkins
```bash
docker run -d \
  --name jenkins \
  --network devops-network \
  -p 8082:8080 \
  -p 50001:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### Lancer SonarQube
```bash
docker run -d \
  --name sonarqube \
  --network devops-network \
  -p 9001:9000 \
  sonarqube:community
```

> ⚠️ Sur WSL2, ajoutez dans `/etc/sysctl.conf` :
> ```
> vm.max_map_count=524288
> fs.file-max=131072
> ```

---

## ⚙️ Jenkins

### Plugins à installer
- Git, Pipeline, NodeJS, SonarQube Scanner, Email Extension

### Credentials à configurer
| ID | Type | Valeur |
|----|------|--------|
| `dockerhub-credentials` | Username/Password | Docker Hub login |
| `k8s-token` | Secret text | Token ServiceAccount K8s |
| `mongo-test-uri` | Secret text | MongoDB Atlas URI |
| `aws-access-key` | Secret text | AWS Access Key ID |
| `aws-secret-key` | Secret text | AWS Secret Access Key |

### Configuration SonarQube dans Jenkins
**Manage Jenkins → System → SonarQube servers**

| Champ | Valeur |
|-------|--------|
| Name | `sonarqube` |
| URL | `http://sonarqube:9000` |

---

## 🔍 SonarQube

### Webhook SonarQube → Jenkins
**Administration → Configuration → Webhooks → Create**

| Champ | Valeur |
|-------|--------|
| Name | Jenkins |
| URL | `http://jenkins:8080/sonarqube-webhook/` |

### `sonar-project.properties`
```properties
sonar.projectKey=portfolio-full-stack
sonar.projectName=Portfolio Full Stack
sonar.projectVersion=1.0
sonar.host.url=http://sonarqube:9000
sonar.sources=backend_react
sonar.exclusions=**/node_modules/**,**/dist/**,**/.git/**,**/coverage/**
sonar.javascript.lcov.reportPaths=backend_react/coverage/lcov.info
sonar.working.directory=.scannerwork
```

---

## ☸️ Kubernetes (Minikube)

### Démarrer Minikube
```bash
minikube start --driver=docker --memory=2048
minikube addons enable ingress
minikube ssh -- "echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf"
```

### Créer namespace + ServiceAccount (après chaque redémarrage)
```bash
kubectl create namespace portfolio
kubectl apply -f k8s/07-jenkins-sa.yaml

# Récupérer le token pour Jenkins
kubectl get secret jenkins-deployer-token -n portfolio \
  -o jsonpath='{.data.token}' | base64 -d
```

### Accéder à l'application en local
```bash
kubectl port-forward -n portfolio service/frontend-service 8080:80 --address=0.0.0.0 &
kubectl port-forward -n portfolio service/backend-service 5001:5001 --address=0.0.0.0 &
```

---

## 📄 Pipeline Jenkins (Jenkinsfile)

```groovy
pipeline {
    agent any
    tools { nodejs 'nodejs' }

    stages {
        stage('Clone') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    script {
                        def scannerHome = tool 'sonarqube-scanner'
                        def nodejsHome = tool 'nodejs'
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.nodejs.executable=${nodejsHome}/bin/node"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend_react') {
                    sh 'docker build --no-cache -t khadim12/portfolio-frontend:latest .'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend_react') {
                    sh 'docker build -t khadim12/portfolio-backend:latest .'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push khadim12/portfolio-frontend:latest'
                    sh 'docker push khadim12/portfolio-backend:latest'
                }
            }
        }

        stage('Terraform K8s Deploy') {
            environment {
                MONGO_URI = credentials('mongo-test-uri')
                K8S_TOKEN = credentials('k8s-token')
            }
            steps {
                dir('terraform/k8s-deploy') {
                    sh 'terraform init'
                    sh 'terraform plan -var="mongo_uri=$MONGO_URI" -var="k8s_token=$K8S_TOKEN"'
                    sh 'terraform apply -auto-approve -var="mongo_uri=$MONGO_URI" -var="k8s_token=$K8S_TOKEN"'
                }
            }
        }
    }

    post {
        success {
            mail(
                to: 'kmbamba567@gmail.com',
                subject: "✅ [Jenkins] Build #${env.BUILD_NUMBER} — Succès",
                body: "Pipeline terminé avec succès !\nJob: ${env.JOB_NAME}\nBuild: #${env.BUILD_NUMBER}\nLogs: ${env.BUILD_URL}"
            )
        }
        failure {
            mail(
                to: 'kmbamba567@gmail.com',
                subject: "❌ [Jenkins] Build #${env.BUILD_NUMBER} — Échec",
                body: "Pipeline échoué !\nJob: ${env.JOB_NAME}\nBuild: #${env.BUILD_NUMBER}\nLogs: ${env.BUILD_URL}"
            )
        }
    }
}
```

---

## 🏗️ Terraform — Concepts

| Concept | Rôle | Fichier |
|---------|------|---------|
| **Provider** | Connexion AWS | `main.tf` |
| **Resource** | Crée des ressources | `main.tf` |
| **Module** | Code réutilisable | `modules/` |
| **State** | Mémoire de Terraform | `terraform.tfstate` |
| **Data Source** | Lit des infos existantes | `main.tf` |
| **Variables** | Paramètres | `variables.tf` |
| **Output** | Affiche résultats | `outputs.tf` |

### Commandes essentielles
```bash
terraform init     # Télécharge les providers
terraform plan     # Prévisualise les changements
terraform apply    # Crée l'infrastructure
terraform destroy  # Supprime tout
terraform state list # Liste les ressources
```

---

## 🏗️ Terraform — VPC + EC2

### Structure
```
terraform/
├── main.tf          # Provider + Data Sources + Modules
├── variables.tf     # Variables
├── outputs.tf       # Outputs
└── modules/
    ├── vpc/         # Module VPC
    └── ec2/         # Module EC2
```

### Utilisation
```bash
cd terraform/
terraform init
terraform plan
terraform apply    # Crée VPC + EC2 sur AWS
terraform destroy  # Supprime après présentation
```

### Outputs
```
vpc_id          = "vpc-xxx"
subnet_id       = "subnet-xxx"
ec2_instance_id = "i-xxx"
ec2_public_ip   = "x.x.x.x"
```

---

## 🏗️ Terraform — K8s Deploy (Minikube)

### Rôle
Déploie l'application sur Minikube via le provider Kubernetes Terraform.

### Ce que Terraform crée
```
✅ ConfigMap (variables d'environnement)
✅ Secret (MongoDB URI)
✅ Deployment Backend (x2 pods)
✅ Deployment Frontend (x2 pods)
✅ Service Backend (ClusterIP)
✅ Service Frontend (ClusterIP)
```

### Utilisation manuelle
```bash
cd terraform/k8s-deploy/
terraform init
terraform apply \
  -var="mongo_uri=mongodb+srv://..." \
  -var="k8s_token=eyJ..."
```

### Dans Jenkins (automatique)
```groovy
stage('Terraform K8s Deploy') {
    environment {
        MONGO_URI = credentials('mongo-test-uri')
        K8S_TOKEN = credentials('k8s-token')
    }
    steps {
        dir('terraform/k8s-deploy') {
            sh 'terraform apply -auto-approve \
              -var="mongo_uri=$MONGO_URI" \
              -var="k8s_token=$K8S_TOKEN"'
        }
    }
}
```

### Différence avec kubectl apply
| | kubectl apply | Terraform K8s |
|---|---|---|
| **Commandes** | 7 fichiers séparés | 1 commande |
| **State** | Non | Oui |
| **Plan** | Non | Oui |
| **Destroy** | Manuel | `terraform destroy` |

---

## ☁️ Terraform — EKS (AWS)

### Rôle
Crée un vrai cluster Kubernetes managé sur AWS.

### Structure
```
terraform/eks/
├── main.tf       # EKS Cluster + Node Group + IAM
├── variables.tf  # Variables
└── outputs.tf    # Cluster endpoint + nom
```

### Ce que Terraform crée
```
✅ VPC + 2 Subnets (2 AZ différentes)
✅ Internet Gateway + Route Tables
✅ IAM Role Cluster EKS
✅ IAM Role Node Group
✅ EKS Cluster
✅ Node Group (2x t3.small)
```

### Utilisation
```bash
# Créer le cluster (~15 minutes)
cd terraform/eks/
terraform init
terraform apply -auto-approve

# Configurer kubectl
aws eks update-kubeconfig \
  --region us-east-1 \
  --name portfolio-eks

# Vérifier les nodes
kubectl get nodes

# Déployer l'application
cd ~/portfolio-full-stack
kubectl create namespace portfolio
kubectl create secret generic backend-secret \
  --from-literal=MONGO_URI="mongodb+srv://..." \
  --namespace=portfolio
kubectl apply -f k8s/

# Exposer avec Load Balancer
kubectl patch svc frontend-service -n portfolio \
  -p '{"spec": {"type": "LoadBalancer"}}'
kubectl patch svc backend-service -n portfolio \
  -p '{"spec": {"type": "LoadBalancer"}}'

# Récupérer l'URL publique
kubectl get svc -n portfolio

# ⚠️ APRÈS LA PRÉSENTATION - OBLIGATOIRE
terraform destroy -auto-approve
```

### Outputs
```
cluster_name     = "portfolio-eks"
cluster_endpoint = "https://xxx.gr7.us-east-1.eks.amazonaws.com"
cluster_region   = "us-east-1"
```

### Différence Minikube vs EKS
| | Minikube | EKS AWS |
|---|---|---|
| **Environnement** | Local WSL2 | Cloud AWS |
| **Accès** | port-forward | URL publique Load Balancer |
| **Coût** | Gratuit | ~$1/heure |
| **DNS** | Manuel | Automatique |
| **Usage** | Dev/Demo | Production |

---

## 🔔 Webhook GitHub

### Exposer Jenkins avec ngrok
```powershell
# PowerShell Windows
cd C:\Users\hp\Downloads\ngrok-v3-stable-windows-amd64
.\ngrok.exe http 8082
```

### Configurer dans GitHub
**Repo → Settings → Webhooks → Add webhook**

| Champ | Valeur |
|-------|--------|
| Payload URL | `https://xxx.ngrok.io/github-webhook/` |
| Content type | `application/json` |
| Events | Just the push event |

### Configurer dans Jenkins
**Pipeline → Configure → Build Triggers**
✅ **GitHub hook trigger for GITScm polling**

---

## 📧 Notifications Email

### Configuration Gmail
**Google Account → Sécurité → Mots de passe des applications**

### Configuration Jenkins
**Manage Jenkins → System → E-mail Notification**

| Champ | Valeur |
|-------|--------|
| SMTP server | `smtp.gmail.com` |
| Port | `465` |
| Use SSL | ✅ |

---

## 🔄 Workflow complet

```
git push
    ↓ webhook
Jenkins clone
    ↓
SonarQube analyse
    ↓
Quality Gate ✅
    ↓
Docker build & push
    ↓
Terraform K8s Deploy (Minikube)
    ↓
Email notification
```

---

## 🛠️ Commandes utiles

### Kubernetes
```bash
kubectl get pods -n portfolio
kubectl logs -n portfolio deployment/backend-deployment
kubectl rollout restart deployment/frontend-deployment -n portfolio
kubectl get svc -n portfolio
pkill -f "kubectl port-forward"
```

### Terraform
```bash
terraform init
terraform plan
terraform apply -auto-approve
terraform destroy -auto-approve
terraform state list
terraform output
```

### Docker
```bash
docker ps
docker logs -f jenkins
docker logs -f sonarqube
```

---

## 📋 Checklist redémarrage machine

```bash
# 1. Démarrer Minikube
minikube start --driver=docker --memory=2048
minikube addons enable ingress
minikube ssh -- "echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf"

# 2. Créer namespace + ServiceAccount
kubectl create namespace portfolio
kubectl apply -f k8s/07-jenkins-sa.yaml

# 3. Récupérer le token et mettre à jour Jenkins credentials
kubectl get secret jenkins-deployer-token -n portfolio \
  -o jsonpath='{.data.token}' | base64 -d

# 4. Lancer ngrok (PowerShell Windows)
.\ngrok.exe http 8082

# 5. Mettre à jour webhook GitHub avec nouvelle URL ngrok

# 6. Port-forwards si besoin
kubectl port-forward -n portfolio service/frontend-service 8080:80 --address=0.0.0.0 &
kubectl port-forward -n portfolio service/backend-service 5001:5001 --address=0.0.0.0 &
```

---

## ⚠️ Points importants

- **Ports internes Docker** : Jenkins=`8080`, SonarQube=`9000`
- **Ne jamais pusher** : `.env`, `*.tfstate`, `k8s/02-secret.yaml`, `.kube/`
- **Token K8s** expire après redémarrage → toujours mettre à jour Jenkins credentials
- **EKS** → `terraform destroy` obligatoire après présentation (~$1/heure)
- **ngrok URL** change à chaque lancement → mettre à jour webhook GitHub
- **`--no-cache`** dans Docker build pour forcer la prise en compte des changements
- **Namespace portfolio** doit être créé manuellement avant le pipeline Terraform


# 1. Recréer EKS (~15 min)
cd ~/portfolio-full-stack/terraform/eks
terraform apply -auto-approve

# 2. Configurer kubectl
aws eks update-kubeconfig --region us-east-1 --name portfolio-eks

# 3. Installer Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# Attendre
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# 4. Déployer l'app
cd ~/portfolio-full-stack
kubectl create namespace portfolio
kubectl create secret generic backend-secret \
  --from-literal=MONGO_URI="mongodb+srv://Bamba:MOT_DE_PASSE@cluster0.topbtjf.mongodb.net/portfolio_db" \
  --namespace=portfolio
kubectl apply -f k8s/

# 5. Récupérer l'URL
kubectl get svc -n ingress-nginx

# 6. Tester
curl http://URL_ELB/api/projects