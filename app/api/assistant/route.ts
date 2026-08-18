import { NextResponse } from "next/server";
import { z } from "zod";
import { askGeminiFromSources } from "@/lib/ai/gemini";
import { answerFromDemoKnowledge } from "@/lib/demo/corpus";
import { retrieveVerifiedChunks } from "@/lib/rag/retriever";
import { resolveRouteMode } from "@/lib/runtime/route-mode";

const assistantRequestSchema = z.object({
  question: z.string().min(2),
  profileId: z.string().optional()
});

export async function POST(request: Request) {
  const body = assistantRequestSchema.parse(await request.json());
  const modeResult = resolveRouteMode();
  if ("response" in modeResult) return modeResult.response;
  if (modeResult.mode === "DEMO") {
    return NextResponse.json(answerFromDemoKnowledge(body.question));
  }

  const chunks = await retrieveVerifiedChunks(body.question);
  const answer = await askGeminiFromSources(body.question, chunks);
  return NextResponse.json(answer);
}
