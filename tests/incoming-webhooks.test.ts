import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  listIncomingWebhooks,
  getIncomingWebhook,
  createIncomingWebhook,
  updateIncomingWebhook,
  deleteIncomingWebhook,
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

describe("REST incoming webhooks", () => {
  it("listIncomingWebhooks GETs /api/admin/incoming-webhooks", async () => {
    const { client, fetchFn } = mkClient([
      { id: "iw1", name: "Form Submit", schema_name: "contact" },
    ]);
    const hooks = await listIncomingWebhooks(client);
    expect(hooks).toHaveLength(1);
    expect(hooks[0].name).toBe("Form Submit");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/incoming-webhooks");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getIncomingWebhook GETs /api/admin/incoming-webhooks/{id}", async () => {
    const { client, fetchFn } = mkClient({ id: "iw1", name: "Form Submit" });
    const hook = await getIncomingWebhook("iw1", client);
    expect(hook.id).toBe("iw1");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/incoming-webhooks/iw1");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getIncomingWebhook encodes the webhook id", async () => {
    const { client, fetchFn } = mkClient({ id: "iw/1" });
    await getIncomingWebhook("iw/1", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/incoming-webhooks/iw%2F1",
    );
  });

  it("createIncomingWebhook POSTs input to /api/admin/incoming-webhooks", async () => {
    const { client, fetchFn } = mkClient({
      id: "iw2",
      name: "Slack Command",
      schema_name: "slack",
    });
    const input = {
      name: "Slack Command",
      schema_name: "slack",
      secret: "s3cret",
      field_map: { text: "message" },
      enabled: true,
      allowed_ips: ["1.2.3.4"],
    };
    const hook = await createIncomingWebhook(input, client);
    expect(hook.name).toBe("Slack Command");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/incoming-webhooks");
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it("updateIncomingWebhook PUTs input to /api/admin/incoming-webhooks/{id}", async () => {
    const { client, fetchFn } = mkClient({
      id: "iw1",
      name: "Updated",
      schema_name: "contact",
    });
    const input = { name: "Updated", schema_name: "contact", enabled: false };
    const hook = await updateIncomingWebhook("iw1", input, client);
    expect(hook.name).toBe("Updated");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/incoming-webhooks/iw1");
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it("deleteIncomingWebhook DELETEs /api/admin/incoming-webhooks/{id}", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteIncomingWebhook("iw1", client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/incoming-webhooks/iw1");
    expect(fetchFn.mock.calls[0][1].method).toBe("DELETE");
  });

  it("deleteIncomingWebhook encodes the webhook id", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteIncomingWebhook("iw/1", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/incoming-webhooks/iw%2F1",
    );
  });
});
