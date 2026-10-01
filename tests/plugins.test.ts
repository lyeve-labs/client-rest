import { describe, it, expect, vi } from "vitest";
import { createClient, ApiError } from "@lyeve-labs/client";
import {
  getPluginStatus,
  getPluginSchema,
  getPluginConfig,
  savePluginConfig,
  resetPluginConfig,
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

describe("REST plugins - status & schema", () => {
  it("getPluginStatus GETs /api/admin/plugins/status", async () => {
    const { client, fetchFn } = mkClient({
      compiled: ["content", "media"],
      entitled: ["content"],
      plugins: [],
    });
    const report = await getPluginStatus(client);
    expect(report.compiled).toContain("content");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/plugins/status");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getPluginSchema GETs /api/admin/plugins/{name}/schema", async () => {
    const { client, fetchFn } = mkClient({
      type: "object",
      properties: { api_key: { type: "string" } },
    });
    const schema = await getPluginSchema("content", client);
    expect(schema.type).toBe("object");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/plugins/content/schema");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getPluginSchema encodes the plugin name", async () => {
    const { client, fetchFn } = mkClient({});
    await getPluginSchema("my plugin", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/plugins/my%20plugin/schema",
    );
  });
});

describe("REST plugins - config", () => {
  it("getPluginConfig returns config for existing plugin", async () => {
    const { client, fetchFn } = mkClient({
      api_key: "sk-xxx",
      endpoint: "https://api.example.com",
    });
    const config = await getPluginConfig("my-plugin", client);
    expect(config).toEqual({
      api_key: "sk-xxx",
      endpoint: "https://api.example.com",
    });
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/plugins/my-plugin/config",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getPluginConfig returns null on 404", async () => {
    const { client } = mkClient({ error: "not found" }, 404);
    const config = await getPluginConfig("my-plugin", client);
    expect(config).toBeNull();
  });

  it("getPluginConfig rethrows non-404 errors", async () => {
    const { client } = mkClient({ error: "forbidden" }, 403);
    await expect(getPluginConfig("my-plugin", client)).rejects.toThrow(
      ApiError,
    );
  });

  it("savePluginConfig PUTs config to /api/admin/plugins/{name}/config", async () => {
    const { client, fetchFn } = mkClient({ api_key: "new-key" });
    const cfg = { api_key: "new-key" };
    const result = await savePluginConfig("my-plugin", cfg, client);
    expect(result).toEqual({ api_key: "new-key" });
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/plugins/my-plugin/config",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(cfg);
  });

  it("resetPluginConfig POSTs to /api/admin/plugins/{name}/config/reset", async () => {
    const { client, fetchFn } = mkClient({});
    const result = await resetPluginConfig("my-plugin", client);
    expect(result).toEqual({});
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/plugins/my-plugin/config/reset",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });
});
