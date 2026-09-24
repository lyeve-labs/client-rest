# @lyeve-labs/client-rest

Typed fetch functions for the LyEve Core REST endpoints: the engine's
`/api/admin/*` and `/api/v1/*` routes and the admin routes of the plugins listed
under [API](#api). Plugin routes outside that table have no function here.

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

- **17 modules:** auth, schemas, content, users, API keys, permissions, webhooks,
  incoming webhooks, plugins, search, logs, OAuth, entitlements, GDPR, API analytics,
  tenants, GraphQL admin.
- **Dependency injection:** every function takes an `HttpClient` after its required
  arguments, so you control the transport.
- **Typed responses:** return types match the API contract exactly. No `any`.

## Requirements

- **Node 24** or newer
- **[@lyeve-labs/client](https://www.npmjs.com/package/@lyeve-labs/client)** `>=0.2.1`

## Install

```bash
pnpm add @lyeve-labs/client @lyeve-labs/client-rest
# or npm install @lyeve-labs/client @lyeve-labs/client-rest
# or yarn add @lyeve-labs/client @lyeve-labs/client-rest
```

## Use

```ts
import { createClient } from "@lyeve-labs/client";
import {
  getSchemas,
  upsertSchema,
  listContent,
  createContent,
  getWebhookHealth,
} from "@lyeve-labs/client-rest";

const client = createClient(fetch, {
  Authorization: "Bearer <token>",
});

// Schemas
const schemas = await getSchemas(client);
await upsertSchema(
  {
    name: "articles",
    display_name: "Articles",
    fields: [
      {
        name: "title",
        field_type: "text",
        required: true,
        unique: false,
        indexed: true,
      },
    ],
  },
  client,
);

// Content
const entries = await listContent("articles", client, 20);
const article = await createContent("articles", { title: "Hello" }, client);

// Webhooks
const health = await getWebhookHealth("webhook-id", client);
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
| tenants           | listTenants, getTenant, createTenant, updateTenant, deleteTenant, archiveTenant, restoreTenant, archiveToColdStorage, listTenantArchives, restoreFromArchive                                                                                                                                 |
| graphql-admin     | listPersistedQueries, getPersistedQuery, createPersistedQuery, deletePersistedQuery, togglePersistedQuery                                                                                                                                                                                    |

Every function takes an `HttpClient` after its required arguments. Optional
arguments follow it: `listContent(schema, client, limit, offset)`,
`listContentCursor(schema, client, cursor, limit)`, `listDeliveries(id, client, limit)`,
`rotateSecret(id, client, newSecret)`, `rollbackPlugin(name, client, n)`,
`listTenants(client, limit, offset)`, `listDeadLetters(client, status, limit, offset)`,
`searchLogs(client, params)`, `getLogVolume(client, window)` and
`getRanking(client, schema)`.

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
