// ============================================================
//  Nova Store E2E - Jenkins Declarative Pipeline
//  Windows agent. Tests a DEPLOYED application; nothing is
//  built or served locally.
//
//  Uses only core pipeline steps (junit, archiveArtifacts) so it
//  runs on a stock Jenkins with no extra plugins installed.
// ============================================================

pipeline {

    agent {
        label 'local'
    }

    parameters {
        choice(name: 'ENV',
               choices: ['prod', 'qa'],
               description: 'Target environment (see src/utils/env.ts)')

        choice(name: 'SUITE',
               choices: ['all', 'smoke', 'regression'],
               description: 'Which suite to run')

        choice(name: 'BROWSER',
               choices: ['chromium', 'firefox', 'webkit', 'all'],
               description: 'Browser project')

        string(name: 'BASE_URL',
               defaultValue: '',
               description: 'Optional. Overrides the app URL. Must end with /')

        string(name: 'API_URL',
               defaultValue: '',
               description: 'Optional. Overrides the API URL. No trailing /')
    }

    options {
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    environment {
        ENV = "${params.ENV}"
        CI  = "true"
        BASE_URL = "${params.BASE_URL}"
        API_URL  = "${params.API_URL}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Install Browsers') {
            steps {
                script {
                    // Installing every engine is slow; only fetch what is needed.
                    if (params.BROWSER == 'all') {
                        bat 'npx playwright install --with-deps'
                    } else {
                        bat "npx playwright install --with-deps ${params.BROWSER}"
                    }
                }
            }
        }

        stage('Typecheck') {
            steps {
                bat 'npm run typecheck'
            }
        }

        stage('Test') {
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

                    // globalSetup wakes a sleeping backend before the first
                    // test, so no separate warm-up stage is needed here.
                    bat "npx playwright test ${suiteFlag} ${browserFlag}"
                }
            }
        }
    }

    post {

        always {
            junit allowEmptyResults: true,
                  testResults: 'results/junit.xml'

            archiveArtifacts artifacts: 'playwright-report/**,results/**,test-results/**',
                             allowEmptyArchive: true,
                             fingerprint: true

            echo 'HTML report archived. Download playwright-report and open index.html.'
        }

        failure {
            echo "FAILED on ENV=${params.ENV}. Check the archived report and traces."
        }

        cleanup {
            cleanWs()
        }
    }
}
