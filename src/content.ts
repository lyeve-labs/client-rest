import type { HttpClient } from "@lyeve-labs/client";
import type { Content } from "@lyeve-labs/client";

export interface ContentRevision {
  id: string;
  entry_id: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface ContentRelation {
  id: string;
  schema_name: string;
  data: Record<string, unknown>;
}

export interface CursorPage {
  items: Content[];
  next_cursor?: string;
  total: number;
}

/**
 * GET /api/v1/content/{schema} - list with offset pagination.
 *
 * Returns a bare array, not a page envelope: the offset endpoint responds with
 * the entries alone and carries no total. Use listContentCursor when you need
 * a total or a next-page token.
 */
export function listContent(
  schemaName: string,
  client: HttpClient,
  limit = 25,
  offset = 0,
): Promise<Content[]> {
  return client.get<Content[]>(
    `/api/v1/content/${encodeURIComponent(schemaName)}?limit=${limit}&offset=${offset}`,
  );
}

/** GET /api/v1/content/{schema}/cursor - cursor-based pagination. */
export function listContentCursor(
  schemaName: string,
  client: HttpClient,
  cursor?: string,
  limit = 20,
): Promise<CursorPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return client.get<CursorPage>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/cursor?${params}`,
  );
}

/** GET /api/v1/content/{schema}/{id} - single entry. */
export function getContent(
  schemaName: string,
  id: string,
  client: HttpClient,
): Promise<Content> {
  return client.get<Content>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}`,
  );
}

/** POST /api/v1/content/{schema} - create an entry. */
export function createContent(
  schemaName: string,
  data: Record<string, unknown>,
  client: HttpClient,
): Promise<Content> {
  return client.post<Content>(
    `/api/v1/content/${encodeURIComponent(schemaName)}`,
    { data },
  );
}

/** POST /api/v1/content/{schema}/bulk - bulk create entries. */
export function bulkCreateContent(
  schemaName: string,
  items: Record<string, unknown>[],
  client: HttpClient,
): Promise<Content[]> {
  return client.post<Content[]>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/bulk`,
    { items },
  );
}

/** PUT /api/v1/content/{schema}/{id} - update an entry. */
export function updateContent(
  schemaName: string,
  id: string,
  data: Record<string, unknown>,
  client: HttpClient,
): Promise<Content> {
  return client.put<Content>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}`,
    { data },
  );
}

/** DELETE /api/v1/content/{schema}/{id} - delete an entry. */
export function deleteContent(
  schemaName: string,
  id: string,
  client: HttpClient,
): Promise<void> {
  return client.delete<void>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}`,
  );
}

/** PUT /api/v1/content/{schema}/{id}/publish - publish a draft entry. */
export function publishContent(
  schemaName: string,
  id: string,
  client: HttpClient,
): Promise<void> {
  return client.put<void>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}/publish`,
    {},
  );
}

/** PUT /api/v1/content/{schema}/{id}/unpublish - unpublish an entry. */
export function unpublishContent(
  schemaName: string,
  id: string,
  client: HttpClient,
): Promise<void> {
  return client.put<void>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}/unpublish`,
    {},
  );
}

/** GET /api/v1/content/{schema}/{id}/revisions - list revisions. */
export function listContentRevisions(
  schemaName: string,
  id: string,
  client: HttpClient,
): Promise<ContentRevision[]> {
  return client.get<ContentRevision[]>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}/revisions`,
  );
}

/** PUT /api/v1/content/{schema}/{id}/revisions/{revId}/restore - restore a revision. */
export function restoreContentRevision(
  schemaName: string,
  id: string,
  revId: string,
  client: HttpClient,
): Promise<Content> {
  return client.put<Content>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revId)}/restore`,
    {},
  );
}

/** GET /api/v1/content/{schema}/{id}/relations/{field} - list related entries. */
export function listContentRelations(
  schemaName: string,
  id: string,
  field: string,
  client: HttpClient,
): Promise<{ data: ContentRelation[]; total: number }> {
  return client.get<{ data: ContentRelation[]; total: number }>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}/relations/${encodeURIComponent(field)}`,
  );
}

/** PUT /api/v1/content/{schema}/{id}/relations/{field} - set related entry IDs. */
export function setContentRelations(
  schemaName: string,
  id: string,
  field: string,
  ids: string[],
  client: HttpClient,
): Promise<void> {
  return client.put<void>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}/relations/${encodeURIComponent(field)}`,
    { ids },
  );
}
