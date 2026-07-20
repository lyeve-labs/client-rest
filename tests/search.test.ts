import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { search, listSynonyms, getRanking } from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}) {
  const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
    new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }));
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST search', () => {
  it('search GETs /api/admin/search?q={query}', async () => {
    const { client, fetchFn } = mkClient({ results: [{ entry_id: 'e1', schema: 'articles', title: 'Hello' }], total: 1, limit: 25, offset: 0, query: 'hello' });
    const result = await search('hello', client);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe('Hello');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/search?q=hello');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('search encodes the query string', async () => {
    const { client, fetchFn } = mkClient({ results: [], total: 0, limit: 25, offset: 0, query: 'hello world' });
    await search('hello world', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/search?q=hello%20world');
  });

  it('search encodes special characters', async () => {
    const { client, fetchFn } = mkClient({ results: [], total: 0, limit: 25, offset: 0, query: 'a&b=c' });
    await search('a&b=c', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/search?q=a%26b%3Dc');
  });

  it('listSynonyms GETs /api/admin/search/synonyms', async () => {
    const { client, fetchFn } = mkClient({ data: [{ id: 's1', name: 'Synonyms', base_term: 'car', synonyms: ['auto', 'vehicle'] }], total_count: 1, limit: 20, offset: 0 });
    const synonyms = await listSynonyms(client);
    expect(synonyms).toHaveLength(1);
    expect(synonyms[0].base_term).toBe('car');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/search/synonyms');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('listSynonyms returns empty array when data is nullish', async () => {
    const { client } = mkClient({ total_count: 0 });
    const synonyms = await listSynonyms(client);
    expect(synonyms).toEqual([]);
  });

  it('getRanking(client, schema) GETs /api/admin/search/ranking?schema=X', async () => {
    const { client, fetchFn } = mkClient({ id: 'r1', schema_name: 'articles', title_weight: 2, body_weight: 1, tag_weight: 1, boost_rules: [], created_at: '', updated_at: '' });
    const ranking = await getRanking(client, 'articles');
    expect(ranking.schema_name).toBe('articles');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/search/ranking?schema=articles');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('getRanking(client) defaults schema to *', async () => {
    const { client, fetchFn } = mkClient({ schema_name: '*' });
    await getRanking(client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/search/ranking?schema=*');
  });

  it('getRanking encodes the schema name', async () => {
    const { client, fetchFn } = mkClient({ schema_name: 'my schema' });
    await getRanking(client, 'my schema');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/search/ranking?schema=my%20schema');
  });
});
