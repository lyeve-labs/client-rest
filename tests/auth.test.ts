import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lyeve/cms-client';
import { getSetupStatus, setup, login, mfaVerify, logout, getMe, isMFAChallenge, type LoginResponse } from '@lyeve/cms-client-rest';

function mkClient(body: unknown = {}, status = 200) {
	const fetchFn = vi.fn(async (_url: string, _init: RequestInit): Promise<Response> =>
		new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
	return { client: createClient(fetchFn as unknown as typeof fetch), fetchFn };
}

describe('REST auth', () => {
	it('getSetupStatus GETs /api/admin/setup', async () => {
		const { client, fetchFn } = mkClient({ setup_required: true });
		expect(await getSetupStatus(client)).toEqual({ setup_required: true });
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/setup');
	});

	it('login POSTs credentials', async () => {
		const { client, fetchFn } = mkClient({ user: {}, token: 't' });
		await login('a@b.co', 'pw', client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/auth/login');
		expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ email: 'a@b.co', password: 'pw' });
	});

	it('mfaVerify POSTs challenge_token + code', async () => {
		const { client, fetchFn } = mkClient({ token: 't' });
		await mfaVerify('ch', '123456', client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/auth/mfa-verify');
		expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ challenge_token: 'ch', code: '123456' });
	});

	it('getMe GETs current user', async () => {
		const { client, fetchFn } = mkClient({ id: 'u1', email: 'a@b.co', roles: ['admin'] });
		expect((await getMe(client)).id).toBe('u1');
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/auth/me');
	});

	it('setup POSTs email and password', async () => {
		const { client, fetchFn } = mkClient({ user: { id: 'u1' }, token: 't' });
		await setup('a@b.co', 'pw', client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/setup');
		expect(fetchFn.mock.calls[0][1].method).toBe('POST');
		expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ email: 'a@b.co', password: 'pw' });
	});

	it('logout POSTs empty body', async () => {
		const { client, fetchFn } = mkClient({}, 204);
		await logout(client);
		expect(fetchFn.mock.calls[0][0]).toBe('/api/admin/auth/logout');
		expect(fetchFn.mock.calls[0][1].method).toBe('POST');
		expect(fetchFn.mock.calls[0][1].body).toBe(JSON.stringify({}));
	});
});

describe('isMFAChallenge', () => {
	it('detects MFA challenge', () => {
		expect(isMFAChallenge({ mfa_required: true, challenge_token: 'ch' })).toBe(true);
		expect(isMFAChallenge({ user: { id: 'u1', email: '', roles: [], tenant_id: '', disabled: false, created_at: '' }, token: 't' })).toBe(false);
	});
});
