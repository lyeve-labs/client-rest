import type { HttpClient } from '@lyeve/cms-client';
import type { Schema } from '@lyeve/cms-client';

export function getSchemas(client: HttpClient): Promise<Schema[]> {
	return client.get<Schema[]>('/api/admin/schemas');
}

export function getSchema(name: string, client: HttpClient): Promise<Schema> {
	return client.get<Schema>(`/api/admin/schemas/${encodeURIComponent(name)}`);
}

export function upsertSchema(schema: Schema, client: HttpClient): Promise<Schema> {
	return client.post<Schema>('/api/admin/schemas', schema);
}

export function deleteSchema(name: string, client: HttpClient): Promise<void> {
	return client.delete<void>(`/api/admin/schemas/${encodeURIComponent(name)}`);
}

export interface SchemaStats {
	rows: number;
	table: string;
}

/** Retained as a path-encoding regression fixture - no production caller yet. */
export function getSchemaStats(name: string, client: HttpClient): Promise<SchemaStats> {
	return client.get<SchemaStats>(`/api/admin/schemas/${encodeURIComponent(name)}/stats`);
}
