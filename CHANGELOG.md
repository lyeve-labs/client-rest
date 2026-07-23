# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


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