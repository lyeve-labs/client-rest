// REST API - typed fetch functions for all REST endpoints.
// Covers /api/admin/* and /api/v1/* routes.
// Every function requires an HttpClient as the last parameter (dependency injection).

export {
  getSetupStatus,
  setup,
  login,
  mfaVerify,
  logout,
  getMe,
  isMFAChallenge,
} from "./auth.js";
export type {
  AuthResponse,
  MFAChallengeResponse,
  LoginResponse,
  TokenResponse,
} from "./auth.js";

export {
  getSchemas,
  getSchema,
  upsertSchema,
  deleteSchema,
  getSchemaStats,
} from "./schemas.js";
export type { SchemaStats } from "./schemas.js";

export { getUsers, createUser, updateUserRoles, deleteUser } from "./users.js";

export {
  listAPIKeys,
  createAPIKey,
  revokeAPIKey,
  deleteAPIKey,
} from "./apikeys.js";

export {
  listPermissions,
  upsertPermission,
  deletePermission,
} from "./permissions.js";

export {
  listWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  listDeliveries,
  rotateSecret,
  retryDelivery,
  listDeadLetters,
  getDeadLetter,
  replayDeadLetter,
  dismissDeadLetter,
  deleteDeadLetter,
  getRetryConfig,
  updateRetryConfig,
  getWebhookHealth,
  getGlobalHealth,
} from "./webhooks.js";
export type { CreateWebhookInput, UpdateWebhookInput } from "./webhooks.js";

export {
  listIncomingWebhooks,
  getIncomingWebhook,
  createIncomingWebhook,
  updateIncomingWebhook,
  deleteIncomingWebhook,
} from "./incoming-webhooks.js";
export type { IncomingWebhookInput } from "./incoming-webhooks.js";

export {
  getPluginStatus,
  getPluginSchema,
  getPluginConfig,
  savePluginConfig,
  resetPluginConfig,
  rollbackPlugin,
  getMigrationCompat,
  safeUpgradePlugin,
  getChangelog,
} from "./plugins.js";
export type {
  PluginPhase,
  PluginStatus,
  PluginStatusReport,
  MigrationCompatibilityResult,
  RollbackResult,
  JsonSchema,
} from "./plugins.js";

export { search, listSynonyms, getRanking } from "./search.js";
export type {
  SearchResult,
  SearchResponse,
  FacetValue,
  SynonymGroup,
  RankingConfig,
  RankWeightBoost,
} from "./search.js";

export {
  searchLogs,
  getLoggingLevels,
  getLoggingConfig,
  getLogVolume,
} from "./logs.js";
export type {
  LogEntry,
  LogSearchResponse,
  LogLevelSnapshot,
  LogConfig,
  LogSinkConfig,
  LogVolumeStats,
  LogVolumeAlert,
  LogSearchParams,
} from "./logs.js";

export {
  listOAuthProviders,
  createOAuthProvider,
  updateOAuthProvider,
  deleteOAuthProvider,
} from "./oauth.js";

export { getEntitlements } from "./entitlements.js";

export { exportSubject, eraseSubject } from "./gdpr.js";
export type {
  DsarExportResult,
  DsarEraseResult,
  DsarExportSummary,
  DsarExportError,
} from "./gdpr.js";

export {
  getSummary,
  getEndpoints,
  getTenants,
  getMethods,
  getAgents,
  getTrend,
  getAnomalies,
} from "./apianalytics.js";
export type {
  MetricsQuery,
  Summary,
  BreakdownItem,
  BreakdownResponse,
  TrendPoint,
  TrendResponse,
  AnomalyPoint,
  AnomalyResponse,
} from "./apianalytics.js";

export {
  listProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  listCapabilities,
  upsertCapability,
  getMetrics,
  getDashboard,
  listFallbackRules,
  PROVIDER_TYPES,
  CAPABILITIES,
} from "./providers.js";
export type {
  ProviderType,
  Provider,
  CreateProviderInput,
  UpdateProviderInput,
  Capability,
  ModelCapability,
  UpsertCapabilityInput,
  ProviderMetric,
  MetricsListResult,
  CostByProvider,
  LatencyByModel,
  DashboardResponse,
  FallbackRule,
  FallbackCondition,
} from "./providers.js";

// Content API (moved from content/ - same HttpClient pattern)
export {
  listContent,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  bulkCreateContent,
  publishContent,
  unpublishContent,
  listContentRevisions,
  restoreContentRevision,
  listContentRelations,
  setContentRelations,
  listContentCursor,
} from "./content.js";
export type {
  ContentRevision,
  ContentRelation,
  CursorPage as ContentCursorPage,
} from "./content.js";

// Tenant management
export {
  listTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  archiveTenant,
  restoreTenant,
  archiveToColdStorage,
  listTenantArchives,
  restoreFromArchive,
} from "./tenants.js";
export type {
  Tenant,
  CreateTenantInput,
  UpdateTenantInput,
  TenantArchive,
} from "./tenants.js";

// GraphQL persisted queries (admin CRUD)
export {
  listPersistedQueries,
  createPersistedQuery,
  deletePersistedQuery,
  updatePersistedQuery,
} from "./graphql-admin.js";
export type { PersistedQuery, PersistedQueryInput } from "./graphql-admin.js";
