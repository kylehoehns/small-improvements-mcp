# small-improvements-mcp

A local, read-only MCP server that pulls your own Small Improvements data
(praise, objectives, 360 feedback, reviews) so an MCP client can help you write a
"what I did this year" / end-of-year self-review.

## Setup

```bash
npm install
npm run build
```

Create a personal access token in Small Improvements:
**Profile → Manage → API Access Tokens → Create Token**. The token inherits your
own permissions; the server only ever reads data about you.

## Register in Claude Code

Add to your MCP config (e.g. `~/.claude.json` or a project `.mcp.json`):

```json
{
  "mcpServers": {
    "small-improvements": {
      "command": "node",
      "args": ["/Users/khoehns/dev/small-improvements-mcp/dist/index.js"],
      "env": { "SI_API_TOKEN": "your-token-here" }
    }
  }
}
```

Optional env var: `SI_BASE_URL` (defaults to `https://app.small-improvements.com/api`).

## Tools

| Tool | What it returns |
|------|-----------------|
| `whoami` | Your id, name, email, role. |
| `get_praise` | Praise received/given (`direction`, `startDate`, `endDate`). |
| `get_objectives` | Objectives with status, completion %, rating (`startDate`, `endDate`). |
| `get_feedback` | 360 feedback received/given, expanded to written answers (`direction`, dates). |
| `get_reviews` | Formal review cycles — structure only (answer text isn't exposed by the API). |
| `get_year_in_review` | Everything above, combined, defaulting to the trailing 12 months. |

Dates are `yyyy-MM-dd`. Start with `get_year_in_review` for a full brag-doc dump.

## Notes

- `test/fixtures/` holds **anonymized** captured responses (real names, emails, and
  free-text scrubbed to `Person N` / `personN@example.com` / placeholder prose).
  Structure matches the live API so tests stay meaningful.
- Development: `npm run dev` (tsx), `npm test`, `npm run typecheck`.
