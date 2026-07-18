import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { listAPIKeys, createAPIKey, revokeAPIKey, deleteAPIKey } from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}, status = 200) {
  const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST API keys', () => {
  it('listAPIKeys GETs /api/admin/api-keys', async () => {
    const { client, fetchFn } = mkClient([{ id: 'k1', name: 'My Key', roles: ['admin'] }]);
    const keys = await listAPIKeys(client);
    expect(keys).toHaveLength(1);
    expect(keys[0].name).toBe('My Key');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/api-keys');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('createAPIKey POSTs input to /api/admin/api-keys', async () => {
    const { client, fetchFn } = mkClient({ id: 'k2', name: 'New Key', key: 'sk-...' });
    const input = { name: 'New Key', roles: ['editor'], schemas: ['articles'], expires_at: '2027-01-01' };
    const result = await createAPIKey(input, client);
    expect(result.id).toBe('k2');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/api-keys');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it('createAPIKey with null expires_at', async () => {
    const { client, fetchFn } = mkClient({ id: 'k3' });
    const input = { name: 'No Expiry', roles: ['admin'], schemas: [], expires_at: null };
    await createAPIKey(input, client);
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it('revokeAPIKey POSTs to /api/admin/api-keys/{id}/revoke', async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await revokeAPIKey('k1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/api-keys/k1/revoke');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });

  it('revokeAPIKey encodes the key id', async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await revokeAPIKey('k/id', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/api-keys/k%2Fid/revoke');
  });

  it('deleteAPIKey DELETEs /api/admin/api-keys/{id}', async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteAPIKey('k1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/api-keys/k1');
    expect(fetchFn.mock.calls[0][1].method).toBe('DELETE');
  });

  it('deleteAPIKey encodes the key id', async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteAPIKey('k/id', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/api-keys/k%2Fid');
  });
});
