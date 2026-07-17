import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { listContent, createContent, updateContent } from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}) {
	const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
		new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }));
	return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST content', () => {
	it('listContent with defaults', async () => {
		const { client, fetchFn } = mkClient([]);
		await listContent('articles', client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/v1/content/articles?limit=25&offset=0');
	});

	it('listContent with custom limit/offset', async () => {
		const { client, fetchFn } = mkClient([]);
		await listContent('articles', client, 10, 5);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/v1/content/articles?limit=10&offset=5');
	});

	it('createContent wraps data', async () => {
		const { client, fetchFn } = mkClient({ id: 'c1' });
		await createContent('articles', { title: 'Hello' }, client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/v1/content/articles');
		expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ data: { title: 'Hello' } });
	});

	it('updateContent wraps data', async () => {
		const { client, fetchFn } = mkClient({ id: 'c1' });
		await updateContent('articles', 'c1', { title: 'X' }, client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/v1/content/articles/c1');
		expect(fetchFn.mock.calls[0][1].method).toBe('PUT');
	});
});
