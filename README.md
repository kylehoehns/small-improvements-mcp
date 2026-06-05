# small-improvements-mcp

[![CI](https://github.com/kylehoehns/small-improvements-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/kylehoehns/small-improvements-mcp/actions/workflows/ci.yml)

A local, read-only MCP server that pulls your own Small Improvements data
(praise, objectives, 360 feedback, reviews) so an MCP client can help you write a
"what I did this year" / end-of-year self-review.

## Prerequisites

- **Node.js 24+**
- An MCP client (Claude Code, Claude Desktop, Cursor, etc.)
- A Small Improvements account with API access

## Setup

Clone and install — the install step builds automatically:

```bash
git clone https://github.com/kylehoehns/small-improvements-mcp.git
cd small-improvements-mcp
npm install
```

This produces `dist/index.js` — the entry point you point your MCP client at below.
(To rebuild after changing the source, run `npm run build`.)

Create a personal access token in Small Improvements:
**Profile → Manage → API Access Tokens → Create Token**. The token inherits your
own permissions; the server only ever reads data about you.

## Register with your MCP client

This is a standard stdio MCP server — any MCP client (Claude Code, Claude Desktop,
Cursor, …) launches it the same way: it runs `node dist/index.js` with your token in
the `SI_API_TOKEN` environment variable. Drop a block like this into your client's
MCP config, using the **absolute path to your clone's** `dist/index.js`:

```json
{
  "mcpServers": {
    "small-improvements": {
      "command": "node",
      "args": ["/absolute/path/to/small-improvements-mcp/dist/index.js"],
      "env": { "SI_API_TOKEN": "your-token-here" }
    }
  }
}
```

> **Handle the token like a password.** `SI_API_TOKEN` is a bearer credential with
> your full read permissions. Keep the literal value out of files you might share,
> **never commit a config containing a real token**, and rotate it if it's exposed.

### Providing the token

Clients differ in how they launch servers and handle secrets, so pick whichever fits:

- **Inline in the config** (simplest). Fine to start with — just keep that file out
  of any repo and `chmod 600` it.
- **Environment-variable indirection.** Some clients expand `${VAR}` in the config,
  so you can set `"SI_API_TOKEN": "${SI_API_TOKEN}"` and keep the real value in your
  shell environment instead of the file. (Support varies — check whether yours does.)
- **Secret manager at launch.** Keep the token in a vault and inject it when the
  server starts, so nothing sensitive touches the config. For example, with the
  1Password CLI set `"command": "op"`, `"args": ["run", "--", "node", "…/dist/index.js"]`,
  and `"SI_API_TOKEN": "op://<vault>/<item>/credential"`; a small wrapper script that
  reads from the macOS Keychain (or any secrets tool) and `exec`s node works too.

**Gotcha:** GUI-launched clients often don't inherit your shell `PATH` and may not
expand `${VAR}`. If `node` comes from a version manager (nvm, fnm, …) or the server
just won't start, use **absolute paths** to both `node` and `dist/index.js`
(`which node` to find the binary).

Optional for any client: `SI_BASE_URL` (defaults to
`https://app.small-improvements.com/api`).

## Verify it works

Restart your MCP client so it picks up the new server, then ask it something like:

> Run `whoami`

You should get back your own id, name, email, and role. If so, you're connected —
try **"give me my year in review"** for the full brag-doc dump. If the server
doesn't show up, double-check the path is absolute and points at the built
`dist/index.js`.

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
