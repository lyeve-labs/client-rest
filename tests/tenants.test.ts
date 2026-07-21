import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import {
  listTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  archiveTenant,
  restoreTenant,
  archiveToColdStorage,
  listTenantArchives,
  restoreFromArchive,
} from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}, status = 200) {
  const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST tenants - CRUD', () => {
  it('listTenants(client, limit, offset) GETs /api/admin/tenants with pagination', async () => {
    const { client, fetchFn } = mkClient({ items: [{ id: 't1', slug: 'tenant-1', name: 'Tenant 1', plan: 'pro', enabled: true, created_at: '', updated_at: '', archived: false }], total: 1 });
    const result = await listTenants(client, 10, 0);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].slug).toBe('tenant-1');
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain('/api/admin/tenants?');
    expect(url).toContain('limit=10');
    expect(url).toContain('offset=0');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('listTenants omits pagination when not provided', async () => {
    const { client, fetchFn } = mkClient({ items: [], total: 0 });
    await listTenants(client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants');
  });

  it('getTenant GETs /api/admin/tenants/{id}', async () => {
    const { client, fetchFn } = mkClient({ id: 't1', slug: 'tenant-1', name: 'Tenant 1', plan: 'pro', enabled: true, created_at: '', updated_at: '', archived: false });
    const tenant = await getTenant('t1', client);
    expect(tenant.slug).toBe('tenant-1');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t1');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('getTenant encodes the tenant id', async () => {
    const { client, fetchFn } = mkClient({});
    await getTenant('t/1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t%2F1');
  });

  it('createTenant POSTs input to /api/admin/tenants', async () => {
    const { client, fetchFn } = mkClient({ id: 't2', slug: 'new-tenant', name: 'New Tenant', plan: 'starter', enabled: true, created_at: '', updated_at: '', archived: false });
    const input = { slug: 'new-tenant', name: 'New Tenant', plan: 'starter' };
    const tenant = await createTenant(input, client);
    expect(tenant.slug).toBe('new-tenant');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it('createTenant omits plan when not provided', async () => {
    const { client, fetchFn } = mkClient({ id: 't3', slug: 'no-plan', name: 'No Plan', plan: 'free', enabled: true, created_at: '', updated_at: '', archived: false });
    await createTenant({ slug: 'no-plan', name: 'No Plan' }, client);
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ slug: 'no-plan', name: 'No Plan' });
  });

  it('updateTenant PUTs input to /api/admin/tenants/{id}', async () => {
    const { client, fetchFn } = mkClient({ id: 't1', slug: 'tenant-1', name: 'Updated Name', plan: 'enterprise', enabled: true, created_at: '', updated_at: '', archived: false });
    const input = { name: 'Updated Name', plan: 'enterprise', enabled: true };
    const tenant = await updateTenant('t1', input, client);
    expect(tenant.name).toBe('Updated Name');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t1');
    expect(fetchFn.mock.calls[0][1].method).toBe('PUT');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it('deleteTenant DELETEs /api/admin/tenants/{id}', async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteTenant('t1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t1');
    expect(fetchFn.mock.calls[0][1].method).toBe('DELETE');
  });
});

describe('REST tenants - lifecycle', () => {
  it('archiveTenant POSTs to /api/admin/tenants/{id}/archive', async () => {
    const { client, fetchFn } = mkClient({ id: 't1', slug: 'tenant-1', name: 'Tenant 1', plan: 'pro', enabled: false, created_at: '', updated_at: '', archived: true, archived_at: '2025-01-01T00:00:00Z' });
    const tenant = await archiveTenant('t1', client);
    expect(tenant.archived).toBe(true);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t1/archive');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });

  it('restoreTenant POSTs to /api/admin/tenants/{id}/restore', async () => {
    const { client, fetchFn } = mkClient({ id: 't1', archived: false });
    const tenant = await restoreTenant('t1', client);
    expect(tenant.archived).toBe(false);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t1/restore');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });

  it('archiveToColdStorage POSTs to /api/admin/tenants/{id}/cold-archive', async () => {
    const { client, fetchFn } = mkClient({ id: 'a1', tenant_id: 't1', archive_path: 's3://bucket/archives/t1.tar.gz', size_bytes: 1024, created_at: '2025-01-01T00:00:00Z' });
    const archive = await archiveToColdStorage('t1', client);
    expect(archive.archive_path).toContain('s3://');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t1/cold-archive');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });

  it('listTenantArchives GETs /api/admin/tenants/{id}/archives', async () => {
    const { client, fetchFn } = mkClient([{ id: 'a1', tenant_id: 't1', archive_path: 's3://bucket/archives/t1.tar.gz', size_bytes: 1024, created_at: '2025-01-01T00:00:00Z' }]);
    const archives = await listTenantArchives('t1', client);
    expect(archives).toHaveLength(1);
    expect(archives[0].tenant_id).toBe('t1');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t1/archives');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('restoreFromArchive POSTs to /api/admin/tenants/{id}/archives/{archiveId}/restore', async () => {
    const { client, fetchFn } = mkClient({ id: 't1', slug: 'tenant-1', name: 'Tenant 1', plan: 'pro', enabled: true, created_at: '', updated_at: '', archived: false });
    const tenant = await restoreFromArchive('t1', 'a1', client);
    expect(tenant.id).toBe('t1');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t1/archives/a1/restore');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });

  it('restoreFromArchive encodes both ids', async () => {
    const { client, fetchFn } = mkClient({});
    await restoreFromArchive('t/1', 'a/1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/tenants/t%2F1/archives/a%2F1/restore');
  });
});
