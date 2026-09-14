import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as bcrypt from 'bcryptjs';

import schema from './schema';
import { findUserByDocument } from '../customerValidator/services/user.service';
import { generateUserToken } from '../customerValidator/services/jwtGenerator.service';

const signIn: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { document, password } = event.body;

  const user = await findUserByDocument(document);

  const isAuthenticated = await bcrypt.compare(password, user?.password ?? '');

  if (!user || !isAuthenticated) {
    return formatJSONResponse({ message: 'Invalid credentials' }, 401);
  }

  const accessToken = generateUserToken({
    id: user.id,
    username: user.username,
    roles: user.roles,
  });

  return formatJSONResponse({ accessToken });
};

export const main = middyfy(signIn);