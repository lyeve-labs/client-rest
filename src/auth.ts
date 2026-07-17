import type { HttpClient } from "@lyeve-labs/client";
import type { User } from "@lyeve-labs/client";

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MFAChallengeResponse {
  mfa_required: true;
  challenge_token: string;
}

export type LoginResponse = AuthResponse | MFAChallengeResponse;

export function isMFAChallenge(r: LoginResponse): r is MFAChallengeResponse {
  return (r as MFAChallengeResponse).mfa_required === true;
}

export interface TokenResponse {
  token: string;
  expires_in: number;
}

export function getSetupStatus(
  client: HttpClient,
): Promise<{ setup_required: boolean }> {
  return client.get("/api/admin/setup");
}

export function setup(
  email: string,
  password: string,
  client: HttpClient,
): Promise<AuthResponse> {
  return client.post("/api/admin/setup", { email, password });
}

export function login(
  email: string,
  password: string,
  client: HttpClient,
): Promise<LoginResponse> {
  return client.post("/api/admin/auth/login", { email, password });
}

export function mfaVerify(
  challengeToken: string,
  code: string,
  client: HttpClient,
): Promise<{ token: string }> {
  return client.post("/api/admin/auth/mfa-verify", {
    challenge_token: challengeToken,
    code,
  });
}

export function logout(client: HttpClient): Promise<void> {
  return client.post("/api/admin/auth/logout", {});
}

export function getMe(client: HttpClient): Promise<User> {
  return client.get("/api/admin/auth/me");
}
