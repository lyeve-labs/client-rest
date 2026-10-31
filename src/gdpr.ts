import type { HttpClient } from "@lyeve-labs/client";
import type { LegalHoldOverride, LegalHoldRef } from "./legal-hold.js";

/** Aggregate statistics for a subject export operation. */
export interface DsarExportSummary {
  total_records: number;
  plugins_queried: number;
  plugins_with_data: number;
}

/** A non-fatal error from a single exporter. */
export interface DsarExportError {
  index: number;
  error: string;
}

/** Merged export result across all plugins (backend: core.SubjectExportResult). */
export interface DsarExportResult {
  identifier: string;
  plugins: Record<string, unknown>;
  summary: DsarExportSummary;
  errors: DsarExportError[];
}

/** Result of a subject erasure (backend: api.EraseResponse). */
export interface DsarEraseResult {
  identifier: string;
  total_rows: number;
  /**
   * True only when every part of the subject's data was erased. A partial
   * erasure answers 207 with this false, and the account itself stays until a
   * repeated request finishes the erasure.
   */
  complete: boolean;
  /** The parts that failed or did not run. Empty when none did. */
  failed: string[];
  errors?: string[];
  /** The legal holds a super admin erased past, present only on an override. */
  overridden_holds?: LegalHoldRef[];
}

/**
 * Export all PII held for a data subject across every plugin.
 * The backend body field is `identifier`. `super_admin` role required.
 */
export function exportSubject(
  subject: string,
  client: HttpClient,
): Promise<DsarExportResult> {
  return client.post<DsarExportResult>("/api/admin/gdpr/export", {
    identifier: subject,
  });
}

/**
 * Erase/anonymize all PII held for a data subject across every plugin.
 * The backend body field is `identifier`. `super_admin` role required.
 *
 * A legal hold on the subject or the tenant refuses with a 409 that
 * `isLegalHoldError` recognizes. Pass `override` to erase anyway. Its fields
 * are sent only then, because an older engine refuses fields it does not know.
 *
 * Check `complete` before telling the subject they are erased. A 207 answer
 * resolves like a 200, with `complete` false and `failed` naming what is left.
 */
export async function eraseSubject(
  subject: string,
  client: HttpClient,
  override?: LegalHoldOverride,
): Promise<DsarEraseResult> {
  const res = await client.post<WireEraseResult>("/api/admin/gdpr/erase", {
    identifier: subject,
    ...(override && {
      override_legal_hold: override.override_legal_hold,
      override_reason: override.override_reason,
      confirmed_hold_ids: override.confirmed_hold_ids,
    }),
  });
  return {
    ...res,
    complete: res.complete ?? (!res.errors?.length && !res.holds?.length),
    failed: res.failed ?? [],
  };
}

/**
 * The erase answer as it arrives. An engine from before `complete` answers
 * 200 for a partial erasure too, so there an error or a legal hold is what
 * says the erasure is unfinished.
 */
type WireEraseResult = Omit<DsarEraseResult, "complete" | "failed"> & {
  complete?: boolean;
  failed?: string[];
  holds?: LegalHoldRef[];
};
