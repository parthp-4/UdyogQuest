import { NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getDemoProfileById } from "@/lib/demo/corpus";
import { buildRecommendationsForProfile } from "@/lib/recommendations/build";

const requestSchema = z.object({
  profileId: z.string().min(1)
});

function useDemoCorpus() {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false" || !isDatabaseConfigured();
}

export async function POST(request: Request) {
  const body = requestSchema.parse(await request.json());

  if (useDemoCorpus()) {
    const profile = getDemoProfileById(body.profileId);
    return NextResponse.json({ recommendations: profile.recommendations });
  }

  const profile = await prisma.businessProfile.findUnique({ where: { id: body.profileId } });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const recommendations = await buildRecommendationsForProfile(profile);
  return NextResponse.json({ recommendations });
}
