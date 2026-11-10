import { useEffect, useState } from "react";
import { enumService, type EnumOption } from "../services/enum-service";

let shifts: EnumOption[] = [];
const shiftsPromise = enumService.loadShifts().then((result) => {
  shifts = result;
  return result;
});

export function useShifts() {
  const [data, setData] = useState(shifts);

  useEffect(() => {
    shiftsPromise.then(setData);
  }, []);

  return { shifts: data, isLoading: data.length === 0 };
}
