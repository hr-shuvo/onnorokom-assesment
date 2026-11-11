import { httpClient } from "../lib/http-client";
import type { AdmissionHold, ApplyHoldInput, HoldStatus } from "../types/hold";
import type { PagedResult } from "../types/academic-class";

const BASE_PATH = "/api";

const ACTIVE_STATUSES: HoldStatus[] = ["Waiting", "Held", "Confirmed"];

export const holdService = {
  async getMyHolds() {
    const { data } = await httpClient.get<AdmissionHold[]>(`${BASE_PATH}/me/holds`);
    return data;
  },

  async getMine() {
    const holds = await holdService.getMyHolds();
    return holds.find((hold) => ACTIVE_STATUSES.includes(hold.status)) ?? null;
  },

  async apply(classId: number, input: ApplyHoldInput) {
    const { data } = await httpClient.post<AdmissionHold>(`${BASE_PATH}/classes/${classId}/holds`, input);
    return data;
  },

  async joinWaitlist(classId: number, input: ApplyHoldInput) {
    const { data } = await httpClient.post<AdmissionHold>(`${BASE_PATH}/classes/${classId}/waitlist`, input);
    return data;
  },

  async confirm(holdId: number) {
    const { data } = await httpClient.post<AdmissionHold>(`${BASE_PATH}/holds/${holdId}/confirm`);
    return data;
  },

  async cancel(holdId: number) {
    await httpClient.delete(`${BASE_PATH}/holds/${holdId}`);
  },

  async loadForClass(
    classId: number,
    params: { pageNumber?: number; pageSize?: number; status?: HoldStatus } = {}
  ) {
    const { data } = await httpClient.get<PagedResult<AdmissionHold>>(
      `${BASE_PATH}/classes/${classId}/holds`,
      { params }
    );
    return data;
  },
};
