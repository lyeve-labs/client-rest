import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  listPermissions,
  upsertPermission,
  deletePermission,
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

describe("REST permissions", () => {
  it("listPermissions GETs /api/admin/permissions", async () => {
    const { client, fetchFn } = mkClient([
      {
        id: "p1",
        role: "editor",
        schema_name: "articles",
        actions: ["read"],
        field_mask: [],
      },
    ]);
    const perms = await listPermissions(client);
    expect(perms).toHaveLength(1);
    expect(perms[0].role).toBe("editor");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/permissions");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("upsertPermission POSTs data to /api/admin/permissions", async () => {
    const { client, fetchFn } = mkClient({
      id: "p2",
      role: "admin",
      schema_name: "*",
      actions: ["read", "write"],
      field_mask: [],
    });
    const input = {
      role: "admin",
      schema_name: "*",
      actions: ["read", "write"],
      field_mask: [],
    };
    const perm = await upsertPermission(input, client);
    expect(perm.role).toBe("admin");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/permissions");
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it("deletePermission DELETEs /api/admin/permissions/{id}", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deletePermission("p1", client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/permissions/p1");
    expect(fetchFn.mock.calls[0][1].method).toBe("DELETE");
  });

  it("deletePermission encodes the permission id", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deletePermission("p/1", client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/permissions/p%2F1");
  });
});
