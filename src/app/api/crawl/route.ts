import { NextRequest } from "next/server";
import { extractLinksAction } from "../../actions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const mode = (searchParams.get("mode") as "fast" | "spider") || "fast";

  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await extractLinksAction(url, mode, (node) => {
          controller.enqueue(encoder.encode(JSON.stringify({ node }) + "\n"));
        });
        controller.close();
      } catch (err: any) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: err.message }) + "\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
