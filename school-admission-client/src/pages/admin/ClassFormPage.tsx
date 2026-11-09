import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { getErrorMessage } from "../../api/client";
import { academicClassService } from "../../api/academic-classes";
import { AcademicClassForm } from "../../components/academic-classes/academic-class-form";
import type { AcademicClassFormValues } from "../../components/academic-classes/academic-class-schema";

export default function ClassFormPage() {
  const { id } = useParams();
  const isEditing = id !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: academicClass, isLoading } = useQuery({
    queryKey: ["class", id],
    queryFn: () => academicClassService.get(Number(id)),
    enabled: isEditing,
  });

  const saveMutation = useMutation({
    mutationFn: academicClassService.save,
    onSuccess: () => {
      toast.success(isEditing ? "Class updated." : "Class created.");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      navigate("/admin/classes");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isEditing && isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{isEditing ? "Edit Class" : "New Class"}</h1>

      <AcademicClassForm
        defaultValues={academicClass}
        isSaving={saveMutation.isPending}
        onSubmit={(values: AcademicClassFormValues) =>
          saveMutation.mutate(isEditing ? { ...values, id: Number(id) } : values)
        }
        onCancel={() => navigate("/admin/classes")}
      />
    </div>
  );
}
