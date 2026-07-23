import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import {
  listWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  listDeliveries,
  rotateSecret,
  retryDelivery,
  listDeadLetters,
  getDeadLetter,
  replayDeadLetter,
  dismissDeadLetter,
  deleteDeadLetter,
  getRetryConfig,
  updateRetryConfig,
  getWebhookHealth,
  getGlobalHealth,
} from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}, status = 200) {
  const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

const webhook = { id: 'wh1', name: 'My Webhook', url: 'https://example.com/hook', events: ['content.created'], schemas: ['articles'], enabled: true };

describe('REST webhooks - CRUD', () => {
  it('listWebhooks GETs /api/admin/webhooks', async () => {
    const { client, fetchFn } = mkClient([webhook]);
    const hooks = await listWebhooks(client);
    expect(hooks).toHaveLength(1);
    expect(hooks[0].name).toBe('My Webhook');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('getWebhook GETs /api/admin/webhooks/{id}', async () => {
    const { client, fetchFn } = mkClient(webhook);
    const hook = await getWebhook('wh1', client);
    expect(hook.id).toBe('wh1');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('getWebhook encodes the webhook id', async () => {
    const { client, fetchFn } = mkClient(webhook);
    await getWebhook('wh/1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh%2F1');
  });

  it('createWebhook POSTs input to /api/admin/webhooks', async () => {
    const { client, fetchFn } = mkClient(webhook);
    const input = { name: 'My Webhook', url: 'https://example.com/hook', events: ['content.created'], schemas: ['articles'], secret: 's3cret', enabled: true };
    const hook = await createWebhook(input, client);
    expect(hook.name).toBe('My Webhook');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it('updateWebhook PUTs partial input to /api/admin/webhooks/{id}', async () => {
    const { client, fetchFn } = mkClient(webhook);
    const input = { enabled: false };
    const hook = await updateWebhook('wh1', input, client);
    expect(hook.enabled).toBe(true);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1');
    expect(fetchFn.mock.calls[0][1].method).toBe('PUT');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it('deleteWebhook DELETEs /api/admin/webhooks/{id}', async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteWebhook('wh1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1');
    expect(fetchFn.mock.calls[0][1].method).toBe('DELETE');
  });

  it('testWebhook POSTs to /api/admin/webhooks/{id}/test', async () => {
    const { client, fetchFn } = mkClient({ ok: true, status_code: 200 });
    const result = await testWebhook('wh1', client);
    expect(result.ok).toBe(true);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1/test');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });
});

describe('REST webhooks - deliveries & rotation', () => {
  it('listDeliveries(id, client, limit) GETs /api/admin/webhooks/{id}/deliveries?limit=N', async () => {
    const { client, fetchFn } = mkClient([{ id: 'd1', status: 'delivered' }]);
    const deliveries = await listDeliveries('wh1', client, 25);
    expect(deliveries).toHaveLength(1);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1/deliveries?limit=25');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('listDeliveries defaults to limit=50', async () => {
    const { client, fetchFn } = mkClient([]);
    await listDeliveries('wh1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1/deliveries?limit=50');
  });

  it('rotateSecret(id, client, newSecret) POSTs new_secret', async () => {
    const { client, fetchFn } = mkClient(webhook);
    const hook = await rotateSecret('wh1', client, 'new-secret');
    expect(hook.id).toBe('wh1');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1/rotate-secret');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ new_secret: 'new-secret' });
  });

  it('rotateSecret(id, client) with no secret sends new_secret: undefined', async () => {
    const { client, fetchFn } = mkClient(webhook);
    await rotateSecret('wh1', client);
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ new_secret: undefined });
  });

  it('retryDelivery POSTs to /api/admin/webhooks/{id}/deliveries/{deliveryId}/retry', async () => {
    const { client, fetchFn } = mkClient({ id: 'd1', status: 'retried', http_status: 200 });
    const result = await retryDelivery('wh1', 'd1', client);
    expect(result.status).toBe('retried');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1/deliveries/d1/retry');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });
});

describe('REST webhooks - dead letter queue', () => {
  it('listDeadLetters(client, status, limit, offset) GETs /api/admin/webhook-dead-letters', async () => {
    const { client, fetchFn } = mkClient({ data: [{ id: 'dl1' }], total_count: 1, limit: 10, offset: 0 });
    const result = await listDeadLetters(client, 'pending', 10, 0);
    expect(result.data).toHaveLength(1);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toContain('/api/admin/webhook-dead-letters?');
    expect(url).toContain('limit=10');
    expect(url).toContain('offset=0');
    expect(url).toContain('status=pending');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('listDeadLetters(client) omits status when undefined', async () => {
    const { client, fetchFn } = mkClient({ data: [], total_count: 0, limit: 50, offset: 0 });
    await listDeadLetters(client);
    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).not.toContain('status=');
    expect(url).toContain('limit=50');
    expect(url).toContain('offset=0');
  });

  it('getDeadLetter GETs /api/admin/webhook-dead-letters/{id}', async () => {
    const { client, fetchFn } = mkClient({ id: 'dl1', status: 'pending' });
    const dl = await getDeadLetter('dl1', client);
    expect(dl.id).toBe('dl1');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhook-dead-letters/dl1');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('replayDeadLetter POSTs to /api/admin/webhook-dead-letters/{id}/replay', async () => {
    const { client, fetchFn } = mkClient({ id: 'dl1', status: 'replayed', http_status: 200 });
    const result = await replayDeadLetter('dl1', client);
    expect(result.status).toBe('replayed');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhook-dead-letters/dl1/replay');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });

  it('dismissDeadLetter POSTs to /api/admin/webhook-dead-letters/{id}/dismiss', async () => {
    const { client, fetchFn } = mkClient({ id: 'dl1', status: 'dismissed' });
    const result = await dismissDeadLetter('dl1', client);
    expect(result.status).toBe('dismissed');
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhook-dead-letters/dl1/dismiss');
    expect(fetchFn.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({});
  });

  it('deleteDeadLetter DELETEs /api/admin/webhook-dead-letters/{id}', async () => {
    const { client, fetchFn } = mkClient(undefined, 204);
    await deleteDeadLetter('dl1', client);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhook-dead-letters/dl1');
    expect(fetchFn.mock.calls[0][1].method).toBe('DELETE');
  });
});

describe('REST webhooks - retry config & health', () => {
  it('getRetryConfig GETs /api/admin/webhooks/{id}/retry-config', async () => {
    const { client, fetchFn } = mkClient({ max_attempts: 3, base_delay_ms: 1000, max_delay_ms: 30000 });
    const config = await getRetryConfig('wh1', client);
    expect(config.max_attempts).toBe(3);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1/retry-config');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('updateRetryConfig PUTs input to /api/admin/webhooks/{id}/retry-config', async () => {
    const { client, fetchFn } = mkClient({ max_attempts: 5, base_delay_ms: 2000, max_delay_ms: 30000 });
    const input = { max_attempts: 5, base_delay_ms: 2000, max_delay_ms: 30000 };
    const config = await updateRetryConfig('wh1', input, client);
    expect(config.max_attempts).toBe(5);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1/retry-config');
    expect(fetchFn.mock.calls[0][1].method).toBe('PUT');
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual(input);
  });

  it('getWebhookHealth GETs /api/admin/webhooks/{id}/health', async () => {
    const { client, fetchFn } = mkClient({ total_deliveries: 100, success_rate: 0.95 });
    const health = await getWebhookHealth('wh1', client);
    expect(health.total_deliveries).toBe(100);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/wh1/health');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });

  it('getGlobalHealth GETs /api/admin/webhooks/health', async () => {
    const { client, fetchFn } = mkClient({ total_webhooks: 5, total_deliveries: 500, global_success_rate: 0.97 });
    const health = await getGlobalHealth(client);
    expect(health.total_webhooks).toBe(5);
    expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/webhooks/health');
    expect(fetchFn.mock.calls[0][1].method).toBe('GET');
  });
});
