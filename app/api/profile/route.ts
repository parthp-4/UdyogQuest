import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDemoLatestProfile } from "@/lib/demo/corpus";
import { onboardingSchema } from "@/lib/profile/onboarding-schema";
import { resolveRouteMode } from "@/lib/runtime/route-mode";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const modeResult = resolveRouteMode();
  if ("response" in modeResult) return modeResult.response;

  if (modeResult.mode === "DEMO") {
    return NextResponse.json({
      profile: {
        ...getDemoLatestProfile(),
        ...parsed.data,
        id: "profile-demo-onboarding-preview"
      }
    });
  }

  const profile = await prisma.businessProfile.create({
    data: parsed.data
  });

  return NextResponse.json({ profile });
}
