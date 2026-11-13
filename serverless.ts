import type { AWS } from '@serverless/typescript';
import functions from './src/functions';

const serverlessConfiguration: AWS = {
  service: 'soat15-serverless',
  frameworkVersion: '3',

  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dotenv-plugin'],

  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'us-east-1',
    environment: {
      DB_HOST: '${env:DB_HOST}',
      DB_PORT: '${env:DB_PORT}',
      DB_NAME: '${env:DB_NAME}',
      DB_USER: '${env:DB_USER}',
      DB_PASSWORD: '${env:DB_PASSWORD}',
      JWT_SECRET: '${env:JWT_SECRET}',
      CLIENT_ID: '${env:CLIENT_ID}',
      CLIENT_SECRET: '${env:CLIENT_SECRET}',
    },
  },
  functions,
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      target: 'node20',
    },
    'serverless-offline': {
      httpPort: 3001,
      host: '0.0.0.0',
      localEnvironment: true,
      noPrependStageInUrl: true,
    },
    dotenv: {
      path: '.env',
    },
  },
};

module.exports = serverlessConfiguration;