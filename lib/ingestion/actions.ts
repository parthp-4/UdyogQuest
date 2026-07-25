"use server";

import { revalidatePath } from "next/cache";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function verifySource(formData: FormData) {
  const sourceId = String(formData.get("sourceId") ?? "");
  const confidence = Number(formData.get("sourceConfidence") ?? 0.9);

  if (!sourceId) return;
  if (!isDatabaseConfigured()) return;

  await prisma.governmentSource.update({
    where: { id: sourceId },
    data: {
      status: "VERIFIED",
      sourceConfidence: Math.max(0, Math.min(1, confidence))
    }
  });

  revalidatePath("/settings");
  revalidatePath("/knowledge");
  revalidatePath("/dashboard");
}
