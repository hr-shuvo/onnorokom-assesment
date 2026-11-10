import { httpClient } from "../lib/http-client";

export interface EnumOption {
  value: number;
  name: string;
}

export const enumService = {
  async loadShifts() {
    const { data } = await httpClient.get<EnumOption[]>("/api/enums/shifts");
    return data;
  },
};
