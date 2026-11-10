import { useQuery } from "@tanstack/react-query";
import { enumService } from "../services/enum-service";

export function useShifts() {
  return useQuery({
    queryKey: ["shifts"],
    queryFn: enumService.loadShifts,
    staleTime: Infinity,
  });
}
