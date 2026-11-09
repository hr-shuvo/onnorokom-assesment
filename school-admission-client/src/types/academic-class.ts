export type Shift = "Morning" | "Day" | "Evening";

export const SHIFTS: Shift[] = ["Morning", "Day", "Evening"];

export interface AcademicClass {
  id: number;
  name: string;
  order: number;
  totalSeats: number;
  isActive: boolean;
  shift: Shift;
  createdAt: string;
  updatedAt: string | null;
}

export interface AcademicClassInput {
  name: string;
  order: number;
  totalSeats: number;
  isActive: boolean;
  shift: Shift;
}

export interface PagedResult<T> {
  items: T[];
  currentPage: number;
  totalPage: number;
  pageSize: number;
  totalCount: number;
}
