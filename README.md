# @lyeve-labs/client-rest

Typed fetch functions for every LyEve Core REST endpoint. Covers the full
`/api/admin/*` and `/api/v1/*` surface.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org)

```bash
pnpm add @lyeve-labs/client @lyeve-labs/client-rest
```

```ts
import { createClient } from "@lyeve-labs/client";
import {
  getSchemas,
  listContent,
  getWebhookHealth,
} from "@lyeve-labs/client-rest";

const client = createClient(fetch, { Authorization: "Bearer <token>" });

const schemas = await getSchemas(client);
const entries = await listContent("articles", client, 20);
const health = await getWebhookHealth("webhook-id", client);
```

One function per endpoint. No SDK to learn. Just import and call.

---

## What's in the box

- **Full REST coverage:** every admin and content API endpoint has a typed function.
- **18 modules:** auth, schemas, content, users, API keys, permissions, webhooks,
  incoming webhooks, plugins, search, logs, OAuth, entitlements, GDPR, API analytics,
  providers, tenants, GraphQL admin.
- **Dependency injection:** every function takes an `HttpClient` as its last argument
  so you control the transport.
- **Typed responses:** return types match the API contract exactly. No `any`.

## Requirements

- **Node 20** or newer
- **[@lyeve-labs/client](https://www.npmjs.com/package/@lyeve-labs/client)** `>=0.2.1`

## Install

```bash
pnpm add @lyeve-labs/client @lyeve-labs/client-rest
# or npm install @lyeve-labs/client @lyeve-labs/client-rest
# or yarn add @lyeve-labs/client @lyeve-labs/client-rest
```

## Use

```ts
import { createClient } from '@lyeve-labs/client';
import {
  getSchemas,
  upsertSchema,
  listContent,
  createContent,
  getWebhookHealth,
} from '@lyeve-labs/client-rest';

const client = createClient(fetch, {
  Authorization: 'Bearer <token>',
});

// Schemas
const schemas = await getSchemas(client);
await upsertSchema({ name: 'articles', fields: [...] }, client);

// Content
const entries = await listContent('articles', client, 20);
const article = await createContent('articles', { title: 'Hello' }, client);

// Webhooks
const health = await getWebhookHealth('webhook-id', client);
```

## API

| Module            | Functions                                                                                                                                                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth              | getSetupStatus, setup, login, mfaVerify, logout, getMe, isMFAChallenge                                                                                                                                                                                                                       |
| schemas           | getSchemas, getSchema, upsertSchema, deleteSchema, getSchemaStats                                                                                                                                                                                                                            |
| content           | listContent, getContent, createContent, updateContent, deleteContent, bulkCreateContent, publishContent, unpublishContent, listContentRevisions, restoreContentRevision, listContentRelations, setContentRelations, listContentCursor                                                        |
| users             | getUsers, createUser, updateUserRoles, deleteUser                                                                                                                                                                                                                                            |
| apikeys           | listAPIKeys, createAPIKey, revokeAPIKey, deleteAPIKey                                                                                                                                                                                                                                        |
| permissions       | listPermissions, upsertPermission, deletePermission                                                                                                                                                                                                                                          |
| webhooks          | listWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook, testWebhook, listDeliveries, rotateSecret, retryDelivery, listDeadLetters, getDeadLetter, replayDeadLetter, dismissDeadLetter, deleteDeadLetter, getRetryConfig, updateRetryConfig, getWebhookHealth, getGlobalHealth |
| incoming-webhooks | listIncomingWebhooks, getIncomingWebhook, createIncomingWebhook, updateIncomingWebhook, deleteIncomingWebhook                                                                                                                                                                                |
| plugins           | getPluginStatus, getPluginSchema, getPluginConfig, savePluginConfig, resetPluginConfig, rollbackPlugin, getMigrationCompat, safeUpgradePlugin, getChangelog                                                                                                                                  |
| search            | search, listSynonyms, getRanking                                                                                                                                                                                                                                                             |
| logs              | searchLogs, getLoggingLevels, getLoggingConfig, getLogVolume                                                                                                                                                                                                                                 |
| oauth             | listOAuthProviders, createOAuthProvider, updateOAuthProvider, deleteOAuthProvider                                                                                                                                                                                                            |
| entitlements      | getEntitlements                                                                                                                                                                                                                                                                              |
| gdpr              | exportSubject, eraseSubject                                                                                                                                                                                                                                                                  |
| apianalytics      | getSummary, getEndpoints, getTenants, getMethods, getAgents, getTrend, getAnomalies                                                                                                                                                                                                          |
| providers         | listProviders, getProvider, createProvider, updateProvider, deleteProvider, listCapabilities, upsertCapability, getMetrics, getDashboard, listFallbackRules                                                                                                                                  |
| tenants           | listTenants, getTenant, createTenant, updateTenant, deleteTenant, archiveTenant, restoreTenant, archiveToColdStorage, listTenantArchives, restoreFromArchive                                                                                                                                 |
| graphql-admin     | listPersistedQueries, createPersistedQuery, deletePersistedQuery, updatePersistedQuery                                                                                                                                                                                                       |

Every function takes an `HttpClient` as the last argument.

## Local development

```bash
pnpm install            # install dependencies
pnpm test               # run unit tests
pnpm check              # type-check
pnpm build              # tsup + publint -> dist/
```

## Project layout

```
src/
  index.ts            # public API (re-exports all modules)
  auth.ts             # authentication endpoints
  schemas.ts          # schema CRUD
  content.ts          # content CRUD, revisions, relations
  users.ts            # user management
  apikeys.ts          # API key lifecycle
  permissions.ts      # RBAC permissions
  webhooks.ts         # webhooks, deliveries, dead letters
  incoming-webhooks.ts
  plugins.ts          # plugin status, config, migrations
  search.ts           # full-text search
  logs.ts             # log querying
  oauth.ts            # OAuth providers
  entitlements.ts     # license entitlements
  gdpr.ts             # data export/erasure
  apianalytics.ts     # API usage analytics
  providers.ts        # AI provider management
  tenants.ts          # tenant lifecycle
  graphql-admin.ts    # persisted queries
tests/                # vitest test suite
```

## Versioning

`@lyeve-labs/client-rest` follows [SemVer](https://semver.org). While under `1.0`,
breaking changes bump the **minor** version; additive changes bump the **patch**.
Every release is logged in [`CHANGELOG.md`](CHANGELOG.md).

## Contributing

Bug reports and feature requests are welcome. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the development setup and conventions.

## License

MIT. See [`LICENSE`](LICENSE).
