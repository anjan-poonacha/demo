pipeline {

  environment {
    registry = "10.128.0.8:5000/crvs/auth"
    dockerImage = ""
  }

  agent any

  stages {

    stage('Checkout Source') {
      steps {
        git 'git@github.com:anjan-poonacha/crvs-auth.git'
      }
    }

    stage('Build Image') {
      steps {
        script {
          dockerImage = docker.build registry + ":$BUILD_NUMBER"
          // dockerImage = docker.build registry
        }
      }
    }

    stage('Push Image') {
      steps {
        script {
          docker.withRegistry( "" ) {
            dockerImage.push()
          }
        }
      }
    }

    stage('Deploy App') {
      steps {
        script {
          kubernetesDeploy(configs: "kube.yml", kubeconfigId:"mykubeconfig")
        }
      }
    }

  }
}