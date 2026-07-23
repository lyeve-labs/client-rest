# @lyeve/cms-client-rest

Typed fetch functions for all LyEve CMS REST endpoints. Covers /api/admin/\* and /api/v1/\* routes.

Depends on `@lyeve/cms-client` for the HTTP client layer.

## Install

```sh
pnpm add @lyeve/cms-client @lyeve/cms-client-rest
```

## Usage

```ts
import { createClient } from '@lyeve/cms-client';
import { getSchemas, listContent, getWebhookHealth } from '@lyeve/cms-client-rest';

const client = createClient(fetch, { Authorization: 'Bearer <token>' });

// Schemas
const schemas = await getSchemas(client);

// Content
const entries = await listContent('articles', client, 20);

// Webhooks
const health = await getWebhookHealth('webhook-id', client);
```

## Modules

| Module | Functions |
|--------|-----------|
| auth | getSetupStatus, setup, login, mfaVerify, logout, getMe, isMFAChallenge |
| schemas | getSchemas, getSchema, upsertSchema, deleteSchema, getSchemaStats |
| content | listContent, getContent, createContent, updateContent, deleteContent, bulkCreateContent, publishContent, unpublishContent, listContentRevisions, restoreContentRevision, listContentRelations, setContentRelations, listContentCursor |
| users | getUsers, createUser, updateUserRoles, deleteUser |
| apikeys | listAPIKeys, createAPIKey, revokeAPIKey, deleteAPIKey |
| permissions | listPermissions, upsertPermission, deletePermission |
| webhooks | listWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook, testWebhook, listDeliveries, rotateSecret, retryDelivery, listDeadLetters, getDeadLetter, replayDeadLetter, dismissDeadLetter, deleteDeadLetter, getRetryConfig, updateRetryConfig, getWebhookHealth, getGlobalHealth |
| incoming-webhooks | listIncomingWebhooks, getIncomingWebhook, createIncomingWebhook, updateIncomingWebhook, deleteIncomingWebhook |
| plugins | getPluginStatus, getPluginSchema, getPluginConfig, savePluginConfig, resetPluginConfig, rollbackPlugin, getMigrationCompat, safeUpgradePlugin, getChangelog |
| search | search, listSynonyms, getRanking |
| logs | searchLogs, getLoggingLevels, getLoggingConfig, getLogVolume |
| oauth | listOAuthProviders, createOAuthProvider, updateOAuthProvider, deleteOAuthProvider |
| entitlements | getEntitlements |
| gdpr | exportSubject, eraseSubject |
| apianalytics | getSummary, getEndpoints, getTenants, getMethods, getAgents, getTrend, getAnomalies |
| providers | listProviders, getProvider, createProvider, updateProvider, deleteProvider, listCapabilities, upsertCapability, getMetrics, getDashboard, listFallbackRules |
| tenants | listTenants, getTenant, createTenant, updateTenant, deleteTenant, archiveTenant, restoreTenant, archiveToColdStorage, listTenantArchives, restoreFromArchive |
| graphql-admin | listPersistedQueries, createPersistedQuery, deletePersistedQuery, updatePersistedQuery |

Every function takes an `HttpClient` as the last argument (dependency injection).

## License

MIT
