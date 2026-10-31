import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import { exportSubject, eraseSubject } from "../src/index.js";

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

describe("REST GDPR", () => {
  it("exportSubject POSTs { identifier } to /api/admin/gdpr/export", async () => {
    const { client, fetchFn } = mkClient({
      identifier: "user@example.com",
      plugins: {},
      summary: { total_records: 5, plugins_queried: 3, plugins_with_data: 2 },
      errors: [],
    });
    const result = await exportSubject("user@example.com", client);
    expect(result.identifier).toBe("user@example.com");
    expect(result.summary.total_records).toBe(5);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/gdpr/export");
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({
      identifier: "user@example.com",
    });
  });

  it("eraseSubject POSTs { identifier } to /api/admin/gdpr/erase", async () => {
    const { client, fetchFn } = mkClient({
      identifier: "user@example.com",
      total_rows: 10,
    });
    const result = await eraseSubject("user@example.com", client);
    expect(result.identifier).toBe("user@example.com");
    expect(result.total_rows).toBe(10);
    expect(fetchFn.mock.calls[0][0]).toBe("/api/admin/gdpr/erase");
    expect(fetchFn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({
      identifier: "user@example.com",
    });
  });

  it("eraseSubject sends the override fields only when given an override", async () => {
    const { client, fetchFn } = mkClient({
      identifier: "user@example.com",
      total_rows: 10,
      overridden_holds: [
        {
          id: "hold-1",
          reason: "Smith v. Acme",
          scope: "subject",
          tenant_id: "acme",
          placed_by: "system",
          placed_by_email: "",
        },
      ],
    });
    await eraseSubject("user@example.com", client);
    expect(
      Object.keys(JSON.parse(String(fetchFn.mock.calls[0][1].body))),
    ).toEqual(["identifier"]);

    const result = await eraseSubject("user@example.com", client, {
      override_legal_hold: true,
      override_reason: "Court order lifted the duty to preserve",
      confirmed_hold_ids: ["hold-1"],
    });
    expect(JSON.parse(String(fetchFn.mock.calls[1][1].body))).toEqual({
      identifier: "user@example.com",
      override_legal_hold: true,
      override_reason: "Court order lifted the duty to preserve",
      confirmed_hold_ids: ["hold-1"],
    });
    expect(result.overridden_holds?.[0].id).toBe("hold-1");
  });

  it("eraseSubject reads a 200 as a complete erasure", async () => {
    const { client } = mkClient(
      {
        identifier: "user@example.com",
        total_rows: 10,
        complete: true,
        errors: null,
      },
      200,
    );
    const result = await eraseSubject("user@example.com", client);
    expect(result.complete).toBe(true);
    expect(result.failed).toEqual([]);
  });

  it("eraseSubject reads a 207 as an incomplete erasure with its failed parts", async () => {
    const { client } = mkClient(
      {
        identifier: "user@example.com",
        total_rows: 4,
        complete: false,
        failed: ["analytics", "account"],
        errors: [
          "not finished: analytics, account",
          "the account was not erased: it is signed out and locked until every other part has erased",
          "repeat the request to finish the erasure",
        ],
      },
      207,
    );
    const result = await eraseSubject("user@example.com", client);
    expect(result.complete).toBe(false);
    expect(result.failed).toEqual(["analytics", "account"]);
    expect(result.total_rows).toBe(4);
  });

  it("eraseSubject reads an older engine's answer by its errors", async () => {
    const done = mkClient({
      identifier: "a@example.com",
      total_rows: 3,
      errors: null,
    });
    expect((await eraseSubject("a@example.com", done.client)).complete).toBe(
      true,
    );

    const partial = mkClient({
      identifier: "a@example.com",
      total_rows: 3,
      errors: ["one or more erasers failed"],
    });
    const result = await eraseSubject("a@example.com", partial.client);
    expect(result.complete).toBe(false);
    expect(result.failed).toEqual([]);
  });

  it("exportSubject handles special characters in identifier", async () => {
    const { client, fetchFn } = mkClient({
      identifier: "user+tag@domain.com",
      plugins: {},
      summary: { total_records: 0, plugins_queried: 0, plugins_with_data: 0 },
      errors: [],
    });
    await exportSubject("user+tag@domain.com", client);
    expect(JSON.parse(String(fetchFn.mock.calls[0][1].body))).toEqual({
      identifier: "user+tag@domain.com",
    });
  });
});
