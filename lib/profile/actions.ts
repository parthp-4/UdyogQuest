"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getDemoLatestProfile } from "@/lib/demo/corpus";
import { onboardingSchema } from "@/lib/profile/onboarding-schema";
import { isLiveMode } from "@/lib/runtime/mode";

function useDemoCorpus() {
  return !isLiveMode();
}

export async function createBusinessProfile(_: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = onboardingSchema.safeParse({
    ...raw,
    turnover: raw.turnover || undefined,
    investment: raw.investment || undefined,
    employees: raw.employees || undefined,
    annualIncome: raw.annualIncome || undefined,
    age: raw.age || undefined,
    existingRegistrations: formData.getAll("existingRegistrations").map(String),
    existingLicenses: formData.getAll("existingLicenses").map(String),
    languages: formData.getAll("languages").map(String),
    hasGst: formData.get("hasGst") === "on",
    hasPan: formData.get("hasPan") === "on",
    hasAadhaar: formData.get("hasAadhaar") === "on",
    hasUdyam: formData.get("hasUdyam") === "on",
    hasFssai: formData.get("hasFssai") === "on",
    hasIec: formData.get("hasIec") === "on",
    hasFactoryLicense: formData.get("hasFactoryLicense") === "on",
    rental: formData.get("rental") === "on",
    owned: formData.get("owned") === "on",
    manufacturing: formData.get("manufacturing") === "on",
    trading: formData.get("trading") === "on",
    coldStorage: formData.get("coldStorage") === "on",
    warehouse: formData.get("warehouse") === "on",
    bankAccount: formData.get("bankAccount") === "on"
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  if (useDemoCorpus()) {
    return { ok: true, profile: getDemoLatestProfile() };
  }

  const profile = await prisma.businessProfile.create({
    data: parsed.data
  });

  revalidatePath("/profile");
  redirect(`/profile?profile=${profile.id}`);
}

export async function getLatestProfile() {
  if (useDemoCorpus()) return getDemoLatestProfile();

  if (!isDatabaseConfigured()) return null;

  return prisma.businessProfile.findFirst({
    orderBy: { updatedAt: "desc" },
    include: { documents: true, eligibilityResults: true, recommendations: { include: { citations: { include: { source: true } } } } }
  });
}
