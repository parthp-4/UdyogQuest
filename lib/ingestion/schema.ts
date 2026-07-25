import { z } from "zod";

export const ingestionSourceSchema = z.object({
  officialUrl: z.string().url(),
  authorityName: z.string().min(2),
  authorityWebsite: z.string().url().optional(),
  title: z.string().min(2),
  kind: z.enum(["WEB_PAGE", "PDF", "CIRCULAR", "NOTIFICATION", "FAQ", "PORTAL", "HELPLINE", "OFFICE"]),
  industry: z.enum(["FOOD", "EXPORT_IMPORT"]).optional(),
  stateApplicability: z.string().optional(),
  districtApplicability: z.string().optional()
});

export type IngestionSourceInput = z.infer<typeof ingestionSourceSchema>;

