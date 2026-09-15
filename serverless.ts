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
      noPrependStageInUrl: true,
    },
    dotenv: {
      path: '.env',
    },
  },
};

module.exports = serverlessConfiguration;