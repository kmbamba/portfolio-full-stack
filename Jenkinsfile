pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                echo 'Clonage du repo...'
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Build image Frontend...'
                dir('frontend_react') {
                    sh 'docker build -t khadim12/portfolio-frontend:latest .'
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

        stage('Deploy') {
            steps {
                echo 'Déploiement...'
                sh 'docker compose up --detach --build'
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