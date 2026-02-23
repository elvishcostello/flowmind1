import { z } from "zod";

// Stub schemas — expand these as workflows are implemented.

export const IntakeResponseSchema = z.object({});

export const TreatmentResponseSchema = z.object({});

export const SummaryResponseSchema = z.object({});

export type IntakeResponse = z.infer<typeof IntakeResponseSchema>;
export type TreatmentResponse = z.infer<typeof TreatmentResponseSchema>;
export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;
