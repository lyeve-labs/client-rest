import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  listProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  listCapabilities,
  upsertCapability,
  getMetrics,
  getDashboard,
  listFallbackRules,
} from "../src/index.js";
import type {
  CreateProviderInput,
  UpdateProviderInput,
  UpsertCapabilityInput,
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

describe("REST providers - CRUD", () => {
  it("listProviders GETs /api/admin/providers", async () => {
    const { client, fetchFn } = mkClient({
      data: [
        {
          id: "p1",
          name: "OpenAI",
          provider_type: "openai",
          default_model: "gpt-4",
          enabled: true,
          priority: 1,
          rate_limit_rpm: 1000,
        },
      ],
      total_count: 1,
      limit: 20,
      offset: 0,
    });
    const providers = await listProviders(client);
    expect(providers).toHaveLength(1);
    expect(providers[0].name).toBe("OpenAI");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/providers");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("listProviders returns empty array when data is nullish", async () => {
    const { client } = mkClient({ total_count: 0 });
    const providers = await listProviders(client);
    expect(providers).toEqual([]);
  });

  it("getProvider GETs /api/admin/providers/{id}", async () => {
    const { client, fetchFn } = mkClient({
      id: "p1",
      name: "OpenAI",
      provider_type: "openai",
      default_model: "gpt-4",
      enabled: true,
      priority: 1,
      rate_limit_rpm: 1000,
      created_at: "",
      updated_at: "",
    });
    const provider = await getProvider("p1", client);
    expect(provider.name).toBe("OpenAI");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/providers/p1");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getProvider encodes the provider id", async () => {
    const { client, fetchFn } = mkClient({});
    await getProvider("p/1", client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/providers/p%2F1");
  });

  it("createProvider POSTs input to /api/admin/providers", async () => {
    const { client, fetchFn } = mkClient({
      id: "p2",
      name: "Anthropic",
      provider_type: "anthropic",
      default_model: "claude-3",
      enabled: true,
      priority: 2,
      rate_limit_rpm: 500,
      created_at: "",
      updated_at: "",
    });
    const input: CreateProviderInput = {
      name: "Anthropic",
      provider_type: "anthropic",
      api_key: "sk-ant-xxx",
      default_model: "claude-3",
      enabled: true,
      priority: 2,
      rate_limit_rpm: 500,
    };
    const provider = await createProvider(input, client);
    expect(provider.name).toBe("Anthropic");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/providers");
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it("updateProvider PUTs input to /api/admin/providers/{id}", async () => {
    const { client, fetchFn } = mkClient({
      id: "p1",
      name: "OpenAI Updated",
      provider_type: "openai",
      default_model: "gpt-4-turbo",
      enabled: true,
      priority: 1,
      rate_limit_rpm: 2000,
      created_at: "",
      updated_at: "",
    });
    const input: UpdateProviderInput = {
      default_model: "gpt-4-turbo",
      rate_limit_rpm: 2000,
    };
    const provider = await updateProvider("p1", input, client);
    expect(provider.default_model).toBe("gpt-4-turbo");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/providers/p1");
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it("deleteProvider DELETEs /api/admin/providers/{id}", async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteProvider("p1", client);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/providers/p1");
    expect(fetchFn.mock.calls[0][1].method).toBe("DELETE");
  });
});

describe("REST providers - capabilities", () => {
  it("listCapabilities GETs /api/admin/providers/{id}/capabilities", async () => {
    const { client, fetchFn } = mkClient({
      data: [
        {
          id: "c1",
          provider_id: "p1",
          model: "gpt-4",
          capabilities: ["vision", "tool_use"],
          context_window: 8192,
          detected_at: "",
          updated_at: "",
        },
      ],
      total_count: 1,
      limit: 20,
      offset: 0,
    });
    const caps = await listCapabilities("p1", client);
    expect(caps).toHaveLength(1);
    expect(caps[0].model).toBe("gpt-4");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/providers/p1/capabilities",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("listCapabilities returns empty array when data is nullish", async () => {
    const { client } = mkClient({ total_count: 0 });
    const caps = await listCapabilities("p1", client);
    expect(caps).toEqual([]);
  });

  it("listCapabilities encodes the provider id", async () => {
    const { client, fetchFn } = mkClient({
      data: [],
      total_count: 0,
      limit: 20,
      offset: 0,
    });
    await listCapabilities("p/1", client);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/providers/p%2F1/capabilities",
    );
  });

  it("upsertCapability PUTs input to /api/admin/providers/{id}/capabilities", async () => {
    const { client, fetchFn } = mkClient({
      id: "c1",
      provider_id: "p1",
      model: "gpt-4",
      capabilities: ["tool_use"],
      context_window: 8192,
      detected_at: "",
      updated_at: "",
    });
    const input: UpsertCapabilityInput = {
      model: "gpt-4",
      capabilities: ["tool_use"],
      context_window: 8192,
    };
    const cap = await upsertCapability("p1", input, client);
    expect(cap.model).toBe("gpt-4");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/providers/p1/capabilities",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });
});

describe("REST providers - metrics, dashboard, fallback rules", () => {
  it("getMetrics GETs /api/admin/providers/metrics", async () => {
    const { client, fetchFn } = mkClient({
      data: {
        metrics: [
          {
            id: "m1",
            provider_id: "p1",
            provider_type: "openai",
            model: "gpt-4",
            operation: "chat",
            tokens_in: 100,
            tokens_out: 50,
            latency_ms: 500,
            cost_micro_usd: 100,
            success: true,
            created_at: "",
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      },
    });
    const result = await getMetrics(client);
    expect(result.metrics).toHaveLength(1);
    expect(result.metrics[0].operation).toBe("chat");
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/providers/metrics");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getMetrics returns empty defaults when data is nullish", async () => {
    const { client } = mkClient({});
    const result = await getMetrics(client);
    expect(result.metrics).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("getDashboard GETs /api/admin/providers/dashboard", async () => {
    const { client, fetchFn } = mkClient({
      total_calls: 1000,
      total_cost_usd: "50.00",
      avg_latency_ms: 300,
      cost_by_provider: null,
      latency_by_model: null,
      enabled_providers: 2,
      total_providers: 3,
    });
    const dashboard = await getDashboard(client);
    expect(dashboard.total_calls).toBe(1000);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/providers/dashboard");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("listFallbackRules GETs /api/admin/providers/fallback-rules", async () => {
    const { client, fetchFn } = mkClient({
      data: [
        {
          id: "f1",
          name: "Fallback to Anthropic",
          primary_provider_id: "p1",
          fallback_provider_id: "p2",
          condition: "error_rate",
          threshold_value: "0.1",
          cooldown_seconds: 300,
          enabled: true,
          priority: 1,
          created_at: "",
          updated_at: "",
        },
      ],
      total_count: 1,
      limit: 20,
      offset: 0,
    });
    const rules = await listFallbackRules(client);
    expect(rules).toHaveLength(1);
    expect(rules[0].name).toBe("Fallback to Anthropic");
    expect(fetchFn.mock.calls[0][0]).toBe(
      "/api/admin/providers/fallback-rules",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("listFallbackRules returns empty array when data is nullish", async () => {
    const { client } = mkClient({ total_count: 0 });
    const rules = await listFallbackRules(client);
    expect(rules).toEqual([]);
  });
});
