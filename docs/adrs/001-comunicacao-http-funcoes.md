# ADR-001: HTTP Communication with One Function per Use Case

## Context

The system must provide authentication operations consumable by web applications and other services. The repository already organizes each operation as an independent Serverless function.

## Decision

Adopt synchronous HTTP communication, with API Gateway routing each endpoint to a dedicated Lambda function: `POST /auth/sign-up` for registration and `POST /auth/sign-in` for login.

## Rationale

- simple and broadly interoperable contract;
- immediate response for registration and authentication;
- deployment and scaling isolation per use case;
- alignment with the current `src/functions` and `serverless.ts` structure.

## Consequences

Each function must maintain stable input and output contracts, validate the request body, and return consistent HTTP status codes. Asynchronous events or messaging may be added for tasks that do not need to block the response, but they do not replace the synchronous login flow.
