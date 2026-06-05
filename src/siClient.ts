import type { SiConfig } from "./config.js";

export type FetchFn = (url: string | URL, init?: RequestInit) => Promise<Response>;

export type QueryValue = string | number | undefined;

export interface SiGetter {
  get<T>(path: string, query?: Record<string, QueryValue>): Promise<T>;
}

export class SiApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    message: string,
  ) {
    super(message);
    this.name = "SiApiError";
  }
}

export function mapError(status: number, body: string): SiApiError {
  if (status === 401) {
    return new SiApiError(
      status,
      body,
      "Small Improvements rejected the token (401). Recreate it in Profile → Manage → " +
        "API Access Tokens and update SI_API_TOKEN.",
    );
  }
  if (status === 403) {
    return new SiApiError(
      status,
      body,
      "Your token lacks permission to read this data (403).",
    );
  }
  return new SiApiError(status, body, `Small Improvements API error ${status}: ${body.slice(0, 500)}`);
}

export async function collectPages<T>(
  fetchPage: (offset: number) => Promise<T[]>,
  pageSize: number,
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;
  for (;;) {
    const page = await fetchPage(offset);
    all.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

export class SiClient implements SiGetter {
  constructor(
    private readonly config: SiConfig,
    private readonly fetchFn: FetchFn = fetch,
  ) {}

  async get<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
    const url = new URL(this.config.baseUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    const res = await this.fetchFn(url, {
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw mapError(res.status, await res.text());
    }
    return (await res.json()) as T;
  }
}
