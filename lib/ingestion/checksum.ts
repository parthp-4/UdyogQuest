import crypto from "node:crypto";

export function computeChecksum(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

export function isUnchanged(previousChecksum: string | null | undefined, nextChecksum: string): boolean {
  return previousChecksum === nextChecksum;
}
