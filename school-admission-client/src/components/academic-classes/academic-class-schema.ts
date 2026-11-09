import { z } from "zod";
import { SHIFTS } from "../../types/academic-class";

export const academicClassSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  order: z.number().min(0, "Order must be 0 or more."),
  totalSeats: z.number().min(1, "Total seats must be at least 1."),
  isActive: z.boolean(),
  shift: z.enum(SHIFTS),
});

export type AcademicClassFormValues = z.infer<typeof academicClassSchema>;
