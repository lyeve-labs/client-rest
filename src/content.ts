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
  data: Record<string, unknown>;
}

/**
 * Options that shape what a content read returns. Each is a query parameter
 * of the list, cursor and get routes, and an option left out sends nothing.
 */
export interface ContentReadOptions {
  /**
   * Relation fields to resolve inline. Dot notation nests ("author.avatar"),
   * and "*" is every relation at that level.
   */
  populate?: string[];
  /** Resolve every relation down to this many levels. */
  depth?: number;
  /**
   * The language tag to serve entries in, when the localization plugin is
   * on. It takes precedence over Accept-Language, and a malformed tag is
   * refused with 400. An entry served in a locale carries `resolved_locale`.
   */
  locale?: string;
  /**
   * Narrow each entry's data to these fields. The entry keeps its id and
   * timestamps. A relation field keeps both its stored column and its
   * populated record. A field the caller cannot read is refused with 400.
   */
  fields?: string[];
}

function withReadOptions(
  params: URLSearchParams,
  options: ContentReadOptions,
): URLSearchParams {
  if (options.populate?.length)
    params.set("populate", options.populate.join(","));
  const depth = options.depth ?? 0;
  if (Number.isInteger(depth) && depth > 0) params.set("depth", String(depth));
  if (options.locale) params.set("locale", options.locale);
  if (options.fields?.length) params.set("fields", options.fields.join(","));
  return params;
}

export interface CursorPage {
  items: Content[];
  /** Present when more pages are available. */
  next_cursor?: string;
}

/**
 * GET /api/v1/content/{schema} - list with offset pagination.
 *
 * Returns a bare array, not a page envelope: the offset endpoint responds with
 * the entries alone and carries no total. Use listContentCursor when you need
 * a next-page token.
 */
export function listContent(
  schemaName: string,
  client: HttpClient,
  limit = 25,
  offset = 0,
  options: ContentReadOptions = {},
): Promise<Content[]> {
  const params = withReadOptions(
    new URLSearchParams({ limit: String(limit), offset: String(offset) }),
    options,
  );
  return client.get<Content[]>(
    `/api/v1/content/${encodeURIComponent(schemaName)}?${params}`,
  );
}

/** GET /api/v1/content/{schema}/cursor: cursor-based pagination. */
export async function listContentCursor(
  schemaName: string,
  client: HttpClient,
  cursor?: string,
  limit = 20,
  options: ContentReadOptions = {},
): Promise<CursorPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  withReadOptions(params, options);
  // The route answers {"data": [...], "next_cursor": "..."} and sends no total.
  // Mapped here rather than exposed raw, so callers keep one page shape.
  const page = await client.get<{ data?: Content[]; next_cursor?: string }>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/cursor?${params}`,
  );
  return { items: page.data ?? [], next_cursor: page.next_cursor };
}

/** GET /api/v1/content/{schema}/{id} - single entry. */
export function getContent(
  schemaName: string,
  id: string,
  client: HttpClient,
  options: ContentReadOptions = {},
): Promise<Content> {
  const query = withReadOptions(new URLSearchParams(), options).toString();
  return client.get<Content>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}${query ? `?${query}` : ""}`,
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

/** POST /api/v1/content/{schema}/bulk: bulk create entries. */
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

/**
 * PUT /api/v1/content/{schema}/{id} - a partial update: only the fields in
 * data are written and validated, and every other field keeps its stored
 * value.
 */
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

/** PUT /api/v1/content/{schema}/{id}/publish: publish a draft entry. */
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

/** PUT /api/v1/content/{schema}/{id}/unpublish: unpublish an entry. */
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

/** GET /api/v1/content/{schema}/{id}/revisions: list revisions. */
export function listContentRevisions(
  schemaName: string,
  id: string,
  client: HttpClient,
): Promise<ContentRevision[]> {
  return client.get<ContentRevision[]>(
    `/api/v1/content/${encodeURIComponent(schemaName)}/${encodeURIComponent(id)}/revisions`,
  );
}

/** PUT /api/v1/content/{schema}/{id}/revisions/{revId}/restore: restore a revision. */
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
