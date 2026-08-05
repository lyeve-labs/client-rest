import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  unwrapList,
  listAPIKeys,
  listWebhooks,
  listIncomingWebhooks,
  listOAuthProviders,
  listProviders,
  listCapabilities,
  listFallbackRules,
  listSynonyms,
  listTenants,
} from "../src/index.js";
import type { HttpClient } from "@lyeve-labs/client";

function mkClient(body: unknown) {
  const fetchFn = vi.fn(
    async (): Promise<Response> =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  );
  return createClient(fetchFn as unknown as typeof fetch);
}

describe("unwrapList", () => {
  it("returns an envelope's data array", () => {
    expect(
      unwrapList({ data: [1, 2], limit: 50, offset: 0, total_count: 2 }),
    ).toEqual([1, 2]);
  });

  it("passes a bare array through", () => {
    expect(unwrapList([1, 2])).toEqual([1, 2]);
  });

  it("maps a null data field to an empty array", () => {
    expect(unwrapList({ data: null, total_count: 0 })).toEqual([]);
  });

  it("maps a null or undefined response to an empty array", () => {
    expect(unwrapList(null)).toEqual([]);
    expect(unwrapList(undefined)).toEqual([]);
  });
});

// Every collection GET must survive both shapes: which endpoints answer the
// envelope and which answer a bare array is not knowable at the call site, and
// getting it wrong renders a populated list as empty with no error anywhere.
const COLLECTIONS: ReadonlyArray<
  readonly [string, (client: HttpClient) => Promise<unknown[]>]
> = [
  ["listAPIKeys", (c) => listAPIKeys(c)],
  ["listWebhooks", (c) => listWebhooks(c)],
  ["listIncomingWebhooks", (c) => listIncomingWebhooks(c)],
  ["listOAuthProviders", (c) => listOAuthProviders(c)],
  ["listProviders", (c) => listProviders(c)],
  ["listCapabilities", (c) => listCapabilities("p1", c)],
  ["listFallbackRules", (c) => listFallbackRules(c)],
  ["listSynonyms", (c) => listSynonyms(c)],
];

describe.each(COLLECTIONS)("%s", (_name, call) => {
  const item = { id: "00000000-0000-0000-0000-000000000001" };

  it("returns the rows from a paginated envelope", async () => {
    const got = await call(
      mkClient({ data: [item], limit: 50, offset: 0, total_count: 1 }),
    );
    expect(got).toHaveLength(1);
  });

  it("returns an empty array for an empty envelope", async () => {
    const got = await call(
      mkClient({ data: [], limit: 50, offset: 0, total_count: 0 }),
    );
    expect(got).toEqual([]);
  });

  it("returns an empty array when data is null", async () => {
    const got = await call(mkClient({ data: null, total_count: 0 }));
    expect(got).toEqual([]);
  });

  it("accepts a bare array", async () => {
    const got = await call(mkClient([item]));
    expect(got).toHaveLength(1);
  });
});

describe("listTenants", () => {
  const tenant = { id: "t1", slug: "acme" };

  it("reads rows and total from the envelope", async () => {
    const got = await listTenants(
      mkClient({ data: [tenant], limit: 50, offset: 0, total_count: 7 }),
    );
    expect(got.items).toHaveLength(1);
    expect(got.total).toBe(7);
  });

  it("falls back to an empty page when data is null", async () => {
    const got = await listTenants(mkClient({ data: null, total_count: 0 }));
    expect(got.items).toEqual([]);
    expect(got.total).toBe(0);
  });
});
