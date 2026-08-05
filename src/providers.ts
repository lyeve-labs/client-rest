// API client for the LLM provider abstraction layer (core-plugin-provider).

import type { HttpClient } from "@lyeve-labs/client";
import { getList } from "./envelope.js";

// Domain types (mirror core-plugin-provider JSON tags)

export type ProviderType =
  "openai" | "anthropic" | "google" | "ollama" | "groq" | "deepseek";

export const PROVIDER_TYPES: ProviderType[] = [
  "openai",
  "anthropic",
  "google",
  "ollama",
  "groq",
  "deepseek",
];

export type Capability =
  | "vision"
  | "tool_use"
  | "json_mode"
  | "streaming"
  | "long_context"
  | "code_gen"
  | "reasoning"
  | "multilingual";

export const CAPABILITIES: Capability[] = [
  "vision",
  "tool_use",
  "json_mode",
  "streaming",
  "long_context",
  "code_gen",
  "reasoning",
  "multilingual",
];

export type FallbackCondition =
  "error_rate" | "latency_exceeded" | "rate_limited" | "always";

/** A configured provider. The API key is never serialised by the backend. */
export interface Provider {
  id: string;
  name: string;
  provider_type: ProviderType;
  endpoint_url?: string;
  default_model: string;
  config_json?: string;
  enabled: boolean;
  priority: number;
  rate_limit_rpm: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProviderInput {
  name: string;
  provider_type: ProviderType;
  api_key: string;
  endpoint_url?: string;
  default_model?: string;
  config_json?: string;
  enabled?: boolean;
  priority?: number;
  rate_limit_rpm?: number;
}

/** All fields optional; a blank/omitted api_key keeps the existing one. */
export interface UpdateProviderInput {
  name?: string;
  api_key?: string;
  endpoint_url?: string;
  default_model?: string;
  config_json?: string;
  enabled?: boolean;
  priority?: number;
  rate_limit_rpm?: number;
}

export interface ModelCapability {
  id: string;
  provider_id: string;
  model: string;
  capabilities: Capability[];
  context_window: number;
  detected_at: string;
  updated_at: string;
}

export interface UpsertCapabilityInput {
  model: string;
  capabilities: Capability[];
  context_window: number;
}

export interface ProviderMetric {
  id: string;
  provider_id: string;
  provider_type: ProviderType;
  model: string;
  operation: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  cost_micro_usd: number;
  success: boolean;
  error_msg?: string;
  created_at: string;
}

export interface MetricsListResult {
  metrics: ProviderMetric[];
  total: number;
  limit: number;
  offset: number;
}

export interface CostByProvider {
  provider_id: string;
  provider_name: string;
  provider_type: ProviderType;
  total_calls: number;
  success_calls: number;
  error_rate: number;
  total_tokens: number;
  total_cost_usd: string;
  avg_latency_ms: number;
}

export interface LatencyByModel {
  provider_id: string;
  provider_name: string;
  model: string;
  calls: number;
  avg_ms: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
}

export interface DashboardResponse {
  total_calls: number;
  total_cost_usd: string;
  avg_latency_ms: number;
  cost_by_provider: CostByProvider[] | null;
  latency_by_model: LatencyByModel[] | null;
  enabled_providers: number;
  total_providers: number;
}

export interface FallbackRule {
  id: string;
  name: string;
  primary_provider_id: string;
  fallback_provider_id: string;
  condition: FallbackCondition;
  threshold_value?: string;
  cooldown_seconds: number;
  enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}


// Provider CRUD

export async function listProviders(client: HttpClient): Promise<Provider[]> {
  return getList<Provider>(client, "/api/admin/providers");
}

export function getProvider(id: string, client: HttpClient): Promise<Provider> {
  return client.get<Provider>(`/api/admin/providers/${encodeURIComponent(id)}`);
}

export function createProvider(
  input: CreateProviderInput,
  client: HttpClient,
): Promise<Provider> {
  return client.post<Provider>("/api/admin/providers", input);
}

export function updateProvider(
  id: string,
  input: UpdateProviderInput,
  client: HttpClient,
): Promise<Provider> {
  return client.put<Provider>(
    `/api/admin/providers/${encodeURIComponent(id)}`,
    input,
  );
}

export function deleteProvider(id: string, client: HttpClient): Promise<void> {
  return client.delete<void>(`/api/admin/providers/${encodeURIComponent(id)}`);
}

// Model capabilities

export async function listCapabilities(
  id: string,
  client: HttpClient,
): Promise<ModelCapability[]> {
  return getList<ModelCapability>(
    client,
    `/api/admin/providers/${encodeURIComponent(id)}/capabilities`,
  );
}

export function upsertCapability(
  id: string,
  input: UpsertCapabilityInput,
  client: HttpClient,
): Promise<ModelCapability> {
  return client.put<ModelCapability>(
    `/api/admin/providers/${encodeURIComponent(id)}/capabilities`,
    input,
  );
}

// Metrics, dashboard, fallback rules

export async function getMetrics(
  client: HttpClient,
): Promise<MetricsListResult> {
  const res = await client.get<{ data: MetricsListResult }>(
    "/api/admin/providers/metrics",
  );
  return res.data ?? { metrics: [], total: 0, limit: 0, offset: 0 };
}

export function getDashboard(client: HttpClient): Promise<DashboardResponse> {
  return client.get<DashboardResponse>("/api/admin/providers/dashboard");
}

export async function listFallbackRules(
  client: HttpClient,
): Promise<FallbackRule[]> {
  return getList<FallbackRule>(client, "/api/admin/providers/fallback-rules");
}
