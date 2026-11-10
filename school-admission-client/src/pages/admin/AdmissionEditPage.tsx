import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getErrorMessage } from "../../lib/http-client";
import { admissionService } from "../../services/admission-service";
import type { Admission } from "../../types/admission";
import { admissionSchema, type AdmissionFormValues } from "../../components/admissions/admission-schema";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loading } from "../../components/ui/loading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";

const toDatetimeLocal = (value: string) => value.slice(0, 16);

const AdmissionEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admission, setAdmission] = useState<Admission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
  });

  useEffect(() => {
    const loadAdmission = async () => {
      setIsLoading(true);
      const result = await admissionService.get(Number(id));
      setAdmission(result);
      setIsLoading(false);
    };
    loadAdmission();
  }, [id]);

  useEffect(() => {
    if (admission) {
      form.reset({
        title: admission.title,
        description: admission.description ?? "",
        opensAt: toDatetimeLocal(admission.opensAt),
        closesAt: toDatetimeLocal(admission.closesAt),
        holdMinutes: admission.holdMinutes,
      });
    }
  }, [admission, form]);

  if (isLoading) {
    return <Loading />;
  }

  const onSubmit = async (values: AdmissionFormValues) => {
    setIsSaving(true);
    try {
      await admissionService.save({ ...values, id: Number(id) });
      toast.success("Admission updated.");
      navigate("/admin/admissions");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Admission</h1>

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
                  <Input {...field} placeholder="Optional description" />
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
                    <Input {...field} type="datetime-local" />
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
                    <Input {...field} type="datetime-local" />
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

export default AdmissionEditPage;
