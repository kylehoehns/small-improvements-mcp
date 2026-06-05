import { collectPages, type SiGetter } from "../siClient.js";
import { normalizePraise, type NormalizedPraise } from "../normalize.js";

export type PraiseDirection = "received" | "given" | "both";

export interface GetPraiseArgs {
  direction?: PraiseDirection;
  startDate?: string;
  endDate?: string;
}

export interface GetPraiseResult {
  received: NormalizedPraise[];
  given: NormalizedPraise[];
}

const PAGE = 50;

async function fetchAll(
  client: SiGetter,
  key: "recipientId" | "authorId",
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<NormalizedPraise[]> {
  const raw = await collectPages<any>(
    (offset) => client.get<any[]>("/v2/praise", { [key]: userId, startDate, endDate, limit: PAGE, offset }),
    PAGE,
  );
  return raw.map(normalizePraise);
}

export async function runGetPraise(client: SiGetter, userId: string, args: GetPraiseArgs): Promise<GetPraiseResult> {
  const dir = args.direction ?? "both";
  const wantReceived = dir === "received" || dir === "both";
  const wantGiven = dir === "given" || dir === "both";
  return {
    received: wantReceived ? await fetchAll(client, "recipientId", userId, args.startDate, args.endDate) : [],
    given: wantGiven ? await fetchAll(client, "authorId", userId, args.startDate, args.endDate) : [],
  };
}
