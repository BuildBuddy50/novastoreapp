// ============================================================
//  Nova Store E2E — Jenkins Declarative Pipeline
//  Runs Playwright tests on a Windows Local Jenkins Agent
// ============================================================

pipeline {

    agent {
        label 'local'
    }

    parameters {
        choice(name: 'ENV',
               choices: ['local', 'dev', 'qa', 'prod'],
               description: 'Target environment')

        choice(name: 'SUITE',
               choices: ['all', 'smoke', 'regression'],
               description: 'Which suite to run')

        choice(name: 'BROWSER',
               choices: ['chromium', 'firefox', 'webkit', 'all'],
               description: 'Browser project')
    }


    environment {
        ENV = "${params.ENV}"
        CI  = "true"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'npm ci'
                bat 'npm run app:install'
            }
        }

        stage('Lint') {
            steps {
                bat 'npm run lint'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {

                    def suiteFlag = ''

                    if (params.SUITE == 'smoke') {
                        suiteFlag = '--grep @smoke'
                    } else if (params.SUITE == 'regression') {
                        suiteFlag = '--grep @regression'
                    }

                    def browserFlag = ''

                    if (params.BROWSER != 'all') {
                        browserFlag = "--project=${params.BROWSER}"
                    }

                    bat "npx playwright test ${suiteFlag} ${browserFlag}"
                }
            }
        }
    }

    post {

        always {

            junit allowEmptyResults: true,
                  testResults: 'results/junit.xml'

            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])

            archiveArtifacts(
                artifacts: 'playwright-report/**,results/**,test-results/**',
                allowEmptyArchive: true,
                fingerprint: true
            )
        }

        failure {
            echo 'Tests failed — see the Playwright Report.'
        }

        cleanup {
            cleanWs()
        }
    }
}