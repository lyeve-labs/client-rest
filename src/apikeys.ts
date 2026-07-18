import type { HttpClient } from '@lyeve/cms-client';
import type { APIKey, CreateAPIKeyResponse } from '@lyeve/cms-client';

export async function listAPIKeys(client: HttpClient): Promise<APIKey[]> {
	return client.get<APIKey[]>('/api/admin/api-keys');
}

export async function createAPIKey(
	input: { name: string; roles: string[]; schemas: string[]; expires_at?: string | null },
	client: HttpClient
): Promise<CreateAPIKeyResponse> {
	return client.post<CreateAPIKeyResponse>('/api/admin/api-keys', input);
}

export async function revokeAPIKey(id: string, client: HttpClient): Promise<void> {
	return client.post<void>(`/api/admin/api-keys/${encodeURIComponent(id)}/revoke`, {});
}

export async function deleteAPIKey(id: string, client: HttpClient): Promise<void> {
	return client.delete<void>(`/api/admin/api-keys/${encodeURIComponent(id)}`);
}
