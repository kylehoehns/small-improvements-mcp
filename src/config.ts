export interface SiConfig {
  token: string;
  baseUrl: string;
}

// Base is the API root; every resource path already includes the `/v2` segment
// (matching the swagger paths), e.g. `${baseUrl}/v2/users/me`.
const DEFAULT_BASE_URL = "https://app.small-improvements.com/api";

export function loadConfig(env: Record<string, string | undefined> = process.env): SiConfig {
  const token = env.SI_API_TOKEN;
  if (!token) {
    throw new Error(
      "SI_API_TOKEN is required. Create a personal access token in Small Improvements: " +
        "Profile → Manage → API Access Tokens, then set it as SI_API_TOKEN.",
    );
  }
  return {
    token,
    baseUrl: env.SI_BASE_URL ?? DEFAULT_BASE_URL,
  };
}
