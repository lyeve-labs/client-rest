import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { getSchemas, upsertSchema } from '@lyeve/cms-client-rest';
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
});
