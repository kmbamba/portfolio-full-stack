# 🚀 Pipeline DevOps Complet — Jenkins + SonarQube + Docker + Kubernetes

## 📋 Table des matières
1. [Architecture globale](#architecture-globale)
2. [Prérequis](#prérequis)
3. [Infrastructure Docker](#infrastructure-docker)
4. [Jenkins](#jenkins)
5. [SonarQube](#sonarqube)
6. [Docker Hub](#docker-hub)
7. [Kubernetes (Minikube)](#kubernetes-minikube)
8. [Pipeline Jenkins (Jenkinsfile)](#pipeline-jenkins)
9. [Webhook GitHub](#webhook-github)
10. [Notifications Email](#notifications-email)
11. [Workflow complet](#workflow-complet)
12. [Commandes utiles](#commandes-utiles)
13. [Reproduire pour un autre projet](#reproduire-pour-un-autre-projet)

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
Kubernetes Deploy (Minikube)
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
| MongoDB Atlas | Base de données cloud | - |
| ngrok | Exposition Jenkins publique | - |

---

## ✅ Prérequis

- WSL2 (Ubuntu) installé
- Docker installé dans WSL2
- Minikube installé dans WSL2
- Compte GitHub
- Compte Docker Hub
- Compte MongoDB Atlas
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
- Git
- Pipeline
- NodeJS
- SonarQube Scanner
- Kubernetes CLI
- Email Extension

### Credentials à configurer
**Manage Jenkins → Credentials → Add**

| ID | Type | Valeur |
|----|------|--------|
| `dockerhub-credentials` | Username/Password | Docker Hub login |
| `k8s-token` | Secret text | Token ServiceAccount K8s |
| `mongo-test-uri` | Secret text | MongoDB Atlas URI |

### Configuration SonarQube dans Jenkins
**Manage Jenkins → System → SonarQube servers**

| Champ | Valeur |
|-------|--------|
| Name | `sonarqube` |
| URL | `http://sonarqube:9000` |
| Token | Token généré dans SonarQube |

### Tools à configurer
**Manage Jenkins → Tools**
- NodeJS → `nodejs`
- SonarQube Scanner → `sonarqube-scanner`

---

## 🔍 SonarQube

### Webhook SonarQube → Jenkins
**Administration → Configuration → Webhooks → Create**

| Champ | Valeur |
|-------|--------|
| Name | Jenkins |
| URL | `http://jenkins:8080/sonarqube-webhook/` |

> ⚠️ Utiliser le nom du conteneur et le port interne (8080, pas 8082)

### Fichier `sonar-project.properties`
```properties
sonar.projectKey=mon-projet
sonar.projectName=Mon Projet
sonar.projectVersion=1.0
sonar.host.url=http://sonarqube:9000
sonar.sources=backend_react
sonar.exclusions=**/node_modules/**,**/dist/**,**/.git/**,**/coverage/**
sonar.javascript.lcov.reportPaths=backend_react/coverage/lcov.info
sonar.working.directory=.scannerwork
```

---

## 🐋 Docker Hub

### Structure des images
```
khadim12/portfolio-frontend:latest
khadim12/portfolio-backend:latest
```

### Build et Push manuel (si besoin)
```bash
docker build -t khadim12/mon-projet-frontend:latest ./frontend
docker build -t khadim12/mon-projet-backend:latest ./backend
docker push khadim12/mon-projet-frontend:latest
docker push khadim12/mon-projet-backend:latest
```

---

## ☸️ Kubernetes (Minikube)

### Démarrer Minikube
```bash
minikube start --driver=docker
minikube addons enable ingress
```

### Structure des fichiers K8s
```
k8s/
├── 00-namespace.yaml          # Namespace dédié
├── 01-configmap.yaml          # Variables d'environnement
├── 02-secret.yaml             # Secrets (gitignored)
├── 03-backend-deployment.yaml # Déploiement backend
├── 04-frontend-deployment.yaml# Déploiement frontend
├── 05-mongo-statefulset.yaml  # MongoDB StatefulSet
├── 06-ingress.yaml            # Ingress nginx
└── 07-jenkins-sa.yaml         # ServiceAccount Jenkins
```

### ServiceAccount Jenkins (authentification sans kubeconfig)
```yaml
# 07-jenkins-sa.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: jenkins-deployer
  namespace: mon-namespace
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: jenkins-deployer-role
rules:
- apiGroups: ["", "apps", "networking.k8s.io"]
  resources: ["namespaces", "deployments", "services", "pods",
              "ingresses", "secrets", "configmaps", "statefulsets"]
  verbs: ["get", "list", "create", "update", "patch", "apply", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: jenkins-deployer-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: jenkins-deployer-role
subjects:
- kind: ServiceAccount
  name: jenkins-deployer
  namespace: mon-namespace
---
apiVersion: v1
kind: Secret
metadata:
  name: jenkins-deployer-token
  namespace: mon-namespace
  annotations:
    kubernetes.io/service-account.name: jenkins-deployer
type: kubernetes.io/service-account-token
```

### Récupérer le token K8s pour Jenkins
```bash
kubectl apply -f k8s/07-jenkins-sa.yaml
kubectl get secret jenkins-deployer-token -n mon-namespace \
  -o jsonpath='{.data.token}' | base64 -d
```
→ Copiez ce token dans Jenkins Credentials (`k8s-token`)

### Accéder à l'application en local
```bash
# Terminal 1
kubectl port-forward -n mon-namespace service/frontend-service 8080:80 --address=0.0.0.0

# Terminal 2
kubectl port-forward -n mon-namespace service/backend-service 5001:5001 --address=0.0.0.0
```

---

## 📄 Pipeline Jenkins (Jenkinsfile)

```groovy
pipeline {
    agent any

    tools {
        nodejs 'nodejs'
    }

    stages {

        stage('Clone') {
            steps {
                echo 'Clonage du repo...'
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
                echo 'Build image Frontend...'
                dir('frontend_react') {
                    sh 'docker build --no-cache -t MON_DOCKERHUB/mon-frontend:latest .'
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Build image Backend...'
                dir('backend_react') {
                    sh 'docker build --no-cache -t MON_DOCKERHUB/mon-backend:latest .'
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
                    sh 'docker push MON_DOCKERHUB/mon-frontend:latest'
                    sh 'docker push MON_DOCKERHUB/mon-backend:latest'
                }
            }
        }

        stage('Deploy to K8s') {
            environment {
                K8S_TOKEN = credentials('k8s-token')
                K8S_URL = 'https://192.168.49.2:8443'
                MONGO_URI = credentials('mongo-test-uri')
            }
            steps {
                echo 'Déploiement sur Kubernetes...'
                sh '''
                    kubectl apply -f k8s/00-namespace.yaml \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl apply -f k8s/01-configmap.yaml \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl create secret generic backend-secret \
                      --from-literal=MONGO_URI="$MONGO_URI" \
                      --namespace=mon-namespace \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true \
                      --dry-run=client -o yaml | kubectl apply -f - \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl apply -f k8s/03-backend-deployment.yaml \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl apply -f k8s/04-frontend-deployment.yaml \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl apply -f k8s/05-mongo-statefulset.yaml \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl apply -f k8s/06-ingress.yaml \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl rollout status deployment/frontend-deployment -n mon-namespace \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl rollout status deployment/backend-deployment -n mon-namespace \
                      --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline terminé avec succès !'
            mail(
                to: 'votre-email@gmail.com',
                subject: "✅ [Jenkins] Build #${env.BUILD_NUMBER} — Succès",
                body: """
Bonjour,

Votre pipeline s'est terminé avec succès !

Job     : ${env.JOB_NAME}
Build   : #${env.BUILD_NUMBER}
Durée   : ${currentBuild.durationString}
Logs    : ${env.BUILD_URL}
                """
            )
        }
        failure {
            echo '❌ Pipeline échoué !'
            mail(
                to: 'votre-email@gmail.com',
                subject: "❌ [Jenkins] Build #${env.BUILD_NUMBER} — Échec",
                body: """
Bonjour,

Votre pipeline a échoué. Merci de vérifier les logs.

Job     : ${env.JOB_NAME}
Build   : #${env.BUILD_NUMBER}
Logs    : ${env.BUILD_URL}
                """
            )
        }
    }
}
```

---

## 🔔 Webhook GitHub

### Prérequis — Exposer Jenkins avec ngrok
```powershell
# Dans PowerShell Windows
cd C:\Users\hp\Downloads\ngrok-v3-stable-windows-amd64
.\ngrok.exe http 8082
```
→ Récupérez l'URL publique : `https://abc123.ngrok.io`

### Configurer dans GitHub
**Repo → Settings → Webhooks → Add webhook**

| Champ | Valeur |
|-------|--------|
| Payload URL | `https://abc123.ngrok.io/github-webhook/` |
| Content type | `application/json` |
| Events | Just the push event |

### Configurer dans Jenkins
**pipeline → Configure → Build Triggers**
✅ **GitHub hook trigger for GITScm polling**

---

## 📧 Notifications Email

### Configuration Gmail
1. **Google Account → Sécurité → Validation en 2 étapes → Mots de passe des applications**
2. Générez un mot de passe pour "Jenkins"

### Configuration Jenkins
**Manage Jenkins → System → E-mail Notification**

| Champ | Valeur |
|-------|--------|
| SMTP server | `smtp.gmail.com` |
| Port | `465` |
| Use SSL | ✅ |
| Username | `votre-email@gmail.com` |
| Password | mot de passe application |

---

## 🔄 Workflow complet

```
1. git push origin main
        ↓
2. GitHub → webhook → ngrok → Jenkins
        ↓
3. Jenkins clone le repo
        ↓
4. SonarQube analyse le code
        ↓
5. Quality Gate vérifie les seuils
        ↓
6. Docker build --no-cache les images
        ↓
7. Docker push vers Docker Hub
        ↓
8. kubectl apply -f k8s/ (via ServiceAccount token)
        ↓
9. kubectl rollout status (vérification)
        ↓
10. Email envoyé (succès ou échec)
```

---

## 🛠️ Commandes utiles

### Kubernetes
```bash
# État des pods
kubectl get pods -n mon-namespace

# Logs d'un pod
kubectl logs -n mon-namespace deployment/backend-deployment

# Redémarrer un déploiement
kubectl rollout restart deployment/frontend-deployment -n mon-namespace

# Forcer le repull d'une image
kubectl patch deployment frontend-deployment -n mon-namespace \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","imagePullPolicy":"Always"}]}}}}'

# Accès à l'application
kubectl port-forward -n mon-namespace service/frontend-service 8080:80 --address=0.0.0.0
kubectl port-forward -n mon-namespace service/backend-service 5001:5001 --address=0.0.0.0

# Tuer tous les port-forwards
pkill -f "kubectl port-forward"
```

### Docker
```bash
# Voir les conteneurs
docker ps

# Logs Jenkins
docker logs -f jenkins

# Logs SonarQube
docker logs -f sonarqube
```

### Git
```bash
# Configurer SSH
ssh-keygen -t ed25519 -C "votre-email@gmail.com"
cat ~/.ssh/id_ed25519.pub  # Copier dans GitHub Settings → SSH keys
git remote set-url origin git@github.com:USERNAME/REPO.git
```

---

## 🔁 Reproduire pour un autre projet

### Checklist étape par étape

#### 1. Préparer le projet
- [ ] Créer le repo GitHub
- [ ] Configurer SSH (`ssh-keygen`)
- [ ] Créer `sonar-project.properties`
- [ ] Créer `Jenkinsfile`
- [ ] Créer les fichiers `k8s/*.yaml`
- [ ] Mettre à jour `.gitignore` (exclure `.env`, `k8s/02-secret.yaml`, `.kube/`)

#### 2. Configurer Jenkins
- [ ] Créer les credentials (`dockerhub-credentials`, `k8s-token`, `mongo-uri`)
- [ ] Configurer SonarQube server
- [ ] Configurer SMTP email
- [ ] Créer le pipeline (pointer vers GitHub)
- [ ] Activer "GitHub hook trigger"

#### 3. Configurer SonarQube
- [ ] Créer le webhook → `http://jenkins:8080/sonarqube-webhook/`
- [ ] Générer un token pour Jenkins

#### 4. Configurer Kubernetes
- [ ] Appliquer `07-jenkins-sa.yaml`
- [ ] Récupérer le token → ajouter dans Jenkins credentials
- [ ] Vérifier l'IP Minikube (`minikube ip`)

#### 5. Configurer GitHub Webhook
- [ ] Lancer ngrok → `.\ngrok.exe http 8082`
- [ ] Ajouter le webhook dans GitHub

#### 6. Tester
- [ ] `git push` → pipeline se déclenche automatiquement
- [ ] Email reçu après le build
- [ ] Application accessible via port-forward

---

## ⚠️ Points importants à retenir

- **Ports internes Docker** : Jenkins=`8080`, SonarQube=`9000` (pas les ports exposés)
- **Ne jamais pusher** : `.env`, `kubeconfig`, `k8s/02-secret.yaml`
- **IP Minikube** change si vous redémarrez → mettre à jour `K8S_URL` dans Jenkinsfile
- **IP WSL** change à chaque redémarrage Windows → mettre à jour l'URL API frontend
- **ngrok URL** change à chaque lancement → mettre à jour le webhook GitHub
- **`--no-cache`** dans Docker build pour forcer la prise en compte des changements
- **`imagePullPolicy: Always`** dans K8s pour forcer le repull des images

---

## 🗺️ Prochaine étape — Terraform + AWS EKS

```
Terraform
    ↓
AWS EKS (vrai cluster Kubernetes)
    ↓
AWS Load Balancer (IP publique fixe)
    ↓
Route53 (vrai domaine)
    ↓
cert-manager (SSL/TLS)
    ↓
https://mon-portfolio.com ✅
```

Cela résoudra tous les problèmes actuels :
- ✅ Plus d'IP qui change
- ✅ Plus de ngrok
- ✅ Plus de port-forward
- ✅ Accessible depuis n'importe où