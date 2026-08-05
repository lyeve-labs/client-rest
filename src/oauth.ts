import type { HttpClient } from "@lyeve-labs/client";
import type { OAuthProvider } from "@lyeve-labs/client";
import { getList } from "./envelope.js";

export async function listOAuthProviders(
  client: HttpClient,
): Promise<OAuthProvider[]> {
  return getList<OAuthProvider>(client, "/api/admin/oauth-providers");
}

export async function createOAuthProvider(
  data: Omit<OAuthProvider, "id" | "created_at" | "updated_at"> & {
    client_secret: string;
  },
  client: HttpClient,
): Promise<OAuthProvider> {
  return client.post<OAuthProvider>("/api/admin/oauth-providers", data);
}

export async function updateOAuthProvider(
  id: string,
  data: Partial<OAuthProvider> & { client_secret?: string },
  client: HttpClient,
): Promise<OAuthProvider> {
  return client.put<OAuthProvider>(
    `/api/admin/oauth-providers/${encodeURIComponent(id)}`,
    data,
  );
}

export async function deleteOAuthProvider(
  id: string,
  client: HttpClient,
): Promise<void> {
  return client.delete<void>(
    `/api/admin/oauth-providers/${encodeURIComponent(id)}`,
  );
}
