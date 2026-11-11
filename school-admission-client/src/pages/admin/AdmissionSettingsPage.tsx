import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays } from "date-fns";
import { toast } from "sonner";

import { getErrorMessage } from "../../lib/http-client";
import { admissionService } from "../../services/admission-service";
import type { AdmissionSettings } from "../../types/admission";
import { admissionSchema, type AdmissionFormValues } from "../../components/admissions/admission-schema";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { DatePicker } from "../../components/ui/date-picker";
import { Loading } from "../../components/ui/loading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";

const AdmissionSettingsPage = () => {
  const [admission, setAdmission] = useState<AdmissionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
  });
  const opensAt = useWatch({ control: form.control, name: "opensAt" });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await admissionService.get();
        setAdmission(result);
      } catch (err) {
        setLoadError(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (admission) {
      form.reset({
        title: admission.title,
        description: admission.description ?? "",
        opensAt: new Date(admission.opensAt),
        closesAt: new Date(admission.closesAt),
        holdMinutes: admission.holdMinutes,
        waitlistHoldMinutes: admission.waitlistHoldMinutes,
      });
    }
  }, [admission, form]);

  if (isLoading) {
    return <Loading className="min-h-screen" />;
  }

  if (loadError) {
    return <p className="text-sm text-destructive">{getErrorMessage(loadError)}</p>;
  }

  const onSubmit = async (values: AdmissionFormValues) => {
    setIsSaving(true);
    try {
      const result = await admissionService.save({
        ...values,
        opensAt: values.opensAt.toISOString(),
        closesAt: values.closesAt.toISOString(),
      });
      setAdmission(result);
      toast.success("Admission settings saved.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublished = async () => {
    if (!admission) return;

    setIsTogglingPublish(true);
    try {
      const result = await admissionService.setPublished(!admission.isPublished);
      setAdmission(result);
      toast.success(result.isPublished ? "Admission published." : "Admission unpublished.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsTogglingPublish(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admission Settings</h1>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              admission?.isPublished ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {admission?.isPublished ? "Published" : "Unpublished"}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={togglePublished}
            disabled={isTogglingPublish}
          >
            {admission?.isPublished ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

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
                    <DatePicker value={field.value} onChange={field.onChange} />
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

          <div className="grid grid-cols-2 gap-4">
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
              name="waitlistHoldMinutes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waitlist Hold Minutes</FormLabel>
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

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdmissionSettingsPage;
