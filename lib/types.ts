import { z } from "zod";

// Stub schemas — expand these as workflows are implemented.

export const IntakeResponseSchema = z.object({});

export const TreatmentResponseSchema = z.object({});

export const SummaryResponseSchema = z.object({});

export type IntakeResponse = z.infer<typeof IntakeResponseSchema>;
export type TreatmentResponse = z.infer<typeof TreatmentResponseSchema>;
export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

// Loop creation flow — query params passed between outer-loop → inner-loop → how-long → how-often
// Each screen receives all params from prior screens plus its own addition.

export const YourLoopsParams = z.object({
  refresh: z.string().optional(),
});

export type YourLoopsParams = z.infer<typeof YourLoopsParams>;

export const OuterLoopParams = z.object({
  category: z.string(),
});

export const InnerLoopParams = OuterLoopParams.extend({
  tasks: z.string(), // JSON-encoded string[]
});

export const HowLongParams = InnerLoopParams.extend({
  "how-long": z.string(),
});

export const HowOftenParams = HowLongParams.extend({
  "how-often": z.string(),
});

export type OuterLoopParams = z.infer<typeof OuterLoopParams>;
export type InnerLoopParams = z.infer<typeof InnerLoopParams>;
export type HowLongParams = z.infer<typeof HowLongParams>;
export type HowOftenParams = z.infer<typeof HowOftenParams>;
