export interface AdmissionSettings {
  title: string;
  description: string | null;
  opensAt: string;
  closesAt: string;
  holdMinutes: number;
  waitlistHoldMinutes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdmissionSettingsInput {
  title: string;
  description?: string;
  opensAt: string;
  closesAt: string;
  holdMinutes: number;
  waitlistHoldMinutes: number;
}
