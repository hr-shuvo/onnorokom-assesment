import { useEffect, useState } from "react";
import { admissionService } from "../services/admission-service";
import type { AdmissionSettings } from "../types/admission";

const isAdmissionOpen = (admission: AdmissionSettings | null): boolean => {
  if (!admission?.isPublished) return false;
  const now = new Date();
  return new Date(admission.opensAt) <= now && now < new Date(admission.closesAt);
};

const closedMessage = (admission: AdmissionSettings | null): string => {
  if (!admission?.isPublished) {
    return "Please check back later for the next admission window.";
  }
  const now = new Date();
  if (new Date(admission.opensAt) > now) {
    return `Admissions open on ${new Date(admission.opensAt).toLocaleString()}.`;
  }
  return `Admissions closed on ${new Date(admission.closesAt).toLocaleString()}.`;
};

export const useAdmission = () => {
  const [admission, setAdmission] = useState<AdmissionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setAdmission(await admissionService.get());
      setIsLoading(false);
    };
    load();
  }, []);

  return {
    admission,
    isLoading,
    isOpen: isAdmissionOpen(admission),
    closedMessage: closedMessage(admission),
  };
};
