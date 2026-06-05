import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig, type SiConfig } from "./config.js";
import { SiClient } from "./siClient.js";
import { runWhoami } from "./tools/whoami.js";
import { runGetPraise } from "./tools/praise.js";
import { runGetObjectives } from "./tools/objectives.js";
import { runGetFeedback } from "./tools/feedback.js";
import { runGetReviews } from "./tools/reviews.js";
import { runYearInReview } from "./tools/yearInReview.js";

function jsonResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

async function main() {
  let config: SiConfig;
  try {
    config = loadConfig();
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }

  const client = new SiClient(config);
  let cachedId: string | null = null;
  const userId = async (): Promise<string> => {
    if (!cachedId) cachedId = (await runWhoami(client)).id;
    return cachedId;
  };

  const directionSchema = z.enum(["received", "given", "both"]).optional();
  const dateSchema = z.string().describe("yyyy-MM-dd").optional();

  const server = new McpServer({ name: "small-improvements", version: "0.1.0" });

  server.registerTool(
    "whoami",
    { description: "Get the authenticated Small Improvements user (id, name, email, role).", inputSchema: {} },
    async () => jsonResult(await runWhoami(client)),
  );

  server.registerTool(
    "get_praise",
    {
      description: "Praise you received and/or gave, within an optional date range (yyyy-MM-dd).",
      inputSchema: { direction: directionSchema, startDate: dateSchema, endDate: dateSchema },
    },
    async (args) => jsonResult(await runGetPraise(client, await userId(), args)),
  );

  server.registerTool(
    "get_objectives",
    {
      description: "Your objectives/OKRs with status, completion %, and rating, within an optional date range (yyyy-MM-dd).",
      inputSchema: { startDate: dateSchema, endDate: dateSchema },
    },
    async (args) => jsonResult(await runGetObjectives(client, await userId(), args)),
  );

  server.registerTool(
    "get_feedback",
    {
      description:
        "360/unified feedback you received and/or gave, auto-expanded to the written answers. Optional date range (yyyy-MM-dd) filters on creation date.",
      inputSchema: { direction: directionSchema, startDate: dateSchema, endDate: dateSchema },
    },
    async (args) => jsonResult(await runGetFeedback(client, args)),
  );

  server.registerTool(
    "get_reviews",
    {
      description:
        "Your formal review cycles (structure only: cycle, dates, role, contributing reviewers). Answer text is not exposed by the API.",
      inputSchema: {},
    },
    async () => jsonResult(await runGetReviews(client)),
  );

  server.registerTool(
    "get_year_in_review",
    {
      description:
        "Aggregates praise, objectives, feedback, and reviews into one 'what I did this year' document. Defaults to the trailing 12 months; pass startDate/endDate (yyyy-MM-dd) to override.",
      inputSchema: { startDate: dateSchema, endDate: dateSchema },
    },
    async (args) => jsonResult(await runYearInReview(client, args)),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("small-improvements MCP server running on stdio");
}

main().catch((e) => {
  console.error(e instanceof Error ? (e.stack ?? e.message) : String(e));
  process.exit(1);
});
