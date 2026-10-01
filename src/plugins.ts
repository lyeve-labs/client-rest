import { ApiError, type HttpClient } from "@lyeve-labs/client";

// Plugin management API client.
//
// Backend endpoints (core engine, proxied via /api/admin > :3001):
//   GET  /api/admin/plugins/status                    > activation status
//   GET  /api/admin/plugins/{name}/schema             > JSON Schema for config
//   GET  /api/admin/plugins/{name}/config             > current config (404 > not configured)
//   PUT  /api/admin/plugins/{name}/config             > save config (super_admin)
//   POST /api/admin/plugins/{name}/config/reset       > reset config (super_admin)

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
  /** The plugin's own version, when it reports one. */
  version?: string;
  /** How the plugin describes itself, when it does. */
  manifest?: PluginManifest;
  /** The routes a running plugin serves, sorted by pattern then method. */
  routes?: PluginRoute[];
}

/** How a plugin describes itself in its status row. */
export interface PluginManifest {
  label: string;
  description?: string;
  category?: string;
  maturity?: "stable" | "beta";
}

/** Who may call a route: anyone, a signed-in user, an admin or a super admin. */
export type PluginRouteGroup = "public" | "auth" | "admin" | "super_admin";

/** One route a running plugin serves. */
export interface PluginRoute {
  method: string;
  pattern: string;
  group: PluginRouteGroup;
}

export interface PluginStatusReport {
  compiled: string[];
  entitled: string[];
  requested?: string[];
  plugins: PluginStatus[];
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
