import type { HttpClient } from "@lyeve-labs/client";

// Types

export interface PersistedQuery {
  id: string;
  name: string;
  query: string;
  variables?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PersistedQueryInput {
  name: string;
  query: string;
  variables?: Record<string, unknown>;
}

// CRUD

/** GET /api/admin/graphql/persisted-queries - list persisted queries. Requires admin. */
export function listPersistedQueries(
  client: HttpClient,
): Promise<PersistedQuery[]> {
  return client.get<PersistedQuery[]>("/api/admin/graphql/persisted-queries");
}

/** POST /api/admin/graphql/persisted-queries - create a persisted query. Requires admin. */
export function createPersistedQuery(
  input: PersistedQueryInput,
  client: HttpClient,
): Promise<PersistedQuery> {
  return client.post<PersistedQuery>(
    "/api/admin/graphql/persisted-queries",
    input,
  );
}

/** DELETE /api/admin/graphql/persisted-queries/{id} - delete a persisted query. */
export function deletePersistedQuery(
  id: string,
  client: HttpClient,
): Promise<void> {
  return client.delete<void>(
    `/api/admin/graphql/persisted-queries/${encodeURIComponent(id)}`,
  );
}

/** PATCH /api/admin/graphql/persisted-queries/{id} - update a persisted query. */
export function updatePersistedQuery(
  id: string,
  input: Partial<PersistedQueryInput>,
  client: HttpClient,
): Promise<PersistedQuery> {
  return client.patch<PersistedQuery>(
    `/api/admin/graphql/persisted-queries/${encodeURIComponent(id)}`,
    input,
  );
}
