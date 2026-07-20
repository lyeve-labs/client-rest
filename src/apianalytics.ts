import type { HttpClient } from '@lyeve/cms-client';


// Response shapes - mirror core-plugin-apianalytics/plugin/types.go

/** Optional filters accepted by every metrics query endpoint. */
export interface MetricsQuery {
	tenant_id?: string;
	endpoint?: string;
	method?: string;
	user_agent_family?: string;
	/** ISO8601, inclusive. */
	from?: string;
	/** ISO8601, inclusive. */
	to?: string;
	/** Max 500, default 30 (server-clamped). */
	limit?: number;
}

/** Rolled-up view of API metrics for a time range. */
export interface Summary {
	from: string;
	to: string;

	total_requests: number;
	total_2xx: number;
	total_4xx: number;
	total_5xx: number;
	error_rate: number;

	avg_latency_p50_ms: number;
	avg_latency_p95_ms: number;
	avg_latency_p99_ms: number;
	max_latency_p99_ms: number;

	avg_request_size_bytes: number;
	max_request_size_bytes: number;

	unique_endpoints: number;
	unique_tenants: number;
	unique_methods: number;
	unique_user_agents: number;
}

/** A single dimension row in a breakdown query. */
export interface BreakdownItem {
	key: string;
	request_count: number;
	error_rate: number;
	avg_latency_p95_ms: number;
	max_latency_p99_ms: number;
	request_size_avg_bytes: number;
}

/** Wraps a list of breakdown items (endpoints/tenants/methods/agents). */
export interface BreakdownResponse {
	items: BreakdownItem[];
	total: number;
}

/** A single point in a time-series trend. */
export interface TrendPoint {
	hour: string;
	request_count: number;
	error_rate: number;
	avg_latency_p95_ms: number;
	max_latency_p99_ms: number;
}

/** Time-ordered list of trend points. */
export interface TrendResponse {
	points: TrendPoint[];
}

/** A single anomalous hour flagged by the detector. */
export interface AnomalyPoint {
	hour: string;
	/** e.g. "request_count", "error_rate". */
	metric_name: string;
	actual_value: number;
	expected_avg: number;
	z_score: number;
	/** "low" | "medium" | "high". */
	severity: string;
}

/** Detected anomalies with the detection window and threshold. */
export interface AnomalyResponse {
	anomalies: AnomalyPoint[];
	window_hours: number;
	z_threshold: number;
}


// Client functions

const BASE = '/api/admin/apianalytics/metrics';

/** Serialize a MetricsQuery into a URL query string (empty values dropped). */
function qs(query?: MetricsQuery): string {
	if (!query) return '';
	const params = new URLSearchParams();
	for (const [k, v] of Object.entries(query)) {
		if (v === undefined || v === null || v === '') continue;
		params.set(k, String(v));
	}
	const s = params.toString();
	return s ? `?${s}` : '';
}

/** GET /metrics/summary - rolled-up totals for the range. */
export function getSummary(query: MetricsQuery | undefined, client: HttpClient): Promise<Summary> {
	return client.get<Summary>(`${BASE}/summary${qs(query)}`);
}

/** GET /metrics/endpoints - request volume/error/latency grouped by endpoint. */
export function getEndpoints(query: MetricsQuery | undefined, client: HttpClient): Promise<BreakdownResponse> {
	return client.get<BreakdownResponse>(`${BASE}/endpoints${qs(query)}`);
}

/** GET /metrics/tenants - grouped by tenant (super_admin sees all tenants). */
export function getTenants(query: MetricsQuery | undefined, client: HttpClient): Promise<BreakdownResponse> {
	return client.get<BreakdownResponse>(`${BASE}/tenants${qs(query)}`);
}

/** GET /metrics/methods - grouped by HTTP method. */
export function getMethods(query: MetricsQuery | undefined, client: HttpClient): Promise<BreakdownResponse> {
	return client.get<BreakdownResponse>(`${BASE}/methods${qs(query)}`);
}

/** GET /metrics/agents - grouped by user-agent family. */
export function getAgents(query: MetricsQuery | undefined, client: HttpClient): Promise<BreakdownResponse> {
	return client.get<BreakdownResponse>(`${BASE}/agents${qs(query)}`);
}

/** GET /metrics/trend - hourly time-series. */
export function getTrend(query: MetricsQuery | undefined, client: HttpClient): Promise<TrendResponse> {
	return client.get<TrendResponse>(`${BASE}/trend${qs(query)}`);
}

/** GET /metrics/anomalies - detected anomalous hours. */
export function getAnomalies(query: MetricsQuery | undefined, client: HttpClient): Promise<AnomalyResponse> {
	return client.get<AnomalyResponse>(`${BASE}/anomalies${qs(query)}`);
}
