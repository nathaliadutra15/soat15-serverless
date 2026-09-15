import * as jwt from 'jsonwebtoken';

export interface UserTokenPayload {
  id: string;
  username: string;
  roles: string[];
}

export function generateUserToken(user: UserTokenPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não configurado nas variáveis de ambiente (.env)');
  }

  const payload = {
    roles: user.roles,
    sub: user.id,
    username: user.username,
  };

  const options: jwt.SignOptions = {
    expiresIn: (3600 * 24) as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}