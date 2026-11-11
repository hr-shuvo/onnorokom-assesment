import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import SiteHeader from "@/components/layout/SiteHeader";
import AdmissionClosedCard from "@/components/admissions/AdmissionClosedCard";
import ApplicantDetailsCard from "@/components/admissions/ApplicantDetailsCard";
import HoldStatusCard from "@/components/admissions/HoldStatusCard";
import ClassListCard from "@/components/admissions/ClassListCard";
import { Loading } from "@/components/ui/loading";
import { getErrorMessage } from "@/lib/http-client";
import { academicClassService } from "@/services/academic-class-service";
import { holdService } from "@/services/hold-service";
import { useAdmission } from "@/hooks/use-admission";
import { useStudentStore } from "@/stores/student-store";
import type { AcademicClass } from "@/types/academic-class";
import type { AdmissionHold } from "@/types/hold";

const AdmissionApplicationPage = () => {
  const navigate = useNavigate();
  const { admission, isLoading: isAdmissionLoading, isOpen, closedMessage } = useAdmission();
  const { applicant } = useStudentStore();

  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [hold, setHold] = useState<AdmissionHold | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingClassId, setSubmittingClassId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!applicant) {
      navigate("/admissions", { replace: true });
    }
  }, [applicant, navigate]);

  useEffect(() => {
    if (!applicant) return;

    const load = async () => {
      setIsLoading(true);
      const [classesResult, holdResult] = await Promise.all([
        academicClassService.load(1, 100),
        holdService.getMine(),
      ]);
      setClasses(classesResult.items.filter((c) => c.isActive));
      setHold(holdResult);
      setIsLoading(false);
    };
    load();
  }, [applicant]);

  const refreshHold = async () => {
    setIsRefreshing(true);
    try {
      setHold(await holdService.getMine());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsRefreshing(false);
    }
  };

  const onApply = async (classId: number, mode: "apply" | "waitlist") => {
    if (!applicant) return;

    setSubmittingClassId(classId);
    try {
      const input = { studentName: applicant.studentName, guardianPhone: applicant.guardianPhone };
      const result =
        mode === "apply" ? await holdService.apply(classId, input) : await holdService.joinWaitlist(classId, input);
      setHold(result);
      toast.success(mode === "apply" ? "Seat held! Confirm before it expires." : "You're on the waitlist.");
    } catch (err) {
      toast.error(getErrorMessage(err));
      await refreshHold();
    } finally {
      setSubmittingClassId(null);
    }
  };

  const onConfirm = async () => {
    if (!hold) return;
    setIsConfirming(true);
    try {
      setHold(await holdService.confirm(hold.id));
      toast.success("Your seat is confirmed!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsConfirming(false);
    }
  };

  if (!applicant || isAdmissionLoading || isLoading) {
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

        {!isOpen && <AdmissionClosedCard message={closedMessage} />}

        {isOpen && (
          <>
            <ApplicantDetailsCard applicant={applicant} />

            {hold ? (
              <HoldStatusCard
                hold={hold}
                onConfirm={onConfirm}
                isConfirming={isConfirming}
                onRefresh={refreshHold}
                isRefreshing={isRefreshing}
              />
            ) : (
              <ClassListCard classes={classes} onApply={onApply} submittingClassId={submittingClassId} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdmissionApplicationPage;
