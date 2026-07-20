import type { HttpClient } from '@lyeve/cms-client';

// Types mirror the core-plugin-logging JSON shapes.

/** A single log entry returned by the search endpoint. */
export interface LogEntry {
	timestamp: string;
	level: string;
	message: string;
	tenant_id?: string;
	plugin?: string;
	trace_id?: string;
	span_id?: string;
	request_id?: string;
	fields?: Record<string, unknown>;
}

/** Paginated search envelope. */
export interface LogSearchResponse {
	results: LogEntry[];
	total: number;
	limit: number;
	offset: number;
}

/** Point-in-time log-level configuration. Level values are slog.Level integers:
 *  DEBUG=-4, INFO=0, WARN=4, ERROR=8. */
export interface LogLevelSnapshot {
	default_level: number;
	tenants: Record<string, number>;
	plugins: Record<string, number>;
}

/** A configured log sink backend (secrets redacted). */
export interface LogSinkConfig {
	driver: string;
	endpoint?: string;
	labels?: Record<string, string>;
	index_prefix?: string;
	batch_size?: number;
	max_buffer?: number;
}

/** Full logging config. */
export interface LogConfig {
	sinks: LogSinkConfig[];
	levels: LogLevelSnapshot;
	redacted_fields?: string[];
}

/** A triggered volume threshold breach. */
export interface LogVolumeAlert {
	count: number;
	exceeded_by: number;
	checked_at: string;
}

/** Log volume statistics for a time window. */
export interface LogVolumeStats {
	total: number;
	by_level: Record<string, number>;
	by_tenant: Record<string, number>;
	by_plugin: Record<string, number>;
	window: string;
	since: string;
	alerts: LogVolumeAlert[];
}

export interface LogSearchParams {
	query?: string;
	level?: string;
	limit?: number;
}

/** GET /api/admin/logs/search - full-text + level filtered search. */
export function searchLogs(
	client: HttpClient,
	params: LogSearchParams = {}
): Promise<LogSearchResponse> {
	const qs = new URLSearchParams();
	if (params.query) qs.set('query', params.query);
	if (params.level) qs.set('level', params.level);
	qs.set('limit', String(params.limit ?? 100));
	return client.get<LogSearchResponse>(`/api/admin/logs/search?${qs.toString()}`);
}

/** GET /api/admin/logging/levels - current per-tenant/per-plugin log levels. */
export function getLoggingLevels(client: HttpClient): Promise<LogLevelSnapshot> {
	return client.get<LogLevelSnapshot>('/api/admin/logging/levels');
}

/** GET /api/admin/logging/config - full logging configuration. */
export function getLoggingConfig(client: HttpClient): Promise<LogConfig> {
	return client.get<LogConfig>('/api/admin/logging/config');
}

/** GET /api/admin/logging/volume - log volume stats for a window (default 1h). */
export function getLogVolume(client: HttpClient, window = '1h'): Promise<LogVolumeStats> {
	return client.get<LogVolumeStats>(
		`/api/admin/logging/volume?window=${encodeURIComponent(window)}`
	);
}
