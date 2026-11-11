import { httpClient } from "../lib/http-client";
import type { AdmissionSettings, AdmissionSettingsInput } from "../types/admission";

const BASE_PATH = "/api/configuration/admission";

export const admissionService = {
  async get() {
    const { data } = await httpClient.get<AdmissionSettings>(BASE_PATH);
    return data;
  },

  async save(input: AdmissionSettingsInput) {
    const { data } = await httpClient.post<AdmissionSettings>(BASE_PATH, input);
    return data;
  },

  async setPublished(isPublished: boolean) {
    const { data } = await httpClient.patch<AdmissionSettings>(`${BASE_PATH}/status`, null, {
      params: { isPublished },
    });
    return data;
  },
};
