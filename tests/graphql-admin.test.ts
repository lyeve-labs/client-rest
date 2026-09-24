import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  listPersistedQueries,
  getPersistedQuery,
  createPersistedQuery,
  deletePersistedQuery,
  togglePersistedQuery,
} from "../src/index.js";

function mkClient(body: unknown = {}, status = 200) {
  const fetchFn = vi.fn(
    async (_url: string, _init: RequestInit): Promise<Response> =>
      new Response(status === 204 ? null : JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  );
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

const record = {
  query_hash: "ab12",
  query: "query { content { id } }",
  operation_name: "GetContent",
  description: "",
  enabled: true,
};

// The GraphQL plugin registers its admin routes as
// /api/admin/graphql/persisted-queries/* on GET, POST, DELETE and PATCH. The
// wildcard does not match the bare prefix, so the collection is the prefix
// with a trailing slash.
describe("REST GraphQL admin", () => {
  it("listPersistedQueries GETs the collection with its trailing slash", async () => {
    const { client, fetchFn } = mkClient({
      data: [record],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const list = await listPersistedQueries(client);
    expect(list.total).toBe(1);
    expect(list.data[0].query_hash).toBe("ab12");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("listPersistedQueries sends search, limit and offset", async () => {
    const { client, fetchFn } = mkClient({
      data: [],
      total: 0,
      limit: 10,
      offset: 20,
    });
    await listPersistedQueries(client, {
      search: "content",
      limit: 10,
      offset: 20,
    });
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/?search=content&limit=10&offset=20",
    );
  });

  it("createPersistedQuery POSTs the input to the collection", async () => {
    const { client, fetchFn } = mkClient(record, 201);
    const input = {
      query: "query { content { id } }",
      operation_name: "GetContent",
    };
    const created = await createPersistedQuery(input, client);
    expect(created.query_hash).toBe("ab12");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it("getPersistedQuery GETs one query by hash", async () => {
    const { client, fetchFn } = mkClient(record);
    await getPersistedQuery("ab12", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/ab12",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("deletePersistedQuery DELETEs one query by hash", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deletePersistedQuery("ab12", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/ab12",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("DELETE");
  });

  it("deletePersistedQuery encodes the hash", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deletePersistedQuery("pq/1", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/pq%2F1",
    );
  });

  it("togglePersistedQuery PATCHes the toggle route", async () => {
    const { client, fetchFn } = mkClient({
      query_hash: "ab12",
      enabled: false,
    });
    const res = await togglePersistedQuery("ab12", client);
    expect(res.enabled).toBe(false);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/ab12/toggle",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("PATCH");
  });
});
