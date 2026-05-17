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
        stage('Test') {
            steps {
                echo 'Lancement des tests...'
                dir('backend_react') {
                    sh 'npm install'
                    sh 'npm test || true'
                    sh 'ls -la coverage/ || echo "Dossier coverage absent"'
                }
            }
        }

       stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    script {
                        def scannerHome = tool 'sonarqube-scanner'
                        def nodejsHome = tool 'nodejs'
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.nodejs.executable=${nodejsHome}/bin/node
                         """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline terminé avec succès !'
            mail(
                to:      'kmbamba567@gmail.com',
                subject: "✅ [Jenkins] Build #${env.BUILD_NUMBER} — Succès",
                body:    """
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
                to:      'kmbamba567@gmail.com',
                subject: "❌ [Jenkins] Build #${env.BUILD_NUMBER} — Échec",
                body:    """
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