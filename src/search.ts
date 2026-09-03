import type { HttpClient } from "@lyeve-labs/client";
import { getList } from "./envelope.js";

// Types mirror lyeve-plugin-search plugin/types.go

/** A single hit in a full-text search response. */
export interface SearchResult {
  entry_id: string;
  schema: string;
  tenant_id?: string;
  slug: string;
  title: string;
  body?: unknown;
  meta?: unknown;
  status: string;
  tags?: string[];
  published_at?: string;
  created_by: string;
  updated_at: string;
  created_at: string;
  rank: number;
  snippets?: Record<string, string>;
}

/** A single bucket in a faceted count. */
export interface FacetValue {
  value: string;
  count: number;
}

/** Top-level response from GET /api/admin/search. */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
  facets?: Record<string, FacetValue[]>;
  query: string;
}

/** A synonym group scoped to a tenant. */
export interface SynonymGroup {
  id: string;
  tenant_id?: string;
  name: string;
  base_term: string;
  synonyms: string[];
  created_at: string;
  updated_at: string;
}

/** A single per-field boost rule. */
export interface RankWeightBoost {
  field: string;
  value?: string;
  boost: number;
}

/** Ranking weights for a schema. */
export interface RankingConfig {
  id: string;
  tenant_id?: string;
  schema_name: string;
  title_weight: number;
  body_weight: number;
  tag_weight: number;
  boost_rules: RankWeightBoost[];
  created_at: string;
  updated_at: string;
}

/** Run a full-text search via GET /api/admin/search?q=... */
export function search(q: string, client: HttpClient): Promise<SearchResponse> {
  return client.get<SearchResponse>(
    `/api/admin/search?q=${encodeURIComponent(q)}`,
  );
}

/** Fetch the tenant's synonym groups (paginated envelope). */
export function listSynonyms(client: HttpClient): Promise<SynonymGroup[]> {
  return getList<SynonymGroup>(client, "/api/admin/search/synonyms");
}

/** Fetch the ranking config for a schema ("*" = global default). */
export function getRanking(
  client: HttpClient,
  schema = "*",
): Promise<RankingConfig> {
  return client.get<RankingConfig>(
    `/api/admin/search/ranking?schema=${encodeURIComponent(schema)}`,
  );
}
