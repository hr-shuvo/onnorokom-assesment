import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays } from "date-fns";
import { toast } from "sonner";

import { getErrorMessage } from "../../lib/http-client";
import { admissionService } from "../../services/admission-service";
import { admissionSchema, type AdmissionFormValues } from "../../components/admissions/admission-schema";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { DatePicker } from "../../components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAdmissionStatuses } from "../../hooks/use-admission-statuses";

const AdmissionCreatePage = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { statuses } = useAdmissionStatuses();
  const publishableStatuses = statuses.filter((status) => status.name !== "Archived");

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      title: "",
      description: "",
      holdMinutes: 10,
      status: "Draft",
    },
  });
  const opensAt = useWatch({ control: form.control, name: "opensAt" });

  const onSubmit = async (values: AdmissionFormValues) => {
    setIsSaving(true);
    try {
      await admissionService.save({
        ...values,
        opensAt: values.opensAt.toISOString(),
        closesAt: values.closesAt.toISOString(),
      });
      toast.success("Admission created.");
      navigate("/admin/admissions");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New Admission</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Admission 2026" autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Optional description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="opensAt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opens At</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} minDate={new Date()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="closesAt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closes At</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      minDate={opensAt ? addDays(opensAt, 1) : undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="holdMinutes"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hold Minutes</FormLabel>
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
            name="status"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {publishableStatuses.map((option) => (
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

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/admissions")}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdmissionCreatePage;
