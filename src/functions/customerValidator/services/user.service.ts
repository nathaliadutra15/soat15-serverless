import { Pool } from 'pg';

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  name: string;
  document: string;
  legalNature: string;
  roles: string[];
}

export interface CreateUserInput {
  username: string;
  passwordHash: string;
  name: string;
  document: string;
  legalNature: string;
}

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 5,
    });
  }
  return pool;
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const db = getPool();

  const result = await db.query(
    `SELECT
       u.id,
       u.username,
       u.password,
       u.name,
       u.document,
       u.legal_nature AS "legalNature",
       COALESCE(array_agg(r.authority) FILTER (WHERE r.authority IS NOT NULL), '{}') AS roles
     FROM tb_user u
     LEFT JOIN tb_user_role ur ON ur.user_id = u.id
     LEFT JOIN tb_role r ON r.id = ur.role_id
     WHERE u.username = $1
     GROUP BY u.id`,
    [username],
  );

  return result.rows[0] ?? null;
}

export async function findUserByUsernameOrDocument(
  username: string,
  document: string,
): Promise<{ id: string; username: string; document: string } | null> {
  const db = getPool();

  const result = await db.query(
    'SELECT id, username, document FROM tb_user WHERE username = $1 OR document = $2 LIMIT 1',
    [username, document],
  );

  return result.rows[0] ?? null;
}

export async function createUser(input: CreateUserInput): Promise<{ id: string }> {
  const db = getPool();

  const result = await db.query(
    `INSERT INTO tb_user (username, password, name, document, legal_nature)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [input.username, input.passwordHash, input.name, input.document, input.legalNature],
  );

  return result.rows[0];
}