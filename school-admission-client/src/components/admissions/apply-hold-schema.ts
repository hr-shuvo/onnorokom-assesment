import { z } from "zod";

export const applyHoldSchema = z.object({
  studentId: z.string().regex(/^\d{8}$/, "Student ID must be exactly 8 digits."),
  studentName: z.string().trim().max(100, "Student name is too long.").optional(),
  guardianPhone: z.string().trim().max(20, "Guardian phone is too long.").optional(),
});

export type ApplyHoldFormValues = z.infer<typeof applyHoldSchema>;
