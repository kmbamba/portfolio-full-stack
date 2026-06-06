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
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.nodejs.executable=${nodejsHome}/bin/node"
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
                    sh 'docker build --no-cache -t khadim12/portfolio-frontend:latest .'
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Build image Backend...'
                dir('backend_react') {
                    sh 'docker build -t khadim12/portfolio-backend:latest .'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Push des images sur Docker Hub...'
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

        stage('Deploy to K8s') {
            environment {
                K8S_TOKEN = credentials('k8s-token')
                K8S_URL = 'https://192.168.49.2:8443'
                MONGO_URI = credentials('mongo-test-uri')
            }
            steps {
                echo 'Déploiement sur Kubernetes...'
                sh '''
                    kubectl apply -f k8s/00-namespace.yaml --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true
                    kubectl apply -f k8s/01-configmap.yaml --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true

                    kubectl create secret generic backend-secret \
                      --from-literal=MONGO_URI="$MONGO_URI" \
                      --namespace=portfolio \
                      --server=$K8S_URL \
                      --token=$K8S_TOKEN \
                      --insecure-skip-tls-verify=true \
                      --dry-run=client -o yaml | kubectl apply -f - \
                      --server=$K8S_URL \
                      --token=$K8S_TOKEN \
                      --insecure-skip-tls-verify=true

                    kubectl apply -f k8s/03-backend-deployment.yaml --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true
                    kubectl apply -f k8s/04-frontend-deployment.yaml --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true
                    kubectl apply -f k8s/05-mongo-statefulset.yaml --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true
                    kubectl apply -f k8s/06-ingress.yaml --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true
                    

                    kubectl rollout status deployment/frontend-deployment -n portfolio --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true
                    kubectl rollout status deployment/backend-deployment -n portfolio --server=$K8S_URL --token=$K8S_TOKEN --insecure-skip-tls-verify=true
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline terminé avec succès !'
        }
        failure {
            echo '❌ Pipeline échoué !'
        }
    }
}