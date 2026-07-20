import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { searchLogs, getLoggingLevels, getLoggingConfig, getLogVolume } from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}) {
  const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
    new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }));
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST logs', () => {
  it('searchLogs(client, params) GETs /api/admin/logs/search with query params', async () => {
    const { client, fetchFn } = mkClient({ results: [{ timestamp: '2025-01-01T00:00:00Z', level: 'ERROR', message: 'boom' }], total: 1, limit: 100, offset: 0 });
    const result = await searchLogs(client, { query: 'boom', level: 'ERROR', limit: 50 });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].level).toBe('ERROR');
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain('/api/admin/logs/search?');
    expect(url).toContain('query=boom');
    expect(url).toContain('level=ERROR');
    expect(url).toContain('limit=50');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('searchLogs defaults limit to 100', async () => {
    const { client, fetchFn } = mkClient({ results: [], total: 0, limit: 100, offset: 0 });
    await searchLogs(client, {});
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain('limit=100');
  });

  it('searchLogs omits query and level when empty', async () => {
    const { client, fetchFn } = mkClient({ results: [], total: 0, limit: 100, offset: 0 });
    await searchLogs(client, {});
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).not.toContain('query=');
    expect(url).not.toContain('level=');
    expect(url).toContain('limit=100');
  });

  it('searchLogs omits params entirely when undefined', async () => {
    const { client, fetchFn } = mkClient({ results: [], total: 0, limit: 100, offset: 0 });
    await searchLogs(client);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toBe('/api/admin/logs/search?limit=100');
  });

  it('getLoggingLevels GETs /api/admin/logging/levels', async () => {
    const { client, fetchFn } = mkClient({ default_level: 0, tenants: {}, plugins: {} });
    const levels = await getLoggingLevels(client);
    expect(levels.default_level).toBe(0);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/logging/levels');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('getLoggingConfig GETs /api/admin/logging/config', async () => {
    const { client, fetchFn } = mkClient({ sinks: [{ driver: 'stdout' }], levels: { default_level: 0, tenants: {}, plugins: {} }, redacted_fields: ['password'] });
    const config = await getLoggingConfig(client);
    expect(config.sinks).toHaveLength(1);
    expect(config.redacted_fields).toContain('password');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/logging/config');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('getLogVolume(client, window) GETs /api/admin/logging/volume?window=...', async () => {
    const { client, fetchFn } = mkClient({ total: 1000, by_level: {}, by_tenant: {}, by_plugin: {}, window: '1h', since: '2025-01-01T00:00:00Z', alerts: [] });
    const stats = await getLogVolume(client, '1h');
    expect(stats.total).toBe(1000);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/logging/volume?window=1h');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('getLogVolume defaults window to 1h', async () => {
    const { client, fetchFn } = mkClient({ total: 0, by_level: {}, by_tenant: {}, by_plugin: {}, window: '1h', since: '', alerts: [] });
    await getLogVolume(client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/logging/volume?window=1h');
  });

  it('getLogVolume encodes the window parameter', async () => {
    const { client, fetchFn } = mkClient({ total: 0, by_level: {}, by_tenant: {}, by_plugin: {}, window: '24h', since: '', alerts: [] });
    await getLogVolume(client, '24h');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/logging/volume?window=24h');
  });
});
