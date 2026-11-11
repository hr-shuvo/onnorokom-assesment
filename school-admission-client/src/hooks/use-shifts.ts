import { useEffect, useState } from "react";
import { enumService, type EnumOption } from "../services/enum-service";

let shifts: EnumOption[] = [];

const loadShifts = async () => {
  try {
    shifts = await enumService.loadShifts();
  } catch {
    shifts = [];
  }
  return shifts;
};

const shiftsPromise = loadShifts();

export function useShifts() {
  const [data, setData] = useState(shifts);

  useEffect(() => {
    const load = async () => {
      setData(await shiftsPromise);
    };
    load();
  }, []);

  return { shifts: data, isLoading: data.length === 0 };
}
