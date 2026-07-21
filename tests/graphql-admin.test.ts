import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  listPersistedQueries,
  createPersistedQuery,
  deletePersistedQuery,
  updatePersistedQuery,
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

describe("REST GraphQL admin", () => {
  it("listPersistedQueries GETs /api/admin/graphql/persisted-queries", async () => {
    const { client, fetchFn } = mkClient([
      {
        id: "pq1",
        name: "GetContent",
        query: "query { content { id } }",
        created_at: "",
        updated_at: "",
      },
    ]);
    const queries = await listPersistedQueries(client);
    expect(queries).toHaveLength(1);
    expect(queries[0].name).toBe("GetContent");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("createPersistedQuery POSTs input to /api/admin/graphql/persisted-queries", async () => {
    const { client, fetchFn } = mkClient({
      id: "pq2",
      name: "UpdateContent",
      query: "mutation { updateContent }",
      created_at: "",
      updated_at: "",
    });
    const input = {
      name: "UpdateContent",
      query: "mutation { updateContent }",
      variables: { id: "123" },
    };
    const query = await createPersistedQuery(input, client);
    expect(query.name).toBe("UpdateContent");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it("deletePersistedQuery DELETEs /api/admin/graphql/persisted-queries/{id}", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deletePersistedQuery("pq1", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/pq1",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("DELETE");
  });

  it("deletePersistedQuery encodes the query id", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deletePersistedQuery("pq/1", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/pq%2F1",
    );
  });

  it("updatePersistedQuery PATCHes input to /api/admin/graphql/persisted-queries/{id}", async () => {
    const { client, fetchFn } = mkClient({
      id: "pq1",
      name: "Renamed",
      query: "query { content { id title } }",
      created_at: "",
      updated_at: "",
    });
    const input = { name: "Renamed", query: "query { content { id title } }" };
    const query = await updatePersistedQuery("pq1", input, client);
    expect(query.name).toBe("Renamed");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/graphql/persisted-queries/pq1",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("PATCH");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it("updatePersistedQuery sends partial update", async () => {
    const { client, fetchFn } = mkClient({});
    await updatePersistedQuery("pq1", { name: "JustName" }, client);
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({
      name: "JustName",
    });
  });
});
