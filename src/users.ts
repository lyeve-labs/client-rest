import type { HttpClient } from '@lyeve/cms-client';
import type { User } from '@lyeve/cms-client';

export function getUsers(client: HttpClient): Promise<User[]> {
	return client.get<User[]>('/api/admin/users');
}

export function createUser(
	email: string,
	password: string,
	roles: string[],
	client: HttpClient
): Promise<User> {
	return client.post<User>('/api/admin/users', { email, password, roles });
}

export function updateUserRoles(
	id: string,
	roles: string[],
	client: HttpClient
): Promise<User> {
	return client.put<User>(`/api/admin/users/${encodeURIComponent(id)}/roles`, { roles });
}

export function deleteUser(id: string, client: HttpClient): Promise<void> {
	return client.delete<void>(`/api/admin/users/${encodeURIComponent(id)}`);
}
