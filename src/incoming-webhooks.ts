import type { HttpClient } from '@lyeve/cms-client';
import type { IncomingWebhook } from '@lyeve/cms-client';

export interface IncomingWebhookInput {
	name: string;
	schema_name: string;
	secret?: string;
	field_map?: Record<string, string>;
	enabled?: boolean;
	allowed_ips?: string[];
}

export async function listIncomingWebhooks(client: HttpClient): Promise<IncomingWebhook[]> {
	return client.get<IncomingWebhook[]>('/api/admin/incoming-webhooks');
}

/** Retained as a path-encoding regression fixture - no production caller yet. */
export async function getIncomingWebhook(id: string, client: HttpClient): Promise<IncomingWebhook> {
	return client.get<IncomingWebhook>(`/api/admin/incoming-webhooks/${encodeURIComponent(id)}`);
}

export async function createIncomingWebhook(
	input: IncomingWebhookInput,
	client: HttpClient
): Promise<IncomingWebhook> {
	return client.post<IncomingWebhook>('/api/admin/incoming-webhooks', input);
}

export async function updateIncomingWebhook(
	id: string,
	input: IncomingWebhookInput,
	client: HttpClient
): Promise<IncomingWebhook> {
	return client.put<IncomingWebhook>(`/api/admin/incoming-webhooks/${encodeURIComponent(id)}`, input);
}

export async function deleteIncomingWebhook(id: string, client: HttpClient): Promise<void> {
	return client.delete(`/api/admin/incoming-webhooks/${encodeURIComponent(id)}`);
}
