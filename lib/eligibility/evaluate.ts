import type { BusinessProfile, EligibilityRule } from "@prisma/client";
import { deterministicRuleSchema, type RuleCondition } from "@/lib/eligibility/rule-schema";

export type DeterministicEligibility = {
  status: "ELIGIBLE" | "POTENTIAL" | "FUTURE_ELIGIBLE" | "NOT_ELIGIBLE" | "UNAVAILABLE";
  reasons: string[];
  unmetConditions: string[];
};

export function evaluateRule(profile: BusinessProfile, rule: EligibilityRule): DeterministicEligibility {
  const parsed = deterministicRuleSchema.safeParse(rule.ruleJson);

  if (!parsed.success) {
    return {
      status: "UNAVAILABLE",
      reasons: [],
      unmetConditions: ["Rule is not machine-readable from verified government source."]
    };
  }

  const all = parsed.data.all ?? [];
  const any = parsed.data.any ?? [];
  const allResults = all.map((condition) => evaluateCondition(profile, condition));
  const anyResults = any.map((condition) => evaluateCondition(profile, condition));
  const allPass = allResults.every((result) => result.pass);
  const anyPass = anyResults.length === 0 || anyResults.some((result) => result.pass);
  const failed = [...allResults, ...anyResults].filter((result) => !result.pass);

  return {
    status: allPass && anyPass ? "ELIGIBLE" : failed.length <= 2 ? "POTENTIAL" : "NOT_ELIGIBLE",
    reasons: [...allResults, ...anyResults].filter((result) => result.pass).map((result) => result.reason),
    unmetConditions: failed.map((result) => result.reason)
  };
}

function evaluateCondition(profile: BusinessProfile, condition: RuleCondition) {
  const value = getProfileValue(profile, condition.field);
  const expected = condition.value;
  let pass = false;

  if (condition.operator === "exists") pass = value !== null && value !== undefined && value !== "";
  if (condition.operator === "equals") pass = value === expected;
  if (condition.operator === "notEquals") pass = value !== expected;
  if (condition.operator === "in") pass = Array.isArray(expected) && expected.includes(value as never);
  if (condition.operator === "notIn") pass = Array.isArray(expected) && !expected.includes(value as never);
  if (condition.operator === "gte") pass = Number(value) >= Number(expected);
  if (condition.operator === "lte") pass = Number(value) <= Number(expected);
  if (condition.operator === "includes") pass = Array.isArray(value) && value.includes(expected as never);

  return {
    pass,
    reason: `${condition.sourceField}: ${condition.sourceQuote}`
  };
}

function getProfileValue(profile: BusinessProfile, field: string) {
  return (profile as unknown as Record<string, unknown>)[field];
}

