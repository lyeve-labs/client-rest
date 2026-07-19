import type {
	Webhook,
	WebhookDelivery,
	WebhookTestResult,
	RetryDeliveryResult,
	RetryConfig,
	RetryConfigInput,
	DeadLetter,
	PaginatedResponse,
	WebhookHealthStats,
	GlobalHealthStats,
} from '@lyeve/cms-client';
import type { HttpClient } from '@lyeve/cms-client';

export interface CreateWebhookInput {
	name: string;
	url: string;
	events: string[];
	schemas: string[];
	secret: string;
	enabled: boolean;
}

export type UpdateWebhookInput = Partial<CreateWebhookInput>;

export function listWebhooks(client: HttpClient): Promise<Webhook[]> {
	return client.get<Webhook[]>('/api/admin/webhooks');
}

/** Retained as a path-encoding regression fixture - no production caller yet. */
export function getWebhook(id: string, client: HttpClient): Promise<Webhook> {
	return client.get<Webhook>(`/api/admin/webhooks/${encodeURIComponent(id)}`);
}

export function createWebhook(input: CreateWebhookInput, client: HttpClient): Promise<Webhook> {
	return client.post<Webhook>('/api/admin/webhooks', input);
}

export function updateWebhook(id: string, input: UpdateWebhookInput, client: HttpClient): Promise<Webhook> {
	return client.put<Webhook>(`/api/admin/webhooks/${encodeURIComponent(id)}`, input);
}

export function deleteWebhook(id: string, client: HttpClient): Promise<void> {
	return client.delete<void>(`/api/admin/webhooks/${encodeURIComponent(id)}`);
}

export function testWebhook(id: string, client: HttpClient): Promise<WebhookTestResult> {
	return client.post<WebhookTestResult>(`/api/admin/webhooks/${encodeURIComponent(id)}/test`, {});
}

export function listDeliveries(id: string, client: HttpClient, limit = 50): Promise<WebhookDelivery[]> {
	return client.get<WebhookDelivery[]>(`/api/admin/webhooks/${encodeURIComponent(id)}/deliveries?limit=${limit}`);
}

// Secret rotation

/** Rotate a webhook signing secret. Provide new_secret or omit for auto-generated.
 *  Requires super_admin. */
export function rotateSecret(
	id: string,
	client: HttpClient,
	newSecret?: string
): Promise<Webhook> {
	return client.post<Webhook>(`/api/admin/webhooks/${encodeURIComponent(id)}/rotate-secret`, {
		new_secret: newSecret,
	});
}

// Delivery retry

/** Re-fire a previously failed delivery synchronously. Requires admin. */
export function retryDelivery(
	id: string,
	deliveryId: string,
	client: HttpClient
): Promise<RetryDeliveryResult> {
	return client.post<RetryDeliveryResult>(
		`/api/admin/webhooks/${encodeURIComponent(id)}/deliveries/${encodeURIComponent(deliveryId)}/retry`,
		{}
	);
}

// Dead letter queue

/** List dead letter entries with optional status filter. Requires admin. */
export function listDeadLetters(
	client: HttpClient,
	status?: string,
	limit = 50,
	offset = 0
): Promise<PaginatedResponse<DeadLetter>> {
	const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
	if (status) params.set('status', status);
	return client.get<PaginatedResponse<DeadLetter>>(`/api/admin/webhook-dead-letters?${params}`);
}

/** Get a single dead letter entry. Requires admin. */
export function getDeadLetter(id: string, client: HttpClient): Promise<DeadLetter> {
	return client.get<DeadLetter>(`/api/admin/webhook-dead-letters/${encodeURIComponent(id)}`);
}

/** Replay a dead letter by re-firing it to the webhook URL. Requires admin. */
export function replayDeadLetter(
	id: string,
	client: HttpClient
): Promise<{ id: string; status: string; http_status: number }> {
	return client.post<{ id: string; status: string; http_status: number }>(
		`/api/admin/webhook-dead-letters/${encodeURIComponent(id)}/replay`,
		{}
	);
}

/** Dismiss a dead letter (no retry). Requires admin. */
export function dismissDeadLetter(
	id: string,
	client: HttpClient
): Promise<{ id: string; status: string }> {
	return client.post<{ id: string; status: string }>(
		`/api/admin/webhook-dead-letters/${encodeURIComponent(id)}/dismiss`,
		{}
	);
}

/** Permanently delete a dead letter entry. Requires admin. */
export function deleteDeadLetter(id: string, client: HttpClient): Promise<void> {
	return client.delete<void>(`/api/admin/webhook-dead-letters/${encodeURIComponent(id)}`);
}

// Retry config

/** Get per-webhook retry configuration. Requires admin. */
export function getRetryConfig(id: string, client: HttpClient): Promise<RetryConfig> {
	return client.get<RetryConfig>(`/api/admin/webhooks/${encodeURIComponent(id)}/retry-config`);
}

/** Create or update per-webhook retry configuration. Requires admin. */
export function updateRetryConfig(
	id: string,
	input: RetryConfigInput,
	client: HttpClient
): Promise<RetryConfig> {
	return client.put<RetryConfig>(`/api/admin/webhooks/${encodeURIComponent(id)}/retry-config`, input);
}

// Health

/** Get per-webhook delivery health stats. Requires admin. */
export function getWebhookHealth(
	id: string,
	client: HttpClient
): Promise<WebhookHealthStats> {
	return client.get<WebhookHealthStats>(`/api/admin/webhooks/${encodeURIComponent(id)}/health`);
}

/** Get global aggregated health stats across all webhooks. Requires admin. */
export function getGlobalHealth(client: HttpClient): Promise<GlobalHealthStats> {
	return client.get<GlobalHealthStats>('/api/admin/webhooks/health');
}
