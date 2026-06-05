import { describe, it, expect } from "vitest";
import { SiClient, SiApiError } from "../src/siClient.js";

const config = { token: "tok", baseUrl: "https://example.test/api/v2" };

function fakeFetch(captured: { url?: string; headers?: Headers }, response: Response) {
  return async (url: string | URL, init?: RequestInit) => {
    captured.url = url.toString();
    captured.headers = new Headers(init?.headers);
    return response;
  };
}

describe("SiClient.get", () => {
  it("builds the URL, adds the bearer header, and parses JSON", async () => {
    const captured: { url?: string; headers?: Headers } = {};
    const client = new SiClient(
      config,
      fakeFetch(captured, new Response(JSON.stringify({ id: "u1" }), { status: 200 })),
    );

    const body = await client.get<{ id: string }>("/users/me");

    expect(captured.url).toBe("https://example.test/api/v2/users/me");
    expect(captured.headers?.get("authorization")).toBe("Bearer tok");
    expect(body).toEqual({ id: "u1" });
  });

  it("serializes defined query params and skips undefined ones", async () => {
    const captured: { url?: string; headers?: Headers } = {};
    const client = new SiClient(
      config,
      fakeFetch(captured, new Response("[]", { status: 200 })),
    );

    await client.get("/v2/praise", { recipientId: "u1", startDate: "2025-06-03", authorId: undefined, limit: 50 });

    const url = new URL(captured.url!);
    expect(url.searchParams.get("recipientId")).toBe("u1");
    expect(url.searchParams.get("startDate")).toBe("2025-06-03");
    expect(url.searchParams.get("limit")).toBe("50");
    expect(url.searchParams.has("authorId")).toBe(false);
  });

  it("throws a mapped SiApiError on non-2xx", async () => {
    const captured: { url?: string; headers?: Headers } = {};
    const client = new SiClient(
      config,
      fakeFetch(captured, new Response("nope", { status: 401 })),
    );

    await expect(client.get("/users/me")).rejects.toBeInstanceOf(SiApiError);
  });
});
