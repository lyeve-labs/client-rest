import { ApiError, type HttpClient } from "@lyeve-labs/client";

// Plugin management API client.
//
// Backend endpoints (core engine, proxied via /api/admin > :3001):
//   GET  /api/admin/plugins/status                    > activation status
//   GET  /api/admin/plugins/{name}/schema             > JSON Schema for config
//   GET  /api/admin/plugins/{name}/config             > current config (404 > not configured)
//   PUT  /api/admin/plugins/{name}/config             > save config (super_admin)
//   POST /api/admin/plugins/{name}/config/reset       > reset config (super_admin)
//   GET  /api/admin/plugins/{name}/changelog          > markdown changelog
//   POST /api/admin/plugins/{name}/rollback?n=N       > roll back N migrations
//   GET  /api/admin/plugins/{name}/migration-compat   > compatibility check
//   POST /api/admin/plugins/{name}/safe-upgrade       > safe upgrade + auto-rollback

export type PluginPhase =
  "registered" | "starting" | "running" | "failed" | "stopping" | "stopped";

export interface PluginStatus {
  name: string;
  compiled: boolean;
  entitled: boolean;
  requested: boolean;
  active: boolean;
  phase: PluginPhase;
  started_at?: string;
  stopped_at?: string;
  last_error?: string;
  reason?: string;
  upgrade_url?: string;
}

export interface PluginStatusReport {
  compiled: string[];
  entitled: string[];
  requested?: string[];
  plugins: PluginStatus[];
}

/** Result of a migration compatibility check. */
export interface MigrationCompatibilityResult {
  compatible: boolean;
  breaking_changes?: string[];
  new_migrations?: string[];
  rollback_plan?: string[];
  warning?: string;
}

/** Response from POST /api/admin/plugins/{name}/rollback. */
export interface RollbackResult {
  status: string;
  update_available: boolean;
  plugin: string;
  rolled_back_count: number;
}

/** A JSON Schema object as returned by the config schema endpoint. */
export type JsonSchema = Record<string, unknown>;

// Status & schema

/** Fetch activation status for all compiled plugins. */
export function getPluginStatus(
  client: HttpClient,
): Promise<PluginStatusReport> {
  return client.get<PluginStatusReport>("/api/admin/plugins/status");
}

/** Fetch the JSON Schema describing a plugin's configuration. */
export function getPluginSchema(
  name: string,
  client: HttpClient,
): Promise<JsonSchema> {
  return client.get<JsonSchema>(
    `/api/admin/plugins/${encodeURIComponent(name)}/schema`,
  );
}

// Configuration

/** Fetch a plugin's current configuration. Returns null when none is stored (404). */
export async function getPluginConfig(
  name: string,
  client: HttpClient,
): Promise<Record<string, unknown> | null> {
  try {
    return await client.get<Record<string, unknown>>(
      `/api/admin/plugins/${encodeURIComponent(name)}/config`,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Persist a plugin's configuration. Requires super_admin. */
export function savePluginConfig(
  name: string,
  config: Record<string, unknown>,
  client: HttpClient,
): Promise<Record<string, unknown>> {
  return client.put<Record<string, unknown>>(
    `/api/admin/plugins/${encodeURIComponent(name)}/config`,
    config,
  );
}

/** Reset a plugin's configuration to schema defaults. Requires super_admin. */
export function resetPluginConfig(
  name: string,
  client: HttpClient,
): Promise<Record<string, unknown>> {
  return client.post<Record<string, unknown>>(
    `/api/admin/plugins/${encodeURIComponent(name)}/config/reset`,
    {},
  );
}

// Operations (super_admin gated)

/** Roll back a plugin by N migration versions. Requires super_admin. */
export function rollbackPlugin(
  name: string,
  client: HttpClient,
  n = 1,
): Promise<RollbackResult> {
  return client.post<RollbackResult>(
    `/api/admin/plugins/${encodeURIComponent(name)}/rollback?n=${n}`,
    {},
  );
}

/** Check migration compatibility for upgrading a plugin to a target version. */
export function getMigrationCompat(
  name: string,
  targetVersion: string,
  client: HttpClient,
): Promise<MigrationCompatibilityResult> {
  return client.get<MigrationCompatibilityResult>(
    `/api/admin/plugins/${encodeURIComponent(name)}/migration-compat?target=${encodeURIComponent(targetVersion)}`,
  );
}

/** Run a safe upgrade (compatibility check + auto-rollback on failure). Requires super_admin. */
export function safeUpgradePlugin(
  name: string,
  client: HttpClient,
): Promise<MigrationCompatibilityResult> {
  return client.post<MigrationCompatibilityResult>(
    `/api/admin/plugins/${encodeURIComponent(name)}/safe-upgrade`,
    {},
  );
}

/**
 * Fetch a plugin's changelog. The endpoint responds with `text/markdown`
 * rather than JSON, so it cannot go through the shared JSON client - pass an
 * (optionally auth-wrapped) fetch function. Returns '' when no changelog exists.
 */
export async function getChangelog(
  name: string,
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<string> {
  const res = await fetchFn(
    `/api/admin/plugins/${encodeURIComponent(name)}/changelog`,
  );
  if (res.status === 404) return "";
  if (!res.ok) {
    throw new ApiError(
      res.status,
      await res.text().catch(() => "Failed to load changelog"),
    );
  }
  return res.text();
}
