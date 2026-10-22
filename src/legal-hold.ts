import type { ApiError } from "@lyeve-labs/client";

/** A legal hold that covers the data a request would remove. */
export interface LegalHoldRef {
  id: string;
  reason: string;
  /** `subject` covers one person, `tenant` covers the whole tenant. */
  scope: "subject" | "tenant";
  tenant_id: string;
  /** The user id that placed the hold, or `system`. */
  placed_by: string;
  placed_by_email: string;
  placed_at?: string;
}

/**
 * What a removal takes, by kind. Known kinds are listed, and a plugin may
 * report its own as `<plugin>:<kind>`.
 */
export type ImpactKind =
  | "content_entries"
  | "content_versions"
  | "record_revisions"
  | "activity_lines"
  | "audit_entries"
  | "account"
  | "sessions"
  | (string & {});

export interface ImpactCount {
  kind: ImpactKind;
  effect: "removed" | "anonymized";
  count: number;
}

/**
 * The body of the engine's 409 when a legal hold covers the data. A super
 * admin gets `holds` and `removal_allowed`. Anyone else gets only
 * `hold_count`, so a console can say a hold exists without naming it.
 */
export interface LegalHoldRefusal {
  error: string;
  code: "legal_hold";
  request_id?: string;
  /** Whether the tenant allows a super admin to remove held data. */
  removal_allowed?: boolean;
  /** A hold was placed or released since the caller confirmed the list. */
  holds_changed: boolean;
  /** Part of the removal ran before a new hold stopped it. */
  partial: boolean;
  holds?: LegalHoldRef[];
  hold_count?: number;
  impact?: ImpactCount[];
}

/**
 * Sent with a request to remove held data anyway. `confirmed_hold_ids` names
 * every hold the caller showed, and the engine refuses again when the holds
 * changed since.
 */
export interface LegalHoldOverride {
  override_legal_hold: true;
  override_reason: string;
  confirmed_hold_ids: string[];
}

/** A thrown error that carries a legal hold refusal. */
export type LegalHoldError = ApiError & {
  status: 409;
  body: LegalHoldRefusal;
};

/**
 * Reports whether a thrown error is the engine's legal hold refusal. It reads
 * the shape rather than the class, so an error from a second copy of the base
 * client still matches.
 */
export function isLegalHoldError(err: unknown): err is LegalHoldError {
  if (typeof err !== "object" || err === null) return false;
  const { status, body } = err as { status?: unknown; body?: unknown };
  return (
    status === 409 &&
    typeof body === "object" &&
    body !== null &&
    (body as { code?: unknown }).code === "legal_hold"
  );
}
