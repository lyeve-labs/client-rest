import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { getSchemas, getSchema, upsertSchema, deleteSchema, getSchemaStats } from '@lyeve/cms-client-rest';
import type { Schema } from '@lyeve/cms-client';

function mkClient(body: unknown = {}) {
	const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
		new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }));
	return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

const s: Schema = { name: 'articles', display_name: 'Articles', fields: [{ name: 'title', field_type: 'text', required: true, unique: false, indexed: false }] };

describe('REST schemas', () => {
	it('getSchemas', async () => {
		const { client, fetchFn } = mkClient([s]);
		expect(await getSchemas(client)).toEqual([s]);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/schemas');
	});
	it('upsertSchema', async () => {
		const { client, fetchFn } = mkClient(s);
		await upsertSchema(s, client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/schemas');
		expect(fetchFn.mock.calls[0][1].method).toBe('POST');
	});

	it('getSchema encodes name and GETs single schema', async () => {
		const { client, fetchFn } = mkClient(s);
		await getSchema('articles', client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/schemas/articles');
		expect(fetchFn.mock.calls[0][1].method).toBe('GET');
	});

	it('getSchema encodes special characters in name', async () => {
		const { client, fetchFn } = mkClient(s);
		await getSchema('my schema', client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/schemas/my%20schema');
	});

	it('deleteSchema encodes name and DELETEs', async () => {
		const { client, fetchFn } = mkClient({}, 204);
		await deleteSchema('articles', client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/schemas/articles');
		expect(fetchFn.mock.calls[0][1].method).toBe('DELETE');
	});

	it('getSchemaStats GETs stats subpath', async () => {
		const { client, fetchFn } = mkClient({ rows: 42, table: 'articles' });
		const stats = await getSchemaStats('articles', client);
		expect(stats).toEqual({ rows: 42, table: 'articles' });
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/schemas/articles/stats');
	});
});
