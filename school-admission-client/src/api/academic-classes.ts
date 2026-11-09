import { httpClient } from "./client";
import type { AcademicClass, AcademicClassInput, PagedResult } from "../types/academic-class";

const BASE_PATH = "/api/classes";

export interface ListAcademicClassesParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export const academicClassService = {
  async load(params: ListAcademicClassesParams = {}) {
    const { data } = await httpClient.get<PagedResult<AcademicClass>>(BASE_PATH, {
      params,
    });
    return data;
  },

  async get(id: number) {
    const { data } = await httpClient.get<AcademicClass>(`${BASE_PATH}/${id}`);
    return data;
  },

  async save(input: AcademicClassInput & { id?: number }) {
    const { data } = await httpClient.post<AcademicClass>(`${BASE_PATH}/save`, input);
    return data;
  },

  async toggleStatus(id: number) {
    const { data } = await httpClient.patch<AcademicClass>(`${BASE_PATH}/${id}/status`);
    return data;
  },

  async delete(id: number) {
    await httpClient.delete(`${BASE_PATH}/delete/${id}`);
  },
};
