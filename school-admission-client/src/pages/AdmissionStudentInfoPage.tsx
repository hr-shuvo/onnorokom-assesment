import { useEffect } from "react";
import { useNavigate } from "react-router";

import SiteHeader from "@/components/layout/SiteHeader";
import AdmissionClosedCard from "@/components/admissions/AdmissionClosedCard";
import StudentInfoForm from "@/components/admissions/StudentInfoForm";
import type { ApplyHoldFormValues } from "@/components/admissions/apply-hold-schema";
import { Loading } from "@/components/ui/loading";
import { useAdmission } from "@/hooks/use-admission";
import { useStudentStore } from "@/stores/student-store";

const AdmissionStudentInfoPage = () => {
  const navigate = useNavigate();
  const { admission, isLoading, isOpen, closedMessage } = useAdmission();
  const { applicant, setApplicant } = useStudentStore();

  useEffect(() => {
    if (applicant) {
      navigate("/admissions/application", { replace: true });
    }
  }, [applicant, navigate]);

  const onSubmit = (values: ApplyHoldFormValues) => {
    setApplicant({
      studentId: values.studentId,
      studentName: values.studentName,
      guardianPhone: values.guardianPhone,
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />

      <main className="mx-auto max-w-3xl space-y-6 p-6 py-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{admission?.title ?? "Admission"}</h1>
          {admission?.description && <p className="text-muted-foreground">{admission.description}</p>}
        </div>

        {isOpen ? <StudentInfoForm onSubmit={onSubmit} /> : <AdmissionClosedCard message={closedMessage} />}
      </main>
    </div>
  );
};

export default AdmissionStudentInfoPage;
