import type { HttpClient } from '@lyeve/cms-client';
import type { Entitlements } from '@lyeve/cms-client';

/** Fetch the current license entitlements (plan, features, effective caps). */
export function getEntitlements(client: HttpClient): Promise<Entitlements> {
	return client.get<Entitlements>('/api/admin/entitlements');
}
