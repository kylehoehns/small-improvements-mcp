import type { SiGetter } from "../siClient.js";
import { defaultYearRange } from "../dates.js";
import { runWhoami, type WhoAmI } from "./whoami.js";
import { runGetPraise } from "./praise.js";
import { runGetObjectives } from "./objectives.js";
import { runGetFeedback, type FeedbackBucket } from "./feedback.js";
import { runGetReviews } from "./reviews.js";
import type { NormalizedPraise, NormalizedObjective, NormalizedReview } from "../normalize.js";

export interface YearInReviewArgs {
  startDate?: string;
  endDate?: string;
}

export interface SourceError {
  source: string;
  error: string;
}

export interface YearInReview {
  me: WhoAmI;
  range: { startDate: string; endDate: string };
  praiseReceived: NormalizedPraise[];
  praiseGiven: NormalizedPraise[];
  objectives: NormalizedObjective[];
  feedbackReceived: FeedbackBucket;
  feedbackGiven: FeedbackBucket;
  reviews: NormalizedReview[];
  errors: SourceError[];
}

const EMPTY_BUCKET: FeedbackBucket = { items: [], errors: [] };

export async function runYearInReview(client: SiGetter, args: YearInReviewArgs): Promise<YearInReview> {
  const me = await runWhoami(client);
  const def = defaultYearRange();
  const range = {
    startDate: args.startDate ?? def.startDate,
    endDate: args.endDate ?? def.endDate,
  };
  const errors: SourceError[] = [];

  async function attempt<T>(source: string, fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      errors.push({ source, error: e instanceof Error ? e.message : String(e) });
      return fallback;
    }
  }

  const [praise, objectives, feedback, reviews] = await Promise.all([
    attempt("praise", () => runGetPraise(client, me.id, range), { received: [], given: [] }),
    attempt("objectives", () => runGetObjectives(client, me.id, range), [] as NormalizedObjective[]),
    attempt("feedback", () => runGetFeedback(client, range), { received: EMPTY_BUCKET, given: EMPTY_BUCKET }),
    attempt("reviews", () => runGetReviews(client), [] as NormalizedReview[]),
  ]);

  return {
    me,
    range,
    praiseReceived: praise.received,
    praiseGiven: praise.given,
    objectives,
    feedbackReceived: feedback.received,
    feedbackGiven: feedback.given,
    reviews,
    errors,
  };
}
