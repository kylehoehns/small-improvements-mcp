import type { SiGetter } from "../siClient.js";
import { mapWithConcurrency } from "../concurrency.js";
import { normalizeFeedbackDetail, type NormalizedFeedback } from "../normalize.js";

export type FeedbackDirection = "received" | "given" | "both";

export interface GetFeedbackArgs {
  direction?: FeedbackDirection;
  startDate?: string;
  endDate?: string;
}

export interface FeedbackError {
  id: string;
  error: string;
}

export interface FeedbackBucket {
  items: NormalizedFeedback[];
  errors: FeedbackError[];
}

export interface GetFeedbackResult {
  received: FeedbackBucket;
  given: FeedbackBucket;
}

const CONCURRENCY = 5;

function inRange(createdAt: string | undefined, startDate?: string, endDate?: string): boolean {
  if (!createdAt) return true;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return true;
  if (startDate && t < new Date(startDate).getTime()) return false;
  if (endDate && t > new Date(`${endDate}T23:59:59Z`).getTime()) return false;
  return true;
}

async function expand(
  client: SiGetter,
  listPath: string,
  detailPath: (id: string) => string,
  startDate?: string,
  endDate?: string,
): Promise<FeedbackBucket> {
  const list = await client.get<any[]>(listPath);
  const filtered = list.filter((f) => inRange(f.createdAt, startDate, endDate));
  const items: NormalizedFeedback[] = [];
  const errors: FeedbackError[] = [];

  const results = await mapWithConcurrency(filtered, CONCURRENCY, async (f) => {
    try {
      return { ok: true as const, value: normalizeFeedbackDetail(await client.get<any>(detailPath(f.id))) };
    } catch (e) {
      return { ok: false as const, id: f.id, error: e instanceof Error ? e.message : String(e) };
    }
  });

  for (const r of results) {
    if (r.ok) items.push(r.value);
    else errors.push({ id: r.id, error: r.error });
  }
  return { items, errors };
}

export async function runGetFeedback(client: SiGetter, args: GetFeedbackArgs): Promise<GetFeedbackResult> {
  const dir = args.direction ?? "both";
  const empty: FeedbackBucket = { items: [], errors: [] };
  const received =
    dir === "received" || dir === "both"
      ? await expand(client, "/v2/unified-feedback/your", (id) => `/v2/unified-feedback/details/${id}`, args.startDate, args.endDate)
      : empty;
  const given =
    dir === "given" || dir === "both"
      ? await expand(client, "/v2/unified-feedback/you-provided", (id) => `/v2/unified-feedback/details-you-provided/${id}`, args.startDate, args.endDate)
      : empty;
  return { received, given };
}
