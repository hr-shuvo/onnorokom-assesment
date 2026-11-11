import axios from "axios";
import { httpClient } from "../lib/http-client";
import type { AdmissionHold, ApplyHoldInput } from "../types/hold";

const BASE_PATH = "/api";

export const holdService = {
  async getMine() {
    try {
      const { data } = await httpClient.get<AdmissionHold>(`${BASE_PATH}/holds/me`);
      return data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
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
    const { data } = await httpClient.post<AdmissionHold>(`${BASE_PATH}/holds/${holdId}/cancel`);
    return data;
  },
};
