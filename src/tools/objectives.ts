import type { SiGetter } from "../siClient.js";
import { normalizeObjective, type NormalizedObjective } from "../normalize.js";

export interface GetObjectivesArgs {
  startDate?: string;
  endDate?: string;
}

export async function runGetObjectives(
  client: SiGetter,
  userId: string,
  args: GetObjectivesArgs,
): Promise<NormalizedObjective[]> {
  const list = await client.get<any[]>("/v2/objective-cycles/all/objectives/relevant", {
    userId,
    startDate: args.startDate,
    endDate: args.endDate,
  });
  return list.map(normalizeObjective);
}
