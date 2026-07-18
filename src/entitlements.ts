import type { HttpClient } from "@lyeve-labs/client";
import type { Entitlements } from "@lyeve-labs/client";

/** Fetch the current license entitlements (plan, features, effective caps). */
export function getEntitlements(client: HttpClient): Promise<Entitlements> {
  return client.get<Entitlements>("/api/admin/entitlements");
}
