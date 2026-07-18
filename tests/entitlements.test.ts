import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { getEntitlements } from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}) {
  const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
    new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }));
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST entitlements', () => {
  it('getEntitlements GETs /api/admin/entitlements', async () => {
    const { client, fetchFn } = mkClient({ plan: 'pro', state: 'active', features: ['search', 'analytics'], caps: { users: 100 } });
    const result = await getEntitlements(client);
    expect(result.plan).toBe('pro');
    expect(result.state).toBe('active');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/entitlements');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });
});
