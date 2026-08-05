# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Collection reads went through a single envelope unwrap. `listAPIKeys`, `listWebhooks`, `listIncomingWebhooks`, `listTenants`, the three OAuth provider reads and `search` each assumed one of the two shapes the engine answers with (`{data,limit,offset,total_count}` or a bare array). The mismatched half returned an empty list from a request that had succeeded, so nothing threw and the page simply rendered nothing. `unwrapList`/`getList` in `envelope.ts` now accept both.

## [0.1.3] - 2026-08-04

### Fixed

- Split the `types` export condition so TypeScript resolves `.d.ts` under `import` and `.d.cts` under `require`.
- Type `listContent` as a bare array to match what the endpoint returns.

## [0.1.2] - 2026-07-28

Published with no user-facing changes; repository tooling only.

## [0.1.1] - 2026-07-24

### Fixed

- `listContent` return type corrected to `{ items: Content[]; total: number }` to match the actual API envelope.
- `rollbackPlugin` parameter order changed to `(name, client, n?)` so TypeScript can infer types without callers passing undefined for the client.
- Test fixtures updated to use correct field names (`schema_name`, `max_attempts`, `base_delay_ms`, `max_delay_ms`).
- README usage examples fixed to match actual function signatures.

## [0.1.0] - 2026-07-23

### Added

- Initial release.
- Typed fetch functions for all `/api/admin/*` and `/api/v1/*` REST endpoints, following a consistent `(client, ...params)` dependency-injection pattern.
- Auth operations: login, MFA verification, logout, session status, and token management.
- Schema CRUD with upsert, content CRUD with bulk operations, publish/unpublish workflows, revision history, and relation management.
- Webhook lifecycle management including testing, delivery inspection, retry, dead-letter queue operations, and global health monitoring.
- Plugin management: status reporting, configuration, migration compatibility checks, safe upgrades, and rollback support.
- Search with facet aggregation, synonym management, and ranking configuration.
- System logging: log search with filtering, logging level management, config inspection, and volume monitoring.
- Tenant lifecycle: create, update, delete, archive, restore, and cold-storage archiving.
- Provider registry for AI/LLM provider configurations with capability management, metrics, and fallback rules.
- API analytics: summary, endpoint breakdown, agent metrics, trend analysis, and anomaly detection.
- OAuth provider management, entitlements inspection, GDPR data subject requests (export/erase), API key management, permission CRUD, incoming webhooks, and GraphQL persisted-query management.
