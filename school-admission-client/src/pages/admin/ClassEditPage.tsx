import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getErrorMessage } from "../../api/client";
import { academicClassService } from "../../api/academic-classes";
import type { AcademicClass } from "../../types/academic-class";
import { enumService, type EnumOption } from "../../api/enums";
import { academicClassSchema, type AcademicClassFormValues } from "../../components/academic-classes/academic-class-schema";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Loading } from "../../components/ui/loading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const ClassEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [academicClass, setAcademicClass] = useState<AcademicClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shifts, setShifts] = useState<EnumOption[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);

  const form = useForm<AcademicClassFormValues>({
    resolver: zodResolver(academicClassSchema),
  });

  useEffect(() => {
    const loadClass = async () => {
      setIsLoading(true);
      const result = await academicClassService.get(Number(id));
      setAcademicClass(result);
      setIsLoading(false);
    };
    loadClass();
  }, [id]);

  useEffect(() => {
    if (academicClass) {
      form.reset(academicClass);
    }
  }, [academicClass, form]);

  useEffect(() => {
    const loadShifts = async () => {
      setIsLoadingShifts(true);
      const result = await enumService.loadShifts();
      setShifts(result);
      setIsLoadingShifts(false);
    };
    loadShifts();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  const onSubmit = async (values: AcademicClassFormValues) => {
    setIsSaving(true);
    try {
      await academicClassService.save({ ...values, id: Number(id) });
      toast.success("Class updated.");
      navigate("/admin/classes");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Class</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Class 5" autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="order"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="totalSeats"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Seats</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="shift"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingShifts}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shifts.map((option) => (
                      <SelectItem key={option.value} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex-row items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Active</FormLabel>
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/classes")}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ClassEditPage;
