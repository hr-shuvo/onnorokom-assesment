export type AdmissionStatus = string;

export interface Admission {
  id: number;
  title: string;
  description: string | null;
  opensAt: string;
  closesAt: string;
  holdMinutes: number;
  status: AdmissionStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdmissionInput {
  title: string;
  description?: string;
  opensAt: string;
  closesAt: string;
  holdMinutes: number;
  status: AdmissionStatus;
}

export interface PagedResult<T> {
  items: T[];
  currentPage: number;
  totalPage: number;
  pageSize: number;
  totalCount: number;
}
