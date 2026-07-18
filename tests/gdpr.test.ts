import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { exportSubject, eraseSubject } from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}, status = 200) {
  const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST GDPR', () => {
  it('exportSubject POSTs { identifier } to /api/admin/gdpr/export', async () => {
    const { client, fetchFn } = mkClient({ identifier: 'user@example.com', plugins: {}, summary: { total_records: 5, plugins_queried: 3, plugins_with_data: 2 }, errors: [] });
    const result = await exportSubject('user@example.com', client);
    expect(result.identifier).toBe('user@example.com');
    expect(result.summary.total_records).toBe(5);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/gdpr/export');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ identifier: 'user@example.com' });
  });

  it('eraseSubject POSTs { identifier } to /api/admin/gdpr/erase', async () => {
    const { client, fetchFn } = mkClient({ identifier: 'user@example.com', total_rows: 10 });
    const result = await eraseSubject('user@example.com', client);
    expect(result.identifier).toBe('user@example.com');
    expect(result.total_rows).toBe(10);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/gdpr/erase');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ identifier: 'user@example.com' });
  });

  it('exportSubject handles special characters in identifier', async () => {
    const { client, fetchFn } = mkClient({ identifier: 'user+tag@domain.com', plugins: {}, summary: { total_records: 0, plugins_queried: 0, plugins_with_data: 0 }, errors: [] });
    await exportSubject('user+tag@domain.com', client);
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ identifier: 'user+tag@domain.com' });
  });
});
