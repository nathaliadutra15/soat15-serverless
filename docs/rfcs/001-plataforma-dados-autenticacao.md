# RFC-001: Execution Platform, Data, and Authentication

- **Status:** accepted for the MVP
- **Data:** 2026-09-15
- **Scope:** runtime, persistence, and API identity

## Context

The service must expose registration and login with low operational complexity, store users relationally, and allow other APIs to validate customer identity.

## Proposed Decision

1. Run the API on AWS Lambda behind API Gateway, using Node.js 20 and TypeScript.
2. Use PostgreSQL as the relational database accessed through the `pg` driver.
3. Use bcrypt to store passwords as hashes, never as plaintext.
4. Issue a JWT signed with an environment-configured secret, valid for 24 hours and containing the `sub`, `username`, and `roles` claims.

## Alternatives Considered

- **Container or VM:** provides more process control, but requires managing capacity, availability, and infrastructure deployment.
- **NoSQL database:** simplifies scaling for some access patterns, but the current model already depends on relationships between users and roles.
- **Server-side sessions:** require shared state and an additional session store; JWT reduces this coupling between services.
- **OAuth2/OIDC from the start:** is a good evolution for federation and external providers, but adds an identity server and flow that are not required for the MVP.

## Consequences

- PostgreSQL must be accessible from Lambda and contain the tables queried by the code.
- `JWT_SECRET` must be long, random, and managed through Secrets Manager, Parameter Store, or an equivalent mechanism in production.
- Immediate token revocation is not available without a revocation list or sessions; the risk is limited by the 24-hour expiration.
- The API remains public through API Gateway until suitable authorization, throttling, WAF, and observability are added.

## Review Criteria

Review this RFC when identity federation, immediate revocation, multiple databases, data residency requirements, or traffic volume justify a different execution strategy.
