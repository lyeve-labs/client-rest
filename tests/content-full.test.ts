import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  listContent,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  bulkCreateContent,
  publishContent,
  unpublishContent,
  listContentRevisions,
  restoreContentRevision,
  listContentRelations,
  setContentRelations,
  listContentCursor,
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

describe("REST content - CRUD", () => {
  it("listContent(schema, client, limit, offset) GETs /api/v1/content/{schema}?limit=N&offset=N", async () => {
    const { client, fetchFn } = mkClient([
      {
        id: "e1",
        data: { title: "Hello" },
        created_at: "",
        updated_at: "",
      },
    ]);
    const items = await listContent("articles", client, 10, 0);
    expect(items).toHaveLength(1);
    expect(items[0].data).toEqual({ title: "Hello" });
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/articles?limit=10&offset=0",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("listContent defaults limit=25 offset=0", async () => {
    const { client, fetchFn } = mkClient([]);
    await listContent("articles", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/articles?limit=25&offset=0",
    );
  });

  it("listContent encodes the schema name", async () => {
    const { client, fetchFn } = mkClient([]);
    await listContent("my schema", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/my%20schema?limit=25&offset=0",
    );
  });

  it("getContent GETs /api/v1/content/{schema}/{id}", async () => {
    const { client, fetchFn } = mkClient({ id: "e1" });
    const item = await getContent("articles", "e1", client);
    expect(item.id).toBe("e1");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/v1/content/articles/e1");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("createContent POSTs { data } to /api/v1/content/{schema}", async () => {
    const { client, fetchFn } = mkClient({
      id: "e1",
      data: { title: "New Article" },
    });
    const item = await createContent(
      "articles",
      { title: "New Article" },
      client,
    );
    expect(item.data).toEqual({ title: "New Article" });
    expect(fetchFn.mock.calls[0][0]).toBe("/api/v1/content/articles");
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({
      data: { title: "New Article" },
    });
  });

  it("updateContent PUTs { data } to /api/v1/content/{schema}/{id}", async () => {
    const { client, fetchFn } = mkClient({
      id: "e1",
      data: { title: "Updated" },
    });
    const item = await updateContent(
      "articles",
      "e1",
      { title: "Updated" },
      client,
    );
    expect(item.data.title).toBe("Updated");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/v1/content/articles/e1");
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({
      data: { title: "Updated" },
    });
  });

  it("deleteContent DELETEs /api/v1/content/{schema}/{id}", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteContent("articles", "e1", client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/v1/content/articles/e1");
    expect(fetchFn.mock.calls[0][1].method).toBe("DELETE");
  });
});

describe("REST content - bulk & publishing", () => {
  it("bulkCreateContent POSTs { items } to /api/v1/content/{schema}/bulk", async () => {
    const { client, fetchFn } = mkClient([
      { id: "e1", data: { title: "A" } },
      { id: "e2", data: { title: "B" } },
    ]);
    const items = [{ title: "A" }, { title: "B" }];
    const results = await bulkCreateContent("articles", items, client);
    expect(results).toHaveLength(2);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/v1/content/articles/bulk");
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({
      items,
    });
  });

  it("publishContent PUTs to /api/v1/content/{schema}/{id}/publish", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await publishContent("articles", "e1", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/articles/e1/publish",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({});
  });

  it("unpublishContent PUTs to /api/v1/content/{schema}/{id}/unpublish", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await unpublishContent("articles", "e1", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/articles/e1/unpublish",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({});
  });
});

describe("REST content - revisions", () => {
  it("listContentRevisions GETs /api/v1/content/{schema}/{id}/revisions", async () => {
    const { client, fetchFn } = mkClient([
      {
        id: "r1",
        entry_id: "e1",
        data: { title: "v1" },
        created_at: "2025-01-01T00:00:00Z",
      },
    ]);
    const revs = await listContentRevisions("articles", "e1", client);
    expect(revs).toHaveLength(1);
    expect(revs[0].entry_id).toBe("e1");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/articles/e1/revisions",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("restoreContentRevision PUTs to /api/v1/content/{schema}/{id}/revisions/{revId}/restore", async () => {
    const { client, fetchFn } = mkClient({
      id: "e1",
      data: { title: "Restored" },
    });
    const item = await restoreContentRevision("articles", "e1", "r1", client);
    expect(item.data.title).toBe("Restored");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/articles/e1/revisions/r1/restore",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({});
  });
});

describe("REST content - relations", () => {
  it("listContentRelations GETs /api/v1/content/{schema}/{id}/relations/{field}", async () => {
    const { client, fetchFn } = mkClient({
      data: [{ id: "r1", data: { name: "Alice" } }],
      total: 1,
    });
    const result = await listContentRelations(
      "articles",
      "e1",
      "author",
      client,
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0].data).toEqual({ name: "Alice" });
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/articles/e1/relations/author",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("setContentRelations PUTs { ids } to /api/v1/content/{schema}/{id}/relations/{field}", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await setContentRelations("articles", "e1", "author", ["a1", "a2"], client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/v1/content/articles/e1/relations/author",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({
      ids: ["a1", "a2"],
    });
  });
});

describe("REST content - cursor pagination", () => {
  it("listContentCursor(schema, client, cursor, limit) builds cursor URL", async () => {
    // The route answers {"data": [...], "next_cursor": "..."} and sends no
    // total. The fixture used to send items and a total, which is the shape
    // the client wanted rather than the one it receives.
    const { client, fetchFn } = mkClient({
      data: [{ id: "e1" }, { id: "e2" }],
      next_cursor: "cursor-abc",
    });
    const page = await listContentCursor("articles", client, "cursor-abc", 10);
    expect(page.items).toHaveLength(2);
    expect(page.next_cursor).toBe("cursor-abc");
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain("/api/v1/content/articles/cursor?");
    expect(url).toContain("cursor=cursor-abc");
    expect(url).toContain("limit=10");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("listContentCursor defaults limit=20 and omits cursor when not provided", async () => {
    const { client, fetchFn } = mkClient({ items: [], total: 0 });
    await listContentCursor("articles", client);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain("/api/v1/content/articles/cursor?");
    expect(url).toContain("limit=20");
    expect(url).not.toContain("cursor=");
  });
});

describe("REST content - read options", () => {
  const options = {
    populate: ["author", "tags.icon"],
    depth: 2,
    locale: "pt-BR",
    fields: ["title", "author"],
  };

  function query(url: string): Record<string, string> {
    return Object.fromEntries(new URL(url, "http://engine").searchParams);
  }

  it("listContent sends each option beside limit and offset", async () => {
    const { client, fetchFn } = mkClient([]);
    await listContent("articles", client, 10, 5, options);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url.startsWith("/api/v1/content/articles?")).toBe(true);
    expect(query(url)).toEqual({
      limit: "10",
      offset: "5",
      populate: "author,tags.icon",
      depth: "2",
      locale: "pt-BR",
      fields: "title,author",
    });
  });

  it("listContentCursor sends each option beside the cursor", async () => {
    const { client, fetchFn } = mkClient({ data: [] });
    await listContentCursor("articles", client, "c1", 10, options);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url.startsWith("/api/v1/content/articles/cursor?")).toBe(true);
    expect(query(url)).toEqual({
      limit: "10",
      cursor: "c1",
      populate: "author,tags.icon",
      depth: "2",
      locale: "pt-BR",
      fields: "title,author",
    });
  });

  it("getContent sends each option", async () => {
    const { client, fetchFn } = mkClient({ id: "e1" });
    await getContent("articles", "e1", client, options);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url.startsWith("/api/v1/content/articles/e1?")).toBe(true);
    expect(query(url)).toEqual({
      populate: "author,tags.icon",
      depth: "2",
      locale: "pt-BR",
      fields: "title,author",
    });
  });

  it("listContent sends each filter as filters[field]", async () => {
    const { client, fetchFn } = mkClient([]);
    await listContent("articles", client, 25, 0, {
      filters: { title: "Hello world", _status: "published" },
      fields: ["title"],
    });
    const url = fetchFn.mock.calls[0][0] as string;
    expect(query(url)).toEqual({
      limit: "25",
      offset: "0",
      "filters[title]": "Hello world",
      "filters[_status]": "published",
      fields: "title",
    });
  });

  it("an empty or zero option sends nothing", async () => {
    const { client, fetchFn } = mkClient({ id: "e1" });
    const empty = { populate: [], depth: 0, locale: "", fields: [] };
    await getContent("articles", "e1", client, empty);
    await listContent("articles", client, 25, 0, { ...empty, filters: {} });
    // The engine reads depth as an integer and drops anything else.
    await getContent("articles", "e1", client, { depth: 1.5 });
    expect(fetchFn.mock.calls[0][0]).toBe("/api/v1/content/articles/e1");
    expect(fetchFn.mock.calls[1][0]).toBe(
      "/api/v1/content/articles?limit=25&offset=0",
    );
    expect(fetchFn.mock.calls[2][0]).toBe("/api/v1/content/articles/e1");
  });
});
