import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { enumService, type EnumOption } from "../../api/enums";
import { academicClassSchema, type AcademicClassFormValues } from "./academic-class-schema";

const emptyValues: AcademicClassFormValues = {
  name: "",
  order: 0,
  totalSeats: 1,
  isActive: true,
  shift: "Morning",
};

interface AcademicClassFormProps {
  defaultValues?: AcademicClassFormValues;
  isSaving: boolean;
  onSubmit: (values: AcademicClassFormValues) => void;
  onCancel: () => void;
}

export function AcademicClassForm({
  defaultValues = emptyValues,
  isSaving,
  onSubmit,
  onCancel,
}: AcademicClassFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AcademicClassFormValues>({
    resolver: zodResolver(academicClassSchema),
    defaultValues,
  });

  const shift = watch("shift");
  const isActive = watch("isActive");

  const [shifts, setShifts] = useState<EnumOption[]>([]);

  useEffect(() => {
    async function loadShifts() {
      const result = await enumService.loadShifts();
      setShifts(result);
    }
    loadShifts();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="e.g. Class 5" autoFocus {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
          {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalSeats">Total Seats</Label>
          <Input
            id="totalSeats"
            type="number"
            {...register("totalSeats", { valueAsNumber: true })}
          />
          {errors.totalSeats && (
            <p className="text-sm text-destructive">{errors.totalSeats.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shift">Shift</Label>
        <select
          id="shift"
          value={shift}
          onChange={(e) => setValue("shift", e.target.value as AcademicClassFormValues["shift"])}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {shifts.map((option) => (
            <option key={option.value} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <Label className="gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setValue("isActive", e.target.checked)}
          className="size-4"
        />
        Active
      </Label>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
