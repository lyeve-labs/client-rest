import type { HttpClient } from "@lyeve-labs/client";

/**
 * The engine's paginated list envelope. Admin collection endpoints answer this
 * shape rather than a bare array, and the two are indistinguishable to a
 * caller that only reads `.length` or `.map` -- the request succeeds, so a
 * surrounding `.catch` never fires and the page silently renders as empty.
 */
export interface Paginated<T> {
  data?: T[] | null;
  limit?: number;
  offset?: number;
  total_count?: number;
}

/**
 * Normalises a list response to an array. Accepts the envelope, a bare array,
 * and `null` (which the engine encodes for an empty result rather than `[]`).
 * Use this for every collection GET: some endpoints answer bare arrays and
 * others answer the envelope, and which is which is not knowable at the call
 * site.
 */
export function unwrapList<T>(res: Paginated<T> | T[] | null | undefined): T[] {
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

/** GETs a collection and normalises the response to an array. */
export async function getList<T>(
  client: HttpClient,
  path: string,
): Promise<T[]> {
  return unwrapList(await client.get<Paginated<T> | T[] | null>(path));
}
