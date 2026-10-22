import { describe, it, expect, vi } from "vitest";
import { createClient } from "@lyeve-labs/client";
import { eraseSubject, isLegalHoldError } from "../src/index.js";

function clientAnswering(status: number, body: unknown) {
  const fetchFn = vi.fn(
    async (_url: string, _init: RequestInit): Promise<Response> =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  );
  return createClient(fetchFn as unknown as typeof fetch);
}

async function thrownBy(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (err) {
    return err;
  }
  throw new Error("expected the request to throw");
}

const superAdminBody = {
  error: "a legal hold covers this data",
  code: "legal_hold",
  request_id: "req-1",
  removal_allowed: true,
  holds_changed: false,
  partial: false,
  holds: [
    {
      id: "6f1c2a4e-0000-4000-8000-000000000001",
      reason: "Smith v. Acme",
      scope: "tenant",
      tenant_id: "acme",
      placed_by: "6f1c2a4e-0000-4000-8000-000000000002",
      placed_by_email: "counsel@acme.test",
      placed_at: "2026-10-01T09:00:00Z",
    },
  ],
  impact: [{ kind: "content_entries", effect: "removed", count: 120 }],
};

describe("isLegalHoldError", () => {
  it("recognizes the 409 a super admin gets, with holds and impact", async () => {
    const err = await thrownBy(
      eraseSubject("user@example.com", clientAnswering(409, superAdminBody)),
    );
    expect(isLegalHoldError(err)).toBe(true);
    if (!isLegalHoldError(err)) return;
    expect(err.body.removal_allowed).toBe(true);
    expect(err.body.holds?.[0].scope).toBe("tenant");
    expect(err.body.holds?.[0].placed_by_email).toBe("counsel@acme.test");
    expect(err.body.impact?.[0]).toEqual({
      kind: "content_entries",
      effect: "removed",
      count: 120,
    });
  });

  it("recognizes the 409 anyone else gets, with a count and no holds", async () => {
    const err = await thrownBy(
      eraseSubject(
        "user@example.com",
        clientAnswering(409, {
          error: "a legal hold covers this data",
          code: "legal_hold",
          holds_changed: false,
          partial: false,
          hold_count: 2,
        }),
      ),
    );
    expect(isLegalHoldError(err)).toBe(true);
    if (!isLegalHoldError(err)) return;
    expect(err.body.holds).toBeUndefined();
    expect(err.body.removal_allowed).toBeUndefined();
    expect(err.body.hold_count).toBe(2);
  });

  it("rejects a 409 with another code", async () => {
    const err = await thrownBy(
      eraseSubject(
        "user@example.com",
        clientAnswering(409, { error: "slug taken", code: "conflict" }),
      ),
    );
    expect(err).toBeInstanceOf(Error);
    expect(isLegalHoldError(err)).toBe(false);
  });

  it("rejects values that are not a refusal", () => {
    expect(isLegalHoldError(undefined)).toBe(false);
    expect(isLegalHoldError(null)).toBe(false);
    expect(isLegalHoldError(new Error("boom"))).toBe(false);
    expect(isLegalHoldError({ status: 400, body: superAdminBody })).toBe(false);
  });
});
