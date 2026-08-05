import type { HttpClient } from "@lyeve-labs/client";
import type { APIKey, CreateAPIKeyResponse } from "@lyeve-labs/client";

export async function listAPIKeys(client: HttpClient): Promise<APIKey[]> {
  // The engine answers with a paginated envelope, not a bare array. Typing this
  // as APIKey[] made every caller crash on .map/.length.
  const res = await client.get<{ data?: APIKey[] } | APIKey[]>(
    "/api/admin/api-keys",
  );
  return Array.isArray(res) ? res : (res?.data ?? []);
}

export async function createAPIKey(
  input: {
    name: string;
    roles: string[];
    schemas: string[];
    expires_at?: string | null;
  },
  client: HttpClient,
): Promise<CreateAPIKeyResponse> {
  return client.post<CreateAPIKeyResponse>("/api/admin/api-keys", input);
}

export async function revokeAPIKey(
  id: string,
  client: HttpClient,
): Promise<void> {
  return client.post<void>(
    `/api/admin/api-keys/${encodeURIComponent(id)}/revoke`,
    {},
  );
}

export async function deleteAPIKey(
  id: string,
  client: HttpClient,
): Promise<void> {
  return client.delete<void>(`/api/admin/api-keys/${encodeURIComponent(id)}`);
}
