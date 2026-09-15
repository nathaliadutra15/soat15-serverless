# ADR-002: AWS Lambda Managed Scaling

## Context

The authentication functions are stateless at the application process level: persistent state is stored in PostgreSQL and customer identity is carried by the JWT. The project does not maintain its own continuously running HTTP server.

## Decision

Use the native scaling capabilities of AWS Lambda and API Gateway for the MVP. Do not configure HPA, because HPA is a pod orchestration mechanism and does not apply directly to Lambda functions.

## Rationale

- eliminates the need to manage replicas and servers;
- scales on demand according to request volume;
- reduces cost when there is no traffic;
- preserves the adopted independent-function model.

## Consequences

PostgreSQL becomes the main capacity constraint and requires pooling, connection limits, and monitoring. The code uses a pool with `max: 5` per instance, but total capacity must account for the number of concurrent Lambda instances. Cold starts, concurrency limits, timeouts, and alarms must be defined before production.

If the system migrates to Kubernetes, this decision must be revisited and a dedicated ADR may adopt HPA for containerized services.
