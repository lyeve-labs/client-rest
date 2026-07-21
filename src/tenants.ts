import type { HttpClient } from '@lyeve/cms-client';

// Types

export interface Tenant {
	id: string;
	slug: string;
	name: string;
	plan: string;
	enabled: boolean;
	created_at: string;
	updated_at: string;
	suspended_at?: string | null;
	archived: boolean;
	archived_at?: string | null;
	restored_at?: string | null;
}

export interface CreateTenantInput {
	slug: string;
	name: string;
	plan?: string;
}

export interface UpdateTenantInput {
	name?: string;
	plan?: string;
	enabled?: boolean;
}

export interface TenantArchive {
	id: string;
	tenant_id: string;
	archive_path: string;
	size_bytes: number;
	created_at: string;
}

// CRUD

/** GET /api/admin/tenants - list all tenants. Requires super_admin. */
export function listTenants(
	client: HttpClient,
	limit?: number,
	offset?: number
): Promise<{ items: Tenant[]; total: number }> {
	const params = new URLSearchParams();
	if (limit !== undefined) params.set('limit', String(limit));
	if (offset !== undefined) params.set('offset', String(offset));
	const qs = params.toString();
	return client.get<{ items: Tenant[]; total: number }>(
		`/api/admin/tenants${qs ? `?${qs}` : ''}`
	);
}

/** GET /api/admin/tenants/{id} - get a single tenant. Requires super_admin. */
export function getTenant(id: string, client: HttpClient): Promise<Tenant> {
	return client.get<Tenant>(`/api/admin/tenants/${encodeURIComponent(id)}`);
}

/** POST /api/admin/tenants - create a new tenant. Requires super_admin. */
export function createTenant(
	input: CreateTenantInput,
	client: HttpClient
): Promise<Tenant> {
	return client.post<Tenant>('/api/admin/tenants', input);
}

/** PUT /api/admin/tenants/{id} - update a tenant. Requires super_admin. */
export function updateTenant(
	id: string,
	input: UpdateTenantInput,
	client: HttpClient
): Promise<Tenant> {
	return client.put<Tenant>(`/api/admin/tenants/${encodeURIComponent(id)}`, input);
}

/** DELETE /api/admin/tenants/{id} - delete a tenant. Requires super_admin. */
export function deleteTenant(id: string, client: HttpClient): Promise<void> {
	return client.delete<void>(`/api/admin/tenants/${encodeURIComponent(id)}`);
}

// Lifecycle

/** POST /api/admin/tenants/{id}/archive - mark tenant read-only. Requires super_admin. */
export function archiveTenant(id: string, client: HttpClient): Promise<Tenant> {
	return client.post<Tenant>(`/api/admin/tenants/${encodeURIComponent(id)}/archive`, {});
}

/** POST /api/admin/tenants/{id}/restore - un-archive a tenant. Requires super_admin. */
export function restoreTenant(id: string, client: HttpClient): Promise<Tenant> {
	return client.post<Tenant>(`/api/admin/tenants/${encodeURIComponent(id)}/restore`, {});
}

/** POST /api/admin/tenants/{id}/cold-archive - export to cold storage. Requires super_admin. */
export function archiveToColdStorage(id: string, client: HttpClient): Promise<TenantArchive> {
	return client.post<TenantArchive>(
		`/api/admin/tenants/${encodeURIComponent(id)}/cold-archive`,
		{}
	);
}

/** GET /api/admin/tenants/{id}/archives - list cold storage archives. Requires super_admin. */
export function listTenantArchives(id: string, client: HttpClient): Promise<TenantArchive[]> {
	return client.get<TenantArchive[]>(
		`/api/admin/tenants/${encodeURIComponent(id)}/archives`
	);
}

/** POST /api/admin/tenants/{id}/archives/{archiveId}/restore - restore from cold storage. */
export function restoreFromArchive(
	id: string,
	archiveId: string,
	client: HttpClient
): Promise<Tenant> {
	return client.post<Tenant>(
		`/api/admin/tenants/${encodeURIComponent(id)}/archives/${encodeURIComponent(archiveId)}/restore`,
		{}
	);
}
