import type { HttpClient } from "@lyeve-labs/client";
import type { Permission } from "@lyeve-labs/client";

export async function listPermissions(
  client: HttpClient,
): Promise<Permission[]> {
  return client.get<Permission[]>("/api/admin/permissions");
}

export async function upsertPermission(
  data: {
    role: string;
    schema_name: string;
    actions: string[];
    field_mask: string[];
  },
  client: HttpClient,
): Promise<Permission> {
  return client.post<Permission>("/api/admin/permissions", data);
}

export async function deletePermission(
  id: string,
  client: HttpClient,
): Promise<void> {
  return client.delete<void>(
    `/api/admin/permissions/${encodeURIComponent(id)}`,
  );
}
