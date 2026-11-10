import { useEffect, useState } from "react";
import { enumService, type EnumOption } from "../services/enum-service";

let statuses: EnumOption[] = [];
const statusesPromise = enumService.loadAdmissionStatuses().then((result) => {
  statuses = result;
  return result;
});

export function useAdmissionStatuses() {
  const [data, setData] = useState(statuses);

  useEffect(() => {
    statusesPromise.then(setData);
  }, []);

  return { statuses: data, isLoading: data.length === 0 };
}
