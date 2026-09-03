# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-02

### Fixed

- `listContentCursor` returned an empty page every time. `CursorPage` declared
  `items` and a `total`, and the route answers `{"data": [...],
  "next_cursor": "..."}` with no total - so `page.items` was `undefined` on
  every call. The response is mapped to the declared shape now, and `total` is
  gone from the type because the route does not send one.
- The test fixture returned the shape the client wanted rather than the one the
  route sends, which is why this passed.

## [0.1.7] - 2026-09-02

### Changed

- CONTRIBUTING documents the branch model. It covered commits and releases but never said which branch a change starts from: work branches off `dev` and the PR goes back into `dev`, while `main` takes merges and carries the release tags.

## [0.1.6] - 2026-08-12

### Changed

- Raise the `@lyeve-labs/client` peer floor to 0.2.1. The previous floor allowed
  0.1.x, which was never published to the registry.

## [0.1.5] - 2026-08-11

### Changed

- Move to node 24 and pnpm 10.33.4, and test against client 0.3.0.

Carries the 0.1.4 collection-unwrap fix as well. 0.1.4 was tagged but never
published, so this is the first release to reach the registry since 0.1.3 and the
first to actually ship that fix.

## [0.1.4] - 2026-08-06

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
