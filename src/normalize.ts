export interface MiniUser {
  id: string;
  name: string;
}

export function miniUser(u: any): MiniUser {
  return { id: u?.id ?? "", name: u?.name ?? "" };
}

const MARKUP_RE = /<!--MARKUP_VERSION:[^>]*-->/g;
const BLOCK_END_RE = /<\/(p|div|li|h[1-6]|ul|ol)>/gi;
const BR_RE = /<br\s*\/?>/gi;
const TAG_RE = /<[^>]+>/g;
const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

export function stripMarkup(html: string | null | undefined): string {
  if (!html) return "";
  let s = html.replace(MARKUP_RE, "");
  s = s.replace(BLOCK_END_RE, "\n").replace(BR_RE, "\n");
  s = s.replace(TAG_RE, "");
  s = s.replace(/&#(\d+);/g, (_m, n: string) => String.fromCharCode(Number(n)));
  s = s.replace(/&\w+;/g, (m) => NAMED_ENTITIES[m] ?? m);
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

export function toIso(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return new Date(value).toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString();
}

export interface NormalizedObjective {
  id: string;
  title: string;
  cycleName: string;
  status: string | null;
  completionPercentage: number;
  rating: number | null;
  due: string | null;
}

export function normalizeObjective(item: any): NormalizedObjective {
  return {
    id: item.id,
    title: item.title,
    cycleName: item.cycleName,
    status: item.status?.description ?? null,
    completionPercentage: item.completionPercentage ?? 0,
    rating: item.rating === -1 ? null : item.rating ?? null,
    due: toIso(item.due),
  };
}

export interface NormalizedReviewEntry {
  id: string;
  role: string;
  isComplete: boolean;
  contributingReviewers: string[];
}

export interface NormalizedReview {
  cycleName: string;
  underReviewFrom: string | null;
  underReviewTo: string | null;
  reviews: NormalizedReviewEntry[];
}

export function normalizeReviewCycle(entry: any): NormalizedReview {
  return {
    cycleName: entry.cycle?.name ?? "",
    underReviewFrom: toIso(entry.cycle?.underReviewFrom),
    underReviewTo: toIso(entry.cycle?.underReviewTo),
    reviews: (entry.reviews ?? []).map((r: any) => ({
      id: r.id,
      role: r.role ?? "",
      isComplete: Boolean(r.isComplete),
      contributingReviewers: (r.contributingReviewers ?? []).map((u: any) => u?.name ?? ""),
    })),
  };
}

export interface NormalizedFeedbackAnswer {
  reviewer: string;
  text: string;
}

export interface NormalizedFeedbackQuestion {
  question: string;
  answers: NormalizedFeedbackAnswer[];
}

export interface NormalizedFeedback {
  id: string;
  topic: string;
  type: string;
  status: string;
  createdAt: string | null;
  reviewees: string[];
  reviewers: string[];
  questions: NormalizedFeedbackQuestion[];
}

export function normalizeFeedbackDetail(detail: any): NormalizedFeedback {
  const d = Array.isArray(detail) ? detail[0] : detail;
  const questions: NormalizedFeedbackQuestion[] = (d.questionsWithAnswers ?? [])
    .filter((q: any) => q.type === "Question")
    .map((q: any) => ({
      question: stripMarkup(q.title || q.description),
      answers: (q.answers ?? []).map((a: any) => ({
        reviewer: a.reviewer?.name ?? "",
        text: stripMarkup(a.text),
      })),
    }));
  return {
    id: d.id,
    topic: d.topic?.title ?? "",
    type: d.type ?? "",
    status: d.status ?? "",
    createdAt: toIso(d.createdAt),
    reviewees: (d.reviewees ?? []).map((u: any) => u?.name ?? ""),
    reviewers: (d.reviewers ?? []).map((u: any) => u?.name ?? ""),
    questions,
  };
}

export interface NormalizedPraise {
  id: string;
  title: string;
  message: string;
  date: string | null;
  author: MiniUser;
  recipients: MiniUser[];
  badge: string | null;
  anonymous: boolean;
}

export function normalizePraise(item: any): NormalizedPraise {
  return {
    id: item.id,
    title: stripMarkup(item.title),
    message: stripMarkup(item.message),
    date: toIso(item.date),
    author: miniUser(item.author),
    recipients: (item.recipients ?? []).map(miniUser),
    badge: item.badge?.name ?? null,
    anonymous: Boolean(item.anonymous),
  };
}
