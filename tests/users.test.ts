import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  getUsers,
  createUser,
  updateUserRoles,
  deleteUser,
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

describe("REST users", () => {
  it("getUsers GETs /api/admin/users", async () => {
    const { client, fetchFn } = mkClient([
      { id: "u1", email: "a@b.co", roles: ["admin"] },
    ]);
    const users = await getUsers(client);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe("a@b.co");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/users");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("createUser POSTs email, password, roles", async () => {
    const { client, fetchFn } = mkClient({
      id: "u2",
      email: "new@b.co",
      roles: ["editor"],
    });
    const user = await createUser("new@b.co", "p4ss", ["editor"], client);
    expect(user.email).toBe("new@b.co");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/users");
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({
      email: "new@b.co",
      password: "p4ss",
      roles: ["editor"],
    });
  });

  it("updateUserRoles PUTs roles to /api/admin/users/{id}/roles", async () => {
    const { client, fetchFn } = mkClient({
      id: "u1",
      roles: ["admin", "editor"],
    });
    const user = await updateUserRoles("u1", ["admin", "editor"], client);
    expect(user.roles).toEqual(["admin", "editor"]);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/users/u1/roles");
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({
      roles: ["admin", "editor"],
    });
  });

  it("updateUserRoles encodes the user id", async () => {
    const { client, fetchFn } = mkClient();
    await updateUserRoles("u/1", ["editor"], client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/users/u%2F1/roles");
  });

  it("deleteUser DELETEs /api/admin/users/{id}", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteUser("u1", client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/users/u1");
    expect(fetchFn.mock.calls[0][1].method).toBe("DELETE");
  });

  it("deleteUser encodes the user id", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteUser("u/1", client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/users/u%2F1");
  });
});
