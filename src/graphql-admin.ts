import type { HttpClient } from "@lyeve-labs/client";

// Types

/** A persisted query as the GraphQL plugin stores it, keyed by the SHA-256 of its text. */
export interface PersistedQuery {
  query_hash: string;
  query: string;
  operation_name: string;
  description: string;
  enabled: boolean;
  auto_registered?: boolean;
}

export interface PersistedQueryInput {
  query: string;
  operation_name?: string;
  description?: string;
}

export interface PersistedQueryListParams {
  search?: string;
  /** 1 to 200; the server uses 50 outside that range. */
  limit?: number;
  offset?: number;
}

export interface PersistedQueryList {
  data: PersistedQuery[];
  total: number;
  limit: number;
  offset: number;
}

export interface PersistedQueryToggle {
  query_hash: string;
  enabled: boolean;
}

// The plugin registers its admin routes under this prefix with a wildcard, so
// the collection is addressed with a trailing slash; the bare prefix is not a
// route and answers 404.
const collection = "/api/admin/graphql/persisted-queries/";

function itemPath(hash: string): string {
  return `${collection}${encodeURIComponent(hash)}`;
}

// CRUD

/** GET /api/admin/graphql/persisted-queries/ - list persisted queries. Requires admin. */
export function listPersistedQueries(
  client: HttpClient,
  params: PersistedQueryListParams = {},
): Promise<PersistedQueryList> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.offset !== undefined) qs.set("offset", String(params.offset));
  const query = qs.toString();
  return client.get<PersistedQueryList>(
    query ? `${collection}?${query}` : collection,
  );
}

/** GET /api/admin/graphql/persisted-queries/{hash} - read one persisted query. Requires admin. */
export function getPersistedQuery(
  hash: string,
  client: HttpClient,
): Promise<PersistedQuery> {
  return client.get<PersistedQuery>(itemPath(hash));
}

/** POST /api/admin/graphql/persisted-queries/ - store a query in the allowlist. Requires admin. */
export function createPersistedQuery(
  input: PersistedQueryInput,
  client: HttpClient,
): Promise<PersistedQuery> {
  return client.post<PersistedQuery>(collection, input);
}

/** DELETE /api/admin/graphql/persisted-queries/{hash} - delete a persisted query. */
export function deletePersistedQuery(
  hash: string,
  client: HttpClient,
): Promise<void> {
  return client.delete<void>(itemPath(hash));
}

/** PATCH /api/admin/graphql/persisted-queries/{hash}/toggle - flip a persisted query between enabled and disabled. */
export function togglePersistedQuery(
  hash: string,
  client: HttpClient,
): Promise<PersistedQueryToggle> {
  return client.patch<PersistedQueryToggle>(`${itemPath(hash)}/toggle`, {});
}

/**
 * @deprecated The server has no route that edits a persisted query, so this
 * call always fails with 405. A query's hash is its text, so store the new
 * text with {@link createPersistedQuery} and delete the old one, or use
 * {@link togglePersistedQuery} to enable or disable it.
 */
export function updatePersistedQuery(
  hash: string,
  input: Partial<PersistedQueryInput>,
  client: HttpClient,
): Promise<PersistedQuery> {
  return client.patch<PersistedQuery>(itemPath(hash), input);
}
