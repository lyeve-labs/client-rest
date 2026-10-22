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

/** Result of a subject erasure (backend: api.ExportResponse). */
export interface DsarEraseResult {
  identifier: string;
  total_rows: number;
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
 */
export function eraseSubject(
  subject: string,
  client: HttpClient,
  override?: LegalHoldOverride,
): Promise<DsarEraseResult> {
  return client.post<DsarEraseResult>("/api/admin/gdpr/erase", {
    identifier: subject,
    ...(override && {
      override_legal_hold: override.override_legal_hold,
      override_reason: override.override_reason,
      confirmed_hold_ids: override.confirmed_hold_ids,
    }),
  });
}
