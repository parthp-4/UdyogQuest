import { z } from "zod";

export const deterministicRuleSchema = z.object({
  all: z.array(z.lazy(() => conditionSchema)).optional(),
  any: z.array(z.lazy(() => conditionSchema)).optional()
});

const primitive = z.union([z.string(), z.number(), z.boolean()]);

export const conditionSchema: z.ZodType<RuleCondition> = z.object({
  field: z.string(),
  operator: z.enum(["equals", "notEquals", "in", "notIn", "gte", "lte", "exists", "includes"]),
  value: z.union([primitive, z.array(primitive)]).optional(),
  sourceQuote: z.string().min(1),
  sourceField: z.string().min(1)
});

export type RuleCondition = {
  field: string;
  operator: "equals" | "notEquals" | "in" | "notIn" | "gte" | "lte" | "exists" | "includes";
  value?: string | number | boolean | Array<string | number | boolean>;
  sourceQuote: string;
  sourceField: string;
};

