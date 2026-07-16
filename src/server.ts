import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(request: Request, response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  // IMPORTANT: Do NOT hijack Server Function responses! They must remain JSON so the client can parse them.
  if (request.url.includes("/_serverFn/")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  const capturedError = consumeLastCapturedError();
  console.error(capturedError ?? new Error(`h3 swallowed SSR error: ${body}`));
  
  return new Response(
    "CRITICAL SSR ERROR: " + (capturedError ? (capturedError.stack || capturedError.message) : body), 
    {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    }
  );
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      
      // If it's a data request (like serverFn), DO NOT hijack it.
      const isDataRequest = 
        request.url.includes("/_serverFn/") || 
        request.headers.get("accept")?.includes("application/json") ||
        request.headers.get("sec-fetch-mode") === "cors";

      if (isDataRequest) return response;

      return await normalizeCatastrophicSsrResponse(request, response);
    } catch (error) {
      console.error("[SSR Fetch Error]:", error);
      
      const isDataRequest = 
        request.url.includes("/_serverFn/") || 
        request.headers.get("accept")?.includes("application/json") ||
        request.headers.get("sec-fetch-mode") === "cors";

      if (isDataRequest) {
        return new Response(JSON.stringify({ error: String(error) }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
      
      // Temporarily output the RAW error instead of HTML so we can debug Vercel SSR crash
      return new Response(
        "CRITICAL SSR ERROR: " + (error instanceof Error ? error.stack || error.message : String(error)), 
        {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" },
        }
      );
    }
  },
};
