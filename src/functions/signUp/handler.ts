import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as bcrypt from 'bcryptjs';

import schema from './schema';
import { isValidCpf, isValidCnpj, normalizeDocument } from '../customerValidator/utils/documentValidator';
import { findUserByUsernameOrDocument, createUser } from '../customerValidator/services/user.service';

const SALT_ROUNDS = 10;

const signUp: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { username, password, name, document, legalNature } = event.body;

  const normalizedDocument = normalizeDocument(document);

  if (legalNature === 'PF' && !isValidCpf(normalizedDocument)) {
    return formatJSONResponse({ message: 'document is not a valid CPF' }, 400);
  }
  if (legalNature === 'PJ' && !isValidCnpj(normalizedDocument)) {
    return formatJSONResponse({ message: 'document is not a valid CNPJ' }, 400);
  }

  const existingUser = await findUserByUsernameOrDocument(username, normalizedDocument);

  if (existingUser) {
    const conflictField = existingUser.username === username ? 'username' : 'document';
    return formatJSONResponse(
      { message: `${conflictField} already in use` },
      409,
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await createUser({
    username,
    passwordHash,
    name,
    document: normalizedDocument,
    legalNature,
  });

  return formatJSONResponse({ id: newUser.id, username, name }, 201);
};

export const main = middyfy(signUp);