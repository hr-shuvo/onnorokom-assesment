import { z } from "zod";

export const admissionSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().optional(),
    opensAt: z.date("Opens at is required."),
    closesAt: z.date("Closes at is required."),
    holdMinutes: z.number("Hold minutes is required.").min(1, "Hold minutes must be at least 1."),
    waitlistHoldMinutes: z
      .number("Waitlist hold minutes is required.")
      .min(1, "Waitlist hold minutes must be at least 1."),
  })
  .refine((values) => values.closesAt > values.opensAt, {
    message: "Closes at must be after opens at.",
    path: ["closesAt"],
  });

export type AdmissionFormValues = z.infer<typeof admissionSchema>;
