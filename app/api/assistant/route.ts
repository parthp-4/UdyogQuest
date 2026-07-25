import { NextResponse } from "next/server";
import { z } from "zod";
import { askGeminiFromSources } from "@/lib/ai/gemini";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { answerFromDemoKnowledge } from "@/lib/demo/corpus";
import { retrieveVerifiedChunks } from "@/lib/rag/retriever";

const assistantRequestSchema = z.object({
  question: z.string().min(2),
  profileId: z.string().optional()
});

function useDemoCorpus() {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false" || !isDatabaseConfigured();
}

export async function POST(request: Request) {
  const body = assistantRequestSchema.parse(await request.json());
  if (useDemoCorpus()) {
    return NextResponse.json(answerFromDemoKnowledge(body.question));
  }

  const chunks = await retrieveVerifiedChunks(body.question);
  const answer = await askGeminiFromSources(body.question, chunks);
  return NextResponse.json(answer);
}
