import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { applyHoldSchema, type ApplyHoldFormValues } from "./apply-hold-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface StudentInfoFormProps {
  onSubmit: (values: ApplyHoldFormValues) => void;
}

const StudentInfoForm = ({ onSubmit }: StudentInfoFormProps) => {
  const form = useForm<ApplyHoldFormValues>({
    resolver: zodResolver(applyHoldSchema),
    defaultValues: { studentId: "", studentName: "", guardianPhone: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Applicant Details</CardTitle>
            <CardDescription>Enter your details once — they'll be used for any class you apply to.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              name="studentId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="8-digit ID" maxLength={8} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="studentName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="guardianPhone"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guardian Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit">Continue</Button>
      </form>
    </Form>
  );
};

export default StudentInfoForm;
