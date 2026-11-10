import { z } from "zod";

export const admissionSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().optional(),
    opensAt: z.string().min(1, "Opens at is required."),
    closesAt: z.string().min(1, "Closes at is required."),
    holdMinutes: z.number("Hold minutes is required.").min(1, "Hold minutes must be at least 1."),
  })
  .refine((values) => new Date(values.closesAt) > new Date(values.opensAt), {
    message: "Closes at must be after opens at.",
    path: ["closesAt"],
  });

export type AdmissionFormValues = z.infer<typeof admissionSchema>;
