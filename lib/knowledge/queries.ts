import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  getDemoDependencyItems,
  getDemoKnowledgeArticles,
  getDemoKnowledgeByIndustry,
  getDemoKnowledgeSummary,
  getDemoLatestNotifications,
  getDemoLatestVerifiedSources,
  getDemoPendingSources,
  getDemoSchemeKnowledge,
  getDemoVerifiedRegistrations
} from "@/lib/demo/corpus";

function useDemoCorpus() {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false" || !isDatabaseConfigured();
}

export async function getKnowledgeSummary(): Promise<{ verifiedSources: number; documents: number; rules: number }> {
  if (useDemoCorpus()) return getDemoKnowledgeSummary();

  if (!isDatabaseConfigured()) {
    return { verifiedSources: 0, documents: 0, rules: 0 };
  }

  const [verifiedSources, documents, rules] = await Promise.all([
    prisma.governmentSource.count({ where: { status: "VERIFIED" } }),
    prisma.knowledgeDocument.count(),
    prisma.eligibilityRule.count()
  ]);

  return { verifiedSources, documents, rules };
}

export async function getLatestVerifiedSources(limit = 10): Promise<any[]> {
  if (useDemoCorpus()) return getDemoLatestVerifiedSources(limit);

  if (!isDatabaseConfigured()) return [];

  return prisma.governmentSource.findMany({
    where: { status: "VERIFIED" },
    include: { authority: true },
    orderBy: [{ lastUpdated: "desc" }, { updatedAt: "desc" }],
    take: limit
  });
}

export async function getKnowledgeArticles(query?: string): Promise<any[]> {
  if (useDemoCorpus()) return getDemoKnowledgeArticles(query);

  if (!isDatabaseConfigured()) return [];

  return prisma.knowledgeDocument.findMany({
    where: query
      ? {
          source: { status: "VERIFIED" },
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { rawText: { contains: query, mode: "insensitive" } }
          ]
        }
      : { source: { status: "VERIFIED" } },
    include: { source: { include: { authority: true, artifacts: true } } },
    orderBy: { updatedAt: "desc" },
    take: 25
  });
}

export async function getVerifiedRegistrations(): Promise<any[]> {
  if (useDemoCorpus()) return getDemoVerifiedRegistrations();

  if (!isDatabaseConfigured()) return [];

  return prisma.knowledgeDocument.findMany({
    where: {
      source: { status: "VERIFIED" },
      OR: [
        { applicability: { not: null } },
        { requiredDocuments: { not: null } },
        { fees: { not: null } },
        { processingTime: { not: null } }
      ]
    },
    include: { source: { include: { authority: true, artifacts: true } } },
    take: 30,
    orderBy: { updatedAt: "desc" }
  });
}

export async function getSchemeKnowledge(): Promise<any[]> {
  if (useDemoCorpus()) return getDemoSchemeKnowledge();

  if (!isDatabaseConfigured()) return [];

  return prisma.knowledgeDocument.findMany({
    where: {
      source: { status: "VERIFIED" },
      OR: [{ benefits: { not: null } }, { eligibility: { not: null } }]
    },
    include: { source: { include: { authority: true, artifacts: true } } },
    orderBy: { updatedAt: "desc" },
    take: 30
  });
}

export async function getDependencyItems(): Promise<Array<{ id: string; label: string; dependsOn: string[]; why?: string }>> {
  if (useDemoCorpus()) return getDemoDependencyItems();

  if (!isDatabaseConfigured()) return [];

  const rules = await prisma.eligibilityRule.findMany({
    where: { source: { status: "VERIFIED" } },
    include: { source: true },
    take: 50
  });

  return rules.map((rule) => {
    const ruleJson = rule.ruleJson as { dependsOn?: string[] } | null;
    return {
      id: rule.id,
      label: rule.title,
      dependsOn: Array.isArray(ruleJson?.dependsOn) ? ruleJson.dependsOn : []
    };
  });
}

export async function getLatestNotifications(): Promise<any[]> {
  if (useDemoCorpus()) return getDemoLatestNotifications();

  if (!isDatabaseConfigured()) return [];

  return prisma.governmentSource.findMany({
    where: { status: "VERIFIED" },
    include: { authority: true },
    orderBy: [{ lastUpdated: "desc" }, { updatedAt: "desc" }],
    take: 20
  });
}

export async function getKnowledgeByIndustry(industry: "FOOD" | "EXPORT_IMPORT"): Promise<any[]> {
  if (useDemoCorpus()) return getDemoKnowledgeByIndustry(industry);

  if (!isDatabaseConfigured()) return [];

  return prisma.knowledgeDocument.findMany({
    where: {
      industry,
      source: { status: "VERIFIED" }
    },
    include: { source: { include: { authority: true, artifacts: true } } },
    orderBy: { updatedAt: "desc" },
    take: 40
  });
}

export async function getPendingSources(): Promise<any[]> {
  if (useDemoCorpus()) return getDemoPendingSources();

  if (!isDatabaseConfigured()) return [];

  return prisma.governmentSource.findMany({
    where: { status: "PENDING" },
    include: { authority: true },
    orderBy: { fetchedAt: "desc" },
    take: 25
  });
}
