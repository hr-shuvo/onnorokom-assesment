import { httpClient } from "./client";
import type { AcademicClass, AcademicClassInput, PagedResult } from "../types/academic-class";

const BASE_PATH = "/api/classes";

export async function listAcademicClasses() {
  const { data } = await httpClient.get<PagedResult<AcademicClass>>(BASE_PATH, {
    params: { pageSize: 100 },
  });
  return data;
}

export async function saveAcademicClass(input: AcademicClassInput & { id?: number }) {
  const { data } = await httpClient.post<AcademicClass>(`${BASE_PATH}/save`, input);
  return data;
}

export async function toggleAcademicClassStatus(id: number) {
  const { data } = await httpClient.patch<AcademicClass>(`${BASE_PATH}/${id}/status`);
  return data;
}

export async function deleteAcademicClass(id: number) {
  await httpClient.delete(`${BASE_PATH}/delete/${id}`);
}
