import type { HttpClient } from "@lyeve-labs/client";
import type { User } from "@lyeve-labs/client";

export function getUsers(client: HttpClient): Promise<User[]> {
  return client.get<User[]>("/api/admin/users");
}

/**
 * POST /api/admin/users: creates an account that holds exactly `roles`.
 * `roles` is required and must name at least one role. The engine has no
 * default role and refuses an empty list with a 422 that names `roles`.
 */
export function createUser(
  email: string,
  password: string,
  roles: string[],
  client: HttpClient,
): Promise<User> {
  return client.post<User>("/api/admin/users", { email, password, roles });
}

export function updateUserRoles(
  id: string,
  roles: string[],
  client: HttpClient,
): Promise<User> {
  return client.put<User>(`/api/admin/users/${encodeURIComponent(id)}/roles`, {
    roles,
  });
}

export function deleteUser(id: string, client: HttpClient): Promise<void> {
  return client.delete<void>(`/api/admin/users/${encodeURIComponent(id)}`);
}
