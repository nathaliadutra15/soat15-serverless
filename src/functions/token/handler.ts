import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse } from '@libs/api-gateway';
import * as jwt from 'jsonwebtoken';


type TokenRequest = {
  clientId: string;
  clientSecret: string;
};

type TokenResponse = {
  accessToken: string;
  expiresIn: number;
};

const EXPIRES_IN_SECONDS = 3600;

const hasTokenRequestShape = (value: unknown): value is TokenRequest => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const body = value as Record<string, unknown>;
  return (
    typeof body.clientId === 'string' &&
    typeof body.clientSecret === 'string'
  );
};

const parseHeader = (event: APIGatewayProxyEvent): unknown => {
  const authorizationHeader = event.headers['Authorization'] ?? event.headers['authorization'] ?? '';
  const encodedCredentials = authorizationHeader.replace(/^Basic\s+/i, '');
const decoded = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
const [clientId, clientSecret] = decoded.split(':');
  
  return {
    clientId,
    clientSecret,
  };
};

const buildToken = (clientId: string): TokenResponse => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload = {
    sub: 'service',
    roles: ['ADMIN'],
  };

  const accessToken = jwt.sign(payload, secret, { expiresIn: EXPIRES_IN_SECONDS });

  return {
    accessToken,
    expiresIn: EXPIRES_IN_SECONDS,
  };
};

const token = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const credentials = parseHeader(event);

  if (!hasTokenRequestShape(credentials)) {
    return formatJSONResponse({ message: 'Invalid request body' }, 400);
  }

  const expectedClientId = process.env.CLIENT_ID;
  const expectedClientSecret = process.env.CLIENT_SECRET;

  if (!expectedClientId || !expectedClientSecret) {
    return formatJSONResponse({ message: 'Client credentials are not configured' }, 500);
  }

  const isValidClient = credentials.clientId === expectedClientId && credentials.clientSecret === expectedClientSecret;

  if (!isValidClient) {
    return formatJSONResponse({ message: 'Invalid client credentials' }, 401);
  }

  return formatJSONResponse(buildToken(credentials.clientId));
};

export const main = token;
