import { httpClient } from "../lib/http-client";
import type { Admission, AdmissionInput, PagedResult } from "../types/admission";

const BASE_PATH = "/api/admissions";

export const admissionService = {
  async load(pageNumber?: number, pageSize?: number, search?: string, status?: string) {
    const { data } = await httpClient.get<PagedResult<Admission>>(BASE_PATH, {
      params: { pageNumber, pageSize, search, status },
    });
    return data;
  },

  async get(id: number) {
    const { data } = await httpClient.get<Admission>(`${BASE_PATH}/${id}`);
    return data;
  },

  async save(input: AdmissionInput & { id?: number }) {
    const { data } = await httpClient.post<Admission>(`${BASE_PATH}/save`, input);
    return data;
  },

  async changeStatus(id: number, status: string) {
    const { data } = await httpClient.patch<Admission>(`${BASE_PATH}/${id}/status`, null, {
      params: { status },
    });
    return data;
  },
};
