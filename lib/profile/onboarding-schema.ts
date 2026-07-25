import { z } from "zod";

const optionalNumber = z.preprocess((value) => (value === "" || value === null ? undefined : value), z.coerce.number().nonnegative().optional());
const optionalPositiveInt = z.preprocess((value) => (value === "" || value === null ? undefined : value), z.coerce.number().int().positive().optional());
const optionalNonNegativeInt = z.preprocess((value) => (value === "" || value === null ? undefined : value), z.coerce.number().int().nonnegative().optional());

export const onboardingSchema = z.object({
  businessName: z.string().min(2),
  businessCategory: z.enum(["FOOD", "EXPORT_IMPORT"]),
  businessActivity: z.string().min(2),
  stage: z.enum(["IDEA", "PRE_REGISTRATION", "OPERATING", "EXPANDING", "EXPORT_READY"]),
  state: z.string().min(2),
  district: z.string().min(2),
  city: z.string().min(2),
  pin: z.string().regex(/^\d{6}$/),
  ownership: z.enum(["PROPRIETORSHIP", "PARTNERSHIP", "LLP", "PRIVATE_LIMITED", "SHG", "COOPERATIVE", "TRUST", "OTHER"]),
  turnover: optionalNumber,
  investment: optionalNumber,
  employees: optionalNonNegativeInt,
  annualIncome: optionalNumber,
  socialCategory: z.string().optional(),
  gender: z.string().optional(),
  age: optionalPositiveInt,
  education: z.string().optional(),
  existingRegistrations: z.array(z.string()).default([]),
  existingLicenses: z.array(z.string()).default([]),
  hasGst: z.boolean().optional(),
  hasPan: z.boolean().optional(),
  hasAadhaar: z.boolean().optional(),
  hasUdyam: z.boolean().optional(),
  hasFssai: z.boolean().optional(),
  hasIec: z.boolean().optional(),
  hasFactoryLicense: z.boolean().optional(),
  premises: z.enum(["RENTED", "OWNED", "SHARED", "HOME_BASED", "WAREHOUSE", "FACTORY", "UNKNOWN"]),
  rental: z.boolean().optional(),
  owned: z.boolean().optional(),
  manufacturing: z.boolean().optional(),
  trading: z.boolean().optional(),
  foodCategory: z.string().optional(),
  coldStorage: z.boolean().optional(),
  warehouse: z.boolean().optional(),
  exportDestination: z.string().optional(),
  importProducts: z.string().optional(),
  bankAccount: z.boolean().optional(),
  loanStatus: z.string().optional(),
  creditHistory: z.string().optional(),
  mobile: z.string().min(8),
  email: z.string().email(),
  languages: z.array(z.string()).default(["English"])
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
