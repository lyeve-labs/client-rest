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

export interface SetupStatus {
  setup_required: boolean;
  /**
   * Where the operator finds the setup token while setup is open: "env" when
   * the engine has LYEVE_SETUP_TOKEN, "log" when it printed a one-time token
   * at boot. Absent once setup is complete or when no token is available.
   */
  token_source?: "env" | "log";
}

export function getSetupStatus(client: HttpClient): Promise<SetupStatus> {
  return client.get("/api/admin/setup");
}

/**
 * Creates the first super admin. Only works while no account exists, and only
 * with the engine's setup token: its LYEVE_SETUP_TOKEN, or the one-time token
 * it logs at boot when that is unset. A missing or wrong token is a 401.
 */
export function setup(
  email: string,
  password: string,
  setupToken: string,
  client: HttpClient,
): Promise<AuthResponse> {
  return client.post("/api/admin/setup", {
    email,
    password,
    setup_token: setupToken,
  });
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
