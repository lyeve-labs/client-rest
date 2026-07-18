import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { listOAuthProviders, createOAuthProvider, updateOAuthProvider, deleteOAuthProvider } from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}, status = 200) {
  const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST OAuth providers', () => {
  it('listOAuthProviders GETs /api/admin/oauth-providers', async () => {
    const { client, fetchFn } = mkClient([{ id: 'o1', name: 'GitHub', provider: 'github' }]);
    const providers = await listOAuthProviders(client);
    expect(providers).toHaveLength(1);
    expect(providers[0].name).toBe('GitHub');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/oauth-providers');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('createOAuthProvider POSTs data to /api/admin/oauth-providers', async () => {
    const { client, fetchFn } = mkClient({ id: 'o2', name: 'Google', provider: 'google' });
    const input = { name: 'Google', provider: 'google' as const, client_secret: 'sec', client_id: 'cid', redirect_uri: 'https://example.com/cb', scopes: ['email'], enabled: true };
    const provider = await createOAuthProvider(input, client);
    expect(provider.name).toBe('Google');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/oauth-providers');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it('updateOAuthProvider PUTs data to /api/admin/oauth-providers/{id}', async () => {
    const { client, fetchFn } = mkClient({ id: 'o1', name: 'GitHub Enterprise' });
    const data = { name: 'GitHub Enterprise', scopes: ['repo'] };
    const provider = await updateOAuthProvider('o1', data, client);
    expect(provider.name).toBe('GitHub Enterprise');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/oauth-providers/o1');
    expect(fetchFn.mock.calls[0][1].method).toBe('PUT');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(data);
  });

  it('updateOAuthProvider encodes the provider id', async () => {
    const { client, fetchFn } = mkClient();
    await updateOAuthProvider('o/id', { name: 'X' }, client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/oauth-providers/o%2Fid');
  });

  it('deleteOAuthProvider DELETEs /api/admin/oauth-providers/{id}', async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteOAuthProvider('o1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/oauth-providers/o1');
    expect(fetchFn.mock.calls[0][1].method).toBe('DELETE');
  });
});
