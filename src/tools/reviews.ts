import type { SiGetter } from "../siClient.js";
import { normalizeReviewCycle, type NormalizedReview } from "../normalize.js";

export async function runGetReviews(client: SiGetter): Promise<NormalizedReview[]> {
  const list = await client.get<any[]>("/v2/review/yourReviews");
  return list.map(normalizeReviewCycle);
}
