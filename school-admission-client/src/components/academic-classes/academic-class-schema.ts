import { z } from "zod";

export const academicClassSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  order: z.number("Order is required.").min(0, "Order must be 0 or more."),
  totalSeats: z
    .number("Total seats is required.")
    .min(1, "Total seats must be at least 1."),
  isActive: z.boolean(),
  shift: z.string().min(1, "Shift is required."),
});

export type AcademicClassFormValues = z.infer<typeof academicClassSchema>;
