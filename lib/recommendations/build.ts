import type { BusinessProfile } from "@prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";
import { evaluateRule } from "@/lib/eligibility/evaluate";

export async function buildRecommendationsForProfile(profile: BusinessProfile) {
  if (!isDatabaseConfigured()) return [];

  const rules = await prisma.eligibilityRule.findMany({
    where: {
      industry: profile.businessCategory,
      source: { status: "VERIFIED" }
    },
    include: { source: true }
  });

  if (rules.length === 0) {
    return [];
  }

  return Promise.all(
    rules.map(async (rule) => {
      const result = evaluateRule(profile, rule);
      return prisma.recommendation.create({
        data: {
          profileId: profile.id,
          status: result.status,
          title: rule.title,
          why: result.reasons.length ? result.reasons.join("\n") : VERIFIED_UNAVAILABLE,
          expectedBenefit: null,
          expectedTimeline: null,
          documentsNeeded: [],
          officialPortal: rule.source.applicationPortal,
          applicationSteps: VERIFIED_UNAVAILABLE,
          helpline: rule.source.helpline,
          relatedSchemes: [],
          alternatives: [],
          citations: {
            create: {
              sourceId: rule.sourceId,
              quote: result.reasons[0] ?? null
            }
          }
        }
      });
    })
  );
}
