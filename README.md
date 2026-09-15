# SOAT15 Serverless

Authentication API built with Serverless Framework, AWS Lambda, API Gateway, TypeScript, and PostgreSQL. The service registers customers and authenticates users by document, returning a JWT for use by other APIs.

## Objective and Scope

The project focuses on the identity context:

- register individuals (PF) or legal entities (PJ);
- normalize and validate CPF or CNPJ;
- prevent duplicate usernames and documents;
- store passwords only as bcrypt hashes;
- authenticate by document and password;
- issue a JWT containing the identifier, username, and roles (`roles`), valid for 24 hours.

The currently deployed functions are `signUp` and `signIn`. The `customerValidator` directory contains shared services and validation logic, but it is not an independent route.

## Endpoints

### `POST /auth/sign-up`

Creates a user. The request body must contain:

```json
{
    "username": "maria",
    "password": "secure-password",
    "name": "Maria Silva",
    "document": "52998224725",
    "legalNature": "PF"
}
```

Responses: `201` with `id`, `username`, and `name`; `400` for an invalid CPF/CNPJ; `409` when the username or document is already registered; `400` when the body does not match the schema.

### `POST /auth/sign-in`

Authenticates by document and password:

```json
{
    "document": "52998224725",
    "password": "secure-password"
}
```

Responses: `200` with `{ "accessToken": "..." }` or `401` for invalid credentials.

## Stack and Architecture

- **AWS Lambda + API Gateway:** one function per use case, with managed scaling.
- **Node.js 22 + TypeScript:** runtime configured in `serverless.ts`.
- **PostgreSQL:** persistence accessed through the `pg` driver; expected tables are `tb_user`, `tb_user_role`, and `tb_role`.
- **Middy:** parses JSON received from API Gateway.
- **bcryptjs:** password hashing with 10 salt rounds.
- **jsonwebtoken:** JWT signed with `JWT_SECRET` and a 24-hour expiration.
- **esbuild:** bundles functions for deployment.
- **Traefik:** optional local proxy exposing the API on port 80.

Main flow: client -> API Gateway/Traefik -> Lambda -> PostgreSQL. During registration, the password is validated and hashed before the `INSERT`; during login, the hash is compared and the token is generated only after authentication.

## Prerequisites

- Node.js 22;
- npm;
- PostgreSQL accessible from the machine, container, or application network;
- Docker and Docker Compose only if the local Traefik proxy is used;
- AWS credentials configured for deployment.

## Local Configuration

Create a `.env` file in the project root. It must not be committed:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=soat15
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=replace-with-a-strong-secret
```

The repository does not contain PostgreSQL migrations or seed data. Before starting the API, the database must exist and contain the tables queried by `src/functions/customerValidator/services/user.service.ts`.

## Local Execution

```bash
npm install
npx serverless offline
```

`serverless-offline` starts the API at `http://localhost:3001`. Test it with:

```bash
curl -X POST http://localhost:3001/auth/sign-up \
    -H "Content-Type: application/json" \
    -d '{"username":"maria","password":"secure-password","name":"Maria Silva","document":"52998224725","legalNature":"PF"}'

curl -X POST http://localhost:3001/auth/sign-in \
    -H "Content-Type: application/json" \
    -d '{"document":"52998224725","password":"secure-password"}'
```

To use local Traefik, keep Serverless Offline running and execute `docker compose up -d`. In that case, use `http://localhost/auth/sign-up` and `http://localhost/auth/sign-in`. The Traefik dashboard is available at `http://localhost:8080`.

## Deployment and Operations

```bash
npx serverless deploy
npx serverless info
npx serverless logs -f signUp --tail
npx serverless logs -f signIn --tail
```

Deployment uses AWS in the `us-east-1` region. Environment variables and the JWT secret must be provided through the runtime environment configuration mechanism; do not publish `.env` files or secrets to the repository. The API Gateway endpoint is public by default and must be protected with HTTPS, access controls, rate limits, and observability before production use.

## Project Structure

```text
src/functions/index.ts                 Registry of deployed functions
src/functions/signUp                  Registration and request schema
src/functions/signIn                  Login and request schema
src/functions/customerValidator       Validation, user access, and JWT
src/libs                               API Gateway, Middy, and handler helpers
serverless.ts                          Runtime, plugins, and local configuration
docker-compose.yml                     Optional Traefik proxy
docs/rfcs                              Proposals and evolvable technical decisions
docs/adrs                              Permanent architectural decisions
```

## Quality and Known Limitations

`package.json` does not currently define automated tests. Before promoting a change, run at least `npx tsc --noEmit`, execute the registration/login flows against a test PostgreSQL database, and verify validation, conflict, and invalid credential responses. The schema currently validates types and required fields, but password length and complexity rules have not yet been defined.

## Technical Decisions

- [System component diagram and request flows](docs/architecture/component-diagram.md)
- [RFC-001: Execution platform, data, and authentication](docs/rfcs/001-plataforma-dados-autenticacao.md)
- [ADR-001: HTTP communication with one function per use case](docs/adrs/001-comunicacao-http-funcoes.md)
- [ADR-002: AWS Lambda managed scaling](docs/adrs/002-escalabilidade-lambda.md)

RFCs record alternatives and decisions that may evolve. ADRs record accepted architectural decisions, their rationale, and consequences.
