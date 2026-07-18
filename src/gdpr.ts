import type { HttpClient } from '@lyeve/cms-client';

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

/** Merged export result across all plugins (backend: cmscore.SubjectExportResult). */
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
}

/**
 * Export all PII held for a data subject across every plugin.
 * The backend body field is `identifier`; `super_admin` role required.
 */
export function exportSubject(
	subject: string,
	client: HttpClient
): Promise<DsarExportResult> {
	return client.post<DsarExportResult>('/api/admin/gdpr/export', { identifier: subject });
}

/**
 * Erase/anonymize all PII held for a data subject across every plugin.
 * The backend body field is `identifier`; `super_admin` role required.
 */
export function eraseSubject(subject: string, client: HttpClient): Promise<DsarEraseResult> {
	return client.post<DsarEraseResult>('/api/admin/gdpr/erase', { identifier: subject });
}
