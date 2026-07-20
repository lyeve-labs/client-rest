import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import {
  getSummary,
  getEndpoints,
  getTenants,
  getMethods,
  getAgents,
  getTrend,
  getAnomalies,
} from "../src/index.js";
import type { MetricsQuery } from "../src/index.js";

function mkClient(body: unknown = {}) {
  const fetchFn = vi.fn(
    async (_url: string, _init: RequestInit): Promise<Response> =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  );
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

const BASE = "/api/admin/apianalytics/metrics";

describe("REST API analytics", () => {
  it("getSummary(query, client) GETs /metrics/summary with query string", async () => {
    const { client, fetchFn } = mkClient({
      total_requests: 1000,
      total_2xx: 950,
      total_4xx: 40,
      total_5xx: 10,
      error_rate: 0.01,
      avg_latency_p50_ms: 50,
      avg_latency_p95_ms: 200,
      avg_latency_p99_ms: 500,
      max_latency_p99_ms: 2000,
      avg_request_size_bytes: 1024,
      max_request_size_bytes: 65536,
      unique_endpoints: 10,
      unique_tenants: 3,
      unique_methods: 5,
      unique_user_agents: 2,
      from: "2025-01-01T00:00:00Z",
      to: "2025-01-02T00:00:00Z",
    });
    const query: MetricsQuery = {
      tenant_id: "t1",
      from: "2025-01-01T00:00:00Z",
      to: "2025-01-02T00:00:00Z",
    };
    const summary = await getSummary(query, client);
    expect(summary.total_requests).toBe(1000);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain(`${BASE}/summary?`);
    expect(url).toContain("tenant_id=t1");
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getSummary with no query omits query string", async () => {
    const { client, fetchFn } = mkClient({
      total_requests: 0,
      total_2xx: 0,
      total_4xx: 0,
      total_5xx: 0,
      error_rate: 0,
      avg_latency_p50_ms: 0,
      avg_latency_p95_ms: 0,
      avg_latency_p99_ms: 0,
      max_latency_p99_ms: 0,
      avg_request_size_bytes: 0,
      max_request_size_bytes: 0,
      unique_endpoints: 0,
      unique_tenants: 0,
      unique_methods: 0,
      unique_user_agents: 0,
      from: "",
      to: "",
    });
    await getSummary(undefined, client);
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/summary`);
  });

  it("getSummary drops undefined/null/empty values from query", async () => {
    const { client, fetchFn } = mkClient({
      total_requests: 0,
      total_2xx: 0,
      total_4xx: 0,
      total_5xx: 0,
      error_rate: 0,
      avg_latency_p50_ms: 0,
      avg_latency_p95_ms: 0,
      avg_latency_p99_ms: 0,
      max_latency_p99_ms: 0,
      avg_request_size_bytes: 0,
      max_request_size_bytes: 0,
      unique_endpoints: 0,
      unique_tenants: 0,
      unique_methods: 0,
      unique_user_agents: 0,
      from: "",
      to: "",
    });
    const query: MetricsQuery = {
      tenant_id: "t1",
      endpoint: undefined,
      method: "",
    };
    await getSummary(query, client);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain("tenant_id=t1");
    expect(url).not.toContain("endpoint=");
    expect(url).not.toContain("method=");
  });

  it("getEndpoints GETs /metrics/endpoints", async () => {
    const { client, fetchFn } = mkClient({
      items: [
        {
          key: "GET /api/admin/users",
          request_count: 100,
          error_rate: 0.01,
          avg_latency_p95_ms: 150,
          max_latency_p99_ms: 500,
          request_size_avg_bytes: 500,
        },
      ],
      total: 1,
    });
    const result = await getEndpoints(undefined, client);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].key).toBe("GET /api/admin/users");
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/endpoints`);
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getTenants GETs /metrics/tenants", async () => {
    const { client, fetchFn } = mkClient({ items: [], total: 0 });
    const result = await getTenants(undefined, client);
    expect(result.items).toEqual([]);
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/tenants`);
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getMethods GETs /metrics/methods", async () => {
    const { client, fetchFn } = mkClient({ items: [], total: 0 });
    const result = await getMethods(undefined, client);
    expect(result.items).toEqual([]);
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/methods`);
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getAgents GETs /metrics/agents", async () => {
    const { client, fetchFn } = mkClient({ items: [], total: 0 });
    const result = await getAgents(undefined, client);
    expect(result.items).toEqual([]);
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/agents`);
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getTenants with query filters", async () => {
    const { client, fetchFn } = mkClient({ items: [], total: 0 });
    const query: MetricsQuery = { limit: 10, from: "2025-01-01T00:00:00Z" };
    await getTenants(query, client);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain("limit=10");
    expect(url).toContain("from=2025-01-01T00%3A00%3A00Z");
  });

  it("getTrend GETs /metrics/trend", async () => {
    const { client, fetchFn } = mkClient({
      points: [
        {
          hour: "2025-01-01T10:00:00Z",
          request_count: 200,
          error_rate: 0.02,
          avg_latency_p95_ms: 180,
          max_latency_p99_ms: 600,
        },
      ],
    });
    const result = await getTrend(undefined, client);
    expect(result.points).toHaveLength(1);
    expect(result.points[0].request_count).toBe(200);
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/trend`);
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("getAnomalies GETs /metrics/anomalies", async () => {
    const { client, fetchFn } = mkClient({
      anomalies: [
        {
          hour: "2025-01-01T12:00:00Z",
          metric_name: "error_rate",
          actual_value: 0.15,
          expected_avg: 0.02,
          z_score: 4.2,
          severity: "high",
        },
      ],
      window_hours: 72,
      z_threshold: 3.0,
    });
    const result = await getAnomalies(undefined, client);
    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].severity).toBe("high");
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/anomalies`);
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });
});
