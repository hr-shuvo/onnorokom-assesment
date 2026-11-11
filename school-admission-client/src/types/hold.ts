export type HoldStatus = "Waiting" | "Held" | "Confirmed" | "Expired" | "Cancelled";

export interface AdmissionHold {
  id: number;
  studentId: string;
  studentName: string | null;
  guardianPhone: string | null;
  classId: number;
  className: string | null;
  classShift: string | null;
  status: HoldStatus;
  expiresAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export interface ApplyHoldInput {
  studentName?: string;
  guardianPhone?: string;
}
