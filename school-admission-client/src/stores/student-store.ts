import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ApplicantInfo {
  studentId: string;
  studentName?: string;
  guardianPhone?: string;
}

interface StudentStore {
  applicant: ApplicantInfo | null;
  setApplicant: (applicant: ApplicantInfo) => void;
  clearApplicant: () => void;
}

export const useStudentStore = create<StudentStore>()(
  persist(
    (set) => ({
      applicant: null,
      setApplicant: (applicant) => set({ applicant }),
      clearApplicant: () => set({ applicant: null }),
    }),
    { name: "schoolAdmission.applicant" },
  ),
);
